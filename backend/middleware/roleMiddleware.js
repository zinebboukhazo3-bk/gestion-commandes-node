 
// Autorise uniquement les utilisateurs ayant le rôle admin
const adminOnly = (req, res, next) => {
    // Le middleware protect doit être exécuté avant celui-ci
    if (!req.user) {
        return res.status(401).json({
            message: 'Authentification requise'
        });
    }

    // Vérifie le rôle enregistré dans le token JWT
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Accès refusé : réservé aux administrateurs'
        });
    }

    // Le rôle est admin : la requête peut continuer
    next();
};

module.exports = { adminOnly };
