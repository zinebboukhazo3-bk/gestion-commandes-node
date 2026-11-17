
// Récupérer le formulaire de connexion
const loginForm = document.getElementById('loginForm');

// Récupérer la zone d'affichage des messages
const message = document.getElementById('message');

// Écouter la soumission du formulaire
loginForm.addEventListener('submit', async (event) => {

    // Empêcher le rechargement automatique de la page
    event.preventDefault();

    // Récupérer les valeurs saisies par l'utilisateur
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {

        // Envoyer les identifiants au backend
        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            // Transformer les données en JSON
            body: JSON.stringify({ email, password })
        });

        // Récupérer la réponse du backend
        const data = await response.json();

        // Vérifier si la requête a échoué
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la connexion');
        }

        // Enregistrer le token JWT
        localStorage.setItem('token', data.token);

        // Enregistrer les informations de l'utilisateur
        localStorage.setItem('user', JSON.stringify(data.user));

        // Afficher un message de succès
        message.textContent = data.message || 'Connexion réussie';
        message.style.color = '#34D399';

        // Rediriger vers le tableau de bord après une courte attente
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {

        // Afficher le message d'erreur
        message.textContent = error.message;
        message.style.color = '#F87171';
    }
});
