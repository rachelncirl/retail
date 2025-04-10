var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

// Load the proto files
const chat = protoLoader.loadSync('../protos/chat.proto', {});
const chatProto = grpc.loadPackageDefinition(chat).chat;

// Create a server
const server = new grpc.Server();

// Implement the SendMessage RPC
function Chat(call) {
    console.log("Client connected to chat service.");

    // Pipe incoming messages from the client to outgoing messages
    call.on('data', (message) => {
        console.log(`${message.name}: ${message.message}`);

        // Send back the message to the client
        call.write({ name: message.name, message: message.message });
    });

    call.on('end', () => {
        console.log("Client disconnected.");
        call.end();  // Close the stream
    });

    call.on('error', (e) => {
        console.error("Error: ", e);
        call.end(); // Close the stream in case of error
    });
}

// Add service to the server
server.addService(chatProto.ChatService.service, { Chat });

// Start the server
server.bindAsync('127.0.0.1:50060', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Chat Server running at http://127.0.0.1:50060');
});
