
// Récupérer le formulaire d'inscription
const registerForm = document.getElementById('registerForm');

// Récupérer la zone des messages
const message = document.getElementById('message');

// Écouter la soumission du formulaire
registerForm.addEventListener('submit', async (event) => {

    // Empêcher le rechargement de la page
    event.preventDefault();

    // Récupérer les valeurs saisies
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Vérifier que les deux mots de passe sont identiques
    if (password !== confirmPassword) {
        message.textContent = 'Les mots de passe ne correspondent pas.';
        message.style.color = '#F87171';
        return;
    }

    try {

        // Envoyer les informations au backend
        const response = await fetch('http://localhost:3000/users/register', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            // Envoyer les données sous forme JSON
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        // Récupérer la réponse du backend
        const data = await response.json();

        // Vérifier si la requête a échoué
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de l’inscription');
        }

        // Afficher le message de succès
        message.textContent = data.message || 'Inscription réussie !';
        message.style.color = '#34D399';

        // Réinitialiser le formulaire
        registerForm.reset();

    } catch (error) {

        // Afficher le message d'erreur
        message.textContent = error.message;
        message.style.color = '#F87171';
    }
});
