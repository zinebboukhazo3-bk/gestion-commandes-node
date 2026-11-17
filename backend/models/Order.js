const mongoose = require('mongoose');

// Définition de la structure d'un article dans la commande
const orderItemSchema = new mongoose.Schema({
    // Référence vers le produit commandé
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    // Quantité commandée
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La quantité doit être au moins égale à 1']
    },

    // Prix du produit au moment de la commande
    // On le conserve pour que le prix historique ne change pas
    price: {
        type: Number,
        required: true,
        min: [0, 'Le prix ne peut pas être négatif']
    }
});

// Définition de la structure d'une commande
const orderSchema = new mongoose.Schema({
    // Utilisateur qui a passé la commande
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Produits et quantités de la commande
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: items => items.length > 0,
            message: 'Une commande doit contenir au moins un produit'
        }
    },

    // Montant total de la commande
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Le total ne peut pas être négatif']
    },

    // État actuel de la commande
    status: {
        type: String,
        enum: ['en attente', 'confirmée', 'expédiée', 'livrée', 'annulée'],
        default: 'en attente'
    }
}, {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true
});

// Création et exportation du modèle Order
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;