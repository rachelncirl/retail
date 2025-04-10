const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const chatLoader = protoLoader.loadSync('../protos/chat.proto', {});
const chatProto = grpc.loadPackageDefinition(chatLoader).chat;
const chatClient = new chatProto.ChatService('localhost:50055', grpc.credentials.createInsecure());

function chat(io) {
    io.on('connection', (socket) => {
        console.log('Client connected to chat');

        const call = chatClient.Chat();

        // Receive messages from gRPC stream and forward to frontend
        call.on('data', (data) => {
            console.log("gRPC Message:", data.user, data.message);
            socket.emit('chat message', data);
        });

        // Receive messages from frontend and send to gRPC
        socket.on('chat message', (data) => {
            console.log("Frontend Message:", data.user, data.message);
            call.write({
                name: data.user,
                message: data.message,
                timestamp: Date.now()
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected from chat');
            call.end();
        });
    });
}

module.exports = chat;
