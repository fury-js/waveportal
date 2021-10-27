import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

const App = () => {
  const contractAddress = "0xf2d65e43cC6108DAac1782025A4c80d7E179e380";
  const contractABI = abi.abi;
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState('')
  const [allWaves, setAllWaves] = useState([])
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        getAllWavesfromContract();
        console.log(allWaves  )
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try{
      const{ ethereum } = window;
      if(!ethereum){
        alert("Get metamask")
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      console.log("account connected:", accounts[0])
      setCurrentAccount(accounts[0])
    }catch(err){
      console.log(err)
    }
  }

  const wave = async () => {
    try{
      const{ethereum} = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        let count = await wavePortalContract.getTotalWaves()
        console.log("Retreived total wave count:", count.toNumber())

        let waveTxn = await wavePortalContract.wave("my test wave")
        console.log("Mining....", waveTxn.hash);

        await waveTxn.wait();
        count = await wavePortalContract.getTotalWaves()
        setWaveCount(count.toNumber())
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object does not exist")
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getAllWavesfromContract = async () => {
    try{
      const{ethereum} = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = []


        waves.forEach(wave => {
          wavesCleaned.push({
            address:wave.waver,
            message: wave.message,
            timestamp: new Date(wave.timestamp * 1000)
          })

        })

        setAllWaves(wavesCleaned)
      } else {
        console.log("Ethereum object does not exist")
      }
    } catch (err) {
      console.log(err)
    }

  }
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am chukky_cool an expert in smart-contract dev, allow me to make your dreams come true. Connect your Ethereum wallet and wave at me!
        </div>

        <input type='text'></input>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
          </button>
        )}
        {currentAccount ? <div><h4>{currentAccount}</h4> <h4>Number of waves: {waveCount}</h4></div> :<h4>No waves currently</h4>}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"} }>
              <div>Address: {wave.address}</div>
              <div>Message: {wave.message}</div>
              <div>Time: {wave.timestamp.toString()}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
