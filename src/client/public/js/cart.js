// Event delegation for dynamically created 'addToCart' buttons
document.getElementById('productList').addEventListener('click', function (event) {
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
});

// Event delegation for dynamically created 'removeFromCart' buttons
document.getElementById('cartContents').addEventListener('click', function (event) {
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
});

// Function to render the cart data
function renderCartData(cartItems) {
    const cartContentsDiv = document.getElementById('cartContents');
    cartContentsDiv.innerHTML = ''; // Clear previous contents

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
