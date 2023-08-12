# Game Contracts

### General Approach

Snake owners can challenge others, once the other accept the battle will start behind the scenes. We are using Chainlink to get the Bitcoin price from a time after the challenge was accepted. With this price, we randomly pick the territory where the battle will happen. Since the territory has great effect on the result of the battle, we make it unpredictable on the time of challening and accepting, but deterministic a few blocks later. In the future, we will use this strategy to add more "randomness" to the battles.

Morale decreases after each battle, which inspires demand, contraty to unlimited game play.

Once the next round of the oracle is available, the battle can be simulated to discover the winner. This can be called as a view or as a method altering the storage in order to finish the challenge, update the morale and distribute experience. Later, this experience will be used to level up, increasing the stats of the snake.

### Boosts, strenghts and weaknesses.

There are 5 mechanics in play which will affect the attack and defense of the contenders:

- `getDefenseBoostFromFactionAndTerritory`
- `getAttackDefenseBoostFromElementAndTerritory`
- `getForestAttackBoost`
- `getAttackBoostFromElementAndSkill`
- `getAttackBoostFromElement`

### Stats

Stats are stored in a separate contract, and are only updatable by the game contract: an initial one, when finishing battles, when generals and commanders call to increase morale, or when leveling up. For this we will use an EIP currently in development, which will propose a Single Properties Repository per chain, at a predictable address. Part of this interface is included at `IProperties.sol`
