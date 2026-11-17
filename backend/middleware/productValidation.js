
// Importer body pour définir les règles de validation
const { body } = require('express-validator');

// Règles de validation pour créer un produit
const createProductValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom du produit est obligatoire'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('La description est obligatoire'),

    body('price')
        .isFloat({ min: 0.01 })
        .withMessage('Le prix doit être supérieur à zéro'),

    body('quantity')
        .isInt({ min: 0 })
        .withMessage('La quantité doit être un entier positif ou nul'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('La catégorie est obligatoire')
];



// Règles de validation pour modifier un produit
const updateProductValidation = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Le nom ne peut pas être vide'),

    body('description')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('La description ne peut pas être vide'),

    body('price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Le prix doit être supérieur à zéro'),

    body('quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La quantité doit être un entier positif ou nul'),

    body('category')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('La catégorie ne peut pas être vide')
];


module.exports = {
    createProductValidation,
    updateProductValidation
};

