
// Récupérer le token JWT depuis localStorage
const token = localStorage.getItem('token');

// Récupérer les informations de l'utilisateur
const userData = localStorage.getItem('user');

// Vérifier si l'utilisateur est connecté
if (!token || !userData) {

    // Rediriger vers la page de connexion
    window.location.href = 'index.html';

} else {

    // Transformer les données JSON en objet JavaScript
    const user = JSON.parse(userData);

    // Afficher les informations de l'utilisateur
    document.getElementById('welcomeMessage').textContent =
        `Bienvenue ${user.name} sur votre espace personnel !`;

    document.getElementById('userName').textContent = user.name;

    document.getElementById('userEmail').textContent = user.email;

    document.getElementById('userRole').textContent = user.role;
}

// Récupérer le bouton de déconnexion
const logoutButton = document.getElementById('logoutButton');

// Écouter le clic sur le bouton
logoutButton.addEventListener('click', () => {

    // Supprimer le token JWT
    localStorage.removeItem('token');

    // Supprimer les informations utilisateur
    localStorage.removeItem('user');

    // Rediriger vers la page de connexion
    window.location.href = 'index.html';
});
