
// Importer body pour définir les règles de validation
const { body } = require('express-validator');

// Règles de validation pour l'inscription
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom est obligatoire'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('L’adresse e-mail est obligatoire')
        .isEmail()
        .withMessage('Veuillez saisir une adresse e-mail valide'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

// Règles de validation pour la connexion
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('L’adresse e-mail est obligatoire')
        .isEmail()
        .withMessage('Veuillez saisir une adresse e-mail valide'),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est obligatoire')
];

module.exports = {
    registerValidation,
    loginValidation
};
