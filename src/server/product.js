const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const product = protoLoader.loadSync('../protos/product.proto', {});
const productProto = grpc.loadPackageDefinition(product).product;

// Hardcoded product list
const shoes = [
  { id: "NB1", brand: "New Balance", price: 120, description: "530", image: "/images/newbalance.jpg" },
  { id: "DR1", brand: "Dr Martens", price: 200, description: "1460 Pascal", image: "/images/drmartens.jpg" },
  { id: "AD1", brand: "Adidas", price: 100, description: "VL Court 3.0", image: "/images/adidas.jpg" },
  { id: "CV1", brand: "Converse", price: 75, description: "All Star Hi", image: "/images/converse.jpg" },
  { id: "BK1", brand: "Birkenstock", price: 90, description: "Arizona", image: "/images/birkenstock.jpg" },
  { id: "CR1", brand: "Crocs", price: 90, description: "Classic Clog", image: "/images/crocs.jpg" }
];

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

// Create gRPC server and add services
const server = new grpc.Server();
server.addService(productProto.ProductService.service, {
  GetPrice, ListShoes
});

const PORT = '50051';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Product Server running at localhost:${PORT}`);
});
