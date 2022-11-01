const { ethers } = require("hardhat");

const networkConfig = {
    // 1: {
    //     name: "mainnet",
    //     vrfCoordinatorV2: "	0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
    //     raffleEntranceFee: ethers.parseEther("0.1"),
    //     gasLane: "0xff8dedfbfa60af186cf3c830acbc32c05aae823045ae5ea7da1e45fbfaba4f92",
    //     subscriptionId: "0",
    // },
    5: {
        name: "goerli",
    },
    // 137: {
    //     name: "polygon",
    //     vrfCoordinatorV2: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
    //     raffleEntranceFee: ethers.parseEther("0.05"),
    //     gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd",
    //     subscriptionId: "0x0",
    // },
    31337: {
        name: "localhost",
    },
    // 10: {
    //     name: "optimism",
    // },
    // 420: {
    //     name: "optimismGoerli",
    // },
};

const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
};
