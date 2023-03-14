import onboard from "./onboard";
import { ethers } from "ethers";
import usdcAbi from "../abi/usdc-abi.json";
import usdtAbi from "../abi/usdt-abi.json";
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

const usdtAddressMap = new Map([
  [1, process.env.ETH_USDT_ADDRESS],
  [5, process.env.ETH_GOERLI_USDT_ADDRESS],
  [137, process.env.MATIC_USDT_ADDRESS],
  [80001, process.env.MATIC_MUMBAI_USDT_ADDRESS],
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

export const checkStableCoinAllowance = async (
  from,
  stableCoinTokenContract,
  contractAddress
) => {
  const approvedAmount = await stableCoinTokenContract.allowance(
    from,
    contractAddress
  );

  return approvedAmount;
};

export const approveStableCoin = async (usdcContract, contractAddress) => {
  const approveTx = await usdcContract.approve(contractAddress, MaxUint256);

  return approveTx.wait();
};

export const transfer = async (to, amount, isUSDC = true) => {
  const provider = await getProvider();
  const chainId = await provider
    .getNetwork()
    .then((network) => network.chainId);
  const signer = provider.getSigner();
  const from = await signer.getAddress();

  const stableCoinAddress = isUSDC
    ? usdcAddressMap.get(chainId)
    : usdtAddressMap.get(chainId);
  const stableCoinAbi = isUSDC ? usdcAbi : usdtAbi;

  const stableCoinTokenContract = new ethers.Contract(
    stableCoinAddress,
    stableCoinAbi,
    signer
  );
  // const decimals = await usdc.decimals();

  const contractAddress = contractAddressMap.get(chainId);
  const commissionProxy = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );
  try {
    if (!from) {
      throw new Error("No account is connected");
    }

    const _amount = ethers.utils.parseUnits(amount, 6).toString();

    // Check if USDC is already approved to be spent by the contract
    const allowanceAmount = await checkStableCoinAllowance(
      from,
      stableCoinTokenContract,
      contractAddress
    );

    if (!allowanceAmount.gte(_amount)) {
      // Approve the smart contract to spend USDC
      await approveStableCoin(stableCoinTokenContract, contractAddress);
    }

    const tx = await commissionProxy.transferFunds(
      to,
      _amount,
      stableCoinAddress,
      {
        gasLimit: 999999,
      }
    );
    await tx.wait();

    // const tx = await usdc.transfer(contractAddress, amountInWei);
    console.log("🚀 Money sent result: ", tx.hash);
  } catch (error) {
    console.error(error);
  }
};
