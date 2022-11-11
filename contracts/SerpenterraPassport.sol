// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SerpenterraPassport is ERC20, ERC20Burnable, Ownable {
    address private _factionGem;

    constructor() ERC20("Serpenterra Passport", "STP") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burnFromFactionGem(address owner, uint256 amount) public {
        if (_msgSender() != _factionGem) revert("Not Faction Gem");

        _burn(owner, amount);
    }

    function updateFactionGem(address newFactionGem) external onlyOwner {
        _factionGem = newFactionGem;
    }
}
