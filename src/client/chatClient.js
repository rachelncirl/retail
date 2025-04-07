const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const chat = protoLoader.loadSync('../protos/chat.proto', {});
const chatProto = grpc.loadPackageDefinition(chat).chat;

const chatClient = new chatProto.ChatService('localhost:50055', grpc.credentials.createInsecure());

function sendMessage(req, callback) {
    console.log(req);
    chatClient.SendMessage({message: message}, (err, response) => {
        if (err) {
            console.log("Error sending chat message", err);
        } else {
            callback(null, response);
        }
    });
}

module.exports = { sendMessage };