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
