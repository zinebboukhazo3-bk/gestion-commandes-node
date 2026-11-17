
const mongoose = require('mongoose');

// Définition de la structure d'un utilisateur
const userSchema = new mongoose.Schema({

    // Nom de l'utilisateur
    name: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },

    // Adresse email de l'utilisateur
    email: {
        type: String,
        required: [true, 'L email est obligatoire'],
        unique: true,
        lowercase: true,
        trim: true
    },

    // Mot de passe de l'utilisateur
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },

    // Rôle de l'utilisateur : client ou administrateur
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    }

}, {
    // Ajoute automatiquement les dates de création et de modification
    timestamps: true
});

// Création du modèle User
const User = mongoose.model('User', userSchema);

// Exportation du modèle
module.exports = User;
