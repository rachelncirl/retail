const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/cart.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const cartProto = grpc.loadPackageDefinition(packageDefinition).cart;

const cartItems = [
    {orderId: 1, status: "Shipped"},
    {orderId: 2, status: "Pending"}
];


const getOrder = (call, callback) => {
    const order = orders.find(o => o.orderId === call.request.orderId);
    if (order) {
        callback(null, order);
    } else {
        callback ({
            code: grpc.status.NOT_FOUND,
            details: "Order not found"
        })
    }
}

const server = new grpc.Server();
server.addService(cartProto.CartService.service, {
    GetOrder : getOrder
});
server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), () => {
    console.log('CartService is running');
})