import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Decentragram from "../build/contracts/Decentragram.json";
import ResumeUpload from "./ResumeUpload";

function Main() {
  const ipfsClient = require("ipfs-http-client");
  const ipfs = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });
  const [account, setAccount] = useState("");
  const [decentragram, setDecentragram] = useState(null);

  // const imagesCount = 0;
  const [imagesCount, setImagesCount] = useState(0);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buffer, setBuffer] = useState(null);
  const [tipAmount, setTipAmount] = useState(0);

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
      // set the imagesCount to update with every new image
      setImagesCount(imagesCount);

      for (let i = 1; i <= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call();
        setImages((prevImages) => [...prevImages, image]);
      }

      //  this.setState({
      //   images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
      // })

      // display the images
      setLoading(false);

      console.log(imagesCount);

      setLoading(false);
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }
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
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 ml-auto mr-auto"
          style={{ maxWidth: "500px" }}
        >
          <div className="content mr-auto ml-auto">
            <p>&nbsp;</p>
            <h2>Share Image</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                // const description = this.imageDescription.value;
                // make above line work with hooks
                const description = event.target.imageDescription.value;
                uploadImage(description);
              }}
            >
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .bmp, .gif"
                onChange={captureFile}
              />
              <div className="form-group mr-sm-2">
                <br></br>
                <input
                  id="imageDescription"
                  type="text"
                  className="form-control"
                  placeholder="Image description..."
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg">
                Upload!
              </button>
            </form>
            <p>&nbsp;</p>
            {images.map((image, key) => {
              return (
                <div className="card mb-4" key={key}>
                  <div className="card-header">
                    <small className="text-muted">{image.author}</small>
                  </div>
                  <ul id="imageList" className="list-group list-group-flush">
                    <li className="list-group-item">
                      <p class="text-center">
                        <img
                          src={`https://ipfs.infura.io/ipfs/${image.hash}`}
                          style={{ maxWidth: "420px" }}
                        />
                      </p>
                      <p>{image.description}</p>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Main;
