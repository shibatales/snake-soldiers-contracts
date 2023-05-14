// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./ISnake.sol";
import "./IProperties.sol";
import "./AggregatorV3Interface.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/OwnableLock.sol";

error CannotChallengeYourself();
error CannotBattleWithNotOwnedSnake();
error CannotHaveMultipleActiveChallenges();
error NotEnoughMorale();
error InvalidChallenge();
error InvalidElements();
error ExperienceAlreadyClaimed();

contract SnakeVsSnake is OwnableLock {
    uint256 public constant MIN_MORALE_TO_BATTLE = 5;
    uint256 public constant MORALE_RECOVERED_PER_HOUR = 2;

    uint256 public constant STAT_INDEX_HP = 0;
    uint256 public constant STAT_INDEX_MORALE = 1;
    uint256 public constant STAT_INDEX_ATK = 2;
    uint256 public constant STAT_INDEX_DEF = 3;
    uint256 public constant STAT_INDEX_LEVEL = 4;
    uint256 public constant STAT_INDEX_XP = 5;

    uint256 private _lastChallengeId;
    address private immutable _snakeSoldiers;
    address private immutable _properties;
    address private immutable _aggregator;

    mapping(uint256 => Challenge) private _challenges;
    mapping(uint256 => mapping(uint256 => uint256))
        private _snakeToSnakeToCurrentChallengeId;
    mapping(uint256 => uint256) private _snakeToActiveChallengeId;
    mapping(uint256 => uint256) private _snakeToLastMoraleUpdate;

    // struct to store the game state
    struct Challenge {
        uint256 challenger;
        uint256 challenged;
        uint256 initTime;
        uint256 endTime;
        uint256 winner;
        uint80 oracleIdRound;
        bool experienceClaimed;
    }

    enum Element {
        Fire,
        Earth,
        Water,
        Air
    }

    enum Faction {
        Desert,
        Mountain,
        Islands,
        Valley,
        Forest,
        None
    }

    enum Skill {
        Combat,
        Tank,
        Heal,
        Sniper,
        None
    }

    constructor(address snakeSoldiers, address properties, address aggregator) {
        _snakeSoldiers = snakeSoldiers;
        _properties = properties;
        _aggregator = aggregator;
    }

    function challenge(
        uint256 challenger,
        uint256 challenged
    ) public notLocked {
        address challengerOwner = ISnake(_snakeSoldiers).ownerOf(challenger);
        if (challengerOwner != msg.sender) {
            revert CannotBattleWithNotOwnedSnake();
        }

        if (challenged != 0) {
            // Open challenge, anyone can accept
            address challengedOwner = ISnake(_snakeSoldiers).ownerOf(
                challenged
            );
            if (challengedOwner == msg.sender) {
                revert CannotChallengeYourself();
            }
        }

        if (_snakeToActiveChallengeId[challenger] != 0) {
            revert CannotHaveMultipleActiveChallenges();
        }

        uint256 challengerMorale = IProperties(_properties)
            .getUintTokenProperty(_snakeSoldiers, challenger, "MOR");
        if (challengerMorale < MIN_MORALE_TO_BATTLE) {
            revert NotEnoughMorale();
        }

        (uint80 lastRoundId, , , , ) = AggregatorV3Interface(_aggregator)
            .latestRoundData();

        _lastChallengeId++;
        // store battle
        _challenges[_lastChallengeId] = Challenge({
            challenger: challenger,
            challenged: challenged,
            initTime: block.timestamp,
            oracleIdRound: lastRoundId + 1,
            endTime: 0,
            winner: 0,
            experienceClaimed: false
        });
        _snakeToActiveChallengeId[challenger] = _lastChallengeId;
    }

    function getCurrentMorale(uint256 snake) public view returns (uint256) {
        uint256 lastMoraleUpdate = _snakeToLastMoraleUpdate[snake];

        uint256 stamina = IProperties(_properties).getUintTokenProperty(
            _snakeSoldiers,
            snake,
            "MOR"
        );
        uint256 maxMorale = IProperties(_properties).getUintTokenProperty(
            _snakeSoldiers,
            snake,
            "MAX_MOR"
        );
        if (lastMoraleUpdate == 0) {
            return maxMorale;
        }
        uint256 staminaRecovered = ((block.timestamp - lastMoraleUpdate) /
            3600) * MORALE_RECOVERED_PER_HOUR;
        if (staminaRecovered + stamina > maxMorale) {
            return maxMorale;
        } else {
            return staminaRecovered + stamina;
        }
    }

    function _updateMorale(uint256 snake, uint256 newMorale) private {
        IProperties(_properties).setUintTokenProperty(
            _snakeSoldiers,
            snake,
            "MOR",
            newMorale
        );
    }

    function cancelChallenge(uint256 challenger) public {
        // check if challenger is owned by msg.sender
        // check if snake 1 has an active challenge
        // delete snake 1 active challenge
    }

    // accept challenge
    function acceptChallenge(uint256 challenger, uint256 challenged) public {
        // check challenged is owned by msg.sender
        address challengedOwner = ISnake(_snakeSoldiers).ownerOf(challenged);
        if (challengedOwner != msg.sender) {
            revert CannotBattleWithNotOwnedSnake();
        }
        if (_snakeToActiveChallengeId[challenged] == 1) {
            revert CannotHaveMultipleActiveChallenges();
        }
        uint256 activeChallengeId = _snakeToActiveChallengeId[challenger];
        _snakeToActiveChallengeId[challenged] = activeChallengeId;

        Challenge storage activeChallenge = _challenges[activeChallengeId];
        if (
            activeChallenge.challenger != challenger ||
            activeChallenge.challenger == 0 ||
            (activeChallenge.challenged != challenged &&
                activeChallenge.challenged != 0)
        ) {
            revert InvalidChallenge();
        }

        activeChallenge.initTime = block.timestamp;
        _snakeToSnakeToCurrentChallengeId[challenger][
            challenged
        ] = activeChallengeId;
    }

    function play(
        uint256 challenger,
        uint256 challenged
    )
        public
        view
        returns (
            uint256 challengeId,
            uint256 winner,
            uint256 staminaLost,
            uint256 challengerGainedXP,
            uint256 challengedGainedXP
        )
    {
        uint256 activeChallengeId = _snakeToSnakeToCurrentChallengeId[
            challenger
        ][challenged];
        if (activeChallengeId == 0) revert InvalidChallenge();

        Challenge memory activeChallenge = _challenges[activeChallengeId];
        uint256[] memory challengerStats;
        uint256[] memory challengedStats;
        (challengerStats, challengedStats) = _getStats(challenger, challenged);

        (
            challengerStats[STAT_INDEX_ATK],
            challengerStats[STAT_INDEX_DEF],
            challengedStats[STAT_INDEX_ATK],
            challengedStats[STAT_INDEX_DEF]
        ) = getAdjustedStatsForBothSnakes(
            challenger,
            challenged,
            activeChallenge,
            challengerStats,
            challengedStats
        );

        uint256 turns;

        (
            challengerStats[STAT_INDEX_HP],
            challengedStats[STAT_INDEX_HP],
            turns
        ) = playBattle(challengerStats, challengedStats);

        return
            _getResult(
                challenger,
                challenged,
                challengerStats,
                challengedStats,
                activeChallengeId,
                turns
            );
    }

    function getAdjustedStatsForBothSnakes(
        uint256 challenger,
        uint256 challenged,
        Challenge memory activeChallenge,
        uint256[] memory challengerStats,
        uint256[] memory challengedStats
    )
        public
        view
        returns (
            uint256 challengerAdjustedAtk,
            uint256 challengerAdjustedDef,
            uint256 challengedAdjustedAtk,
            uint256 challengedAdjustedDef
        )
    {
        // Initially, we'll use the seed just to define the territory
        uint256 seed = getSeedFromRound(activeChallenge.oracleIdRound);
        Faction territory = Faction(seed % 5);

        // TODO, this is called twice, getting the other values here breaks the limit of variables. Try to optimize
        (Element elementA, , ) = getSnakeGems(challenger);
        (Element elementB, , ) = getSnakeGems(challenged);

        (
            uint256 challengerElementAttackBoost,
            uint256 challengedElementAttackBost
        ) = getAttackBoostFromElement(elementA, elementB);

        (
            challengerAdjustedAtk,
            challengerAdjustedDef
        ) = getAdjustedStatsForSnake(
            challenger,
            challengerStats,
            challengerElementAttackBoost,
            territory
        );

        (
            challengedAdjustedAtk,
            challengedAdjustedDef
        ) = getAdjustedStatsForSnake(
            challenged,
            challengedStats,
            challengedElementAttackBost,
            territory
        );
    }

    function getAdjustedStatsForSnake(
        uint256 snakeId,
        uint256[] memory snakeStats,
        uint256 elementAttackBoost,
        Faction territory
    ) public view returns (uint256 adjustedAttack, uint256 adjustedDefense) {
        (Element element, Faction faction, Skill skill) = getSnakeGems(snakeId);

        uint256 attackBoostFromElementAndSkill = getAttackBoostFromElementAndSkill(
                element,
                skill
            );

        uint256 defenseBoostFromFactionAndTerritory = getDefenseBoostFromFactionAndTerritory(
                faction,
                territory
            );

        uint256 attackDefenseBoostFromElementAndTerritory = getAttackDefenseBoostFromElementAndTerritory(
                element,
                territory
            );

        uint256 forestAttackBoost = getForestAttackBoost(faction);

        adjustedAttack =
            (snakeStats[STAT_INDEX_ATK] *
                (elementAttackBoost +
                    attackBoostFromElementAndSkill +
                    attackDefenseBoostFromElementAndTerritory +
                    forestAttackBoost -
                    30000)) /
            10000;
        adjustedDefense =
            (snakeStats[STAT_INDEX_DEF] *
                (defenseBoostFromFactionAndTerritory +
                    attackDefenseBoostFromElementAndTerritory -
                    10000)) /
            10000;
    }

    function getSnakeGems(
        uint256 snakeId
    ) public view returns (Element, Faction, Skill) {
        // TODO:
        // Get snake children, go through them and match according to known address of each gem
        // Faction and skill may not be present, element has to.
    }

    function playBattle(
        uint256[] memory challengerStats,
        uint256[] memory challengedStats
    )
        public
        pure
        returns (uint256 challengerHP, uint256 challengedHP, uint256 turns)
    {
        uint256 damage;
        for (; turns < MIN_MORALE_TO_BATTLE; ) {
            unchecked {
                ++turns;
            }

            damage =
                (challengerStats[STAT_INDEX_ATK] * 10) /
                challengedStats[STAT_INDEX_DEF];
            if (damage >= challengedHP) {
                challengedStats[STAT_INDEX_HP] = 0;
                break;
            } else {
                challengedStats[STAT_INDEX_HP] -= damage;
            }
            damage =
                (challengedStats[STAT_INDEX_ATK] * 10) /
                challengerStats[STAT_INDEX_DEF];
            if (damage >= challengerHP) {
                challengerStats[STAT_INDEX_HP] = 0;
                break;
            } else {
                challengerStats[STAT_INDEX_HP] -= damage;
            }
        }
    }

    function claimXP(uint256 challenger, uint256 challenged) public {
        (
            uint256 challengeId,
            ,
            uint256 staminaLost,
            uint256 challengerGainedXP,
            uint256 challengedGainedXP
        ) = play(challenger, challenged);

        Challenge storage activeChallenge = _challenges[challengeId];
        if (activeChallenge.experienceClaimed) {
            revert ExperienceAlreadyClaimed();
        }

        activeChallenge.experienceClaimed = true;
        _snakeToActiveChallengeId[challenger] = 0;
        _snakeToActiveChallengeId[challenged] = 0;
        _snakeToSnakeToCurrentChallengeId[challenger][challenged] = 0;

        string[] memory keys = new string[](2);
        keys[0] = "XP";
        keys[1] = "MOR";

        uint256[] memory challengerStats = IProperties(_properties)
            .getMultipleUintTokenProperty(_snakeSoldiers, challenger, keys);
        uint256[] memory challengedStats = IProperties(_properties)
            .getMultipleUintTokenProperty(_snakeSoldiers, challenged, keys);

        uint256[] memory values = new uint256[](2);
        values[0] = challengerStats[0] + challengerGainedXP;
        values[1] = challengerStats[1] - staminaLost; // TODO: Make sure on play that this doesn't get to 0
        IProperties(_properties).setMultipleUintTokenProperty(
            _snakeSoldiers,
            challenger,
            keys,
            values
        );

        values[0] = challengedStats[0] + challengedGainedXP;
        values[1] = challengedStats[1] - staminaLost; // TODO: Make sure on play that this doesn't get to 0
        IProperties(_properties).setMultipleUintTokenProperty(
            _snakeSoldiers,
            challenged,
            keys,
            values
        );
    }

    function getSeedFromRound(uint80 roundId) public view returns (uint256) {
        (, int256 answer, , , ) = AggregatorV3Interface(_aggregator)
            .getRoundData(roundId);
        uint8 decimals = AggregatorV3Interface(_aggregator).decimals();

        return uint256(uint256(answer) / (10 ** (decimals - 2))); // Remove decimals and get last 2 digits
    }

    function getDefenseBoostFromFactionAndTerritory(
        Faction faction,
        Faction territory
    ) public pure returns (uint256) {
        if (faction == territory) return 11000;
        else return 10000;
    }

    function getAttackDefenseBoostFromElementAndTerritory(
        Element element,
        Faction territory
    ) public pure returns (uint256) {
        if (uint256(element) == uint256(territory)) return 10500;
        else return 10000;
    }

    function getForestAttackBoost(
        Faction faction
    ) public pure returns (uint256) {
        if (faction == Faction.Forest) {
            return 11000;
        } else {
            return 10000;
        }
    }

    function getAttackBoostFromElementAndSkill(
        Element element,
        Skill skill
    ) public pure returns (uint256) {
        if (uint256(element) == uint256(skill)) {
            return 11000;
        } else {
            return 10000;
        }
    }

    function getAttackBoostFromElement(
        Element elementA,
        Element elementB
    ) public pure returns (uint256, uint256) {
        if (elementA == elementB) {
            // Same element
            return (8000, 8000); // -20%, -20%
        } else if (elementA == Element.Fire && elementB == Element.Air) {
            // Fire, Air
            return (13000, 9000); // +30%, -10%
        } else if (elementA == Element.Fire && elementB == Element.Earth) {
            // Fire, Earth
            return (9500, 11000); // -5%, +10%
        } else if (elementA == Element.Fire && elementB == Element.Water) {
            // Fire, Water
            return (10000, 12500); // 0%, +25%
        } else if (elementA == Element.Air && elementB == Element.Fire) {
            // Air, Fire
            return (9000, 13000); // -10%, +30%
        } else if (elementA == Element.Air && elementB == Element.Earth) {
            // Air, Earth
            return (12500, 8000); // +25%, -20%
        } else if (elementA == Element.Air && elementB == Element.Water) {
            // Air, Water
            return (10000, 10500); // 0%, +5%
        } else if (elementA == Element.Earth && elementB == Element.Fire) {
            // Earth, Fire
            return (11000, 9500); // +10%, -5%
        } else if (elementA == Element.Earth && elementB == Element.Air) {
            // Earth, Air
            return (8000, 12500); // -20%, +25%
        } else if (elementA == Element.Earth && elementB == Element.Water) {
            // Earth, Water
            return (12000, 9000); // +20%, -10%
        } else if (elementA == Element.Water && elementB == Element.Fire) {
            // Water, Fire
            return (12500, 10000); // +25%, 0%
        } else if (elementA == Element.Water && elementB == Element.Air) {
            // Water, Air
            return (10500, 10000); // +5%, 0%
        } else if (elementA == Element.Water && elementB == Element.Earth) {
            // Water, Earth
            return (9000, 12000); // -10%, +20%
        } else {
            revert InvalidElements();
        }
    }

    function _getStats(
        uint256 challenger,
        uint256 challenged
    ) private view returns (uint256[] memory, uint256[] memory) {
        string[] memory keys = new string[](6);
        keys[STAT_INDEX_HP] = "HP";
        keys[STAT_INDEX_MORALE] = "MOR";
        keys[STAT_INDEX_ATK] = "ATK";
        keys[STAT_INDEX_DEF] = "DEF";
        keys[STAT_INDEX_LEVEL] = "LEVEL";
        keys[STAT_INDEX_XP] = "XP";
        uint256[] memory challengerStats = IProperties(_properties)
            .getMultipleUintTokenProperty(_snakeSoldiers, challenger, keys);
        uint256[] memory challengedStats = IProperties(_properties)
            .getMultipleUintTokenProperty(_snakeSoldiers, challenged, keys);
        return (challengerStats, challengedStats);
    }

    function _getResult(
        uint256 challenger,
        uint256 challenged,
        uint256[] memory challengerStats,
        uint256[] memory challengedStats,
        uint256 activeChallengeId,
        uint256 staminaLost
    )
        private
        pure
        returns (
            uint256 challengeId,
            uint256 winner,
            uint256 staminaLost_,
            uint256 challengerGainedXP,
            uint256 challengedGainedXP
        )
    {
        if (challengerStats[STAT_INDEX_HP] >= challengedStats[STAT_INDEX_HP]) {
            return (
                activeChallengeId,
                challenger,
                staminaLost,
                challengedStats[STAT_INDEX_LEVEL] * 2,
                challengerStats[STAT_INDEX_LEVEL]
            );
        } else {
            return (
                activeChallengeId,
                challenged,
                staminaLost,
                challengedStats[STAT_INDEX_LEVEL],
                challengerStats[STAT_INDEX_LEVEL] * 3
            );
        }
    }

    // distribute XP
}
