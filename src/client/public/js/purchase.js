document.getElementById('purchase').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get values from the form
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expDate = document.getElementById('exp').value;
    const cvv = document.getElementById('cvv').value;
    const amount = 50;

    console.log(amount);

    // Simple validation (could be more advanced depending on the requirements)
    if (!cardName || !cardNumber || !expDate || !cvv) {
        alert('Please fill in all the payment fields.');
        return;
    }

    // Assuming the backend API expects these details to process the purchase
    const paymentData = {
        cardName: cardName,
        cardNumber: cardNumber,
        expDate: expDate,
        cvv: cvv
    };

    // Get the cart contents
    let cartContents
    const userId = window.sessionId;
    fetch(`/refreshCart?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            cartContents = data;

            // Send payment data to the server
            fetch('/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData), // Send the payment data as JSON
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.success) {
                        // Successful payment
                        alert('Payment successful! Your purchase is complete.');

                        // Make a unary API call to clear the cart
                        fetch(`/clearCart?userId=${userId}`)
                            .then(response => response.text())
                            .catch(error => {
                                console.error('Error:', error);
                            });
                    } else {
                        // Payment failed
                        alert('Payment failed: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error processing payment:', error);
                    alert('There was an error with the payment. Please try again later.');
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });

});
