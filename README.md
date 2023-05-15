# Snake Soldiers

Snake Soldiers is an NFT collection of 5000 units, divided into 3 categories: Generals, Commanders, and Soldiers, built on the Moonbeam network and fully EVM compatible, thanks to the RMRK technology. The collection illustrates military characters in the form of snakes. Generals will represent famous strategists and military men and women of history, such as Sun Tzu, Cleopatra, Simon Bolivar, etc. Each General holder will select his favorite character, which will be created on demand.

The main purpose is to build a player vs. player game (PvP), where NFT holders will fight to conquer lands and resources within a metaverse known as Serpenterra. The player's fun and entertainment will be prioritized, hand in hand with a sustainable economy and taking advantage of blockchain technology and the power of ownership provided by the NFTs.

# Smart contracts

In total, we have implemented 5 smart contracts, as follows:

#### 1. SnakeSoldiers:

This is the main contract. It implements the RMRK equipable interface and is the one that is destined to receive the gems. It has the logic implemented to mine NFTs of 3 different ranges with their respective prices. Mining is done in phases, a maximum of 20, comprising 250 units each. When mining, the resource is automatically assigned according to the rank. Each rank has its own maximum amount according to the current phase; everything is controlled at the contract level. The contract also implements the functionality of revealing the egg element. Deployed on Moonbeam at [0x3ab955216BdD76f51fbe02A3fe237D6612BBD09F](https://moonbeam.moonscan.io/address/0x3ab955216BdD76f51fbe02A3fe237D6612BBD09F#code)

#### 2. ElementGem:

This gem represents the element that the snake can control: air, water, fire, or earth. The NFT is soulbound, meaning that once it is nested in the snake, it cannot be "un-nested."

#### 3. FactionGem:

This gem represents the faction to which the snake belongs: forest, desert, islands, mountain, or valley. The NFT is semi-soulbound; it can only be un-soulbound (exchanged) if the snake's owner has an ERC20 token representing a Serpenterra passport. A passport unit is "burned" as payment when the transfer is made.

#### 4. SkillGem:

This gem represents the special ability that the snake has during battles: melee, healer, sniper, or tank. The NFT is free. It can be unnested and transferred without restrictions.

Note: All gem contracts implement the functionality of claiming the gem for each snake. It is allocated nuḿerically so that the number of gems of each faction is as similar as possible. That is, in case there are 100 snakes created, there will be approximately 25 gems of each type.

#### 5. Passport:

ERC20 token that represents the Serpenterra Passport. It is required to transfer faction gems and is burned during the process. It has the special functionality to allow burning from the faction gems contract.

We are online in the Moonbeam network, 500 units were already minted, and the next phases will be open according to the community response and market behavior. The next step in the roadmap is the Egg hatching and the Gems reveal.

## Technology:

- RMRK 2.0, EVM implementation: https://github.com/rmrk-team/evm
- Moonbeam network
- Hardhat for development: https://hardhat.org/
- Vue.js for the web page: https://vuejs.org/
- Vuetify as a design framework: https://next.vuetifyjs.com/en/
- Vue-dapp for connecting Vue.js with ethers: https://github.com/chnejohnson/vue-dapp

## Mini-Game

We are building a Player vs Player game (PvP), where NFT holders can send their snakes to fight between them. It could be an individual or team battle.

We have created a series of heuristics influencing these battles around the gameplay we designed for our project. The element, faction and skill gems, and the different terrains where the battles will take place will influence the outcome of the fights. Likewise, a bit of randomness and "luck" will allow us to obtain non predictable results in each battle. After the battles, the results are deterministic so that they can be reproduced.

These are the main characteristics to be taken into account:

- Strengths and Weaknesses by Element
- Strengths as a function of skill and element
- Strengths according to faction and battle territory
- Strengths according to battle territory and element
- Strengths according to the faction (single boost - Forest)
