// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./utils/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/RMRKRoyalties.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/soulbound/RMRKSoulbound.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";

error GemAlreadyClaimed();
error CannotMintGemForNotOwnedToken();

contract FactionGem is
    Ownable,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    address private immutable _snakeSoldiers;
    address private immutable _passportAddress;
    mapping(uint256 => uint256) private _claimed;
    string private _tokenURI;
    uint256 private _totalSupply;
    uint256 private immutable _maxSupply;

    uint64 private constant _MAIN_RESOURCE_ID = uint64(1);
    uint64 private constant _EQUIP_RESOURCE_ID = uint64(2);

    string private constant _POST_URL_PER_TYPE_ISLANDS = "islands";
    string private constant _POST_URL_PER_TYPE_DESERT = "desert";
    string private constant _POST_URL_PER_TYPE_VALLEY = "valley";
    string private constant _POST_URL_PER_TYPE_MOUNTAIN = "mountain";
    string private constant _POST_URL_PER_TYPE_FOREST = "forest";

    uint256 private constant _MAX_SUPPLY_PER_PHASE_COMMANDERS = 45; // A maximum possible of 45*4=180
    uint256 private constant _MAX_SUPPLY_PER_PHASE_GENERALS = 5; // A maximum possible of 5*4=20
    uint256 private constant _MAX_PHASES = 4;
    uint256 private constant _COMMANDERS_OFFSET =
        _MAX_SUPPLY_PER_PHASE_GENERALS * _MAX_PHASES; // Starts after generals.

    constructor(
        string memory collectionMetadata_,
        string memory tokenURI_,
        address snakeSoldiers_,
        uint256 maxSupply_,
        address passportAddress
    )
        // Custom optional: additional parameters
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(_msgSender(), 500) // 500 -> 5%
        RMRKEquippable("Snake Soldiers Faction Gem", "SSFG")
    {
        _snakeSoldiers = snakeSoldiers_;
        _maxSupply = maxSupply_;
        _tokenURI = tokenURI_;
        _passportAddress = passportAddress;
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
        _acceptResource(snakeTokenId, 1);
        _acceptResource(snakeTokenId, 0);
    }

    function addResourceEntry(
        ExtendedResource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) external onlyOwnerOrContributor {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
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

    function getResourceMetaForToken(uint256 tokenId, uint64 resourceIndex)
        public
        view
        override(AbstractMultiResource, IRMRKMultiResource)
        returns (string memory)
    {
        if (resourceIndex >= getActiveResources(tokenId).length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = getActiveResources(tokenId)[resourceIndex];
        string memory metaUri = getResourceMeta(resourceId);
        string memory postUri = _postUriFor(tokenId);
        metaUri = string(abi.encodePacked(metaUri, postUri));
        return metaUri;
    }

    // Factions are assigned round robing style, it's an easy way to make sure
    // that the number of snakes per element is as similar as possible.
    function _postUriFor(uint256 tokenId) private pure returns (string memory) {
        uint256 mod;

        if (tokenId > _COMMANDERS_OFFSET) {
            mod = tokenId % 5;
        } else {
            // For generals, we ensure the faction match the elements
            mod = tokenId % 4;
        }
        if (mod == 0) return _POST_URL_PER_TYPE_DESERT;
        else if (mod == 1) return _POST_URL_PER_TYPE_MOUNTAIN;
        else if (mod == 2) return _POST_URL_PER_TYPE_ISLANDS;
        else if (mod == 3) return _POST_URL_PER_TYPE_VALLEY;
        else return _POST_URL_PER_TYPE_FOREST;
    }

    function isSoulbound(uint256 tokenId) public view virtual returns (bool) {
        uint256 mod = tokenId % 5;
        if (mod == 4) return false;

        address owner = ownerOf(tokenId);
        uint256 balance = RMRKEquippable(_passportAddress).balanceOf(owner);
        // Idea: I want to get the balance of the snake that owns this token.
        // I can only get the balance of the snake contract
        // If owner has no passport, then it is soulbound.
        // Alternatively we could loo through snake's children
        return balance == 0;
    }
}
