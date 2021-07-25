!function(){window;const e=document.documentElement;if(e.classList.remove("no-js"),e.classList.add("js"),document.body.classList.contains("has-animations")){(window.sr=ScrollReveal()).reveal(".feature, .pricing-table-inner",{duration:600,distance:"20px",easing:"cubic-bezier(0.5, -0.01, 0, 1.005)",origin:"bottom",interval:100}),e.classList.add("anime-ready"),anime.timeline({targets:".hero-figure-box-05"}).add({duration:400,easing:"easeInOutExpo",scaleX:[.05,.05],scaleY:[0,1],perspective:"500px",delay:anime.random(0,400)}).add({duration:400,easing:"easeInOutExpo",scaleX:1}).add({duration:800,rotateY:"-15deg",rotateX:"8deg",rotateZ:"-1deg"}),anime.timeline({targets:".hero-figure-box-06, .hero-figure-box-07"}).add({duration:400,easing:"easeInOutExpo",scaleX:[.05,.05],scaleY:[0,1],perspective:"500px",delay:anime.random(0,400)}).add({duration:400,easing:"easeInOutExpo",scaleX:1}).add({duration:800,rotateZ:"20deg"}),anime({targets:".hero-figure-box-01, .hero-figure-box-02, .hero-figure-box-03, .hero-figure-box-04, .hero-figure-box-08, .hero-figure-box-09, .hero-figure-box-10",duration:anime.random(600,800),delay:anime.random(600,800),rotate:[anime.random(-360,360),function(e){return e.getAttribute("data-rotation")}],scale:[.7,1],opacity:[0,1],easing:"easeInOutExpo"})}}();

// Change this address to match your deployed contract!
const contract_address = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";

const dApp = {
  ethEnabled: function() {
    // If the browser has MetaMask installed
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  },
  setAdmin: async function() {
    // if account selected in MetaMask is the same as owner then admin will show
    if (this.isAdmin) {
      $(".dapp-admin").show();
    } else {
      $(".dapp-admin").hide();
    }
  },

  main: async function() {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();

    this.cryptoRightABI = await (await fetch("./Personality.json")).json();

    this.contract = new window.web3.eth.Contract(
      this.cryptoRightABI,
      contract_address,
      { defaultAccount: this.accounts[0] }
    );
    console.log("Contract object", this.contract);

    this.updateUI();

  }
};

dApp.main();

