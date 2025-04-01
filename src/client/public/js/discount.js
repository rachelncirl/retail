// Apply a discount code to the user's session
document.getElementById('applyDiscount').addEventListener('click', () => {
    applyDiscount();
});

function applyDiscount() {
    const code = document.getElementById('discountCode').value;

    console.log("Discount Code Entered: " + code);

    // Make an HTTP request to the Express server
    fetch(`/discount?code=${code}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            discount = data.percentage;
            refresh();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}