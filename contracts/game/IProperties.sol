// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IProperties is IERC165 {
    function getUintTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key
    ) external view returns (uint256);

    function getMultipleUintTokenProperty(
        address collection,
        uint256 tokenId,
        string[] memory keys
    ) external view returns (uint256[] memory);

    function setUintTokenProperty(
        address collection,
        uint256 tokenId,
        string memory key,
        uint256 newValue
    ) external returns (uint256);

    function setMultipleUintTokenProperty(
        address collection,
        uint256 tokenId,
        string[] memory keys,
        uint256[] memory newValues
    ) external returns (uint256[] memory);
}
