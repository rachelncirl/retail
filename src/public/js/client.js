const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');
const readlineSync = require("readline-sync");

const packageDefinition = protoLoader.loadSync('../protos/shop.proto', {});
const shopProto = grpc.loadPackageDefinition(packageDefinition).shop;

const client = new shopProto.ShoeShop('localhost:50051', grpc.credentials.createInsecure());

// Client-side JavaScript function
function hello() {
  alert("Hello from the client-side JavaScript!");
}

// Attach event listener to the button to call the function
document.getElementById('sayHello').addEventListener('click', hello);

// Unary
function getPrice() {
  const brand = readlineSync.question("Enter mobile brand: ");
  console.log(brand);
  client.GetPrice({ brand }, (error, response) => {
    if (error) {
      console.log(error);
    }
    else {
      console.log(`brand: ${response.brand}, Price: ${response.price}`);
    }
  });
}

// Unary
function purchase() {
  let cartId = 1;
  client.Purchase({ cartId }, (error, response) => {
    if (error) {
      console.log(error);
    }
    else {
      console.log(`${response.message}`);
    }
  });
}

// Server rpc
function listShoes() {
  const call = client.ListShoes({});
  call.on("data", (shop) => {
    console.log(`brand: ${shop.brand}, Price: ${shop.price}`)
  });
  call.on("end", () => console.log("End of shoe list"));
}

// Client rpc
function shoppingCart() {
  const call = client.ShoppingCart((error, respomse) => {
    if (error) console.error(error);
    else console.log(respomse.message);
  });

  let moreItems = true;
  while (moreItems) {
    const brand = readlineSync.question("Enter Shoe brand: ");
    const size = parseInt(readlineSync.question("Enter size: "));
    const color = readlineSync.question("Enter color: ");
    const quantity = parseInt(readlineSync.question("Enter quantity: "));
    call.write({ brand, size, color, quantity });
    moreItems = readlineSync.keyInYN("Add another item to the Shopping Cart?");
  }

  call.end();
}

// Server rpc
function viewCartContents() {
  const call = client.ViewCart({});
  call.on("data", (cart) => {
    console.log(`Brand: ${cart.brand}, Size: ${cart.size}, Color: ${cart.color}, Quantity: ${cart.quantity}`)
  });
  call.on("end", () => console.log("End of Cart Items list"));
}

// Bidirectional
function chat() {
  console.log("Chatting");
  const call = client.Chat({});
  call.on("data", (mobile) => {
    console.log(`brand: ${mobile.brand}, Price: ${mobile.price}`)
  });
  call.on("end", () => console.log("End of mobile list"));
}


function main() {
  console.log("\n1. Get Shoe Price");
  console.log("2. List Shoes");
  console.log("3. Add to Cart");
  console.log("4. Show Cart Contents");
  console.log("5. Purchase");
  console.log("6. Chat with support");
  const choice = parseInt(readlineSync.question("Choose an option: "))

  switch (choice) {
    case 1:
      getPrice();
      break;
    case 2:
      listShoes();
      break;
    case 3:
      shoppingCart();
      break;
    case 4:
      viewCartContents();
      break;
    case 5:
      purchase();
      break;
    case 6:
      chat();
      break;
    default:
      console.log("Invalid choice");
  }
}

main();