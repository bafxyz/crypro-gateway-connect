import onboard from "./onboard";
// import web3 from "web3";

const connect = async () => {
  await onboard.connectWallet();
};

const mumbaiContractAddress = "0xfb2BC39C052f5F24dCb0c3c623d18de4cbB081d5";

const contractAddress = mumbaiContractAddress;
const contractABI = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_to",
        type: "address",
      },
    ],
    name: "transferFunds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const transfer = async (to, value) => {
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // Create a new transaction object
  const tx = contract.methods.transferFunds(to);

  // Get the gas estimate for the transaction
  const gasEstimate = await tx.estimateGas({ from });

  // Send the transaction
  const result = await tx.send({
    from,
    gas: gasEstimate,
    value: web3.utils.toWei(value, "ether"),
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("connect");
  button.addEventListener("click", connect);

  const transferButton = document.getElementById("transfer");
  transferButton.addEventListener("click", () => {
    const value = document.getElementById("to").value;
    const to = document.getElementById("transfer-amount").value;
    transfer(to, value);
  });
});
