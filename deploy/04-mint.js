const { ethers, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");


module.exports = async function({getNamedAccounts}) {
    const { deployer } = await getNamedAccounts();

    // Basic
    const basicNft = await ethers.getContract("BasicNft", deployer);
    const basicMintTx = await basicNft.mintNft();
    await basicMintTx.wait(1);
    console.log(`Basic NFT index 1 has tokenURI: ${await basicNft.tokenURI(1)}`)

    // Random Ipfs
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 600000) // 10 minutes
        randomIpfsNft.once("NftMinted", async () => {
            resolve()
        })
        const randomIpfsMintTx = await randomIpfsNft.requestNFT({ value: mintFee.toString() });
        const randomIpfsMintTxReceipt = await randomIpfsMintTx.wait(1);
        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsMintTxReceipt.events[1].args.requestId.toString();
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address);
        }
    })
    console.log(`Random IPFS NFT index 1 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`)


    // Random Ipfs
    const highValue = ethers.utils.parseEther("4000");
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
    const dynamicSvgMintTx = await dynamicSvgNft.mintNft(highValue.toString());
    await dynamicSvgMintTx.wait(1);
    console.log(`Dynamic SVG NFT index 1 has tokenURI: ${await dynamicSvgNft.tokenURI(1)}`)
}

module.exports.tags = ["all", "mint"];