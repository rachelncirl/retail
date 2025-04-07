const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const cart = protoLoader.loadSync('../protos/cart.proto', {});
const cartProto = grpc.loadPackageDefinition(cart).cart;
const cartClient = new cartProto.CartService('localhost:50052', grpc.credentials.createInsecure());

function addToCart(req, callback) {

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
        callback(null, cart);
    });

    call.on("error", (error) => {
        console.error(error);
        callback(error, 'Error occurred while adding to cart');
    });
}

function removeFromCart(req, callback) {
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
        callback(null, cart);
    });

    call.on("error", (error) => {
        console.error(error);
        callback(error, 'Error occurred while removing from the cart');
    });
}

function refreshCart(req, callback) {
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
        callback(null, cart);
    });

    call.on("error", (error) => {
        console.error(error);
        callback(error, 'Error occurred while refreshing cart');
    });
}

function clearCart(req, callback) {
    const userId = req.query.userId;

    cartClient.EmptyCart({ userId }, (error) => {
        if (error) {
            console.error('Error:', error);
            callback(error, 'Error occurred while clearing the cart');
        } else {
            callback(null, null);
        }
    });
}

module.exports = { addToCart, removeFromCart, refreshCart, clearCart };