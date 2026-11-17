const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/roleMiddleware').adminOnly;
const validateobjectId = require('../middleware/validateObjectId');
const validaterequest = require('../middleware/validateRequest');
const { createOrderValidation, updateOrderStatusValidation } = require('../middleware/orderValidation');


// Toutes les routes de commande nécessitent une connexion
router.post('/', protect, createOrderValidation, validaterequest, orderController.createOrder);

router.get('/my-orders', protect, orderController.getMyOrders);

router.get('/my-orders/:id', protect, validateobjectId,  orderController.getMyOrderById);

router.get('/allorders', protect, adminOnly, orderController.getAllOrders);

router.put('/allorders/:id', protect, adminOnly, validateobjectId, updateOrderStatusValidation, validaterequest, orderController.updateOrderStatus);

// Annuler sa propre commande (client connecté)

router.put('/:id/cancel', protect, validateobjectId, orderController.cancelMyOrder);


module.exports = router;