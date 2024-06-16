import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [newOwner, setNewOwner] = useState("");
  const [amount, setAmount] = useState("");
  const [frozen, setFrozen] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(ethers.utils.parseEther(amount));
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(ethers.utils.parseEther(amount));
      await tx.wait();
      getBalance();
    }
  };

  const transferOwnership = async () => {
    if (atm) {
      let tx = await atm.transferOwnership(newOwner);
      await tx.wait();
    }
  };

  const freezeContract = async () => {
    if (atm) {
      let tx = await atm.freezeContract();
      await tx.wait();
      setFrozen(true);
    }
  };

  const unfreezeContract = async () => {
    if (atm) {
      let tx = await atm.unfreezeContract();
      await tx.wait();
      setFrozen(false);
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <input
          type="text"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
        <br /><br />
        <input
          type="text"
          placeholder="New owner address"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
        />
        <button onClick={transferOwnership}>Transfer Ownership</button>
        <br /><br />
        <button onClick={freezeContract} disabled={frozen}>Freeze Contract</button>
        <button onClick={unfreezeContract} disabled={!frozen}>Unfreeze Contract</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          margin: 0 auto;
          padding: 20px;
          max-width: 1000px;
          background-image: url('https://cdn.gencraft.com/prod/user/a0ae7548-5a92-4720-87fa-546a2865cf98/8d5c3ca7-69e0-4aee-bfe6-1773f0f8533a/image/image1_0.jpg?Expires=1718603189&Signature=J4ThUKMXmkyAtj~ucITG5xluEcMTDhb2kaA~rbfRqVYB3ejY97K32R~UNeI-S4feHQZpBupRuGppoFT-g9FawmAZ5WfPzI~UlKoT9l1K7f9lxA3h5J5NsCT-e7Zy8v6B3nbmXlqLm-Mz3mMrBkXED6n4tws5QO5Gcx9teoaYigtFzaiLTqLSVzOwBmoFOALngkwVYnejf0f1denP-uNxzhH6r~S6GSohMdMKTt-0gFAGTP4pprlxe5e~AGHntXRtoeYVAbBoQiijlNWIUlkgocwmiDKwx8tYBOxUqs8nZo-UbBiqtg~JZUvYChwV-5Q8oAvg7eLmr9gSNEoDi2GBVg__&Key-Pair-Id=K3RDDB1TZ8BHT8');
          background-size: cover;
          background-position: center;
          height: 80vh;
          color: white;
          font-family: 'Algerian';
        }
      `}</style>
    </main>
  );
}
