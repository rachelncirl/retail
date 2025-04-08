const express = require('express');
const product = require('./productClient');
const cart = require('./cartClient');
const discount = require('./discountClient');
const purchase = require('./purchaseClient');
const chat = require('./chatClient');
const discovery = require('./discoveryClient');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Product

app.get('/list', (req, res) => {

    // Discover product service and then fetch product list
    discovery.discoverService('productService', (productService) => {
        if (!productService) {
            res.status(500).send("Product Service not found");
            return;
        }

        product.getProducts((err, product) => {
            if (err) {
                res.status(500).send("Error fetching product");
                return;
            }

            if (!product) {
                res.send("Product not found");
                return;
            }
            res.status(200).send(product);
        });
    });
});

// Cart

app.get('/addToCart', (req, res) => {

    // Discover cart service and then add item to the cart
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Cart Service not found");
            return;
        }

        cart.addToCart(req, (err, cartItems) => {
            if (err) {
                res.status(500).send("Error adding item to cart");
                return;
            }

            if (!cartItems) {
                res.send("Cart not found");
                return;
            }
            res.status(200).send(cartItems);
        });
    });
});

app.get('/removeFromCart', (req, res) => {

    // Discover cart service and then remove item from the cart
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Cart Service not found");
            return;
        }

        cart.removeFromCart(req, (err, cartItems) => {
            if (err) {
                res.status(500).send("Error removing item to cart");
                return;
            }

            if (!cartItems) {
                res.send("Cart not found");
                return;
            }
            res.status(200).send(cartItems);
        });
    });
});

app.get('/refreshCart', (req, res) => {

    // Discover cart service and then refresh the cart contents
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Cart Service not found");
            return;
        }

        cart.refreshCart(req, (err, cartItems) => {
            if (err) {
                res.status(500).send("Error refreshing the cart");
                return;
            }

            if (!cartItems) {
                res.send("Cart not found");
                return;
            }
            res.status(200).send(cartItems);
        });
    });
});

app.get('/clearCart', (req, res) => {

    // Discover cart service and then clear the cart
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Cart Service not found");
            return;
        }

        cart.clearCart(req, (err) => {
            if (err) {
                res.status(500).send("Error clearing the cart");
                return;
            }
            res.status(200).send("Cart Cleared Successfully");
        });
    });
});

// Discount

app.get('/discount', (req, res) => {

    // Discover discount service and then fetch the discount
    discovery.discoverService('discountService', (discountService) => {
        if (!discountService) {
            res.status(500).send("Discount Service not found");
            return;
        }

        discount.applyDiscount(req, (err, discountData) => {
            if (err) {
                res.status(500).send("Error applying the discount");
                return;
            }
            res.status(200).send(discountData);
        });
    });
});



// Purchase

app.post('/pay', (req, res) => {

    // Discover purchase service and then make the payment
    discovery.discoverService('purchaseService', (purchaseService) => {
        if (!purchaseService) {
            res.status(500).send("Purchase Service not found");
            return;
        }

        purchase.pay(req, (err, paymentData) => {
            if (err) {
                res.status(500).send("Error paying for the Order");
                return;
            }
            res.status(200).send(paymentData);
        });
    });
});

app.post('/order', (req, res) => {

    // Discover purchase service and then place the order
    discovery.discoverService('purchaseService', (purchaseService) => {
        if (!purchaseService) {
            res.status(500).send("Purchase Service not found");
            return;
        }

        purchase.order(req, (err, orderData) => {
            if (err) {
                res.status(500).send("Error placing the Order");
                return;
            }
            res.status(200).send(orderData);
        });
    });
});

// Chat

app.get('/chat', (req, res) => {

    // Discover discount service and then fetch the discount
    discovery.discoverService('chatService', (chatService) => {
        if (!chatService) {
            res.status(500).send("Chat Service not found");
            return;
        }

        console.log(req.query.id, req.query.message);
        chat.sendMessage(req.query.id, req.query.message);
    });
});

app.listen(port, () => {
    console.log(`Client is running on port ${port}`);
});
