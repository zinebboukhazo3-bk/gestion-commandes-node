
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fonction pour inscrire un nouvel utilisateur
const registerUser = async (req, res) => {
    try {
        // Récupération des données envoyées par le client
        const { name, email, password } = req.body;

        // Vérification des champs obligatoires
        if (!name || !email || !password ) {
            return res.status(400).json({
                message: 'Tous les champs sont obligatoires'
            });
        }

        // Vérification si l'email existe déjà
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        // Hachage du mot de passe avant son enregistrement
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création du nouvel utilisateur
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Enregistrement de l'utilisateur dans MongoDB
        const savedUser = await newUser.save();

        // Réponse envoyée au client sans révéler le mot de passe
        res.status(201).json({
            message: 'Utilisateur inscrit avec succès',
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de l inscription',
            error: error.message
        });
    }
};


// Fonction pour récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
    try {
        // Récupération des utilisateurs sans leurs mots de passe
        const users = await User.find().select('-password');

        res.status(200).json({
            message: 'Liste des utilisateurs récupérée avec succès',
            users
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérification des champs obligatoires
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email et mot de passe sont obligatoires'
            });
        }

        // Recherche de l'utilisateur par email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Mot de passe incorrect'
            });
        }

        // Génération du token JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Réponse envoyée au client
        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la connexion',
            error: error.message
        });
    }
};

// Fonction pour récupérer le profil de l'utilisateur connecté
const getMyProfile = async (req, res) => {
    try {
        // Récupérer l'utilisateur connecté grâce à son ID
        const user = await User.findById(req.user.id).select('-password');

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        // Retourner les informations de l'utilisateur
        res.status(200).json({
            message: 'Profil récupéré avec succès',
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        });
    }
};



// Fonction pour modifier le profil de l'utilisateur connecté
const updateMyProfile = async (req, res) => {
    try {
        // Récupérer uniquement les champs autorisés
        const { name, email } = req.body;

        // Vérifier qu'au moins un champ est envoyé
        if (name === undefined && email === undefined) {
            return res.status(400).json({
                message: 'Veuillez fournir au moins une information à modifier'
            });
        }

        // Préparer les nouvelles informations
        const updateData = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    message: 'Le nom ne peut pas être vide'
                });
            }

            updateData.name = name.trim();
        }

        if (email !== undefined) {
            if (!email.trim()) {
                return res.status(400).json({
                    message: 'L’adresse e-mail ne peut pas être vide'
                });
            }

            updateData.email = email.trim().toLowerCase();
        }

        // Modifier uniquement le profil de l'utilisateur connecté
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            {
                new: true,          // Retourner les nouvelles données
                runValidators: true // Appliquer les validations du modèle
            }
        ).select('-password');

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        res.status(200).json({
            message: 'Profil modifié avec succès',
            user
        });

    } catch (error) {
        // Gérer le cas où l'e-mail existe déjà
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Cette adresse e-mail est déjà utilisée'
            });
        }

        res.status(500).json({
            message: 'Erreur lors de la modification du profil',
            error: error.message
        });
    }
};



// Fonction pour changer le mot de passe de l'utilisateur connecté
const changePassword = async (req, res) => {
    try {
        // Récupérer les mots de passe envoyés dans la requête
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Vérifier que tous les champs sont fournis
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: 'Tous les champs sont obligatoires'
            });
        }

        // Vérifier que le nouveau mot de passe est suffisamment long
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
            });
        }

        // Vérifier que les deux nouveaux mots de passe correspondent
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'La confirmation du mot de passe est incorrecte'
            });
        }

        // Récupérer l'utilisateur connecté
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        // Comparer l'ancien mot de passe avec le hash enregistré
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Ancien mot de passe incorrect'
            });
        }

        // Hasher le nouveau mot de passe avant de l'enregistrer
        user.password = await bcrypt.hash(newPassword, 10);

        // Enregistrer les modifications dans MongoDB
        await user.save();

        res.status(200).json({
            message: 'Mot de passe modifié avec succès'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors du changement du mot de passe',
            error: error.message
        });
    }
};

// Exportation des fonctions
module.exports = {
    registerUser,
    getAllUsers, 
    loginUser,
    getMyProfile,
    updateMyProfile,
    changePassword
};
