const { ethers } = require("hardhat");

const networkConfig = {
    // 1: {
    //     name: "mainnet",
    //     vrfCoordinatorV2: "	0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
    //     gasLane: "0xff8dedfbfa60af186cf3c830acbc32c05aae823045ae5ea7da1e45fbfaba4f92",
    //     subscriptionId: "0",
    // },
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "4149",
        callbackGasLimit: "1000000",
        mintFee: ethers.utils.parseEther("0.02")
    },
    // 137: {
    //     name: "polygon",
    //     vrfCoordinatorV2: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
    //     gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd",
    //     subscriptionId: "0x0",
    // },
    31337: {
        name: "localhost",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "1000000",
        mintFee: ethers.utils.parseEther("0.02")
    },
    // 10: {
    //     name: "optimism",
    // },
    // 420: {
    //     name: "optimismGoerli",
    // },
};

const DECIMALS = "18";
const INITIAL_PRICE = "200000000000000000000";
const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
};
