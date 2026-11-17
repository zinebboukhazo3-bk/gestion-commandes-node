// Charge les variables du fichier .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connexion');

const app = express();
app.use(cors());
const PORT = 3000;

// Permet à Express de lire les données JSON envoyées dans les requêtes
app.use(express.json());

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);


// Démarre la connexion à MongoDB
connectDB();






// Route de test
app.get('/', (req, res) => {
    res.send('Bienvenue dans l’API Gestion des commandes');
});

// Démarre le serveur Express
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});