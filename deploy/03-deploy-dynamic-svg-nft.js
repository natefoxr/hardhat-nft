const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs")

module.exports = async function({getNamedAccounts, deployments}) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;

    if (chainId == 31337) {
        const EthUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }


    const lowSVG = fs.readFileSync("./images/svg/frown.svg", { encoding: "utf8" })
    const highSVG = fs.readFileSync("./images/svg/happy.svg", { encoding: "utf8" })

    log("--------------------------------------------------");
    
    const args = [ethUsdPriceFeedAddress, lowSVG, highSVG];
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying Contract...")
        await verify(dynamicSvgNft.address, args)
    }

    log("--------------------------------------------------");

}

module.exports.tags = ["all", "dynamicSvgNft", "main"];