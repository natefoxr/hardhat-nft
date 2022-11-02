// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract Encoding {
    function combineStrings() public pure returns(string memory) {
        return string(abi.encodePacked("Hi Emily! ", "I Love you!"));
    }

    function encodeNumber() public pure returns(bytes memory) {
        bytes memory number = abi.encode(1);
        return number;
    }

        function encodeString() public pure returns(bytes memory) {
        bytes memory someString = abi.encode("A String");
        return someString;
    }

    function encodePackedString() public pure returns(bytes memory) {
        bytes memory someString = abi.encodePacked("A String");
        return someString;
    }

    function encodeStringBytes() public pure returns(bytes memory) {
        bytes memory someString = bytes("A String");
        return someString;
    }

    function decodeString() public pure returns (string memory) {
        string memory someString = abi.decode(encodeString(), (string));
        return someString;
    }

    function multiEncode() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("A String", "Another aspect to the function");
        return someString;
    }

    function multiDecode() public pure returns (string memory, string memory) {
        (string memory someString, string memory anotherString) = abi.decode(multiEncode(), (string, string));
        return (someString, anotherString);
    }

    function multiEncodePacked() public pure returns (bytes memory) {
        bytes memory someBytes = abi.encodePacked("A String", "Another aspect to the function");
        return someBytes;
    }

    function multiStringCastPacked() public pure returns (string memory) {
        string memory someString = string(multiEncodePacked());
        return someString;
    }
}