const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files
const product = protoLoader.loadSync('../protos/product.proto', {});
const productProto = grpc.loadPackageDefinition(product).product;

const productClient = new productProto.ProductService('localhost:50051', grpc.credentials.createInsecure());

function getProducts(callback) {

        // Create an array for gathering the shoe list
        let shoes = [];

        const call = productClient.ListShoes({});

        call.on("data", (shoe) => {

            // Add the shoe to the list
            shoes.push({
                id: shoe.id,
                brand: shoe.brand,
                price: shoe.price,
                description: shoe.description,
                image: shoe.image
            });
        });

        call.on("end", () => {
            callback(null, shoes);
        });

        call.on("error", (error) => {
            console.error(error);
            callback(null, 'Error occurred while fetching shoes');
        });
}

function getPrice(req, callback) {
    const brand = req.query.brand;

    productClient.GetPrice({ brand }, (error, priceData) => {
        if (error) {
            console.error('Error:', error);
            callback(error, 'Error occurred while applying the Discount');
        } else {
            callback(null, priceData);
        }
    });
}

module.exports = { getProducts, getPrice };