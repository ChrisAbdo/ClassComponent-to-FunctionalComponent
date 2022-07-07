import Head from "next/head";
import { useEffect, useState } from "react";
import Decentragram from "../build/contracts/Decentragram.json";
import Web3 from "web3";
import Navbar from "../components/Navbar";
import Profile from "../pages/profile";

const Home = () => {
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

      const imagesCount = await decentragram.methods.imageCount().call();
      setImagesCount(imagesCount);

      for (let i = 1; i <= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call();
        setImages([...images, image]);
      }

      // sort image. show highest tipped images first
      setImages(images.sort((a, b) => b.tipAmount - a.tipAmount));

      setLoading(false);
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  // event for captureFile.
  const captureFile = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
      console.log("buffer", buffer);
    };
  };

  // upload image which takes in description
  const uploadImage = async (description) => {
    console.log("submitting to ipfs");

    ipfs.add(buffer, (error, result) => {
      console.log("IPFS result", result);
      if (error) {
        console.log("IPFS error", error);
        return;
      }

      setLoading(true);

      decentragram.methods
        .uploadImage(result[0].hash, description)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          setLoading(false);
        });
    });
  };

  return (
    <div className="flex min-h-screen py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">Welcome to profile.web3 </h1>
      </main> */}

      <Navbar account={account} />
      {/* loading goes here */}
      {loading ? (
        <div className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
          <h1 className="text-6xl font-bold">Loading...</h1>
        </div>
      ) : (
        <Profile
          images={images}
          account={account}
          uploadImage={uploadImage}
          captureFile={captureFile}
        />
      )}
    </div>
  );
};

export default Home;
