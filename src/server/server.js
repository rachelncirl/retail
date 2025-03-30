const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');

const packageDefinition = protoLoader.loadSync('../protos/shop.proto', {});
const shopProto = grpc.loadPackageDefinition(packageDefinition).shop;

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

// Unary - Get the price of a shoe by its brand
function GetPrice(call, callback) {
  const shoe = shoes.find(s => s.brand === call.request.brand);
  if (shoe) {
    callback(null, { brand: shoe.brand, price: shoe.price });
  } else {
    callback(null, { brand: "", price: 0 });
  }
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
  }
  call.end();
}

// Client rpc - Handle the shopping cart for each user
function ShoppingCart(call, callback) {
  const userId = call.request.userId;
  if (!userCarts.has(userId)) {
    userCarts.set(userId, []);
  }

  let totalItems = 0;

  call.on("data", (order) => {
    totalItems += order.quantity;
    const cart = userCarts.get(userId);
    for (let i = 0; i < order.quantity; i++) {
      const shoe = shoes.find(s => s.id === order.shoeId); // Assuming order contains shoeId and quantity
      if (shoe) {
        cart.push(shoe);
      }
    }
    console.log(`${userId}'s cart has ${cart.length} items.`);
  });

  call.on("end", () => {
    callback(null, { message: `${totalItems} items added to Cart` });
  });
}

// Server streaming - View the user's cart
function ViewCart(call) {
  const userId = call.request.userId;
  if (userCarts.has(userId)) {
    userCarts.get(userId).forEach(item => call.write(item));
  }
  call.end();
}

// Unary - Handle the purchase of the cart items
function Purchase(call, callback) {
  const userId = call.request.userId;
  if (userCarts.has(userId)) {
    const purchasedItems = userCarts.get(userId).length;
    userCarts.set(userId, []); // Clear the cart after purchase
    callback(null, { message: `${purchasedItems} items purchased` });
  } else {
    callback(null, { message: "No items in the cart" });
  }
}

// Bidirectional stream - Chat (not implemented)
function Chat(call) {
  console.log("TODO: Chat");
  call.end();
}

// Create gRPC server and add services
const server = new grpc.Server();
server.addService(shopProto.ShoeShop.service, {
  GetPrice, ListShoes, ShoppingCart, ViewCart, Purchase, Chat, AddToCart, RemoveFromCart
});

const PORT = '50051';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Server running at localhost:${PORT}`);
});
