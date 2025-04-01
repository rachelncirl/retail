// Creates an empty Shopping Cart on Page Load
document.addEventListener('DOMContentLoaded', function () {
    refresh();
});

// Add product to Shopping Cart
document.getElementById('productList').addEventListener('click', function (event) {
    add(event);
});

// Remove item from the Shopping Cart
document.getElementById('cartContents').addEventListener('click', function (event) {
    remove(event);
});

// Reload the Shopping Cart from the Server
document.getElementById('refreshCart').addEventListener('click', () => {
    refresh();
});

// Empty the Shopping Cart
document.getElementById('clearCart').addEventListener('click', () => {
    empty();
    refresh()
});

// Define inital cart value for discount percentage
let discount = 0;

function add(event) {
    if (event.target && event.target.matches('button[id^="addToCart-"]')) {
        const productId = event.target.name;
        const userId = window.sessionId;
        console.log('Adding Product:', productId);

        fetch(`/addToCart?id=${productId}&userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                renderCartData(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function remove(event) {
    console.log(event.target.parentElement);
    if (event.target.parentElement && event.target.parentElement.matches('button[id^="removeFromCart-"]')) {
        const productId = event.target.parentElement.name;
        const userId = window.sessionId;
        console.log('Removing Product:', productId);

        fetch(`/removeFromCart?id=${productId}&userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                renderCartData(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function empty() {
    console.log("Emptying the Shopping Cart Contents");
    const userId = window.sessionId;

    // Make a unary API call to clear the cart
    fetch(`/clearCart?userId=${userId}`)
        .then(response => response.text())
        .catch(error => {
            console.error('Error:', error);
        });
}

function refresh() {
    console.log("Refreshing Shopping Cart Contents");
    const userId = window.sessionId;

    // Make an HTTP request to the Express server
    fetch(`/refreshCart?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            renderCartData(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


// Function to render the cart data
function renderCartData(cartItems) {
    const cartContentsDiv = document.getElementById('cartContents');
    cartContentsDiv.innerHTML = ''; 

    const cartTable = document.createElement('table');
    cartTable.classList.add('table');

    const tbody = document.createElement('tbody');
    let total = 0;

    cartItems.forEach(item => {
        const row = document.createElement('tr');

        // Brand
        const brand = document.createElement('td');
        brand.textContent = item.brand;
        row.appendChild(brand);

        // Price
        const price = document.createElement('td');
        price.textContent = `$${item.price.toFixed(2)}`;
        row.appendChild(price);

        // Remove button
        const removeFromCart = document.createElement('button');
        removeFromCart.id = `removeFromCart-${item.id}`;
        removeFromCart.name = item.id;
        removeFromCart.classList.add("btn");
        removeFromCart.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeFromCart.style.border = 'none';
        row.appendChild(removeFromCart);

        tbody.appendChild(row);
        total += item.price;
    });

    console.log('Discount');

    // Ensure the discount is applied only if it's greater than 0
    if (discount > 0) {
        console.log('Applying Discount of : ' + discount);

        // Add Discount Row
        const discountRow = document.createElement('tr');

        const discountLabelCell = document.createElement('td');
        discountLabelCell.textContent = 'Discount ('+ discount + '%)';
        discountLabelCell.style.fontWeight = 'bold';
        discountLabelCell.style.color = 'red';
        discountRow.appendChild(discountLabelCell);

        let discountAmount = ((total/100) * discount);
        total = total - discountAmount;

        const discountAmountCell = document.createElement('td');
        discountAmountCell.textContent = `-$${discountAmount.toFixed(2)}`;
        discountAmountCell.style.fontWeight = 'bold';
        discountAmountCell.style.color = 'red';
        discountRow.appendChild(discountAmountCell);

        tbody.appendChild(discountRow);
    }

    // Add total row
    const totalRow = document.createElement('tr');
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = 'Total';
    totalLabelCell.style.fontWeight = 'bold';
    totalRow.appendChild(totalLabelCell);

    const totalAmountCell = document.createElement('td');
    totalAmountCell.textContent = `$${total.toFixed(2)}`;
    totalAmountCell.style.fontWeight = 'bold';
    totalRow.appendChild(totalAmountCell);

    tbody.appendChild(totalRow);

    cartTable.appendChild(tbody);

    // Append the table to the cart contents div
    cartContentsDiv.appendChild(cartTable);
}
