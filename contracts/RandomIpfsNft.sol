// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();
error RandomIpfsNft__AlreadyInitialized();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // when we mint a NFT, we will trigger a chainlink VRF call ato get us a random number
    // using that number, we will get a random NFT
    // Catnip Cheeky (Super Rare) Cheekster (Rare) Cheeky (Common)

    // users have to pay to mint an NFT
    // the owner of the contract can withdraw the ETH

    // Type Declaration
    enum Breed {
        CATNIP_CHEEKY,
        MAXIE,
        CHEEKY
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_animalTokenUris;
    uint256 internal immutable i_mintFee;
    bool private s_initialized;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed animal, address minter);

    constructor (
        address vrfCoordinatorV2, 
        uint64 subscriptionId, 
        bytes32 gasLane, 
        uint32 callbackGasLimit, 
        uint256 mintFee,
        string[3] memory animalTokenUris
    ) VRFConsumerBaseV2(
        vrfCoordinatorV2
    ) ERC721(
        "The Pets", "PETS"
    ) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        i_mintFee = mintFee;
        _initializeContract(animalTokenUris);
    }

    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address tokenOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Breed animal = getBreedFromModdedRng(moddedRng);
        _safeMint(tokenOwner, newTokenId);
        _setTokenURI(newTokenId, s_animalTokenUris[uint256(animal)]);
        emit NftMinted(animal, tokenOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success) { 
            revert RandomIpfsNft__TransferFailed();
            }
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for(uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns(uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function _initializeContract(string[3] memory animalTokenUris) private {
        if (s_initialized) {
            revert RandomIpfsNft__AlreadyInitialized();
        }
        s_animalTokenUris = animalTokenUris;
        s_initialized = true;
    }

    function getMintFee() public view returns(uint256) {
        return i_mintFee;
    }

    function getAnimalTokenURI(uint256 index) public view returns(string memory) {
        return s_animalTokenUris[index];
    }

    function getTokenCounter() public view returns(uint256) {
        return s_tokenCounter;
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }

    function getCallbackGasLimit() public view returns (uint256) {
        return i_callbackGasLimit;
    }
}