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

const BASE_URI_EGGS = 'ipfs://QmPxzTUkLo4VZkkpLF7jHxERcWqjFSSRdkUAAdgB2VQ3jT';
const BASE_URI_GEMS = 'ipfs://GEMS'; // TODO, replace with actual IPFS base
const ELEMENT_GEM_COLLECTION_METADATA = `$ipfs://ElementGemCollectionMeta`; // TODO, replace with actual IPFS
const SKILL_GEM_COLLECTION_METADATA = `$ipfs://SkillGemCollectionMeta`; // TODO, replace with actual IPFS
const FACTION_GEM_COLLECTION_METADATA = `$ipfs://FactionGemCollectionMeta`; // TODO, replace with actual IPFS
const SNAKE_SOLDIER_COLLECTION_METADATA = `ipfs://QmZJhS8dnhnRbybkf5swaobp1Y64oFdM52uHxcWxuXg1YT`;

const CATALOG_METADATA_URI = ``;
const CATALOG_TYPE = 'img/png';
const MAX_GIFTS_PER_PHASE = bn(10);
const MAX_SUPPLY_FOR_GEMS = bn(5000);

const SOLDIER_RANK = 0;
const COMMANDER_RANK = 1;
const GENERAL_RANK = 2;

let SOLDIER_PRICE = ethers.utils.parseEther('25.0');
let COMMANDER_PRICE = ethers.utils.parseEther('250.0');
let GENERAL_PRICE = ethers.utils.parseEther('2000.0');

if (!IS_PROD) {
  SOLDIER_PRICE = SOLDIER_PRICE.div(2000);
  COMMANDER_PRICE = COMMANDER_PRICE.div(2000);
  GENERAL_PRICE = GENERAL_PRICE.div(2000);
}

const ASSET_ID_SOLDIER_EGG_FIRE = bn(1);
const ASSET_ID_SOLDIER_EGG_EARTH = bn(2);
const ASSET_ID_SOLDIER_EGG_WATER = bn(3);
const ASSET_ID_SOLDIER_EGG_AIR = bn(4);
const ASSET_ID_COMMANDER_EGG_FIRE = bn(5);
const ASSET_ID_COMMANDER_EGG_EARTH = bn(6);
const ASSET_ID_COMMANDER_EGG_WATER = bn(7);
const ASSET_ID_COMMANDER_EGG_AIR = bn(8);
const ASSET_ID_GENERAL_EGG_FIRE = bn(9);
const ASSET_ID_GENERAL_EGG_EARTH = bn(10);
const ASSET_ID_GENERAL_EGG_WATER = bn(11);
const ASSET_ID_GENERAL_EGG_AIR = bn(12);

export {
  bn,
  BASE_URI_EGGS,
  BASE_URI_GEMS,
  ELEMENT_GEM_COLLECTION_METADATA,
  SKILL_GEM_COLLECTION_METADATA,
  FACTION_GEM_COLLECTION_METADATA,
  SNAKE_SOLDIER_COLLECTION_METADATA,
  MAX_GIFTS_PER_PHASE,
  MAX_SUPPLY_FOR_GEMS,
  CATALOG_METADATA_URI,
  CATALOG_TYPE,
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
