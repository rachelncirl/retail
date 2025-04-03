const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const bodyParser = require('body-parser');

// Load the proto files
const product = protoLoader.loadSync('../protos/product.proto', {});
const productProto = grpc.loadPackageDefinition(product).product;

const cart = protoLoader.loadSync('../protos/cart.proto', {});
const cartProto = grpc.loadPackageDefinition(cart).cart;

const discount = protoLoader.loadSync('../protos/discount.proto', {});
const discountProto = grpc.loadPackageDefinition(discount).discount;

const purchase = protoLoader.loadSync('../protos/purchase.proto', {});
const purchaseProto = grpc.loadPackageDefinition(purchase).purchase;

const discovery = protoLoader.loadSync('../protos/discovery.proto', {});
const discoveryProto = grpc.loadPackageDefinition(discovery).discovery;

const chat = protoLoader.loadSync('../protos/chat.proto', {});
const chatProto = grpc.loadPackageDefinition(chat).chat;

const productClient = new productProto.ProductService('localhost:50051', grpc.credentials.createInsecure());
const cartClient = new cartProto.CartService('localhost:50052', grpc.credentials.createInsecure());
const discountClient = new discountProto.DiscountService('localhost:50053', grpc.credentials.createInsecure());
const purchaseClient = new purchaseProto.PurchaseService('localhost:50054', grpc.credentials.createInsecure());
const discoveryClient = new discoveryProto.DiscoveryService('localhost:50051', grpc.credentials.createInsecure());
const chatClient = new chatProto.ChatService('localhost:50051', grpc.credentials.createInsecure());

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Payment API call that will call the server to process the payment
app.post('/pay', (req, res) => {
    const paymentRequest = req.body
    console.log(paymentRequest);

    purchaseClient.Pay(paymentRequest, (error, response) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).send({
                message: 'An error occurred while emptying the cart',
                details: error.details,
            });
        } else {
            console.log('Payment Response: ' + response.message)
            res.status(200).send({
                message: response.message,
                success: response.success
            });
        }
    });
});

// Order API that will be called to place an order
app.post('/order', (req, res) => {

    const order = req.body

    // Open the stream
    const call = purchaseClient.Order((error, respomse) => {
      if (error) console.error(error);
      else console.log(respomse.message);
    });
  
    // Write the items to the stream
    for (let item of order) {
        const { id, brand, price } = item; 
        call.write({ id, brand, price });
    }
  
    // Close the stream
    call.end();
});

// Client Side API implementation to call the Discount Service
app.get('/discount', (req, res) => {
    const code = req.query.code;

    discountClient.GetDiscount({ code }, (error, response) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).send({
                message: 'An error occurred while applying the discount',
                details: error.details,
            });
        } else {
            console.log('Discount Amount: ' + response.percentage)
            res.status(200).send({
                percentage: response.percentage,
            });
        }
    });
});

// Define an endpoint that will trigger the gRPC client
app.get('/price', (req, res) => {
    const brand = req.query.brand;

    productClient.GetPrice({ brand }, (error, response) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).send({
                message: 'An error occurred while getting the price',
                details: error.details,
            });
        } else {
            res.status(200).send({
                brand: response.brand,
                price: response.price
            });
        }
    });
});

// Define an endpoint for listing shoes
app.get('/list', (req, res) => {

    // Create an array for gathering the shoe list
    let shoes = [];

    const call = productClient.ListShoes({});

    call.on("data", (shoe) => {

        // Add the shoe to the list
        shoes.push({
            id: shoe.id,
            brand: shoe.brand,
            price: shoe.price,
            description: shoe.description,
            image: shoe.image
        });
    });

    call.on("end", () => {
        // Return the list of shoes as a JSON response
        res.json(shoes);
    });

    call.on("error", (error) => {
        console.error(error);
        res.status(500).send('Error occurred while fetching shoes');
    });
});

// Define an endpoint for adding shoes to cart
app.get('/addToCart', (req, res) => {
    const id = req.query.id;
    const userId = req.query.userId;

    let cart = [];

    console.log("Product ID requested: " + id + " for User: " + userId);
    const call = cartClient.AddToCart({ id, userId });

    call.on("data", (shoe) => {
        cart.push({
            id: shoe.id,
            brand: shoe.brand,
            price: shoe.price
        });
    });

    call.on("end", () => {
        res.json(cart);
    });

    call.on("error", (error) => {
        console.error(error);
        res.status(500).send('Error occurred while adding to cart');
    });
});

// Define an endpoint for removing shoes from the cart
app.get('/removeFromCart', (req, res) => {
    const id = req.query.id;
    const userId = req.query.userId;

    let cart = [];

    console.log("Remove Product ID: " + id + " for User: " + userId);
    const call = cartClient.RemoveFromCart({ id, userId });

    call.on("data", (shoe) => {
        cart.push({
            id: shoe.id,
            brand: shoe.brand,
            price: shoe.price
        });
    });

    call.on("end", () => {
        res.json(cart);
    });

    call.on("error", (error) => {
        console.error(error);
        res.status(500).send('Error occurred while removing from the cart');
    });
});

// Define an endpoint for removing shoes from the cart
app.get('/refreshCart', (req, res) => {
    const userId = req.query.userId;

    let cart = [];

    console.log("Refresh Cart for User: " + userId);
    const call = cartClient.GetCartContents({ userId });

    call.on("data", (shoe) => {
        cart.push({
            id: shoe.id,
            brand: shoe.brand,
            price: shoe.price
        });
    });

    call.on("end", () => {
        res.json(cart);
    });

    call.on("error", (error) => {
        console.error(error);
        res.status(500).send('Error occurred while refreshing cart');
    });
});

// Define an endpoint for clearing the contents of the shopping cart
app.get('/clearCart', (req, res) => {
    const userId = req.query.userId;

    cartClient.EmptyCart({ userId }, (error, response) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).send({
                message: 'An error occurred while emptying the cart',
                details: error.details,
            });
        } else {
            res.status(200).send({
                message: response.message,
            });
        }
    });
});

// Serve static files (HTML, JS, etc.)
app.use(express.static('public'));

// Start the Express server
const PORT = process.env.PORT || 50050;
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});


// TODOS

// Bidirectional
function chatPlaceholder() {
    console.log("Chatting");
    const call = shopClient.Chat({});
    call.on("data", (mobile) => {
        console.log(`brand: ${mobile.brand}, Price: ${mobile.price}`)
    });
    call.on("end", () => console.log("End of mobile list"));
}

