// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

interface ISnake {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}
