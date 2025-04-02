document.getElementById('purchase').addEventListener('click', function (event) {
    // Prevent submitting the form from reloading the page
    event.preventDefault(); 

    // Get values from the form
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expDate = document.getElementById('exp').value;
    const cvv = document.getElementById('cvv').value;

    // Ensure all form data is provided
    if (!cardName || !cardNumber || !expDate || !cvv) {
        alert('Please fill in all the payment fields.');
        return;
    }

    // Get the cart contents
    let cartContents
    const userId = window.sessionId;
    fetch(`/refreshCart?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            cartContents = data;

            // calculate amount
            console.log("Purchase Discount is: " + discount);
            amount = 0;
            for (let item of cartContents) {
                const { id, brand, price } = item;
                if (discount > 0) {
                    let discountedPrice = price - ((price * discount) / 100);
                    amount += discountedPrice
                } else {
                    amount += price
                }
            }
            console.log("Total Purchase Price: " + amount);

            const paymentData = {
                cardName: cardName,
                cardNumber: cardNumber,
                expDate: expDate,
                cvv: cvv,
                amount: amount
            };

            // Send payment data to the server
            fetch('/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.success) {

                            // Now Place the Order
                            fetch('/order', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(cartContents),
                            })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });

                            // Simple pop up alert to indicate successful payment
                            alert('Payment of $' + amount + ' successful! Your purchase is complete.');

                            // Clear the Cart Contents after Purchase
                            empty();

                            // Reload the Cart after clearing
                            refresh();
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
