// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/RMRKRoyalties.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";

error GemAlreadyClaimed();
error CannotMintGemForNotOwnedToken();
error ClaimingNotActive();

abstract contract BaseGem is
    Ownable,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    address private immutable _snakeSoldiers;
    mapping(uint256 => uint256) private _claimed;
    uint256 private _totalSupply;
    uint256 private _totalAssets;
    uint256 private _claimingActive;
    uint256 private immutable _maxSupply;

    uint64 private constant _MAIN_ASSET_ID = uint64(1);
    uint256 internal constant _SOLDIERS_OFFSET = 200;
    uint64 private constant _LOWEST_POSSIBLE_PRIORITY = (2 ^ 16) - 1;

    modifier onlyWithActiveClaim() {
        if (_claimingActive == 0) {
            revert ClaimingNotActive();
        }
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        string memory collectionMetadata_,
        address snakeSoldiers_,
        uint256 maxSupply_
    )
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(_msgSender(), 500) // 500 -> 5%
        RMRKEquippable(name_, symbol_)
    {
        _snakeSoldiers = snakeSoldiers_;
        _maxSupply = maxSupply_;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        _requireMinted(tokenId);
        // We assume this alway has at least 1 element, since we add it on mint and it can only be replaced, not removed
        uint64[] memory priorities = getActiveAssetPriorities(tokenId);
        uint256 len = priorities.length;
        uint64 maxPriority = _LOWEST_POSSIBLE_PRIORITY;
        uint64 maxPriorityIndex;
        for (uint64 i; i < len; ) {
            uint64 currentPrio = priorities[i];
            if (currentPrio < maxPriority) {
                maxPriority = currentPrio;
                maxPriorityIndex = i;
            }
            unchecked {
                ++i;
            }
        }
        uint64 maxPriorityAssetId = getActiveAssets(tokenId)[maxPriorityIndex];
        return getAssetMetadata(tokenId, maxPriorityAssetId);
    }

    function snakeSoldiers() external view returns (address) {
        return _snakeSoldiers;
    }

    function addAssetEntry(
        string memory metadataURI
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(uint64(_totalAssets), metadataURI);
        return _totalAssets;
    }

    function addEquippableAssetEntry(
        uint64 equippableGroupId,
        address catalogAddress,
        string memory metadataURI,
        uint64[] calldata partIds
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(
            uint64(_totalAssets),
            equippableGroupId,
            catalogAddress,
            metadataURI,
            partIds
        );
        return _totalAssets;
    }

    function addAssetToTokens(
        uint256[] calldata tokenIds,
        uint64 assetId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
        uint256 length = tokenIds.length;
        for (uint256 i; i < length; ) {
            _addAssetToToken(tokenIds[i], assetId, overwrites);
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

    function updateRoyaltyRecipient(
        address newRoyaltyRecipient
    ) external override onlyOwner {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    function withdrawRaised(address to, uint256 amount) external onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed.");
    }

    function claimed(uint256 snakeTokenId) external view returns (bool) {
        return _claimed[snakeTokenId] == 1;
    }

    function claimMany(
        uint256[] calldata snakeTokenIds
    ) external onlyWithActiveClaim {
        uint256 length = snakeTokenIds.length;
        for (uint256 i; i < length; ) {
            _claim(snakeTokenIds[i]);
            unchecked {
                ++i;
            }
        }
    }

    function claim(uint256 snakeTokenId) external onlyWithActiveClaim {
        _claim(snakeTokenId);
    }

    function _claim(uint256 snakeTokenId) private {
        // We use the same id for the gem just because relationship is 1 to 1
        if (_claimed[snakeTokenId] == 1) revert GemAlreadyClaimed();

        _claimed[snakeTokenId] = 1;
        _totalSupply += 1;

        address owner = IERC6059(_snakeSoldiers).ownerOf(snakeTokenId);
        if (_msgSender() != owner) revert CannotMintGemForNotOwnedToken();
        _nestMint(_snakeSoldiers, snakeTokenId, snakeTokenId, "");
        _addAssetToToken(snakeTokenId, _MAIN_ASSET_ID, uint64(0));
        _acceptAsset(snakeTokenId, 0, _MAIN_ASSET_ID);
    }

    function getAssetMetadata(
        uint256 tokenId,
        uint64 assetId
    )
        public
        view
        override(AbstractMultiAsset, IERC5773)
        returns (string memory)
    {
        string memory baseMetaUri = super.getAssetMetadata(tokenId, assetId);
        string memory postUri = _postUriFor(tokenId);
        return string.concat(baseMetaUri, postUri);
    }

    function _postUriFor(
        uint256 tokenId
    ) internal pure virtual returns (string memory) {}

    function isClaimActive() external view returns (bool) {
        return _claimingActive == 1;
    }

    function setClaimActive() external onlyOwner {
        _claimingActive = 1;
    }
}
