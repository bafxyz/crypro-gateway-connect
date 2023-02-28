import React from "react";
import { useState } from "react";
import { connect, disconnect, transfer } from "../services/connect";

export function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({});
  const [to, setTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("0");
  const handleTransfer = () => {
    transfer(to, transferAmount);
  };

  const handleConnect = () => {
    connect().then((connected) => {
      const { address, balance: amount } = connected.accounts[0];

      setAddress(address);
      setBalance(amount);
      setIsConnected(true);
    });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTo(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAmount(e.target.value.toString());
  };

  const handleDisconnect = () => {
    disconnect();
    setIsConnected(false);
  };

  return (
    <div className="max-w-sm mx-auto my-10">
      <h1 className="text-2xl font-bold text-gray-900">Client</h1>
      <p className="text-sm text-gray-500">
        This is a simple client to interact with the blockchain.
      </p>
      <div className="flex flex-row gap-4">
        {!isConnected && (
          <button
            className="my-4 rounded-md border border-green-300 bg-green-400 py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleConnect}
          >
            Connect
          </button>
        )}
        {isConnected && (
          <button
            className="my-4 rounded-md border border-red-300 bg-red-400 py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        )}
      </div>
      <div className="py-5 flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500">Your wallet address</p>
          <p id="address" className="text-sm text-gray-900">
            {address}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Your balance</p>
          <pre id="balance">{JSON.stringify(balance)}</pre>
        </div>
      </div>
      <form action="#">
        <div className="my-5">
          <label
            htmlFor="to"
            className="block text-sm font-medium text-gray-700"
          >
            Receiver address
          </label>
          <input
            type="text"
            name="to"
            id="to"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            autoComplete="on"
            value={to}
            onChange={handleToChange}
          />
        </div>

        <div className="my-5">
          <label
            htmlFor="transfer-amount"
            className="block text-sm font-medium text-gray-700"
          >
            Transfer amount
          </label>
          <input
            type="number"
            name="transfer-amount"
            id="transfer-amount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="0"
            value={transferAmount}
            onChange={handleAmountChange}
          />
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <button
            type="button"
            id="transfer"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleTransfer}
          >
            Transfer
          </button>
        </div>
      </form>
    </div>
  );
}
