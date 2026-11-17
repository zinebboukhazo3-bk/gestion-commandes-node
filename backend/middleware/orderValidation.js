 // Importer body pour définir les règles de validation
const { body } = require('express-validator');

// Règles de validation pour créer une commande
const createOrderValidation = [

    // Vérifier que items est un tableau non vide
    body('items')
        .isArray({ min: 1 })
        .withMessage('La commande doit contenir au moins un produit'),

    // Vérifier l'identifiant de chaque produit
    body('items.*.productId')
        .notEmpty()
        .withMessage('L’identifiant du produit est obligatoire')
        .bail()
        .isMongoId()
        .withMessage('Identifiant du produit invalide'),

    // Vérifier la quantité de chaque produit
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('La quantité doit être un entier supérieur à zéro')
];



// Règles de validation pour modifier le statut d'une commande
const updateOrderStatusValidation = [
    body('status')
        .notEmpty()
        .withMessage('Le statut est obligatoire')
        .bail()
        .isIn([
            'en attente',
            'confirmée',
            'expédiée',
            'livrée',
            'annulée'
        ])
        .withMessage('Le statut envoyé est invalide')
];

module.exports = {
    createOrderValidation, 
    updateOrderStatusValidation
};
