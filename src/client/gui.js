const express = require('express');
const product = require('./productClient');
const cart = require('./cartClient');
const discovery = require('./discoveryClient');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/list', (req, res) => {

    // Discover product service and then fetch product info
    discovery.discoverService('productService', (productService) => {
        if (!productService) {
            res.status(500).send("Service not found");
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
            res.send(product);
        });
    });
});

app.get('/addToCart', (req, res) => {

    // Discover product service and then fetch product info
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Service not found");
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
            res.send(cartItems);
        });
    });
});

app.get('/removeFromCart', (req, res) => {

    // Discover product service and then fetch product info
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Service not found");
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
            res.send(cartItems);
        });
    });
});

app.get('/refreshCart', (req, res) => {

    // Discover product service and then fetch product info
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Service not found");
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
            res.send(cartItems);
        });
    });
});

app.get('/clearCart', (req, res) => {

    // Discover product service and then fetch product info
    discovery.discoverService('cartService', (cartService) => {
        if (!cartService) {
            res.status(500).send("Service not found");
            return;
        }

        cart.clearCart(req, (err, cartItems) => {
            if (err) {
                res.status(500).send("Error clearing the cart");
                return;
            }

            if (!cartItems) {
                res.send("Cart not found");
                return;
            }
            res.send(cartItems);
        });
    });
});

app.listen(port, () => {
    console.log(`Client is running on port ${port}`);
});
