// Récupérer les éléments HTML
const orderDetails = document.getElementById('orderDetails');
const orderMessage = document.getElementById('orderMessage');
const logoutButton = document.getElementById('logoutButton');

// Récupérer le token JWT
const token = localStorage.getItem('token');

// Vérifier si l'utilisateur est connecté
if (!token) {
    window.location.href = 'index.html';
}

// Récupérer l'identifiant de la commande depuis l'URL
const params = new URLSearchParams(window.location.search);
const orderId = params.get('id');

// Vérifier si l'identifiant existe
if (!orderId) {
    orderMessage.textContent = 'Identifiant de commande introuvable.';
    orderMessage.style.color = '#F87171';
    
}

// Récupérer les détails d'une commande
const getOrderDetails = async () => {
    try {
        // Envoyer une requête au backend avec l'identifiant
        const response = await fetch(
            `http://localhost:3000/orders/my-orders/${orderId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Récupérer les données du serveur
        const data = await response.json();

        // Vérifier la réponse
        if (!response.ok) {
            throw new Error(data.message || 'Impossible de récupérer la commande');
        }

        // Récupérer la commande
        const order = data.order;

        // Vider le contenu initial
        orderDetails.innerHTML = '';
        // Créer la carte récapitulative de la commande
        const summaryCard = document.createElement('div');
        summaryCard.className = 'order-summary-card';

        // Afficher le numéro de commande
        const id = document.createElement('p');
        id.className = 'summary-id';
        id.textContent = `Commande N° : ${order._id}`;

        // Afficher la date
        const date = document.createElement('p');
        date.className = 'summary-date';
        date.textContent = `Date de commande : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`;

        const status = document.createElement('p');
        status.className = 'order-status';
        switch (order.status) {
            case 'en attente':
                status.classList.add('status-pending');
                break;

            case 'confirmée':
                status.classList.add('status-confirmed');
                break;

            case 'expédiée':
                status.classList.add('status-shipped');
                break;

            case 'livrée':
                status.classList.add('status-delivered');
                break;

            case 'annulée':
                status.classList.add('status-cancelled');
                break;
        }

        // Afficher le statut
        status.textContent = `Statut : ${order.status}`;

        // Afficher le montant total
        const total = document.createElement('p');
        total.className = 'summary-total';
        total.innerHTML = `Montant total : <strong>${order.totalAmount} DH</strong>`;

        // Ajouter les informations dans la carte
        summaryCard.append(id, date, status, total);

        // Ajouter la carte dans la page
        orderDetails.appendChild(summaryCard);

        // Créer la section de progression de la commande
        const progressSection = document.createElement('div');
        progressSection.className = 'order-progress';

        // Définir les différentes étapes du traitement
        const steps = [
            'en attente',
            'confirmée',
            'expédiée',
            'livrée'
        ];

        // Vérifier si la commande est annulée
        if (order.status === 'annulée') {

            // Afficher un message spécial pour une commande annulée
            progressSection.innerHTML = `
        <div class="cancelled-progress">
            <span>✕</span>
            <h3>Commande annulée</h3>
            <p>Cette commande a été annulée.</p>
        </div>
    `;

        } else {

            // Trouver la position du statut actuel
            const currentStep = steps.indexOf(order.status);

            // Créer les étapes de progression
            steps.forEach((step, index) => {

                const stepElement = document.createElement('div');
                stepElement.className = 'progress-step';

                // Vérifier si cette étape est terminée ou actuelle
                if (index <= currentStep) {
                    stepElement.classList.add('completed');
                }

                // Ajouter le cercle et le nom de l'étape
                stepElement.innerHTML = `
            <div class="progress-circle">
                ${index < currentStep ? '✓' : index + 1}
            </div>
            <p>${step.charAt(0).toUpperCase() + step.slice(1)}</p>
        `;

                progressSection.appendChild(stepElement);
            });
        }

        // Ajouter la progression dans la page
        orderDetails.appendChild(progressSection);

        // Titre de la section des produits
        const title = document.createElement('h3');
        title.textContent = 'Produits commandés :';
        orderDetails.appendChild(title);

        // Créer la liste des produits
        const productsList = document.createElement('ul');

        // Créer le tableau des produits de la commande
        const productsTable = document.createElement('table');
        productsTable.className = 'order-products-table';

        // Créer l'en-tête du tableau
        productsTable.innerHTML = `
    <thead>
        <tr>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Sous-total</th>
        </tr>
    </thead>
    <tbody></tbody>
`;

        const tbody = productsTable.querySelector('tbody');

        // Ajouter chaque produit dans le tableau
        order.items.forEach(item => {
            const tr = document.createElement('tr');

            // Calculer le sous-total du produit
            const subtotal = item.price * item.quantity;

            tr.innerHTML = `
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price} DH</td>
        <td>${subtotal} DH</td>
    `;

            tbody.appendChild(tr);
        });

        // Ajouter le tableau dans la page
        orderDetails.appendChild(productsTable);

        // Vérifier si la commande est encore en attente
        if (order.status === 'en attente') {

            // Créer le bouton d'annulation
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Annuler la commande';
            cancelButton.className = 'cancel-order-button';

            // Ajouter l'événement de clic
            cancelButton.addEventListener('click', () => {
                cancelOrder();
            });

            // Ajouter le bouton dans la page
            orderDetails.appendChild(cancelButton);
        }


    } catch (error) {
        // Afficher le message d'erreur
        orderMessage.textContent = error.message;
        orderMessage.style.color = '#F87171';
    }
};


// Annuler une commande
const cancelOrder = async () => {

    // Demander une confirmation au client
    const confirmed = window.confirm(
        'Voulez-vous vraiment annuler cette commande ?'
    );

    if (!confirmed) {
        return;
    }

    try {
        // Envoyer la demande d'annulation au backend
        const response = await fetch(
            `http://localhost:3000/orders/${orderId}/cancel`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Récupérer la réponse du serveur
        const data = await response.json();

        // Vérifier si l'annulation a réussi
        if (!response.ok) {
            throw new Error(data.message || "'Erreur lors de l'annulation'");
        }

        // Afficher le message de confirmation
        orderMessage.textContent = 'Commande annulée avec succès !';
        orderMessage.style.color = '#34D399';

        // Actualiser les détails de la commande
        await getOrderDetails();

    } catch (error) {
        orderMessage.textContent = error.message;
        orderMessage.style.color = '#F87171';
    }
};



// Déconnexion
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

// Charger les détails si l'identifiant est disponible
if (orderId) {
    getOrderDetails();
}