import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;
    try {
      // get contract instance
      const networkId = web3.version.network;
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = web3.eth.contract(starNotaryArtifact.abi).at(deployedNetwork.address);
      const accounts = web3.eth.accounts;
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
    /* try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    } */
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;

    await this.meta.createStar(name, id, {from: this.account}, function(err,result) {
      if(err){
        console.log(err);
      }
    });
    App.setStatus("New Star Owner is " + this.account + ".");
  },
  
  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    const id = Number(document.getElementById("lookid").value);
    await this.meta.lookUptokenIdToStarInfo(id, function(err,result) {
      if(!err){
        App.setStatus(`Star with ID ${id} is ${result}`);
      }else{
        console.log(err);
        App.setStatus(`Error fetching star name.`);
      }
    });
    
  }

};

window.App = App;

window.addEventListener("load", async function() {
   if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
    
  } else { 
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
 }

  App.start();
});