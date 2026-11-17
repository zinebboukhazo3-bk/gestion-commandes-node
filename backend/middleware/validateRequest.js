
// Importer validationResult depuis express-validator
const { validationResult } = require('express-validator');

// Middleware pour vérifier les résultats de validation
const validateRequest = (req, res, next) => {

    // Récupérer les erreurs de validation
    const errors = validationResult(req);

    // Vérifier si des erreurs existent
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Erreur de validation des données',
            errors: errors.array()
        });
    }

    // Si aucune erreur, continuer vers le contrôleur
    next();
};

module.exports = validateRequest;

//لا يقوم هذا البرنامج الوسيط بتحديد القواعد بنفسه，
//  بل يسترجع الأخطاء الناتجة عن القواعد التي سنضيفها إلى المسارات
//ce middleware ne définit pas lui-même les règles. 
// Il récupère les erreurs produites par les règles que nous allons ajouter 
// dans les routes.