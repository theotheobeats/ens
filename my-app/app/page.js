"use client";
import Head from "next/head";1n
import Image from 'next/image'
import styles from './page.module.css'
import Web3Modal from "web3modal"
import { ethers, providers } from "ethers"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  // wallet connected to keep a track whether the user's wallet is connected or not
  const [walletConnected, setWalleconnected] = useState(false);

  // create a reference to the web3 modal (used for connecting to metamask) which persists as long
  // as the page is open
  const web3ModalRef = useRef();

  //ENS
  const [ens, setENS] = useState("");

  // save address of the currently connected account
  const [address, setAddress] = useState("");

  /**
   * Sets the ENS, if the current connected address has an associated ENS or else it sets
   * the address of the connected account
   */
  const setENSorAddress = async (address, web3Provider) => {
    // look up the ENS related to given address
    var _ens = await web3Provider.lookupAddress(address);
    if (_ens) {
      setENS(_ens);
    } else {
      setAddress(address);
    }
  }

  /**
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   */

  const getProviderOrSigner = async (needSigner = false) => {
    // connect to metamask
    // since we store web3Modal as a reference , we need to access the 'current' value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // if user is not connected to goerli network, let em know by throwing error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change the network to Goerli");
    }

    const signer = web3Provider.getSigner();

    // get the address associated to the signer which is connected to the Metamask
    const address = await signer.getAddress();

    // calls the function and set the ENS or Address
    await setENSorAddress(address, web3Provider);
    return signer;
  }

  // connect the meta mask wallet
  const connectWallet = async () => {
    try {
      // get provider from web3Modal, which is our case Metamask
      // when used first time it prompts the user to connect the wallet
      await getProviderOrSigner(true);
      setWalletConnected(true);
    } catch (err) {
      console.log(err);
    };
  }

  /*
   renderButton: Returns a button based on the state of the dapp
 */
  const renderButton = () => {
    if (walletConnected) {
      <div>Wallet connected</div>;
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to LearnWeb3 Punks {ens ? ens : address}!
          </h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            It&#39;s an NFT collection for LearnWeb3 Punks.
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./learnweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by LearnWeb3 Punks
      </footer>
    </div>
  );
}
