import onboard from "./onboard";
import { ethers } from "ethers";
import usdcAbi from "./usdc-abi.json";
import contractAbi from "./contract-abi.json";
import { MaxUint256 } from '@ethersproject/constants'
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

const setAddress = (address) => {
    document.getElementById("address").innerText = address;
};

const setBalance = (balance) => {
    document.getElementById("balance").innerText = JSON.stringify(balance);
};

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

const connect = async () => {
    const wallets = await onboard.connectWallet();
    const connected = wallets[0]

    // If the user has a wallet connected, set the address and balance
    if (connected) {
        setAddress(connected.accounts[0].address)
        setBalance(connected.accounts[0].balance)
    }
}

const disconnect = async () => {
    const wallets = await onboard.connectWallet();
    const connected = wallets[0]

    // If the user has a wallet connected, set the address and balance
    if (connected) {
        const { label } = connected
        onboard.disconnectWallet({ label })
    }
}

const checkUsdcApproval = async (from, usdcContract, contractAddress) => {
    const approvedAmount = await usdcContract.allowance(from, contractAddress);

    return approvedAmount.gte(MaxUint256);
};

const approveUsdc = async (usdcContract, contractAddress) => {
    const approveTx = await usdcContract.approve(contractAddress, MaxUint256);

    return approveTx.wait();
};

const transfer = async (to, value) => {
    const provider = await getProvider();
    const chainId = await provider.getNetwork().then(network => network.chainId);
    const signer = provider.getSigner();
    const from = await signer.getAddress();

    const usdcAddress = usdcAddressMap.get(chainId)
    const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);

    const contractAddress = contractAddressMap.get(chainId);
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    try {
        if (!from) {
            throw new Error('No account is connected');
        }

        // Check if USDC is already approved to be spent by the contract
        const isUsdcApproved = await checkUsdcApproval(from, usdcContract, contractAddress);

        if (!isUsdcApproved) {
            // Approve the smart contract to spend USDC
            await approveUsdc(usdcContract, contractAddress);
        }

        // Transfer the approved USDC to the smart contract
        // Use parseUnits instead of parseEther to account for USDC's 6 decimal places
        const valueInWei = ethers.utils.parseUnits(value, 6);
        const allowance = await usdcContract.allowance(from, contractAddress);

        if (allowance.lt(valueInWei)) {
            await approveUsdc(usdcContract, contractAddress);
        }

        const tx = await contract.transferFunds(to, { value: valueInWei, gasLimit: 3000000 });
        console.log('🚀 Money sent result: ', tx.hash);
    } catch (error) {
        console.error(error);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const connectButton = document.getElementById("connect");
    connectButton.addEventListener("click", connect);

    const disconnectButton = document.getElementById("disconnect");
    disconnectButton.addEventListener("click", disconnect);

    const transferButton = document.getElementById("transfer");
    transferButton.addEventListener("click", () => {
        const to = document.getElementById("to").value;
        const value = document.getElementById("transfer-amount").value;
        transfer(to, value);
    });
});

