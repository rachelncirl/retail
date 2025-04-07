const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const discovery = protoLoader.loadSync('../protos/discovery.proto', {});
const discoveryProto = grpc.loadPackageDefinition(discovery).discovery;

const discoveryClient = new discoveryProto.DiscoveryService('localhost:50050', grpc.credentials.createInsecure());

// Function to discover service information
const discoverService = (serviceName, callback) => {

    discoveryClient.Discover ({
        serviceName: serviceName
    }, (err, response) => {
        if (err) {
            console.log("Error discovering service", err);
            callback(null);
        } else {
            callback(response);
        }
    });
};

// Export the functions
module.exports = {
    discoverService
}