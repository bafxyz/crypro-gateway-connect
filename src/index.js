import onboard from "./onboard";
import Web3 from "web3";
import usdcAbi from "./usdc-abi.json";

const connect = async () => {
  await onboard.connectWallet();
};

const COMMISSION_PROXY_CONTRACT_ABI = [
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
const CONTRACT_ADDRESS_MUMBAI = "0xfb2BC39C052f5F24dCb0c3c623d18de4cbB081d5";
const CONTRACT_ADDRESS_GOERLI = "0x2139c63E0c3cd19CBd37502007cCCB4f5Ae35b42";
const USDCToken = {
  name: "USDC",
  // address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC Mainnet Address
  address: "0xE097d6B3100777DC31B34dC2c58fB524C2e76921", // USDC Testnet Address
  decimals: 6,
};

const transfer = async (to, value) => {
  const from = onboard.state.get().wallets?.[0].accounts?.[0]?.address;
  const web3 = new Web3(onboard.state.get().wallets?.[0].provider);
  const maxUint256 = web3.utils.toBN(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  const usdcContract = new web3.eth.Contract(usdcAbi, USDCToken.address);
  console.log("🚀 ~ file: index.js:41 ~ transfer ~ usdcContract", usdcContract);
  const contract = new web3.eth.Contract(
    COMMISSION_PROXY_CONTRACT_ABI,
    CONTRACT_ADDRESS_MUMBAI
  );

  // Create a new transaction object
  // const tx = contract.methods.transferFunds(to);

  // // Get the gas estimate for the transaction
  // // const gasEstimate = await tx.estimateGas({ from });
  // // debugger;

  // // Send the transaction
  // const result = await tx.send({
  //   from,
  //   gas: "3000000",
  //   value: web3.utils.toWei(value, "ether"),
  //   decimals: 6,
  // });
  // debugger;
  // console.log("🚀 ~ file: index.js:51 ~ transfer ~ result", result);

  usdcContract.methods
    .approve(CONTRACT_ADDRESS_MUMBAI, maxUint256)
    .send({ from })
    .on("receipt", async () => {
      // Transfer the approved USDC to the smart contract
      const tx = contract.methods.transferFunds(to);
      const result = await tx.send({
        from,
        gas: "3000000",
        value: web3.utils.toWei(value, "ether"),
        decimals: 6,
      });
      console.log("🚀 ~ file: index.js:72 ~ .on ~ result", result);
      debugger;

      // .send({ from })
      // .on("receipt", (receipt) => {
      //   console.log(receipt);
      // })
      // .on("error", (error) => {
      //   console.error(error);
      // });
    })
    .on("error", (error) => {
      console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("connect");
  button.addEventListener("click", connect);

  const transferButton = document.getElementById("transfer");
  transferButton.addEventListener("click", () => {
    const to = document.getElementById("to").value;
    const value = document.getElementById("transfer-amount").value;
    transfer(to, value);
  });
});
