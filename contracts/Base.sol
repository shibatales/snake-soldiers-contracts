// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/implementations/RMRKBaseStorageImpl.sol";

contract Base is RMRKBaseStorageImpl {
    constructor(
        string memory metadataURI,
        string memory type_
    ) RMRKBaseStorageImpl(metadataURI, type_) {}
}
