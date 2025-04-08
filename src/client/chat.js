var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

// Load the proto files
const chat = protoLoader.loadSync('../protos/chat.proto', {});
const chatProto = grpc.loadPackageDefinition(chat).chat;

// Create a client and connect to the server
const client = new chatProto.ChatService('127.0.0.1:50060', grpc.credentials.createInsecure());

// Create a stream to send and receive messages
const call = client.SendMessage();

// Listen for incoming messages from the server
call.on('data', (message) => {
    console.log(`Server: ${message.name} says: ${message.message}`);
});

// Handle errors
call.on('error', (e) => {
    console.error("Error: ", e);
});

// Function to send a message to the server
function sendMessage(name, message) {
    call.write({ name, message });
}

// Send some initial messages
sendMessage('Client1', 'Hello, Server!');
setTimeout(() => sendMessage('Client1', 'How are you?'), 2000);
setTimeout(() => sendMessage('Client1', 'Goodbye!'), 4000);

// Close the stream after sending messages
setTimeout(() => {
    call.end();
}, 5000);
