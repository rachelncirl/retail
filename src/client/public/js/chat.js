// Apply a discount code to the user's session
document.getElementById('sendMessage').addEventListener('click', () => {
    sendMessage();
});

function sendMessage() {
    const message = document.getElementById('messageInput').value;
    const id = window.chatId;
    console.log("Message Entered: " + message);

    // Make an HTTP request to the Express server
    fetch(`/chat?id=${id}&message=${message}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
