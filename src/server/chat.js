var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

// Load the proto files
const chat = protoLoader.loadSync('../protos/chat.proto', {});
const chatProto = grpc.loadPackageDefinition(chat).chat;

var clients = {
}

function Chat(call){
  call.on('data', function(chatMessage){

    console.log(chatMessage);

    if(!(chatMessage.name in clients)){
      clients[chatMessage.name] = {
        name: chatMessage.name,
        call: call
      }
    }

    for(var client in clients){
      clients[client].call.write(
        {
          name: chatMessage.name,
          message: chatMessage.message
        }
      )
    }
  });

  call.on('end', function(){
    call.end();
  });

  call.on('error', function(e){
    console.log(e)
  });
}

// Create gRPC server and add services
const server = new grpc.Server();
server.addService(chatProto.ChatService.service, {
  Chat
});

const PORT = '50055';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Chat Server running at localhost:${PORT}`);
});
