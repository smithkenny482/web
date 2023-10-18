class Connection {
    constructor(username) {
        this.username = username;
        this.message_handlers = [];
        // this.socket = new WebSocket("ws://localhost:8000/chat");
        this.socket = new WebSocket("ws://web3-backend-the-sos-brigade.koyeb.app/chat");

        this.connected = false;
        this.socket.addEventListener("open", _ => {
            this.connected = true;
        })

        this.socket.addEventListener("error", (error) => {
            console.log(error)
        })

        this.socket.addEventListener("message", (event) => {
            let [ username, message ] = event.data.split(":", 2);
            this.message_handlers.forEach((f) => f(username, message));
            console.log("message: " + event.data);
        })
    }

    send(msg) {
        this.socket.send(`${this.username}:${msg}`);
    }

    add_handler(handler) {
        this.message_handlers.push(handler);
    }
}




let username;
let connection;

function messageHandler(username, message) {
    let chat = document.getElementsByClassName("chat-messages").item(0);

    // create message elements
    let message_div = document.createElement("div");
    message_div.classList.add("chat-message");

    let message_author = document.createElement("div");
    message_author.classList.add("message-author");
    message_author.textContent = username;

    message_div.appendChild(message_author);

    let message_content = document.createElement("div");
    message_content.classList.add("message-content");
    message_content.textContent = message;

    message_div.appendChild(message_content);
    
    chat.appendChild(message_div)
    scrollToBottom();
}

//connection.add_handler(messageHandler)

function scrollToBottom() {
    let chat = document.querySelector(".chat-container");
    chat.scrollTop = chat.scrollHeight;
}

function sendChatMessage() {
    let input = document.getElementById("chat-text-input");
    let text = input.value;

    if (connection.socket.readyState === WebSocket.CLOSED) {
        document.getElementById("chat-send-button").style.border = "2px solid red";
    }

    connection.send(text);
    input.value = "";
}


document.getElementById("chat-text-input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        sendChatMessage();
    }
});


function toggleHeight() {
    const container = document.querySelector('.chat-container-wrapper');
    container.classList.toggle('minimized');
}


const connectWalletButton = document.getElementById("connectWallet");
const walletStatus = document.getElementById("walletStatus");
const popupContainer = document.getElementById("popupContainer");
const popupMessage = document.getElementById("popupMessage");

function connectWallet() {

    if (window.solana && window.solana.isPhantom) {
        window.solana.connect()
            .then(() => {
                const publicKey = window.solana.publicKey;

                const addressStr = publicKey.toString();
                const shortenedAddress = addressStr.substring(0, 4) + "..." + addressStr.slice(-4);

                username = shortenedAddress;
                connection = new Connection(username);
                connection.add_handler(messageHandler)

                const container = document.querySelector('.overlay');
                container.style.display="none";


                connectWalletButton.textContent = `${shortenedAddress}`;
                connectWalletButton.disabled = true;
            })
            .catch(error => {
                console.error("Error connecting to Phantom wallet:", error);
            });
    } else {
        console.error("Phantom wallet not found. Please install it.");
        popupContainer.style.display = "block";
    }
}

connectWalletButton.addEventListener("click", connectWallet);

closeButton.addEventListener("click", function() {
    popupContainer.style.display = "none";
});

