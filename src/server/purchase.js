const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const purchase = protoLoader.loadSync('../protos/purchase.proto', {});
const purchaseProto = grpc.loadPackageDefinition(purchase).purchase;

// Unary - Pay - Payment processing would be done here
function Pay(call, callback) {
    callback(null, { message: "Payment Successful", success: true});
}

// Client rpc - Handle the Order Request
function Order(call, callback) {

  let userOrder = [];

  call.on("data", (orderItem) => {
    userOrder.push(orderItem);
    console.log(`Order has ${userOrder.length} items.`);
  });

  call.on("end", () => {
    callback(null, { message: `Order has been placed for ${userOrder.length} items` });
  });
}

// Create gRPC server and add services
const server = new grpc.Server();
server.addService(purchaseProto.PurchaseService.service, {
  Pay, Order
});

const PORT = '50054';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Purchase Server running at localhost:${PORT}`);
});
