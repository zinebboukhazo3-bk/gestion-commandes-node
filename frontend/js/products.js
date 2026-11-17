
// Récupérer le token JWT depuis localStorage
const token = localStorage.getItem('token');

// Récupérer les informations de l'utilisateur
const userData = localStorage.getItem('user');

// Vérifier si l'utilisateur est connecté
if (!token || !userData) {

    // Rediriger vers la page de connexion
    window.location.href = 'index.html';

} else {

    // Récupérer les éléments HTML
    const productsList = document.getElementById('productsList');
    const productsMessage = document.getElementById('productsMessage');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const logoutButton = document.getElementById('logoutButton');

    // Récupérer les boutons de pagination
    const previousPage = document.getElementById('previousPage');
    const nextPage = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    // Stocker les produits récupérés
    let products = [];

    // Mémoriser la page actuelle
    let currentPage = 1;

    // Mémoriser le nombre total de pages
    let totalPages = 1;

    // Définir le nombre de produits par page
    const limit = 4 ;


    // Charger les catégories disponibles depuis le backend
    const loadCategories = async () => {
        try {
            // Récupérer les produits pour obtenir leurs catégories
            const response = await fetch(
                'http://localhost:3000/products/products?limit=100',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur de chargement');
            }

            // Extraire les catégories sans répétition
            const categories = [
                ...new Set(
                    data.products
                        .map(product => product.category)
                        .filter(category => category)
                )
            ];

            // Ajouter les catégories dans le select
            categoryFilter.innerHTML =
                '<option value="">Toutes les catégories</option>';

            categories.forEach(category => {
                const option = document.createElement('option');

                option.value = category;
                option.textContent = category;

                categoryFilter.appendChild(option);
            });

        } catch (error) {
            console.error('Erreur lors du chargement des catégories :', error);
        }
    };

    // Récupérer les produits depuis le backend
    const getProducts = async () => {

        try {

            // Construire les paramètres de la requête
            const params = new URLSearchParams({
                page: currentPage,
                limit: limit,
                search: searchInput.value.trim(),
                category: categoryFilter.value,
                sort: sortFilter.value
            });

            // Envoyer la requête au backend
            const response = await fetch(
                `http://localhost:3000/products/products?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Récupérer la réponse JSON
            const data = await response.json();

            // Vérifier si la requête a échoué
            if (!response.ok) {
                throw new Error(
                    data.message || 'Erreur lors du chargement des produits'
                );
            }

            // Récupérer les produits et les informations de pagination
            products = data.products;
            totalPages = data.pagination.totalPages;

            // Afficher les produits
            displayProducts();

            // Mettre à jour la pagination
            updatePagination();

        } catch (error) {

            // Afficher le message d'erreur
            productsList.textContent = error.message;

            productsMessage.textContent = error.message;
            productsMessage.style.color = '#F87171';
        }
    };

    

    // Afficher les produits reçus du backend
    const displayProducts = () => {

        // Vider la liste précédente
        productsList.innerHTML = '';

        // Vérifier si aucun produit n'a été trouvé
        if (products.length === 0) {
            productsList.textContent = 'Aucun produit trouvé.';
            return;
        }

        // Parcourir les produits
        products.forEach(product => {

            // Créer une carte pour chaque produit
            const card = document.createElement('article');
            card.className = 'product-card';

            // Afficher le nom
            const name = document.createElement('h3');
            name.textContent = product.name;

            // Afficher la description
            const description = document.createElement('p');
            description.textContent =
                product.description || 'Aucune description';

            // Afficher la catégorie
            const categoryText = document.createElement('p');
            categoryText.textContent =
                `Catégorie : ${product.category || 'Non définie'}`;

            // Afficher le prix
            const price = document.createElement('p');
            price.className = 'product-price';
            price.textContent = `${product.price} DH`;

            // Afficher la quantité disponible
            const quantity = document.createElement('p');
            quantity.textContent = `Stock disponible : ${product.quantity}`;

            // Créer le bouton Ajouter au panier
            const addButton = document.createElement('button');
            addButton.className = 'add-to-cart';
            addButton.textContent = 'Ajouter au panier';

            // Désactiver le bouton si le produit est en rupture de stock
            addButton.disabled = product.quantity <= 0;

            // Écouter le clic sur le bouton
            addButton.addEventListener('click', () => {
                addToCart(product);
            });

            // Ajouter les éléments à la carte
            card.append(
                name,
                description,
                categoryText,
                price,
                quantity,
                addButton
            );
            // Ajouter la carte à la liste des produits
            productsList.appendChild(card);
        });
    };

    // Ajouter un produit au panier
    const addToCart = (product) => {

        // Récupérer le panier existant depuis localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Vérifier si le produit existe déjà dans le panier
        const existingProduct = cart.find(
            item => item.productId === product._id
        );

        if (existingProduct) {

            // Vérifier que la quantité ne dépasse pas le stock
            if (existingProduct.quantity < product.quantity) {

                // Augmenter la quantité du produit
                existingProduct.quantity++;

            } else {

                productsMessage.textContent = 'Stock insuffisant !';
                productsMessage.style.color = '#F87171';
                return;
            }

        } else {

            // Ajouter le nouveau produit au panier
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                stock: product.quantity
            });
        }

        // Enregistrer le panier dans localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Afficher un message de confirmation
        productsMessage.textContent =
            `${product.name} ajouté au panier avec succès !`;

        productsMessage.style.color = '#34D399';
    };

    // Mettre à jour les informations de pagination
    const updatePagination = () => {

        // Afficher le numéro de la page actuelle
        pageInfo.textContent =
            `Page ${currentPage} / ${totalPages}`;

        // Désactiver Précédent sur la première page
        previousPage.disabled = currentPage === 1;

        // Désactiver Suivant sur la dernière page
        nextPage.disabled = currentPage >= totalPages;
    };

    // Revenir à la page précédente
    previousPage.addEventListener('click', () => {

        if (currentPage > 1) {

            currentPage--;

            // Charger les produits de la page précédente
            getProducts();
        }
    });

    // Passer à la page suivante
    nextPage.addEventListener('click', () => {

        if (currentPage < totalPages) {

            currentPage++;

            // Charger les produits de la page suivante
            getProducts();
        }
    });

    // Écouter la recherche
    searchInput.addEventListener('input', () => {

        // Revenir à la première page après une nouvelle recherche
        currentPage = 1;

        getProducts();
    });

    // Écouter le changement de catégorie
    categoryFilter.addEventListener('change', () => {

        currentPage = 1;

        getProducts();
    });

    // Écouter le changement de tri
    sortFilter.addEventListener('change', () => {

        currentPage = 1;

        getProducts();
    });

    // Gérer la déconnexion
    logoutButton.addEventListener('click', () => {

        // Supprimer les informations de connexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Rediriger vers la page de connexion
        window.location.href = 'index.html';
    });

    // Initialiser le catalogue
    const initializeProducts = async () => {
        await loadCategories();
        await getProducts();
    };

    initializeProducts();
}
