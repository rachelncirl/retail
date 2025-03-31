const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto files
const greeting = protoLoader.loadSync(path.join(__dirname, '../protos/greeting.proto'), {});
const greeterProto = grpc.loadPackageDefinition(greeting).greeter;

const shop = protoLoader.loadSync('../protos/shop.proto', {});
const shopProto = grpc.loadPackageDefinition(shop).shop;

const client = new shopProto.ShoeShop('localhost:50051', grpc.credentials.createInsecure());
const greeter = new greeterProto.Greeter('localhost:50060', grpc.credentials.createInsecure());

// Create an Express app
const app = express();

// Define an endpoint that will trigger the gRPC client
app.get('/discount', (req, res) => {
    const code = req.query.code;
    console.log("Code entered");

    // TODO

    // Response
    res.send(`Discount code ${code} applied!`);
});

// Define an endpoint for listing shoes
app.get('/list', (req, res) => {

    // Create an array for gathering the shoe list
    let shoes = [];

    const call = client.ListShoes({});

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
    const call = client.AddToCart({ id, userId });

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
    const call = client.RemoveFromCart({ id, userId });

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
app.get('/refreshCart', (req, res) => {
    const id = req.query.id;
    const userId = req.query.userId;

    let cart = [];

    console.log("Remove Product ID: " + id + " for User: " + userId);
    const call = client.GetCartContents({ userId });

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

    client.EmptyCart({ userId }, (error, response) => {
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


// Shop CLient

// Unary - Change to Discount Service 
function getPrice() {
    const brand = readlineSync.question("Enter mobile brand: ");
    console.log(brand);
    client.GetPrice({ brand }, (error, response) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`brand: ${response.brand}, Price: ${response.price}`);
        }
    });
}

// Unary
function purchase() {
    let cartId = 1;
    client.Purchase({ cartId }, (error, response) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`${response.message}`);
        }
    });
}

// Server rpc
function listShoes() {
    const call = client.ListShoes({});
    call.on("data", (shop) => {
        console.log(`brand: ${shop.brand}, Price: ${shop.price}`)
    });
    call.on("end", () => console.log("End of shoe list"));
}

// Client rpc
function shoppingCart() {
    const call = client.ShoppingCart((error, respomse) => {
        if (error) console.error(error);
        else console.log(respomse.message);
    });

    let moreItems = true;
    while (moreItems) {
        const brand = readlineSync.question("Enter Shoe brand: ");
        const size = parseInt(readlineSync.question("Enter size: "));
        const color = readlineSync.question("Enter color: ");
        const quantity = parseInt(readlineSync.question("Enter quantity: "));
        call.write({ brand, size, color, quantity });
        moreItems = readlineSync.keyInYN("Add another item to the Shopping Cart?");
    }

    call.end();
}

// Server rpc
function viewCartContents() {
    const call = client.ViewCart({});
    call.on("data", (cart) => {
        console.log(`Brand: ${cart.brand}, Size: ${cart.size}, Color: ${cart.color}, Quantity: ${cart.quantity}`)
    });
    call.on("end", () => console.log("End of Cart Items list"));
}

// Bidirectional
function chat() {
    console.log("Chatting");
    const call = client.Chat({});
    call.on("data", (mobile) => {
        console.log(`brand: ${mobile.brand}, Price: ${mobile.price}`)
    });
    call.on("end", () => console.log("End of mobile list"));
}

