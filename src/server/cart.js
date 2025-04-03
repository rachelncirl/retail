const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const cart = protoLoader.loadSync('../protos/cart.proto', {});
const cartProto = grpc.loadPackageDefinition(cart).cart;

// Hardcoded product list
const shoes = [
  { id: "NB1", brand: "New Balance", price: 120, description: "530"},
  { id: "DR1", brand: "Dr Martens", price: 200, description: "1460 Pascal"},
  { id: "AD1", brand: "Adidas", price: 100, description: "VL Court 3.0"},
  { id: "CV1", brand: "Converse", price: 75, description: "All Star Hi"},
  { id: "BK1", brand: "Birkenstock", price: 90, description: "Arizona"},
  { id: "CR1", brand: "Crocs", price: 90, description: "Classic Clog"}
];

// Map to hold user carts: key is userId, value is an array of cart items
const userCarts = new Map();

// Server streaming - Add an item to the cart
function AddToCart(call) {
  const shoe = shoes.find(s => s.id === call.request.id);
  if (shoe) {
    const userId = call.request.userId; 
    if (!userCarts.has(userId)) {
      userCarts.set(userId, []);
    }
    userCarts.get(userId).push(shoe);
    console.log(`${userId} added ${shoe.brand} to their cart. Cart size: ${userCarts.get(userId).length}`);
    
    // Return the contents of the cart after adding the shoe
    userCarts.get(userId).forEach(shoe => call.write(shoe));
    call.end();
  } else {
    console.log("Shoe not found");
    call.end();
  }
}

// Server streaming - Remove an item from the cart
function RemoveFromCart(call) {
  const userId = call.request.userId;
  if (userCarts.has(userId)) {
    const cart = userCarts.get(userId);
    const shoeIndex = cart.findIndex(s => s.id === call.request.id);
    if (shoeIndex !== -1) {
      cart.splice(shoeIndex, 1);
      console.log(`Removed ${call.request.id} from ${userId}'s cart.`);
    }

    // Return the contents of the cart after removing the shoe
    userCarts.get(userId).forEach(shoe => call.write(shoe));
  }
  call.end();
}

// Server streaming - Get the contents of the user's shopping cart
function GetCartContents(call) {
  const userId = call.request.userId;
  if (userCarts.has(userId)) {

    // Return the contents of the cart after removing the shoe
    userCarts.get(userId).forEach(shoe => call.write(shoe));
  }
  call.end();
}

// Unary - Empty the customer's shopping cart
function EmptyCart(call, callback) {
  const userId = call.request.userId;
  if (userCarts.has(userId)) {
    userCarts.get(userId).splice(0, userCarts.get(userId).length);
    callback(null, { message: "Shopping Cart Emptied"});
  } else {
    callback(null, { message: "Shopping Cart Not Found" });
  }
}

// Create gRPC server and add services
const server = new grpc.Server();

server.addService(cartProto.CartService.service, {
  AddToCart, RemoveFromCart, GetCartContents, EmptyCart
});

const PORT = '50052';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Cart Server running at localhost:${PORT}`);
});
