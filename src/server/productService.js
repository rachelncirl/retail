const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/product.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const productProto = grpc.loadPackageDefinition(packageDefinition).product;

const products = [
    {id: 1, name: "product 1", price: 100},
    {id: 2, name: "product 2", price: 200}
];

const getProduct = (call, callback) => {
    const product = products.find(p => p.id === call.request.id);
    if (product) {
        callback(null, product);
    } else {
        callback ({
            code: grpc.status.NOT_FOUND,
            details: "Product not found"
        })
    }
}

const server = new grpc.Server();
server.addService(productProto.ProductService.service, {
    GetProduct : getProduct
});
server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('ProductService is running');
    server.start();
})