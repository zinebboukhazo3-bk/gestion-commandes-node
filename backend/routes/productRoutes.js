
const express = require('express');

// Création d'un routeur Express
const router = express.Router();

// Importation des fonctions du Controller
const productController = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/roleMiddleware').adminOnly;
const validateobjectId = require('../middleware/validateObjectId');
const validaterequest = require('../middleware/validateRequest');
const { createProductValidation } = require('../middleware/productValidation');
const { updateProductValidation } = require('../middleware/productValidation');

// Récupérer tous les produits
router.get('/products',  productController.getAllProducts);

// Récupérer un produit par son ID
router.get('/products/:id', validateobjectId, productController.getProductById);

// Ajouter un nouveau produit
//protect : vérifie le token.
//adminOnly: vérifie le rôle.
// createProductValidation : applique les règles.
// validateRequest : vérifie les erreurs.
// createProduct : enregistre le produit.
router.post('/products', protect, adminOnly, createProductValidation, validaterequest,  productController.createProduct);

// Modifier un produit
router.put('/products/:id', protect, adminOnly, validateobjectId, updateProductValidation, validaterequest, productController.updateProduct);

// Supprimer un produit
router.delete('/products/:id', protect, adminOnly, validateobjectId, productController.deleteProduct);

// Exportation du routeur
module.exports = router;
