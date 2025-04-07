const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const purchase = protoLoader.loadSync('../protos/purchase.proto', {});
const purchaseProto = grpc.loadPackageDefinition(purchase).purchase;

const purchaseClient = new purchaseProto.PurchaseService('localhost:50054', grpc.credentials.createInsecure());

function pay(req, callback) {

    const paymentRequest = req.body
    console.log(paymentRequest);

    purchaseClient.Pay(paymentRequest, (error, response) => {
        if (error) {
            console.error('Error:', error);
            callback(error, null);
        } else {
            console.log('Payment Response: ' + response.message)
            callback(null, response);
        }
    });

}

function order(req, callback) {

    const order = req.body

    // Open the stream
    const call = purchaseClient.Order((error, response) => {
        if (error) console.error(error);
        else console.log(response.message);
    });

    // Write the items to the stream
    for (let item of order) {
        const { id, brand, price } = item;
        call.write({ id, brand, price });
    }

    // Close the stream
    call.end();

    return callback(null, { message: 'Order is being processed' });

}

module.exports = { pay, order };