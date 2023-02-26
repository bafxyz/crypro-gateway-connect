import { connect, disconnect, transfer } from "./services/connect";

document.addEventListener("DOMContentLoaded", function () {
    const connectButton = document.getElementById("connect");
    connectButton.addEventListener("click", () => {
        connect().then((connected) => {
            if (connected) {
                const { address, balance } = connected.accounts[0];
                document.getElementById("address").innerText = address;
                document.getElementById("balance").innerText = JSON.stringify(balance);
            }
        });
    });

    const disconnectButton = document.getElementById("disconnect");
    disconnectButton.addEventListener("click", disconnect);

    const transferButton = document.getElementById("transfer");
    transferButton.addEventListener("click", () => {
        const to = document.getElementById("to").value;
        const value = document.getElementById("transfer-amount").value;
        transfer(to, value);
    });
});

