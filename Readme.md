This project was bootstrapped with [parceljs](https://parceljs.org).
It shows framework agnostic wallet connect example

### Example
![Example](https://github.com/bafxyz/crypro-gateway-connect/blob/main/example/example.gif?raw=tru)

### Requirements

- Node.js 18+
- These libraries are required to run the project:

```shell
npm i @web3-onboard/coinbase @web3-onboard/core @web3-onboard/injected-wallets @web3-onboard/ledger @web3-onboard/trezor @web3-onboard/trust @web3-onboard/walletconnect
```

### Getting started

Run the following command on your local environment:

```shell
git clone --depth=1 https://github.com/bafxyz/crypto-gateway-connect.git
cd crypto-gateway-connect
npm install

rename .env.example to .env
```

Then, you can run locally in development mode with live reload:

```shell
$ npm run start
```

### Usage

Check src/index.js for usage. and src/index.html for example.

### Note
You can use this project as a template for your own project. You can switch networks in the wallet connect modal.
For this example, I have used the following networks:
#### Production
Ethereum Mainnet
Polygon Mainnet

#### Testnet
Ethereum Goerli
Polygon Mumbai

We added support for the following tokens:
USDC
USDT

