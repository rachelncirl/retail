const grpc = require('@grpc/grpc-js')
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

let userCount = 1;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'purchase.html'));
});
 

// Hard coded product list
const shoes = [
  { id: "NB1", brand: "New Balance", price: 120, description: "530", image: "/images/newbalance.jpg"},
  { id: "DR1", brand: "Dr Martens", price: 200, description: "1460 Pascal", image: "/images/drmartens.jpg"},
  { id: "AD1", brand: "Adidas", price: 100, description: "VL Court 3.0", image: "/images/adidas.jpg"},
  { id: "CV1", brand: "Converse", price: 75, description: "All Star Hi", image: "/images/converse.jpg"},
  { id: "BK1", brand: "Birkenstock", price: 90, description: "Arizona", image: "/images/birkenstock.jpg"},
  { id: "CR1", brand: "Crocs", price: 90, description: "Classic Clog", image: "/images/crocs.jpg"}
];

// Shopping cart contents
const cartItems = [];
 
// Unary
function GetPrice(call, callback){
  const shoe = shoes.find(s => s.brand === call.request.brand);
  if(shoe){
    callback(null, { brand: shoe.brand, price: shoe.price});
  }else{
      callback(null, { brand: shoe.brand, price: 0});
  }
}
 
// Server streaming
function ListShoes(call){
  shoes.forEach(shoe => call.write(shoe));
  call.end();
}

// Client rpc
function ShoppingCart(call, callback){
  let totalItems = 0;

  call.on("data", (order) => {
    totalItems += order.quantity;
    cartItems.push(order);
    console.log(`${cartItems.length} items in the Cart`)
    cartItems.forEach(item => console.log(item));
  })

  call.on("end", () => {
    callback(null, {message: `${totalItems} items added to Cart`});
  })
}

// Server streaming
function ViewCart(call){
  cartItems.forEach(item => call.write(item));
  call.end();
}

// Unary
function Purchase(call, callback){
  let purchasedItems = cartItems.length;
  cartItems.length = 0;
  callback(null, {message: `${purchasedItems} items purchased`});
}

// Bidirectional
function Chat(call) {
  console.log("TODO");
  call.end();
}
 
 
const server = new grpc.Server();
server.addService(shopProto.ShoeShop.service, {
  GetPrice, ListShoes, ShoppingCart, ViewCart, Purchase, Chat
});
 
const PORT = '50051';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port)=>{
  if(error){
    console.error(error);
    return;
  }
  console.log(`Server running at localhost:${PORT}`);
});