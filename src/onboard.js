import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import coinbaseModule from "@web3-onboard/coinbase";
import trezorModule from "@web3-onboard/trezor";
import ledgerModule from "@web3-onboard/ledger";

// Wallets
const coinbase = coinbaseModule();
const trezorOptions = {
  email: "test@test.com",
  appUrl: "https://www.blocknative.com",
};
const ledger = ledgerModule();
const trezor = trezorModule(trezorOptions);

// RPC URLs
const ETH_MAINNET_RPC_URL = "";
const ETH_TESTNET_RPC_URL = "";
const MATIC_MAINNET_RPC_URL = "";
const MATIC_TESTNET_RPC_URL = "";

// Onboard
const injected = injectedModule();

const onboard = Onboard({
  wallets: [injected, coinbase, trezor, ledger],
  chains: [
    // Mainnet
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: ETH_MAINNET_RPC_URL || "https://ethereum.publicnode.com",
    },
    // Testnet
    {
      id: "0x5",
      token: "ETH",
      label: "Goerli",
      rpcUrl: ETH_TESTNET_RPC_URL || "https://eth-goerli.public.blastapi.io",
    },
    // Testnet
    {
      id: "0x13881",
      token: "MATIC",
      label: "Polygon - Mumbai",
      rpcUrl:
        MATIC_MAINNET_RPC_URL || "https://matic-mumbai.chainstacklabs.com",
    },
    // Mainnet
    {
      id: "0x89",
      token: "MATIC",
      label: "Matic Mainnet",
      rpcUrl:
        MATIC_TESTNET_RPC_URL || "https://matic-mainnet.chainstacklabs.com",
    },
  ],
  appMetadata: {
    name: "My App",
    icon: '<svg width="40" height="40"><line x1="10" y1="10" x2="30" y2="30" stroke="red" stroke-width="4" /></svg>',
    description: "Example showcasing how to connect a wallet.",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
    ],
  },
});

export default onboard;
