import onboard from "./onboard";
import { ethers } from "ethers";
import usdcAbi from "../abi/usdc-abi.json";
import contractAbi from "../abi/contract-abi.json";
import { MaxUint256 } from "@ethersproject/constants";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";

// In order to use custom RPC URLs, if there is a RPC error, you need to set up an API key for each network in your .env file
// You should also set up RPC_URL in your .env file in that case
const jsonRpcApiKeyMap = new Map([
  [1, process.env.ETH_API_KEY],
  [5, process.env.ETH_GOERLI_API_KEY],
  [137, process.env.MATIC_API_KEY],
  [80001, process.env.MATIC_MUMBAI_API_KEY],
]);

const contractAddressMap = new Map([
  [1, process.env.ETH_CONTRACT_ADDRESS],
  [5, process.env.ETH_GOERLI_CONTRACT_ADDRESS],
  [137, process.env.MATIC_CONTRACT_ADDRESS],
  [80001, process.env.MATIC_MUMBAI_CONTRACT_ADDRESS],
]);

const usdcAddressMap = new Map([
  [1, process.env.ETH_USDC_ADDRESS],
  [5, process.env.ETH_GOERLI_USDC_ADDRESS],
  [137, process.env.MATIC_USDC_ADDRESS],
  [80001, process.env.MATIC_MUMBAI_USDC_ADDRESS],
]);

const getChainId = async () => {
  const provider = ethers.getDefaultProvider();
  const network = await provider.getNetwork();

  return network.chainId;
};

const getProvider = async () => {
  const chainId = await getChainId();

  let provider;
  const apiKey = jsonRpcApiKeyMap.get(chainId);
  const rpcUrl = process.env.RPC_URL;

  if (window.ethereum) {
    provider = new Web3Provider(window.ethereum);
  } else if (apiKey) {
    provider = new JsonRpcProvider(rpcUrl, { name: chainId, chainId });
  } else {
    provider = ethers.getDefaultProvider();
  }

  return provider;
};

export const connect = async () => {
  const wallets = await onboard.connectWallet();
  const connected = wallets[0];

  return connected;
};

export const disconnect = async () => {
  const wallets = await onboard.connectWallet();
  const connected = wallets[0];

  // If the user has a wallet connected, set the address and balance
  if (connected) {
    const { label } = connected;
    onboard.disconnectWallet({ label });
  }
};

export const checkUsdcAllowance = async (
  from,
  usdcContract,
  contractAddress
) => {
  const approvedAmount = await usdcContract.allowance(from, contractAddress);

  return approvedAmount;
};

export const approveUsdc = async (usdcContract, contractAddress) => {
  const approveTx = await usdcContract.approve(contractAddress, MaxUint256);

  return approveTx.wait();
};

export const transfer = async (to, amount) => {
  const provider = await getProvider();
  const chainId = await provider
    .getNetwork()
    .then((network) => network.chainId);
  const signer = provider.getSigner();
  const from = await signer.getAddress();

  const usdcAddress = usdcAddressMap.get(chainId);
  const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
  const decimals = await usdc.decimals();

  const contractAddress = contractAddressMap.get(chainId);
  const commissionProxy = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );
  // Transfer the approved USDC to the smart contract
  // Use parseUnits instead of parseEther to account for USDC's 6 decimal places
  const amountInWei = ethers.utils.parseUnits(amount, decimals);

  console.log("🚀 ~ file: connect.js:97 ~ transfer ~ from:", from);
  console.log("🚀 ~ file: connect.js:91 ~ transfer ~ to:", to);
  console.log(
    "🚀 ~ file: connect.js:103 ~ transfer ~ contractAddress:",
    contractAddress
  );
  console.log(
    "🚀 ~ file: connect.js:99 ~ transfer ~ usdcAddress:",
    usdcAddress
  );
  console.log(
    "🚀 ~ file: connect.js:115 ~ transfer ~ amountInWei:",
    amountInWei
  );

  try {
    if (!from) {
      throw new Error("No account is connected");
    }

    // Check if USDC is already approved to be spent by the contract
    const allowanceAmount = await checkUsdcAllowance(
      from,
      usdc,
      contractAddress
    );

    console.log(
      "🚀 ~ file: connect.js:127 ~ transfer ~ allowanceAmount:",
      allowanceAmount
    );

    if (!allowanceAmount.gte(amountInWei)) {
      // Approve the smart contract to spend USDC
      await approveUsdc(usdc, contractAddress);
    }

    console.log("🚀 ~ file: connect.js:137 ~ transfer ~ to:", to);

    const tx = await commissionProxy.transferFunds(to, amountInWei);
    await tx.wait();

    // const tx = await usdc.transfer(contractAddress, amountInWei);
    console.log("🚀 Money sent result: ", tx.hash);
  } catch (error) {
    console.error(error);
  }
};
