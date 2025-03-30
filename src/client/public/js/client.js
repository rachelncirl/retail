// Retrieve Product List from Server on Page Load
document.addEventListener('DOMContentLoaded', function () {

  // Make an HTTP request to the Express server
  fetch(`/list`)
    .then(response => response.json())
    .then(data => {

      // Log the gRPC response message from the server
      console.log('Data:', data);

      // Get the table body element where rows will be inserted
      const tableBody = document.getElementById("productList");

      // Loop through the JSON data and create rows
      data.forEach(shoe => {

        // Create a new div for each product
        const productDiv = document.createElement("div");
        productDiv.classList.add("col-md-12", "mb-4");

        // Create the inner row div
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row", "align-items-center");

        // Create the product image div
        const imgDiv = document.createElement("div");
        imgDiv.classList.add("col-md-3");
        const img = document.createElement("img");
        img.src = shoe.image;
        img.alt = `Product: ${shoe.brand}`;
        img.classList.add("img-fluid", "rounded");
        imgDiv.appendChild(img);

        // Create the product description div
        const descriptionDiv = document.createElement("div");
        descriptionDiv.classList.add("col-md-6");
        const nameHeading = document.createElement("h5");
        nameHeading.textContent = shoe.brand;
        const descriptionParagraph = document.createElement("p");
        descriptionParagraph.textContent = shoe.description;
        descriptionDiv.appendChild(nameHeading);
        descriptionDiv.appendChild(descriptionParagraph);

        // Create the price and button div
        const priceDiv = document.createElement("div");
        priceDiv.classList.add("col-md-3", "text-end");
        const priceParagraph = document.createElement("p");
        priceParagraph.innerHTML = `<strong>$${shoe.price}</strong>`;

        const addToCartButton = document.createElement("button");
        addToCartButton.id = `addToCart-${shoe.id}`; // Unique ID for each button
        addToCartButton.name = shoe.id; // Use shoe id for identifying the product
        addToCartButton.classList.add("btn", "btn-primary");
        addToCartButton.textContent = "Add to Cart";
        priceDiv.appendChild(priceParagraph);
        priceDiv.appendChild(addToCartButton);

        // Append all parts to the row
        rowDiv.appendChild(imgDiv);
        rowDiv.appendChild(descriptionDiv);
        rowDiv.appendChild(priceDiv);

        // Append the row to the product div
        productDiv.appendChild(rowDiv);

        // Finally, append the product div to the table body (or any container)
        tableBody.appendChild(productDiv);
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });

  // Event delegation for dynamically created 'addToCart' buttons
  document.getElementById('productList').addEventListener('click', function(event) {
    if (event.target && event.target.matches('button[id^="addToCart-"]')) {
      const productId = event.target.name; // Get the name (id) of the button clicked
      console.log('Adding Product:', productId);

      // Now make a request or perform action with the product ID
      fetch(`/addToCart?id=${productId}`)
        .then(response => response.text())
        .then(data => {
          // Display the response message, or any other action
          document.getElementById('response').innerText = data;
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  });

  // Event listener for the 'greetButton'
  document.getElementById('greetButton').addEventListener('click', () => {
    const name = document.getElementById('name').value || 'World';

    // Make an HTTP request to the Express server
    fetch(`/greet?name=${name}`)
      .then(response => response.text())
      .then(data => {
        // Display the gRPC response message from the server
        document.getElementById('response').innerText = data;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });

  // Event listener for the 'applyDiscount'
  document.getElementById('applyDiscount').addEventListener('click', () => {
    const code = document.getElementById('discountCode').value;

    console.log("Discount Code Entered: " + code);

    // Make an HTTP request to the Express server
    fetch(`/discount?code=${code}`)
      .then(response => response.text())
      .then(data => {
        // Display the gRPC response message from the server
        document.getElementById('response').innerText = data;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});
