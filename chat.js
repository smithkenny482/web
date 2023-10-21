class Connection {
    constructor(username) {
        this.username = username;
        this.message_handlers = [];
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

    disconnect() {
        this.socket.close();
    }
}




let username;
let connection;
let wallet_connection_status = false;

function messageHandler(username, message) {
    let chat = document.getElementsByClassName("chat-messages").item(0);

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

    if (wallet_connection_status == false){
        console.log('connecting wallet')
        if (window.solana && window.solana.isPhantom) {
                window.solana.connect()
                    .then(() => {
                        const publicKey = window.solana.publicKey;
                        const addressStr = publicKey.toString();
                        const shortenedAddress = addressStr.substring(0, 4) + "..." + addressStr.slice(-4);

                        username = shortenedAddress;
                        connection = new Connection(username);
                        wallet_connection_status = true;
                        connection.add_handler(messageHandler)

                        const container = document.querySelector('.overlay');
                        container.style.display="none";
                        connectWalletButton.textContent = `${shortenedAddress}`;
                    })
                    .catch(error => {
                        console.error("Error connecting to Phantom wallet:", error);
                    });
            } else {
                console.error("Phantom wallet not found. Please install it.");
                popupContainer.style.display = "block";
            }
    }

    else {
        const container = document.querySelector('.wallet-more-wrapper');
        
        if (container.style.display == "none") {
            container.style.display = "block";
        } 
        else {
            container.style.display = "none";

        }
    }
    
}

connectWalletButton.addEventListener("click", connectWallet);

const disconnectWalletButton = document.getElementById("disconnectWallet");
function disconnectWallet() {
  if (window.solana && window.solana.isPhantom) {
    window.solana.disconnect();
    connection.disconnect();
    connectWalletButton.textContent = "Connect Wallet";
    wallet_connection_status = false;
    const wallet_wrapper = document.querySelector('.wallet-more-wrapper');
    wallet_wrapper.style.display = "none";

    const overlay = document.querySelector('.overlay');
    overlay.style.display="block";

  }
}

disconnectWalletButton.addEventListener("click", disconnectWallet);

closeButton.addEventListener("click", function() {
    popupContainer.style.display = "none";
});
