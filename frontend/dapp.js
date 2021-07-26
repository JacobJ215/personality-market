!function(){window;const e=document.documentElement;if(e.classList.remove("no-js"),e.classList.add("js"),document.body.classList.contains("has-animations")){(window.sr=ScrollReveal()).reveal(".feature, .pricing-table-inner",{duration:600,distance:"20px",easing:"cubic-bezier(0.5, -0.01, 0, 1.005)",origin:"bottom",interval:100}),e.classList.add("anime-ready"),anime.timeline({targets:".hero-figure-box-05"}).add({duration:400,easing:"easeInOutExpo",scaleX:[.05,.05],scaleY:[0,1],perspective:"500px",delay:anime.random(0,400)}).add({duration:400,easing:"easeInOutExpo",scaleX:1}).add({duration:800,rotateY:"-15deg",rotateX:"8deg",rotateZ:"-1deg"}),anime.timeline({targets:".hero-figure-box-06, .hero-figure-box-07"}).add({duration:400,easing:"easeInOutExpo",scaleX:[.05,.05],scaleY:[0,1],perspective:"500px",delay:anime.random(0,400)}).add({duration:400,easing:"easeInOutExpo",scaleX:1}).add({duration:800,rotateZ:"20deg"}),anime({targets:".hero-figure-box-01, .hero-figure-box-02, .hero-figure-box-03, .hero-figure-box-04, .hero-figure-box-08, .hero-figure-box-09, .hero-figure-box-10",duration:anime.random(600,800),delay:anime.random(600,800),rotate:[anime.random(-360,360),function(e){return e.getAttribute("data-rotation")}],scale:[.7,1],opacity:[0,1],easing:"easeInOutExpo"})}}();

// Change this address to match your deployed contract!
const contractAddress = "0xFA328C1Db1C57886A0F72Ba7d1146d8D5020a7f7";

const dApp = {
  ethEnabled: function() {
    // If the browser has an Ethereum provider (MetaMask) installed
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  },
  collectVars: async function() {
    // get land tokens
    this.tokens = [];
    this.totalSupply = await this.contract.methods.totalSupply().call();

    // fetch json metadata from IPFS (name, description, image, etc)
    const fetchMetadata = (reference_uri) => fetch(`https://gateway.pinata.cloud/ipfs/${reference_uri.replace("ipfs://", "")}`, { mode: "cors" }).then((resp) => resp.json());

    for (let i = 1; i <= this.totalSupply; i++) {
      try {
        const token_uri = await this.contract.methods.tokenURI(i).call();
        console.log('token uri', token_uri)
        const token_json = await fetchMetadata(token_uri);
        console.log('token json', token_json)
        this.tokens.push({
          tokenId: i,
          highestBid: Number(await this.contract.methods.highestBid(i).call()),
          //auctionEnded: Boolean(await this.contract.methods.auctionEnded(i).call()),
          pendingReturn: Number(await this.contract.methods.pendingReturn(i, this.accounts[0]).call()),
          auction: new window.web3.eth.Contract(
            this.auctionJson,
            await this.contract.methods.auctions(i).call(),
            { defaultAccount: this.accounts[0] }
          ),
          owner: await this.contract.methods.ownerOf(i).call(),
          ...token_json
        });
      } catch (e) {
        console.log(JSON.stringify(e));
      }
    }
  },
  setAdmin: async function() {
    // if account selected in MetaMask is the same as owner then admin will show
    if (this.isAdmin) {
      $(".dapp-admin").show();
    } else {
      $(".dapp-admin").hide();
    }
  },
  updateUI: async function() {
    console.log("updating UI");
    // refresh variables
    await this.collectVars();

    $("#dapp-tokens").html("");
    this.tokens.forEach((token) => {
      try {
        let endAuction = `<a token-id="${token.tokenId}" class="dapp-admin" style="display:none;" href="#" onclick="dApp.endAuction(event)">End Auction</a>`;
        let bid = `<a token-id="${token.tokenId}" href="#" onclick="dApp.bid(event);">Bid</a>`;
        let owner = `Owner: ${token.owner}`;
        let withdraw = `<a token-id="${token.tokenId}" href="#" onclick="dApp.withdraw(event)">Withdraw</a>`
        let pendingWithdraw = `Balance: ${token.pendingReturn} wei`;
          $("#dapp-tokens").append(
            `<div class="col m6">
              <div class="card">
                <div class="card-image">
                  <img id="dapp-image" src="https://gateway.pinata.cloud/ipfs/${token.image.replace("ipfs://", "")}">
                  <span id="dapp-name" class="card-title">${token.name}</span>
                </div>
                <div class="card-action">
                  <input type="number" min="${token.highestBid + 1}" name="dapp-wei" value="${token.highestBid + 1}" ${token.auctionEnded ? 'disabled' : ''}>
                  ${token.auctionEnded ? owner : bid}
                  ${token.pendingReturn > 0 ? withdraw : ''}
                  ${token.pendingReturn > 0 ? pendingWithdraw : ''}
                  ${this.isAdmin && !token.auctionEnded ? endAuction : ''}
                </div>
              </div>
            </div>`
          );
      } catch (e) {
        alert(JSON.stringify(e));
      }
    });

    // hide or show admin functions based on contract ownership
    this.setAdmin();
  },
  bid: async function(event) {
    const tokenId = $(event.target).attr("token-id");
    const wei = Number($(event.target).prev().val());
    await this.contract.methods.bid(tokenId).send({from: this.accounts[0], value: wei}).on("receipt", async (receipt) => {
      M.toast({ html: "Transaction Mined! Refreshing UI..." });
      await this.updateUI();
    });
  },
//   endAuction: async function(event) {
//     const tokenId = $(event.target).attr("token-id");
//     await this.contract.methods.endAuction(tokenId).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
//       M.toast({ html: "Transaction Mined! Refreshing UI..." });
//       await this.updateUI();
//     });
//   },
  withdraw: async function(event) {
    const tokenId = $(event.target).attr("token-id") - 1;
    await this.tokens[tokenId].auction.methods.withdraw().send({from: this.accounts[0]}).on("receipt", async (receipt) => {
      M.toast({ html: "Transaction Mined! Refreshing UI..." });
      await this.updateUI();
    });
  },
  
  main: async function() {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();
    this.contractAddress = contractAddress;

    this.pesonalityJson = await (await fetch("./PersonalityMarket.json")).json();
    this.auctionJson = await (await fetch("./PersonalityAuction.json")).json();

    this.contract = new window.web3.eth.Contract(
      this.pesonalityJson,
      this.contractAddress,
      { defaultAccount: this.accounts[0] }
    );
    console.log("Contract object", this.contract);

    this.isAdmin = this.accounts[0] == await this.contract.methods.owner().call();

    await this.updateUI();
  }
};

dApp.main();
