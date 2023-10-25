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

const connectWalletButton = document.getElementById("connectWallet");
const disconnectWalletButton = document.getElementById("disconnectWallet");
const walletStatus = document.getElementById("walletStatus");
const popupContainer = document.getElementById("popupContainer");
const popupMessage = document.getElementById("popupMessage");
const openoption = document.getElementById("OpenconnectWallet");
const guestLogin = document.getElementById("guestLogin");
const guestLoginClose = document.getElementById("Guest-login-closeButton");
const openChat = document.getElementById("OpenChatButton");

document.getElementById("chat-text-input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        sendChatMessage();
    }
});

document.getElementById("guest-login-textbox-input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        ConfirmName();
    }
});



disconnectWalletButton.addEventListener("click", disconnectWallet);
connectWalletButton.addEventListener('click' , connectWallet)
openoption.addEventListener("click", OpenconnectWallet);
openChat.addEventListener("click", OpenChatFunc);
guestLogin.addEventListener("click", guestLoginFunc);


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

function ConfirmName(){
    let input = document.getElementById("guest-login-textbox-input");
    let text = input.value;
    let name;

    if (text.length > 15) {
    name = text.substring(0, 15) + "...";
    } else {
    name = text;
    }

    input.value = "";
    username = name;
    openoption.textContent = `${name}`;
    connection = new Connection(username);
    wallet_connection_status = true;
    connection.add_handler(messageHandler)

    const guestLoginUi = document.querySelector('.guest-login-ui');
    const optionwrapper = document.querySelector('.wallet-more-wrapper');
    const disconnectbutton = document.querySelector('.wallet-disconnect');
    const phantombutton = document.querySelector('.phantom-login');
    const guestbutton = document.querySelector('.guest-login');
    const container = document.querySelector('.overlay');
    const connectWalletButton = document.getElementById("OpenconnectWallet");
    
    optionwrapper.style.display = "none";
    guestLoginUi.style.display = "none";
    phantombutton.style.display = "none";
    guestbutton.style.display = "none";
    disconnectbutton.style.display = "block";
    container.style.display="none";
    connectWalletButton.style.display = "block";
    openChat.style.display = "block";


}

function toggleHeight() {
    const container = document.querySelector('.chat-container-wrapper');
    container.classList.toggle('minimized');
}

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
                        //connection = new Connection(username);
                        wallet_connection_status = true;
                        //connection.add_handler(messageHandler)

                        const container = document.querySelector('.overlay');
                        container.style.display="none";
                        openoption.textContent = `${shortenedAddress}`;
                    })
                    .catch(error => {
                        console.error("Error connecting to Phantom wallet:", error);
                    });
            } else {
                console.error("Phantom wallet not found. Please install it.");
                popupContainer.style.display = "block";
            }
    }

    const disconnectbutton = document.querySelector('.wallet-disconnect');
    const phantombutton = document.querySelector('.phantom-login');
    const guestbutton = document.querySelector('.guest-login');
    const optionwrapper = document.querySelector('.wallet-more-wrapper');

    disconnectbutton.style.display = "block";
    phantombutton.style.display = "none";
    guestbutton.style.display = "none";
    optionwrapper.classList.toggle("slide-left")
    openChat.style.display = "block";

}

function disconnectWallet() {
  if (window.solana && window.solana.isPhantom) {
    window.solana.disconnect();
    connection.disconnect();
    connectWalletButton.textContent = "Connect Wallet";
    wallet_connection_status = false;

    const overlay = document.querySelector('.overlay');
    overlay.style.display="block";

    openoption.textContent = "Connect";
    const disconnectbutton = document.querySelector('.wallet-disconnect');
    const phantombutton = document.querySelector('.phantom-login');
    const guestbutton = document.querySelector('.guest-login');
    const openChat = document.getElementById("OpenChatButton");
    const container = document.querySelector('.wallet-more-wrapper');


    disconnectbutton.style.display = "none";
    phantombutton.style.display = "block";
    guestbutton.style.display = "block";
    openChat.style.display = "none";
    container.classList.toggle("slide-left")

  }
}

function OpenconnectWallet() {
    const container = document.querySelector('.wallet-more-wrapper');
    container.classList.toggle("slide-left")
    container.style.display = "block";

  }

function OpenChatFunc(){
    const container = document.querySelector('.chat-container-wrapper');
    container.classList.toggle("slide-right")
}
  
  
function guestLoginFunc(){
    const optionwrapper = document.querySelector('.wallet-more-wrapper');
    const guestLoginUi = document.querySelector('.guest-login-ui');
    const connectWalletButton = document.getElementById("OpenconnectWallet");

    guestLoginUi.style.display = "block";
    connectWalletButton.style.display = "none";
    optionwrapper.classList.toggle("slide-left")

}

function GuestLogincloseFunc(){
    const guestLoginUi = document.querySelector('.guest-login-ui');
    const connectWalletButton = document.getElementById("OpenconnectWallet");
    
    guestLoginUi.style.display = "none";
    connectWalletButton.style.display = "block";
}

const closeButton = document.getElementById("Guest-login-closeButton")
closeButton.addEventListener("click", GuestLogincloseFunc)





function addSwipeSupport(container) {
    let isSwiping = false;
    let startX;
    let startScrollX;
  
    container.addEventListener('mousedown', startSwipe);
    container.addEventListener('touchstart', startSwipe);
  
    function startSwipe(event) {
      isSwiping = true;
      startX = event.clientX || event.touches[0].clientX;
      startScrollX = container.scrollLeft;
    }
  
    container.addEventListener('mousemove', moveSwipe);
    container.addEventListener('touchmove', moveSwipe);
  
    function moveSwipe(event) {
      if (isSwiping) {
        const currentX = event.clientX || event.touches[0].clientX;
        const swipeX = currentX - startX;
        container.scrollLeft = startScrollX - swipeX;
      }
    }
  
    container.addEventListener('mouseleave', stopSwipe);
    container.addEventListener('mouseup', stopSwipe);
    container.addEventListener('touchcancel', stopSwipe);
    container.addEventListener('touchend', stopSwipe);
  
    function stopSwipe() {
      isSwiping = false;
    }
  }
  
  const mainContainer1 = document.querySelector('.main-container1');
  addSwipeSupport(mainContainer1);
  
  const mainContainer2 = document.querySelector('.main-container2');
  addSwipeSupport(mainContainer2);
