import { ethers, network } from 'hardhat';
import { BigNumber } from 'ethers';

let IS_PROD = false;
if (network.name === 'moonbeam') {
  IS_PROD = true;
  console.log('Running on moonbeam network (PROD)');
}

function bn(num: number): BigNumber {
  return BigNumber.from(num);
}

const BASE_URI = 'ipfs://Qmd4oLxGZdRwrdkK5TLqSQg75RauGbn3XNdErUJCdpgUXw'; // TODO, replace with actual IPFS base
const ELEMENT_GEM_METADATA = `${BASE_URI}/gems/elements/collectionMeta`;
const SKILL_GEM_METADATA = `${BASE_URI}/gems/skills/collectionMeta`;
const FACTION_GEM_METADATA = `${BASE_URI}/gems/factions/collectionMeta`;
const SNAKE_METADATA_URI = `${BASE_URI}/soldiers/collectionMeta`;
const CATALOG_METADATA_URI = ``;
const CATALOG_TYPE = 'img/png';
const MAX_GIFTS_PER_PHASE = bn(20);
const MAX_SUPPLY_FOR_GEMS = bn(5000);

const SOLDIER_RANK = 0;
const COMMANDER_RANK = 1;
const GENERAL_RANK = 2;

let SOLDIER_PRICE = ethers.utils.parseEther('20.0');
let COMMANDER_PRICE = ethers.utils.parseEther('200.0');
let GENERAL_PRICE = ethers.utils.parseEther('1600.0');

if (!IS_PROD) {
  SOLDIER_PRICE = SOLDIER_PRICE.div(2000);
  COMMANDER_PRICE = COMMANDER_PRICE.div(2000);
  GENERAL_PRICE = GENERAL_PRICE.div(2000);
}

const ASSET_ID_SOLDIER_EGG = bn(1);
const ASSET_ID_COMMANDER_EGG = bn(2);
const ASSET_ID_GENERAL_EGG = bn(3);
const ASSET_ID_SOLDIER_EGG_FIRE = bn(4);
const ASSET_ID_SOLDIER_EGG_EARTH = bn(5);
const ASSET_ID_SOLDIER_EGG_WATER = bn(6);
const ASSET_ID_SOLDIER_EGG_AIR = bn(7);
const ASSET_ID_COMMANDER_EGG_FIRE = bn(8);
const ASSET_ID_COMMANDER_EGG_EARTH = bn(9);
const ASSET_ID_COMMANDER_EGG_WATER = bn(10);
const ASSET_ID_COMMANDER_EGG_AIR = bn(11);
const ASSET_ID_GENERAL_EGG_FIRE = bn(12);
const ASSET_ID_GENERAL_EGG_EARTH = bn(13);
const ASSET_ID_GENERAL_EGG_WATER = bn(14);
const ASSET_ID_GENERAL_EGG_AIR = bn(15);

export {
  bn,
  BASE_URI,
  ELEMENT_GEM_METADATA,
  SKILL_GEM_METADATA,
  FACTION_GEM_METADATA,
  SNAKE_METADATA_URI,
  MAX_GIFTS_PER_PHASE,
  MAX_SUPPLY_FOR_GEMS,
  CATALOG_METADATA_URI,
  CATALOG_TYPE,
  ASSET_ID_SOLDIER_EGG,
  ASSET_ID_COMMANDER_EGG,
  ASSET_ID_GENERAL_EGG,
  ASSET_ID_SOLDIER_EGG_FIRE,
  ASSET_ID_SOLDIER_EGG_EARTH,
  ASSET_ID_SOLDIER_EGG_WATER,
  ASSET_ID_SOLDIER_EGG_AIR,
  ASSET_ID_COMMANDER_EGG_FIRE,
  ASSET_ID_COMMANDER_EGG_EARTH,
  ASSET_ID_COMMANDER_EGG_WATER,
  ASSET_ID_COMMANDER_EGG_AIR,
  ASSET_ID_GENERAL_EGG_FIRE,
  ASSET_ID_GENERAL_EGG_EARTH,
  ASSET_ID_GENERAL_EGG_WATER,
  ASSET_ID_GENERAL_EGG_AIR,
  SOLDIER_RANK,
  COMMANDER_RANK,
  GENERAL_RANK,
  SOLDIER_PRICE,
  COMMANDER_PRICE,
  GENERAL_PRICE,
};
