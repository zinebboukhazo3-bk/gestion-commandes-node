
// ============================================
// 1. RÉCUPÉRER LES ÉLÉMENTS HTML
// ============================================

const ordersList = document.getElementById('ordersList');
const ordersMessage = document.getElementById('ordersMessage');

const logoutButton = document.getElementById('logoutButton');

const statusFilter = document.getElementById('statusFilter');
const orderSearch = document.getElementById('orderSearch');
const sortOrders = document.getElementById('sortOrders');

// Éléments des statistiques
const totalOrdersElement = document.getElementById('totalOrders');
const pendingOrdersElement = document.getElementById('pendingOrders');
const shippedOrdersElement = document.getElementById('shippedOrders');
const totalAmountElement = document.getElementById('totalAmount');

// Éléments de pagination
const ordersPagination = document.getElementById('ordersPagination');
const previousPageButton = document.getElementById('previousPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');


// ============================================
// 2. CONFIGURATION
// ============================================

// Récupérer le token JWT
const token = localStorage.getItem('token');

// Stocker toutes les commandes récupérées
let allOrders = [];

// Nombre de commandes à afficher par page
const ordersPerPage = 5;

// Page actuellement affichée
let currentPage = 1;

// Résultat après recherche, filtrage et tri
let filteredOrders = [];


// ============================================
// 3. VÉRIFIER L'AUTHENTIFICATION
// ============================================

if (!token) {
    window.location.href = 'index.html';
}


// ============================================
// 4. RÉCUPÉRER LES COMMANDES DU CLIENT
// ============================================

const getMyOrders = async () => {

    try {

        ordersList.textContent = 'Chargement des commandes...';

        const response = await fetch(
            'http://localhost:3000/orders/my-orders',
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'Erreur lors du chargement des commandes'
            );
        }

        // Vérifier que la réponse contient un tableau
        allOrders = Array.isArray(data.orders) ? data.orders : [];

        // Mettre à jour les statistiques
        updateStatistics();

        // Appliquer recherche, filtre et tri
        applyFilters();

        // Désactiver les contrôles si aucune commande
        if (allOrders.length === 0) {

            ordersList.textContent =
                'Vous n’avez pas encore passé de commande.';

            statusFilter.disabled = true;
            orderSearch.disabled = true;
            sortOrders.disabled = true;

            ordersPagination.style.display = 'none';
        }

    } catch (error) {

        ordersList.textContent = '';

        ordersMessage.textContent = error.message;
        ordersMessage.style.color = '#F87171';

    }

};


// ============================================
// 5. CALCULER LES STATISTIQUES
// ============================================

const updateStatistics = () => {

    // Nombre total de commandes
    const totalOrders = allOrders.length;

    // Nombre de commandes en attente
    const pendingOrders = allOrders.filter(order => {
        return order.status === 'en attente';
    }).length;

    // Nombre de commandes expédiées
    const shippedOrders = allOrders.filter(order => {
        return order.status === 'expédiée';
    }).length;

    // Calculer le montant total des commandes
    const totalAmount = allOrders.reduce((total, order) => {
        return total + Number(order.totalAmount || 0);
    }, 0);

    // Afficher les résultats
    totalOrdersElement.textContent = totalOrders;
    pendingOrdersElement.textContent = pendingOrders;
    shippedOrdersElement.textContent = shippedOrders;

    totalAmountElement.textContent =
        `${totalAmount.toLocaleString('fr-FR')} DH`;

};


// ============================================
// 6. APPLIQUER RECHERCHE ET FILTRAGE
// ============================================

const applyFilters = () => {

    // Récupérer les valeurs des contrôles
    const selectedStatus = statusFilter.value;
    const searchValue = orderSearch.value.trim().toLowerCase();

    // Filtrer les commandes
    filteredOrders = allOrders.filter(order => {

        // Vérifier le statut
        const matchesStatus =
            selectedStatus === 'tous' ||
            order.status === selectedStatus;

        // Vérifier le numéro de commande
        const matchesSearch =
            order._id.toLowerCase().includes(searchValue);

        return matchesStatus && matchesSearch;

    });

    // Revenir à la première page après une recherche ou un filtre
    currentPage = 1;

    // Appliquer le tri
    applySorting();

};


// ============================================
// 7. TRIER LES COMMANDES
// ============================================

const applySorting = () => {

    const selectedSort = sortOrders.value;

    // Trier une copie pour ne pas modifier le tableau original
    const sortedOrders = [...filteredOrders];

    switch (selectedSort) {

        case 'newest':

            // De la plus récente à la plus ancienne
            sortedOrders.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            break;

        case 'oldest':

            // De la plus ancienne à la plus récente
            sortedOrders.sort((a, b) => {
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

            break;

        case 'price-asc':

            // Du montant le plus petit au plus grand
            sortedOrders.sort((a, b) => {
                return Number(a.totalAmount) - Number(b.totalAmount);
            });

            break;

        case 'price-desc':

            // Du montant le plus grand au plus petit
            sortedOrders.sort((a, b) => {
                return Number(b.totalAmount) - Number(a.totalAmount);
            });

            break;

    }

    // Afficher les commandes triées
    displayOrders(sortedOrders);

};


// ============================================
// 8. AFFICHER LES COMMANDES
// ============================================

const displayOrders = (orders) => {

    // Vider la liste avant de l'actualiser
    ordersList.innerHTML = '';

    // Vérifier si des commandes existent
    if (orders.length === 0) {

        ordersList.textContent =
            'Aucune commande trouvée pour cette recherche.';

        ordersPagination.style.display = 'none';

        return;
    }

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    // S'assurer que la page actuelle est valide
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    // Calculer les positions de début et de fin
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;

    // Récupérer uniquement les commandes de la page actuelle
    const currentOrders = orders.slice(startIndex, endIndex);


    // Parcourir les commandes à afficher
    currentOrders.forEach(order => {

        // Créer la carte de commande
        const card = document.createElement('div');
        card.className = 'order-card';

        // Numéro de commande
        const orderId = document.createElement('h3');
        orderId.textContent = `Commande : ${order._id}`;

        // Date de commande
        const date = document.createElement('p');

        date.textContent =
            `Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`;

        // Montant total
        const total = document.createElement('p');

        total.textContent =
            `Total : ${Number(order.totalAmount).toLocaleString('fr-FR')} DH`;

        // Statut de commande
        const status = document.createElement('p');
        status.className = 'order-status';

        // Ajouter une classe CSS selon le statut
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

        status.textContent = `Statut : ${order.status}`;


        // Titre de la liste des produits
        const productsTitle = document.createElement('h4');
        productsTitle.textContent = 'Produits commandés :';

        // Liste des produits
        const productsList = document.createElement('ul');

        // Parcourir les produits de la commande
        (order.items || []).forEach(item => {

            const productItem = document.createElement('li');

            // Afficher les informations du produit
            const productName = item.product
                ? item.product.name
                : 'Produit indisponible';

            productItem.textContent =
                `${productName} | Quantité : ${item.quantity} | Prix : ${item.price} DH`;

            productsList.appendChild(productItem);

        });


        // Bouton pour voir les détails
        const detailsButton = document.createElement('button');

        detailsButton.textContent = 'Voir les détails';
        detailsButton.className = 'details-button';

        // Redirection vers la page des détails
        detailsButton.addEventListener('click', () => {

            window.location.href =
                `order-details.html?id=${order._id}`;

        });


        // Ajouter les éléments à la carte
        card.append(
            orderId,
            date,
            total,
            status,
            productsTitle,
            productsList,
            detailsButton
        );

        // Ajouter la carte à la liste
        ordersList.appendChild(card);

    });


    // Actualiser la pagination
    updatePagination(totalPages);

};


// ============================================
// 9. GÉRER LA PAGINATION
// ============================================

const updatePagination = (totalPages) => {

    // Afficher la pagination
    ordersPagination.style.display = 'flex';

    // Afficher le numéro de la page actuelle
    pageInfo.textContent =
        `Page ${currentPage} sur ${totalPages}`;

    // Désactiver le bouton précédent sur la première page
    previousPageButton.disabled = currentPage === 1;

    // Désactiver le bouton suivant sur la dernière page
    nextPageButton.disabled = currentPage === totalPages;

};


// Aller à la page précédente
previousPageButton.addEventListener('click', () => {

    if (currentPage > 1) {

        currentPage--;

        applySorting();

    }

});


// Aller à la page suivante
nextPageButton.addEventListener('click', () => {

    const totalPages = Math.ceil(
        filteredOrders.length / ordersPerPage
    );

    if (currentPage < totalPages) {

        currentPage++;

        applySorting();

    }

});


// ============================================
// 10. ÉVÉNEMENTS DE RECHERCHE, FILTRE ET TRI
// ============================================

// Rechercher une commande
orderSearch.addEventListener('input', applyFilters);

// Filtrer selon le statut
statusFilter.addEventListener('change', applyFilters);

// Trier les commandes
sortOrders.addEventListener('change', () => {

    currentPage = 1;

    applySorting();

});


// ============================================
// 11. DÉCONNEXION
// ============================================

logoutButton.addEventListener('click', () => {

    // Supprimer les informations de connexion
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Retourner à la page de connexion
    window.location.href = 'index.html';

});


// ============================================
// 12. CHARGER LES COMMANDES AU DÉMARRAGE
// ============================================

getMyOrders();
