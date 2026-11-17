const Order = require('../models/Order');
const Product = require('../models/product');


// Créer une commande pour l'utilisateur connecté
const createOrder = async (req, res) => {
    try {
        // Le middleware protect a placé l'identifiant dans req.user
        const userId = req.user.id;

        // Le client envoie les identifiants des produits et les quantités
        const { items } = req.body;

        // Vérifier que la commande contient au moins un article
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'La commande doit contenir au moins un produit'
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Vérifier chaque produit et calculer le total côté serveur
        for (const item of items) {
            const { productId, quantity } = item;

            // Vérifier que la quantité est un nombre entier positif
            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: 'Chaque quantité doit être un entier supérieur ou égal à 1'
                });
            }

            // Rechercher le produit dans MongoDB
            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    message: `Produit introuvable : ${productId}`
                });
            }

            // Vérifier que le stock est suffisant
            if (product.quantity < quantity) {
                return res.status(400).json({
                    message: `Stock insuffisant pour le produit ${product.name}`
                });
            }

            // Conserver le prix actuel du produit dans la commande
            orderItems.push({
                product: product._id,
                quantity,
                price: product.price
            });

            // Calculer le total à partir des prix de la base de données
            totalAmount += product.price * quantity;
        }

        // Créer la commande avec l'utilisateur connecté
        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount
        });

        // Enregistrer la commande dans MongoDB
        const savedOrder = await newOrder.save();

        // Diminuer le stock des produits commandés
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        res.status(201).json({
            message: 'Commande créée avec succès',
            order: savedOrder
        });

    } catch (error) {
        const status = error.name === 'CastError' ||
            error.name === 'ValidationError' ? 400 : 500;

        res.status(status).json({
            message: 'Erreur lors de la création de la commande',
            error: error.message
        });
    }
};


// Récupérer les commandes de l'utilisateur connecté
const getMyOrders = async (req, res) => {
    try {
        // Filtrer les commandes avec l'identifiant de l'utilisateur connecté
        const orders = await Order.find({
            user: req.user.id
        }).populate('items.product', 'name price');

        res.status(200).json({
            message: 'Commandes récupérées avec succès',
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des commandes',
            error: error.message
        });
    }
};


// Récupérer une commande appartenant à l'utilisateur connecté
const getMyOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('items.product', 'name price');

        if (!order) {
            return res.status(404).json({
                message: 'Commande introuvable'
            });
        }

        res.status(200).json({
            message: 'Commande récupérée avec succès',
            order
        });

    } catch (error) {
        const status = error.name === 'CastError' ? 400 : 500;

        res.status(status).json({
            message: 'Erreur lors de la récupération de la commande',
            error: error.message
        });
    }
};


// Récupérer toutes les commandes (administrateur uniquement)
const getAllOrders = async (req, res) => {
    try {
        // Récupérer les commandes et les informations liées
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 }); // Les plus récentes en premier

        res.status(200).json({
            message: 'Liste des commandes récupérée avec succès',
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des commandes',
            error: error.message
        });
    }
};


// Modifier le statut d'une commande (administrateur uniquement)
const updateOrderStatus = async (req, res) => {
    try {
        // Récupérer le nouveau statut envoyé dans la requête
        const { status } = req.body;

        // Définir les statuts autorisés
        const allowedStatuses = [
            'en attente',
            'confirmée',
            'expédiée',
            'livrée',
            'annulée'
        ];

        // Vérifier que le statut est valide
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Statut invalide'
            });
        }

        // Rechercher la commande par son ID
        const order = await Order.findById(req.params.id);

        // Vérifier si la commande existe
        if (!order) {
            return res.status(404).json({
                message: 'Commande introuvable'
            });
        }

        // Mettre à jour le statut
        order.status = status;

        // Enregistrer les modifications
        await order.save();

        res.status(200).json({
            message: 'Statut de la commande mis à jour avec succès',
            order
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
};


// Annuler une commande appartenant au client connecté
const cancelMyOrder = async (req, res) => {
    try {
        // Rechercher une commande appartenant au client connecté
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        // Vérifier si la commande existe
        if (!order) {
            return res.status(404).json({
                message: 'Commande introuvable'
            });
        }

        // Vérifier que la commande est encore en attente
        if (order.status !== 'en attente') {
            return res.status(400).json({
                message: 'Cette commande ne peut plus être annulée'
            });
        }

        // Restituer au stock les quantités des produits commandés
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: item.quantity }
            });
        }

        // Modifier le statut de la commande
        order.status = 'annulée';

        // Enregistrer la commande
        await order.save();

        res.status(200).json({
            message: 'Commande annulée avec succès',
            order
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de l’annulation de la commande',
            error: error.message
        });
    }
};
// Exporter les fonctions pour les utiliser dans les routes
module.exports = {
    createOrder,
    getMyOrders,
    getMyOrderById, 
    getAllOrders, 
    updateOrderStatus,
    cancelMyOrder 
};