
const Product = require('../models/product');

// Fonction pour récupérer, rechercher, filtrer, trier et paginer les produits
const getAllProducts = async (req, res) => {
    try {
        // Récupérer les paramètres envoyés dans l'URL
        const { search, category, sort } = req.query;

        // Récupérer les paramètres de pagination avec des valeurs par défaut
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 4));

        // Calculer le nombre de produits à ignorer
        const skip = (page - 1) * limit;

        // Préparer les critères de recherche
        let filter = {};

        // Recherche par nom du produit
        if (search) {
            filter.name = {
                $regex: search,
                $options: 'i'
            };
        }

        // Filtrage par catégorie
        if (category) {
            filter.category = category;
        }

        // Préparer le tri
        let sortOption = {};

        if (sort === 'price_asc') {
            sortOption.price = 1;
        } else if (sort === 'price_desc') {
            sortOption.price = -1;
        }

        // Compter le nombre total de produits correspondant aux filtres
        const totalProducts = await Product.countDocuments(filter);

        // Récupérer les produits avec filtres, tri et pagination
        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        // Calculer le nombre total de pages
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            message: 'Liste des produits récupérée avec succès',
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                limit
            },
            products
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des produits',
            error: error.message
        });
    }
};
// Fonction pour récupérer un produit par son ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifie si l'ID possède un format MongoDB valide
        if (!Product) {
            return res.status(500).json({ message: 'Erreur du modèle Product' });
        }

        const product = await Product.findById(id);

        // Vérifie si le produit existe
        if (!product) {
            return res.status(404).json({
                message: 'Produit introuvable'
            });
        }

        res.status(200).json(product);

    } catch (error) {
        // Une erreur de conversion d'ID est une requête invalide
        const status = error.name === 'CastError' ? 400 : 500;

        res.status(status).json({
            message: 'Erreur lors de la récupération du produit',
            error: error.message
        });
    }
};


// Fonction pour ajouter un ou plusieurs produits
const createProduct = async (req, res) => {
    try {
        // Vérifie si le body contient un tableau ou un seul objet
        const isArray = Array.isArray(req.body);

        // Ajoute un ou plusieurs produits
        const savedProducts = await Product.insertMany(
            isArray ? req.body : [req.body]
        );

        res.status(201).json({
            message: 'Produit(s) ajouté(s) avec succès',
            count: savedProducts.length,
            products: savedProducts
        });

    } catch (error) {
        res.status(400).json({
            message: 'Erreur lors de l’ajout du/des produit(s)',
            error: error.message
        });
    }
};


// Fonction pour modifier un produit
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Modifie le produit et retourne sa nouvelle version
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,          // Retourne le produit après modification
                runValidators: true // Applique les validations du Schema
            }
        );

        // Vérifie si le produit existe
        if (!updatedProduct) {
            return res.status(404).json({
                message: 'Produit introuvable'
            });
        }

        res.status(200).json({
            message: 'Produit modifié avec succès',
            product: updatedProduct
        });

    } catch (error) {
        const status = error.name === 'ValidationError' ||
            error.name === 'CastError' ? 400 : 500;

        res.status(status).json({
            message: 'Erreur lors de la modification du produit',
            error: error.message
        });
    }
};


// Fonction pour supprimer un produit
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Recherche et supprime le produit dans MongoDB
        const deletedProduct = await Product.findByIdAndDelete(id);

        // Vérifie si le produit existe
        if (!deletedProduct) {
            return res.status(404).json({
                message: 'Produit introuvable'
            });
        }

        res.status(200).json({
            message: 'Produit supprimé avec succès',
            product: deletedProduct
        });

    } catch (error) {
        const status = error.name === 'CastError' ? 400 : 500;

        res.status(status).json({
            message: 'Erreur lors de la suppression du produit',
            error: error.message
        });
    }
};


// Exportation des fonctions pour les utiliser dans les routes
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
