// Event delegation for dynamically created 'addToCart' buttons
document.getElementById('productList').addEventListener('click', function (event) {
    if (event.target && event.target.matches('button[id^="addToCart-"]')) {
        const productId = event.target.name; // Get the name (id) of the button clicked
        const userId = window.sessionId;
        console.log('Adding Product:', productId);

        // Now make a request or perform action with the product ID
        fetch(`/addToCart?id=${productId}&userId=${userId}`)
            .then(response => response.json()) // Assuming the server returns the updated cart as JSON
            .then(data => {
                console.log(data);

                // Dynamically build the cart contents (assuming the server returns cart items)
                const cartContentsDiv = document.getElementById('cartContents');
                cartContentsDiv.innerHTML = ''; // Clear previous contents

                const cartTable = document.createElement('table');
                cartTable.classList.add('table');

                const tbody = document.createElement('tbody');

                let total = 0;

                data.forEach(item => {
                    const row = document.createElement('tr');

                    const brand = document.createElement('td');
                    brand.textContent = item.brand;
                    row.appendChild(brand);

                    const price = document.createElement('td');
                    price.textContent = `$${item.price.toFixed(2)}`;
                    row.appendChild(price);

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
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});