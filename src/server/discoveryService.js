const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/discovery.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const discoveryProto = grpc.loadPackageDefinition(packageDefinition).discovery;

const services = {
    "productService": "localhost:50051",
    "orderService":  "localhost:50052",
    "chatService": "localhost:50053"
};

const discoverService = (call, callback) => {
    const serviceName = call.request.serviceName;
    const address = services[serviceName];

    if (address) {
        callback(null, {address});
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "service not found"
        });
    }
};

const server = new grpc.Server();
server.addService(discoveryProto.DiscoveryService.service, {
    DiscoverService : discoverService
});
server.bindAsync('127.0.0.1:50050', grpc.ServerCredentials.createInsecure(), () => {
    console.log('DiscoveryService is running');
    server.start();
})