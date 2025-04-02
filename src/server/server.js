const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const socketIo = require('socket.io');
const http = require('http');

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

const app = express();
const appServer = http.createServer(app);
const io = socketIo(appServer);

// Hardcoded product list
const shoes = [
  { id: "NB1", brand: "New Balance", price: 120, description: "530", image: "/images/newbalance.jpg" },
  { id: "DR1", brand: "Dr Martens", price: 200, description: "1460 Pascal", image: "/images/drmartens.jpg" },
  { id: "AD1", brand: "Adidas", price: 100, description: "VL Court 3.0", image: "/images/adidas.jpg" },
  { id: "CV1", brand: "Converse", price: 75, description: "All Star Hi", image: "/images/converse.jpg" },
  { id: "BK1", brand: "Birkenstock", price: 90, description: "Arizona", image: "/images/birkenstock.jpg" },
  { id: "CR1", brand: "Crocs", price: 90, description: "Classic Clog", image: "/images/crocs.jpg" }
];

// Map to hold user carts: key is userId, value is an array of cart items
const userCarts = new Map();

// Hard code discount percentage for now
const discountPercentage = 20;
const discountCode = "NEW20";

// Unary - Get the price of a shoe by its brand
function GetPrice(call, callback) {
  const shoe = shoes.find(s => s.brand === call.request.brand);
  if (shoe) {
    callback(null, { brand: shoe.brand, price: shoe.price });
  } else {
    callback(null, { brand: "", price: 0 });
  }
}

// Unary - Send back a percentage if the shopper enters a valid code
function GetDiscount(call, callback) {
  if (call.request.code == discountCode) {
    callback(null, { percentage: discountPercentage});
  } else {
    callback(null, { percentage: 0 });
  }
}

// Unary - Pay - Payment processing would be done here
function Pay(call, callback) {
    callback(null, { message: "Payment Successful", success: true});
}

// Server streaming - List all available shoes
function ListShoes(call) {
  shoes.forEach(shoe => call.write(shoe));
  call.end();
}

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


// Client rpc - Handle the Order Request
function Order(call, callback) {

  let userOrder = [];

  call.on("data", (orderItem) => {
    userOrder.push(orderItem);
    console.log(`Order has ${userOrder.length} items.`);
  });

  call.on("end", () => {
    callback(null, { message: `Order has been placed for ${userOrder.length} items` });
  });
}

// Bidirectional stream - Chat (not implemented)
function Chat(call) {
  console.log("TODO: Chat");
  call.end();
}

// Bidirectional stream - Chat (not implemented)
function Discover(call) {
  console.log("TODO: Discovery");
  call.end();
}

// Create gRPC server and add services
const server = new grpc.Server();
server.addService(productProto.ProductService.service, {
  GetPrice, ListShoes
});

server.addService(cartProto.CartService.service, {
  AddToCart, RemoveFromCart, GetCartContents, EmptyCart
});

server.addService(discountProto.DiscountService.service, {
  GetDiscount
});

server.addService(purchaseProto.PurchaseService.service, {
  Pay, Order
});

server.addService(discoveryProto.DiscoveryService.service, {
  Discover
});

server.addService(chatProto.ChatService.service, {
  Chat
});

const PORT = '50051';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Server running at localhost:${PORT}`);
});
