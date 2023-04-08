// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RecruitTelegram is ERC20, Ownable {
    uint256 private _maxSupply = 1000;

    event Transcribe(address indexed owner, uint256 value);

    constructor() ERC20("Snake Soldiers Recruit Telegram", "RCRT") {}

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    modifier limitSupplyIncrease(uint256 amount) {
        require(totalSupply() + amount <= maxSupply(), "Max supply exceeded");
        _;
    }

    function recruit(
        address soldier
    ) external onlyOwner limitSupplyIncrease(1) {
        _mint(soldier, 1);
    }
}
