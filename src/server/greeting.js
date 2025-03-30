const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file
const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/greeting.proto'), {});
const proto = grpc.loadPackageDefinition(packageDefinition).greeter;

// Implement the SayHello RPC method
function sayHello(call, callback) {
  const responseMessage = `Hello, ${call.request.name}!`;
  callback(null, { message: responseMessage });
}

// Create a gRPC server
const server = new grpc.Server();
server.addService(proto.Greeter.service, { SayHello: sayHello });

// Bind the gRPC server to a port
const PORT = '50060';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port)=>{
  if(error){
    console.error(error);
    return;
  }
  console.log(`Greeting Server running at localhost:${PORT}`);
});
