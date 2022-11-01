const { assert, expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig, } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft Unit Tests", function () {
        let randomIpfsNft, randomIpfsNftContract, user, deployer;
        const chainId = network.config.chainId;

        beforeEach(async () => {
            accounts = await ethers.getSigners();
            deployer = accounts[0];
            user = accounts[1];
            await deployments.fixture("main");
            randomIpfsNftContract = await ethers.getContract("RandomIpfsNft");
            randomIpfsNft = randomIpfsNftContract.connect(user);
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        });
        describe("Constructor", function () {
            it("sets initialization of the contract correctly", async () => {
                const initialized = await randomIpfsNft.getInitialized();
                assert.equal(initialized.toString(), "true");
            });
            it("sets the callbackGasLimit correctly", async () => {
                const callbackGasLimit = await randomIpfsNft.getCallbackGasLimit();
                assert.equal(callbackGasLimit.toString(), networkConfig[chainId].callbackGasLimit);
            });
            it("sets the mintFee correctly", async () => {
                const mintFee = await randomIpfsNft.getMintFee();
                assert.equal(mintFee.toString(), networkConfig[chainId].mintFee);
            });
            it("sets the tokenUris", async () => {
                const tokenUriZero = await randomIpfsNft.getAnimalTokenURI(0);
                assert(tokenUriZero.includes("ipfs://"));
            });
        })
        describe("RequestNft", function() {
            it("reverts if the value is less than the mint fee", async () => {
                await expect(randomIpfsNft.requestNFT()).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
            });
            it("emits an event with the requestId and sender", async () => {
                const mintFee = await randomIpfsNft.getMintFee();
                await expect(randomIpfsNft.requestNFT({ value: mintFee.toString() })).to.emit(
                    randomIpfsNft, 
                    "NftRequested"
                )
            })
        })
        describe("fulfillRandomWords", function () {
            it("mints a NFT after random words is returned", async function () {
                await new Promise(async (resolve, reject) => {
                    randomIpfsNft.once("NftMinted", async () => {
                        console.log("\n---------------------\n")
                        console.log("Mint Event Triggered!")
                        console.log("\n---------------------\n")
                        try {
                            const tokenUri = await randomIpfsNft.tokenURI("0");
                            const tokenCounter = await randomIpfsNft.getTokenCounter();
                            assert.equal(tokenUri.toString().includes("ipfs://"), true);
                            assert.equal(tokenCounter.toString(), "1");
                            resolve()
                        } catch (e) {
                            console.log(e);
                            reject(e);
                        }
                    })
                    try {
                        const mintFee = await randomIpfsNft.getMintFee()
                        const requestNftRes = await randomIpfsNft.requestNFT({ value: mintFee.toString() });
                        const requestNftRec = await requestNftRes.wait(1);
                        await vrfCoordinatorV2Mock.fulfillRandomWords(
                            requestNftRec.events[1].args.requestId,
                            randomIpfsNft.address
                        )
                    } catch (e) {
                        console.log(e);
                        reject(e)
                    }
                })
            })
        })
        describe("withdraw", function () {
            it("reverts if withdrawn by the address that isn't the owner", async () => {
                await expect(randomIpfsNft.withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
            })
            it("reverts if the transaction fails", async () => {
            it("allows the owner to withdraw funds from the contract", async () => {
                const mintFee = await randomIpfsNft.getMintFee()
                const provider = ethers.getDefaultProvider();
                const startingOwnerBalance = await provider.getBalance(randomIpfsNftContract.address);
                await randomIpfsNft.requestNFT({ value: mintFee.toString() })
                let randomIpfsNftOwner = randomIpfsNftContract.connect(deployer);
                await randomIpfsNftOwner.withdraw();
                const endingOwnerBalance = await provider.getBalance(randomIpfsNftContract.address);
                assert.equal(endingOwnerBalance.toString(), startingOwnerBalance.toString());
            })
        })
        describe("getBreedFromModdedRng", function () {
            it("should return catnipcheeky if moddedRng < 10", async () => {
                const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7);
                assert.equal(0, expectedValue);
            })
            it("should return maxie if moddedRng is between 10-39", async () => {
                const expectedValue = await randomIpfsNft.getBreedFromModdedRng(21);
                assert.equal(1, expectedValue);
            })
            it("should return cheeky if moddedRng is between 40-99", async () => {
                const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77);
                assert.equal(2, expectedValue);
            })
            it("should revert if moddedRng > 99", async ( ) => {
                await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds")
            })
        })
    })
});