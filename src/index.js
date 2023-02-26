import onboard from "./onboard";
import { ethers } from "ethers";
import usdcAbi from "./usdc-abi.json";
import contractAbi from "./contract-abi.json";
import { MaxUint256 } from '@ethersproject/constants'

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

const provider = new ethers.providers.Web3Provider(window.ethereum);

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

const approveUsdc = async (usdcAddress, contractAddress) => {
    const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider.getSigner());
    const approveTx = await usdcContract.approve(contractAddress, MaxUint256);
    return approveTx.wait();
};

const transferToContract = async (to, value, contractAddress) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
    return contract.transferFunds(to, { value: ethers.utils.parseEther(value) });
}

const transfer = async (to, value) => {
    const chainId = await provider.getNetwork().then(network => network.chainId);
    const usdcAddress = usdcAddressMap.get(chainId)
    const contractAddress = contractAddressMap.get(chainId);

    try {
        const from = onboard.state.get().wallets?.[0].accounts?.[0]?.address;
        if (!from) {
            throw new Error('No account is connected');
        }

        // Approve the smart contract to spend USDC
        await approveUsdc(usdcAddress, contractAddress);

        // Transfer the approved USDC to the smart contract
        const result = await transferToContract(to, value, contractAddress);
        console.log('🚀 Money sent result: ', result);
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

