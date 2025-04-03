const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const discount = protoLoader.loadSync('../protos/discount.proto', {});
const discountProto = grpc.loadPackageDefinition(discount).discount;

// Hard code discount percentage for now
const discountPercentage = 20;
const discountCode = "NEW20";

// Unary - Send back a percentage if the shopper enters a valid code
function GetDiscount(call, callback) {
  if (call.request.code == discountCode) {
    callback(null, { percentage: discountPercentage});
  } else {
    callback(null, { percentage: 0 });
  }
}

// Create gRPC server and add services
const server = new grpc.Server();
server.addService(discountProto.DiscountService.service, {
  GetDiscount
});

const PORT = '50053';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Discount Server running at localhost:${PORT}`);
});
