//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract CallAnything {
    address public s_someAddress;
    uint public s_amount;

    function transfer(address someAddress, uint256 amount) public {
        s_someAddress = someAddress;
        s_amount = amount;
    }

    function getSelectorOne() public pure returns (bytes4 selector) {
        selector = bytes4(keccak256(bytes("transfer(address,uint256)")));
    }

    function getDataToCallTransfer(address someAddress, uint256 amount) public pure returns(bytes memory) {
        return abi.encodeWithSelector(getSelectorOne(), someAddress, amount);
    }

    function callTransferFunctionFromBinary(address someAddress, uint256 amount) public returns (bytes4, bool) {
        (bool success, bytes memory returnData) = address(this).call(
            getDataToCallTransfer(someAddress, amount)
        );
        return (bytes4(returnData), success);
    }

        function callTransferFunctionFromBinarySignature(address someAddress, uint256 amount) public returns (bytes4, bool) {
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSignature("transfer(address,uint256)", someAddress, amount)
        );
        return (bytes4(returnData), success);
    }
}

contract CallFunctionWithoutContract {
    address public s_selectorsAndSignatureAddress;

    constructor(address selectorsAndSignatureAddress) {
        s_selectorsAndSignatureAddress = selectorsAndSignatureAddress;
    }

    function callFunctionDirectly(address someAddress, uint256 amount) public returns(bytes4, bool) {
        (bool success, bytes memory returnData) = s_selectorsAndSignatureAddress.call(
            abi.encodeWithSignature("transfer(address,uint256)", someAddress, amount)
        );
        return (bytes4(returnData), success);
    }
}