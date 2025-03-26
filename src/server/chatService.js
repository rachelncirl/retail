const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/chat.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

const sendMessage = (call, callback) => {
    console.log(`Received Message from ${call.request.user}: ${call.request.message}`);
    callback(null, {response: `Hello ${call.request.user}, your message was received: "${call.request.message}`});
}

const server = new grpc.Server();
server.addService(chatProto.ChatService.service, {
    SendMessage : sendMessage
});
server.bindAsync('127.0.0.1:50053', grpc.ServerCredentials.createInsecure(), () => {
    console.log('ChatService is running');
    server.start();
})