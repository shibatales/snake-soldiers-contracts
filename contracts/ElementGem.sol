// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/access/OwnableLock.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/RMRKRoyalties.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/soulbound/RMRKSoulbound.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";

error GemAlreadyClaimed();
error CannotMintGemForNotOwnedToken();

contract ElementGem is
    OwnableLock,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKSoulbound,
    RMRKEquippable
{
    address private immutable _snakeSoldiers;
    mapping(uint256 => uint256) private _claimed;
    string private _tokenURI;
    uint256 private _totalSupply;
    uint256 private immutable _maxSupply;

    uint64 private constant _MAIN_RESOURCE_ID = uint64(1);
    uint64 private constant _EQUIP_RESOURCE_ID = uint64(2);

    string private constant _POST_URL_PER_TYPE_FIRE = "fire";
    string private constant _POST_URL_PER_TYPE_EARTH = "earth";
    string private constant _POST_URL_PER_TYPE_WATER = "water";
    string private constant _POST_URL_PER_TYPE_AIR = "air";

    constructor(
        string memory collectionMetadata_,
        string memory tokenURI_,
        address snakeSoldiers_,
        uint256 maxSupply_
    )
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(_msgSender(), 500) // 500 -> 5%
        RMRKEquippable("Snake Soldiers Element Gem", "SSEG")
    {
        _snakeSoldiers = snakeSoldiers_;
        _maxSupply = maxSupply_;
        _tokenURI = tokenURI_;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKSoulbound, IERC165, RMRKEquippable)
        returns (bool)
    {
        return
            RMRKSoulbound.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKCore, RMRKSoulbound) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function snakeSoldiers() external view returns (address) {
        return _snakeSoldiers;
    }

    function claimed(uint256 snakeTokenId) external view returns (bool) {
        return _claimed[snakeTokenId] == 1;
    }

    function claimMany(uint256[] calldata snakeTokenIds) external {
        uint256 length = snakeTokenIds.length;
        for (uint256 i; i < length; ) {
            _claim(snakeTokenIds[0]);
            unchecked {
                ++i;
            }
        }
    }

    function claim(uint256 snakeTokenId) external {
        _claim(snakeTokenId);
    }

    function _claim(uint256 snakeTokenId) private {
        // We use the same id for the gem just because relationship is 1 to 1
        if (_claimed[snakeTokenId] == 1) revert GemAlreadyClaimed();

        _claimed[snakeTokenId] = 1;
        _totalSupply += 1;

        address owner = IRMRKNesting(_snakeSoldiers).ownerOf(snakeTokenId);
        if (_msgSender() != owner) revert CannotMintGemForNotOwnedToken();
        _nestMint(_snakeSoldiers, snakeTokenId, snakeTokenId);
        _addResourceToToken(snakeTokenId, _EQUIP_RESOURCE_ID, uint64(0));
        _addResourceToToken(snakeTokenId, _MAIN_RESOURCE_ID, uint64(0));
        _acceptResource(snakeTokenId, 1, _MAIN_RESOURCE_ID);
        _acceptResource(snakeTokenId, 0, _EQUIP_RESOURCE_ID);
    }

    function addResourceEntry(
        uint64 id,
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) external onlyOwnerOrContributor {
        _addResourceEntry(
            id,
            equippableGroupId,
            baseAddress,
            metadataURI,
            fixedPartIds,
            slotPartIds
        );
    }

    function addResourceToTokens(
        uint256[] calldata tokenIds,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
        uint256 length = tokenIds.length;
        for (uint256 i; i < length; ) {
            _addResourceToToken(tokenIds[i], resourceId, overwrites);
            unchecked {
                ++i;
            }
        }
    }

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 slotPartId
    ) external onlyOwner {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            slotPartId
        );
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        override
        onlyOwner
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    function withdrawRaised(address to, uint256 amount) external onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed.");
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _tokenURI;
    }

    function getResourceMetadata(uint256 tokenId, uint64 resourceId)
        public
        view
        override(AbstractMultiResource, IRMRKMultiResource)
        returns (string memory)
    {
        string memory metaUri = super.getResourceMetadata(tokenId, resourceId);
        string memory postUri = _postUriFor(tokenId);
        return string(abi.encodePacked(metaUri, postUri));
    }

    // Elements are assigned round robing style, it's an easy way to make sure
    // that the number of snakes per element is as similar as possible.
    function _postUriFor(uint256 tokenId) private pure returns (string memory) {
        uint256 mod = tokenId % 4;
        if (mod == 0) return _POST_URL_PER_TYPE_FIRE;
        else if (mod == 1) return _POST_URL_PER_TYPE_EARTH;
        else if (mod == 2) return _POST_URL_PER_TYPE_WATER;
        else return _POST_URL_PER_TYPE_AIR;
    }
}
