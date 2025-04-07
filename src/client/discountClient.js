const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const discount = protoLoader.loadSync('../protos/discount.proto', {});
const discountProto = grpc.loadPackageDefinition(discount).discount;

const discountClient = new discountProto.DiscountService('localhost:50053', grpc.credentials.createInsecure());

function applyDiscount(req, callback) {
    const code = req.query.code;

    discountClient.GetDiscount({ code }, (error, discountData) => {
        if (error) {
            console.error('Error:', error);
            callback(error, 'Error occurred while applying the Discount');
        } else {
            callback(null, discountData);
        }
    });

}

module.exports = { applyDiscount };