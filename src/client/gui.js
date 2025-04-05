const express = require('express');
const product = require('./productClient');
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

app.listen(port, () => {
    console.log(`Client is running on port ${port}`);
});
