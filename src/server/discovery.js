const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const discovery = protoLoader.loadSync('../protos/discovery.proto', {});
const discoveryProto = grpc.loadPackageDefinition(discovery).discovery;

const services = {
    "productService": "localhost:50051",
    "cartService": "localhost:50052",
    "discountService": "localhost:50053",
    "purchaseService": "localhost:50054"
};

const discoverService = (call, callback) => {
    const serviceName = call.request.serviceName;
    const address = services[serviceName];

    if (address) {
        callback(null, { address });
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "service not found"
        });
    }
};

function Discover(call, callback) {
    const serviceName = call.request.serviceName;
    const address = services[serviceName];

    if (address) {
        callback(null, { address });
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "service not found"
        });
    }
}

// Create gRPC server and add services
const server = new grpc.Server();
server.addService(discoveryProto.DiscoveryService.service, {
    Discover
});

const PORT = '50050';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log(`Discovery Server running at localhost:${PORT}`);
});