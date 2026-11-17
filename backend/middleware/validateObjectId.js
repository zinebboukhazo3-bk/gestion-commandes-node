
// Importer Mongoose pour vérifier les identifiants MongoDB
const mongoose = require('mongoose');

// Middleware pour valider un identifiant MongoDB
const validateObjectId = (req, res, next) => {

    // Récupérer l'identifiant depuis les paramètres de l'URL
    const id = req.params.id;

    // Vérifier si l'identifiant est valide
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: 'Identifiant MongoDB invalide'
        });
    }

    // Si l'identifiant est valide, passer au middleware suivant
    next();
};

module.exports = validateObjectId;
