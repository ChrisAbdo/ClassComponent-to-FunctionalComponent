import React from "react";
import Head from "next/head";
import { useEffect, useState } from "react";
import Decentragram from "../build/contracts/Decentragram.json";
import Web3 from "web3";
import Navbar from "../components/Navbar";
import Main from "../components/Main";

function Profile() {
  const ipfsClient = require("ipfs-http-client");
  const ipfs = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  const [account, setAccount] = useState("");
  const [decentragram, setDecentragram] = useState(null);
  const [imagesCount, setImagesCount] = useState([0]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buffer, setBuffer] = useState(null);

  useEffect(() => {
    // functions loadBlockchainData and loadWeb3
    loadWeb3();
    loadBlockchainData();
  }, []);

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async function loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const networkData = Decentragram.networks[networkId];
    if (networkData) {
      const decentragram = new web3.eth.Contract(
        Decentragram.abi,
        networkData.address
      );
      setDecentragram(decentragram);

      var imagesCount = await decentragram.methods.imageCount().call();
      setImagesCount([]);

      for (let i = 1; i <= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call();
        setImages([...images, image]);
      }

      // sort image. show highest tipped images first

      setLoading(false);
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  return (
    <div>
      <h1>hi</h1>
      {/* if image author is the same as the wallet address, display posts */}
      {images.map((image, key) => {
        if (image.author === account) {
          return (
            <div key={key}>
              <li className="list-group-item">
                <p class="text-center">
                  <img
                    src={`https://ipfs.infura.io/ipfs/${image.hash}`}
                    style={{ maxWidth: "420px" }}
                  />
                </p>
                <p>{image.description}</p>
              </li>
            </div>
          );
        }
      })}
    </div>
  );
}

export default Profile;
