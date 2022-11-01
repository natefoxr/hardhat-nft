const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")


const FUND_AMOUNT = "1000000000000000000000"
const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        }
    ],
}

module.exports = async function({getNamedAccounts, deployments}) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // get IPFS hashes of our images
    let tokenUris;
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

    if (chainId == 31337) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReciept = await tx.wait(1);
        subscriptionId = txReciept.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    log("--------------------------------------------------");
    const arguments = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["callbackGasLimit"],
        networkConfig[chainId]["mintFee"],
        tokenUris
    ];
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying Contract...")
        await verify(randomIpfsNft.address, arguments)
    }

    if (chainId == 31337) {
        vrfCoordinatorV2Mock.addConsumer(
            subscriptionId.toNumber(),
            randomIpfsNft.address
        )
    }

    log("--------------------------------------------------");

}

async function handleTokenUris () {
    tokenUris = [];
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (index in imageUploadResponses) {
        let tokenUriMetadata = {...metadataTemplate};
        tokenUriMetadata.name = files[index].replace(".jpeg", "");
        tokenUriMetadata.description = `One of the best animals in the world :).`;
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[index].IpfsHash}`;
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    }
    console.log("Token URIs uploaded! They are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomIpfsNft", "main"];
