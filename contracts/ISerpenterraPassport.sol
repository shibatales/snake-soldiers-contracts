// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface ISerpenterraPassport {
    function balanceOf(address account) external view returns (uint256);

    function burnFromFactionGem(address owner, uint256 amount) external;
}
