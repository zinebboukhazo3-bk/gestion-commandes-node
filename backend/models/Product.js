
const mongoose = require('mongoose');

// Définition de la structure d'un produit
const productSchema = new mongoose.Schema({

    // Nom du produit (obligatoire)
    name: {
        type: String,
        required: [true, 'Le nom du produit est obligatoire'],
        trim: true
    },

    // Description du produit
    description: {
        type: String,
        default: ''
    },

    // Prix du produit (obligatoire et supérieur à 0)
    price: {
        type: Number,
        required: [true, 'Le prix est obligatoire'],
        min: [0.01, 'Le prix doit être supérieur à 0']
    },

    // Quantité disponible en stock
    quantity: {
        type: Number,
        default: 0,
        min: [0, 'La quantité ne peut pas être négative']
    },

    // Catégorie du produit
    category: {
        type: String,
        default: 'Non classé',
        trim: true
    }

}, {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true
});

// Création et exportation du modèle Product
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
