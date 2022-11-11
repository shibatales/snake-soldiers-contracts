// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./utils/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/RMRKRoyalties.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
// Imported so it's included on typechain. We'll need it to display NFTs NFTs
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKMultiResourceRenderUtils.sol";

error MaxGiftsPerPhaseReached();
error MaxPhaseReached();
error MintOverMax();
error MintUnderpriced();
error MintZero();
error NextPhasePriceMustBeEqualOrHigher();
error SaleNotOpen();
error ElementAlreadyRevealed();

contract SnakeSoldier is
    Ownable,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    using Strings for uint256;

    enum Rank {
        Soldier,
        Commander,
        General
    }

    event Minted(
        Rank rank,
        address indexed buyer,
        uint256 indexed from,
        uint256 indexed to
    );

    mapping(Rank => uint256) private _totalSupply;
    uint256 private _phase;
    bool private _phasesLocked;
    uint256 private _totalGifts;
    uint256 private immutable _maxGiftsPerPhase;

    uint256 private _pricePerSoldier;
    uint256 private _pricePerCommander;
    uint256 private _pricePerGeneral;

    string private _defaultTokenUri;
    mapping(uint64 => uint256) private _isTokenResourceEnumerated;

    uint256 private constant _MAX_SUPPLY_PER_PHASE_SOLDIERS = 1200; // A maximum possible of 1200*4=4800
    uint256 private constant _MAX_SUPPLY_PER_PHASE_COMMANDERS = 45; // A maximum possible of 45*4=180
    uint256 private constant _MAX_SUPPLY_PER_PHASE_GENERALS = 5; // A maximum possible of 5*4=20
    uint256 private constant _MAX_PHASES = 4;

    mapping(uint256 => uint256) private _elementRevealed;
    uint64 private constant _RES_ID_SOLDIER_EGG = 1;
    uint64 private constant _RES_ID_COMMANDER_EGG = 2;
    uint64 private constant _RES_ID_GENERAL_EGG = 3;
    uint64 private constant _RES_ID_SOLDIER_EGG_FIRE = 4;
    // uint64 private constant _RES_ID_SOLDIER_EGG_EARTH = 5;
    // uint64 private constant _RES_ID_SOLDIER_EGG_WATER = 6;
    // uint64 private constant _RES_ID_SOLDIER_EGG_AIR = 7;
    uint64 private constant _RES_ID_COMMANDER_EGG_FIRE = 8;
    // uint64 private constant _RES_ID_COMMANDER_EGG_EARTH = 9;
    // uint64 private constant _RES_ID_COMMANDER_EGG_WATER = 10;
    // uint64 private constant _RES_ID_COMMANDER_EGG_AIR = 11;
    uint64 private constant _RES_ID_GENERAL_EGG_FIRE = 12;
    // uint64 private constant _RES_ID_GENERAL_EGG_EARTH = 13;
    // uint64 private constant _RES_ID_GENERAL_EGG_WATER = 14;
    // uint64 private constant _RES_ID_GENERAL_EGG_AIR = 15;
    // uint64 private constant _RES_ID_SNAKE = 16;

    uint256 private constant _GENERALS_OFFSET = 0; // No offset.
    uint256 private constant _COMMANDERS_OFFSET =
        _MAX_SUPPLY_PER_PHASE_GENERALS * _MAX_PHASES; // Starts after generals.
    uint256 private constant _SOLDIERS_OFFSET =
        (_MAX_SUPPLY_PER_PHASE_COMMANDERS + _MAX_SUPPLY_PER_PHASE_GENERALS) *
            _MAX_PHASES; // After generals and Commanders.

    constructor(
        string memory collectionMetadata_,
        string memory defaultTokenUri,
        uint256 maxGiftsPerPhase_
    )
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(_msgSender(), 500) // 500 -> 5%
        RMRKEquippable("Snake Soldiers", "SS")
    {
        // _phase = 0;  // Value is already 0
        _defaultTokenUri = defaultTokenUri;
        _maxGiftsPerPhase = maxGiftsPerPhase_;
    }

    function mint(
        address to,
        uint256 numToMint,
        Rank rank
    ) external payable {
        _mintChecks(numToMint, rank);

        uint256 mintPriceRequired = numToMint * pricePerMint(rank);
        if (mintPriceRequired != msg.value) revert MintUnderpriced();

        _innerMint(to, numToMint, rank);
    }

    function giftMint(address to, Rank rank) external onlyOwner {
        _mintChecks(1, rank);

        if (_totalGifts == _maxGiftsPerPhase * _phase)
            revert MaxGiftsPerPhaseReached();
        _totalGifts += 1;

        _innerMint(to, 1, rank);
    }

    function _mintChecks(uint256 numToMint, Rank rank) private view {
        if (_phase == 0) revert SaleNotOpen();
        if (numToMint == uint256(0)) revert MintZero();
        if (numToMint + totalSupply(rank) > maxSupply(rank))
            revert MintOverMax();
    }

    function _innerMint(
        address to,
        uint256 numToMint,
        Rank rank
    ) private {
        uint256 nextToken = _totalSupply[rank] + 1 + _rankOffset(rank);
        unchecked {
            _totalSupply[rank] += numToMint;
        }
        uint256 totalSupplyOffset = nextToken + numToMint;
        uint64 resourceId;

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i);
            if (i > _SOLDIERS_OFFSET) {
                resourceId = _RES_ID_SOLDIER_EGG;
            } else if (i > _COMMANDERS_OFFSET) {
                resourceId = _RES_ID_COMMANDER_EGG;
            } else {
                resourceId = _RES_ID_GENERAL_EGG;
            }
            _addResourceToToken(i, resourceId, 0);
            _acceptResource(i, 0, resourceId);
            unchecked {
                ++i;
            }
        }

        emit Minted(rank, to, nextToken, totalSupplyOffset - 1);
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

    function totalSupply(Rank rank) public view returns (uint256) {
        return _totalSupply[rank];
    }

    function totalSupply() public view returns (uint256) {
        return
            _totalSupply[Rank.Soldier] +
            _totalSupply[Rank.Commander] +
            _totalSupply[Rank.General];
    }

    function maxSupply(Rank rank) public view returns (uint256) {
        if (rank == Rank.Soldier)
            return _MAX_SUPPLY_PER_PHASE_SOLDIERS * _phase;
        else if (rank == Rank.Commander)
            return _MAX_SUPPLY_PER_PHASE_COMMANDERS * _phase;
        else return _MAX_SUPPLY_PER_PHASE_GENERALS * _phase;
    }

    function maxSupply() public view returns (uint256) {
        return
            (_MAX_SUPPLY_PER_PHASE_SOLDIERS +
                _MAX_SUPPLY_PER_PHASE_COMMANDERS +
                _MAX_SUPPLY_PER_PHASE_GENERALS) * _phase;
    }

    function maxGifts() public view returns (uint256) {
        return _maxGiftsPerPhase * _phase;
    }

    function totalGifts() public view returns (uint256) {
        return _totalGifts;
    }

    function pricePerMint(Rank rank) public view returns (uint256) {
        if (rank == Rank.Soldier) return _pricePerSoldier;
        else if (rank == Rank.Commander) return _pricePerCommander;
        else return _pricePerGeneral;
    }

    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        override
        onlyOwner
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    function enableNextPhase(
        uint256 pricePerSoldier,
        uint256 pricePerCommander,
        uint256 pricePerGeneral
    ) external onlyOwner {
        if (_phase == _MAX_PHASES || _phasesLocked) revert MaxPhaseReached();

        if (
            _pricePerSoldier > pricePerSoldier ||
            _pricePerCommander > pricePerCommander ||
            _pricePerGeneral > pricePerGeneral
        ) revert NextPhasePriceMustBeEqualOrHigher();

        _phase += 1;
        _pricePerSoldier = pricePerSoldier;
        _pricePerCommander = pricePerCommander;
        _pricePerGeneral = pricePerGeneral;
    }

    function lockPhases() external onlyOwner {
        _phasesLocked = true;
    }

    function withdrawRaised(address to, uint256 amount) external onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed.");
    }

    function _rankOffset(Rank rank) private pure returns (uint256) {
        if (rank == Rank.Soldier) return _SOLDIERS_OFFSET;
        else if (rank == Rank.Commander) return _COMMANDERS_OFFSET;
        else return _GENERALS_OFFSET;
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _defaultTokenUri;
    }

    function getResourceMetadata(uint256 tokenId, uint64 resourceId)
        public
        view
        override(AbstractMultiResource, IRMRKMultiResource)
        returns (string memory)
    {
        string memory metaUri = super.getResourceMetadata(tokenId, resourceId);
        if (_isTokenResourceEnumerated[resourceId] != 0)
            metaUri = string(abi.encodePacked(metaUri, tokenId.toString()));
        return metaUri;
    }

    function setResourceEnumerated(uint64 resourceId, bool enumerated)
        external
        onlyOwner
    {
        if (enumerated) _isTokenResourceEnumerated[resourceId] = 1;
        else delete _isTokenResourceEnumerated[resourceId];
    }

    // This is not ideal but we add it since we had no time for an indexer.
    function getTokensAndOwners(uint256 initId, uint256 size)
        external
        view
        returns (uint256[] memory, address[] memory)
    {
        uint256 lastId = initId + size - 1;
        uint256 totalSupply_ = totalSupply();
        if (lastId > totalSupply_) {
            lastId = totalSupply_;
            size = lastId - initId + 1;
        }
        address[] memory owners = new address[](size);
        uint256[] memory ids = new uint256[](size);

        for (uint256 i; i < size; ) {
            owners[i] = ownerOf(i + initId);
            ids[i] = i + initId;
            unchecked {
                ++i;
            }
        }

        return (ids, owners);
    }

    function revealElement(uint256 tokenId)
        external
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        if (_elementRevealed[tokenId] == 1) revert ElementAlreadyRevealed();
        _elementRevealed[tokenId] = 1;
        uint64 newResourceId;
        uint64 oldResourceId;

        // The "+ tokenId % 4" part, sets the resource for the right element
        if (tokenId > _SOLDIERS_OFFSET) {
            oldResourceId = _RES_ID_SOLDIER_EGG;
            newResourceId = _RES_ID_SOLDIER_EGG_FIRE + uint64(tokenId % 4);
        } else if (tokenId > _COMMANDERS_OFFSET) {
            oldResourceId = _RES_ID_COMMANDER_EGG;
            newResourceId = _RES_ID_COMMANDER_EGG_FIRE + uint64(tokenId % 4);
        } else {
            oldResourceId = _RES_ID_GENERAL_EGG;
            newResourceId = _RES_ID_GENERAL_EGG_FIRE + uint64(tokenId % 4);
        }
        _addResourceToToken(tokenId, newResourceId, oldResourceId);
        _acceptResource(tokenId, 0, newResourceId);
    }
}
