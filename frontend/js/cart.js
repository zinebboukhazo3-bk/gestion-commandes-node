
// Récupérer les éléments HTML
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const cartMessage = document.getElementById('cartMessage');
const checkoutButton = document.getElementById('checkoutButton');
const logoutButton = document.getElementById('logoutButton');

// Récupérer le token JWT
const token = localStorage.getItem('token');

// Vérifier si l'utilisateur est connecté
if (!token) {
    window.location.href = 'index.html';
}

// Récupérer le panier depuis localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Afficher les produits du panier
const displayCart = () => {

    // Vider la liste précédente
    cartList.innerHTML = '';

    // Vérifier si le panier est vide
    if (cart.length === 0) {

        cartList.textContent = 'Votre panier est vide.';

        // Afficher un total égal à zéro
        cartTotal.textContent = '0 DH';

        // Désactiver le bouton de commande
        checkoutButton.disabled = true;

        return;
    }

    // Activer le bouton de commande
    checkoutButton.disabled = false;

    // Calculer le montant total
    let total = 0;

    // Parcourir les produits du panier
    cart.forEach((product, index) => {

        // Calculer le sous-total du produit
        const subtotal = product.price * product.quantity;

        // Ajouter le sous-total au total général
        total += subtotal;

        // Créer une carte pour le produit
        const card = document.createElement('div');
        card.className = 'cart-item';

        // Afficher le nom du produit
        const name = document.createElement('h3');
        name.textContent = product.name;

        // Afficher le prix unitaire
        const price = document.createElement('p');
        price.textContent = `Prix unitaire : ${product.price} DH`;

        // Créer le conteneur des boutons de quantité
        const quantityContainer = document.createElement('div');
        quantityContainer.className = 'quantity-controls';

        // Créer le bouton pour diminuer la quantité
        const decreaseButton = document.createElement('button');
        decreaseButton.textContent = '-';
        decreaseButton.className = 'quantity-button';

        // Désactiver le bouton si la quantité est égale à 1
        decreaseButton.disabled = product.quantity <= 1;

        

        // Créer l'affichage de la quantité
        const quantity = document.createElement('span');
        quantity.textContent = product.quantity;

        // Créer le bouton pour augmenter la quantité
        const increaseButton = document.createElement('button');
        increaseButton.textContent = '+';
        increaseButton.className = 'quantity-button';

        // Désactiver le bouton si le stock est atteint
        increaseButton.disabled = product.quantity >= product.stock;

        // Ajouter les boutons et la quantité au conteneur
        quantityContainer.append(
            decreaseButton,
            quantity,
            increaseButton
        );

        // Diminuer la quantité du produit
        decreaseButton.addEventListener('click', () => {
            updateQuantity(index, -1);
        });

        // Augmenter la quantité du produit
        increaseButton.addEventListener('click', () => {
            updateQuantity(index, 1);
        });
        // Afficher le sous-total
        const productTotal = document.createElement('p');
        productTotal.textContent = `Sous-total : ${subtotal} DH`;

        // Créer le bouton de suppression
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.className = 'delete-cart-item';

        // Supprimer le produit du panier
        deleteButton.addEventListener('click', () => {
            removeFromCart(index);
        });

        // Ajouter les éléments à la carte
       
        card.append(
            name,
            price,
            quantityContainer,
            productTotal,
            deleteButton
        );

        // Ajouter la carte à la liste
        cartList.appendChild(card);
    });

    // Afficher le montant total
    cartTotal.textContent = `${total} DH`;
};
// Modifier la quantité d'un produit dans le panier
const updateQuantity = (index, change) => {

    // Récupérer le produit sélectionné
    const product = cart[index];

    // Calculer la nouvelle quantité
    const newQuantity = product.quantity + change;

    // Vérifier que la quantité ne descend pas sous 1
    if (newQuantity < 1) {
        return;
    }

    // Vérifier que la quantité ne dépasse pas le stock
    if (newQuantity > product.stock) {

        cartMessage.textContent = 'Stock insuffisant !';
        cartMessage.style.color = '#F87171';

        return;
    }

    // Mettre à jour la quantité
    product.quantity = newQuantity;

    // Enregistrer le panier dans localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Effacer les anciens messages
    cartMessage.textContent = '';

    // Actualiser l'affichage du panier
    displayCart();
};

// Supprimer un produit du panier
const removeFromCart = (index) => {

    // Supprimer le produit sélectionné
    cart.splice(index, 1);

    // Enregistrer le panier mis à jour
    localStorage.setItem('cart', JSON.stringify(cart));

    // Afficher un message de confirmation
    cartMessage.textContent = 'Produit supprimé du panier.';
    cartMessage.style.color = '#34D399';

    // Actualiser l'affichage
    displayCart();
};

// Gérer la déconnexion
logoutButton.addEventListener('click', () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.location.href = 'index.html';
});


// Afficher le panier au chargement de la page
displayCart();



// Créer une nouvelle commande
const checkout = async () => {
    try {
        // Vérifier que le panier n'est pas vide
        if (cart.length === 0) {
            cartMessage.textContent = 'Votre panier est vide.';
            cartMessage.style.color = '#F87171';
            return;
        }

        // Désactiver le bouton pendant le traitement
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Traitement en cours...';

        // Préparer les produits et leurs quantités
        const items = cart.map(product => ({
            productId: product.productId,
            quantity: product.quantity
        }));

        // Envoyer la commande au backend
        const response = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items })
        });

        // Récupérer la réponse du serveur
        const data = await response.json();

        // Vérifier si la commande a été créée
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la commande');
        }

        // Vider le panier après la création réussie
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));

        // Actualiser l'affichage
        displayCart();

        // Afficher le message de confirmation
        cartMessage.textContent = 'Commande créée avec succès !';
        cartMessage.style.color = '#34D399';

    } catch (error) {
        // Afficher le message d'erreur
        cartMessage.textContent = error.message;
        cartMessage.style.color = '#F87171';

    } finally {
        // Réactiver le bouton
        checkoutButton.disabled = cart.length === 0;
        checkoutButton.textContent = 'Passer la commande';
    }
};

// Déclencher la création de commande au clic
checkoutButton.addEventListener('click', checkout);
