
const express = require('express');
const router = express.Router();

// Importation des fonctions du Controller
const userController = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../middleware/userValidation');
const validaterequest = require('../middleware/validateRequest');


// Route pour inscrire un utilisateur
router.post('/register', registerValidation, validaterequest, userController.registerUser );

// Route pour récupérer tous les utilisateurs
router.get('/users', protect, userController.getAllUsers);

// Route pour connecter un utilisateur
router.post('/login', loginValidation, validaterequest, userController.loginUser);

// Route pour récupérer le profil de l'utilisateur connecté

router.get('/me', protect, userController.getMyProfile);

// Route pour modifier le profil de l'utilisateur connecté
router.put('/me', protect, userController.updateMyProfile);

// Route pour changer le mot de passe de l'utilisateur connecté
router.put('/me/password', protect, userController.changePassword);



module.exports = router;
