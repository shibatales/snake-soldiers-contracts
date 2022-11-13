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

async function sleep(seconds: number) {
  await new Promise((f) => setTimeout(f, seconds * 1000));
}

let SOLDIER_PRICE = ethers.utils.parseEther('4.0');
let COMMANDER_PRICE = ethers.utils.parseEther('40.0');
let GENERAL_PRICE = ethers.utils.parseEther('400.0');

if (!IS_PROD) {
  SOLDIER_PRICE = SOLDIER_PRICE.div(100);
  COMMANDER_PRICE = COMMANDER_PRICE.div(100);
  GENERAL_PRICE = GENERAL_PRICE.div(100);
}

const SOLDIER_RANK = 0;
const COMMANDER_RANK = 1;
const GENERAL_RANK = 2;

const EMPTY_OVERWRITES = bn(0);
const RES_ID_SOLDIER_EGG = bn(1);
const RES_ID_COMMANDER_EGG = bn(2);
const RES_ID_GENERAL_EGG = bn(3);
const RES_ID_SOLDIER_EGG_FIRE = bn(4);
const RES_ID_SOLDIER_EGG_EARTH = bn(5);
const RES_ID_SOLDIER_EGG_WATER = bn(6);
const RES_ID_SOLDIER_EGG_AIR = bn(7);
const RES_ID_COMMANDER_EGG_FIRE = bn(8);
const RES_ID_COMMANDER_EGG_EARTH = bn(9);
const RES_ID_COMMANDER_EGG_WATER = bn(10);
const RES_ID_COMMANDER_EGG_AIR = bn(11);
const RES_ID_GENERAL_EGG_FIRE = bn(12);
const RES_ID_GENERAL_EGG_EARTH = bn(13);
const RES_ID_GENERAL_EGG_WATER = bn(14);
const RES_ID_GENERAL_EGG_AIR = bn(15);
const RES_ID_SNAKE = bn(16);

const GEM_MAIN_RESOURCE_ID = bn(1);
const GEM_EQUIP_RESOURCE_ID = bn(2);

const IPFS_BASE = 'ipfs://Qmd9cmxr5hjL67kFKBAkLyLEYcg1SMEDmoyjDPufzL2yFR';

export {
  bn,
  sleep,
  SOLDIER_PRICE,
  COMMANDER_PRICE,
  GENERAL_PRICE,
  SOLDIER_RANK,
  COMMANDER_RANK,
  GENERAL_RANK,
  EMPTY_OVERWRITES,
  RES_ID_SOLDIER_EGG,
  RES_ID_COMMANDER_EGG,
  RES_ID_GENERAL_EGG,
  RES_ID_SOLDIER_EGG_FIRE,
  RES_ID_SOLDIER_EGG_EARTH,
  RES_ID_SOLDIER_EGG_WATER,
  RES_ID_SOLDIER_EGG_AIR,
  RES_ID_COMMANDER_EGG_FIRE,
  RES_ID_COMMANDER_EGG_EARTH,
  RES_ID_COMMANDER_EGG_WATER,
  RES_ID_COMMANDER_EGG_AIR,
  RES_ID_GENERAL_EGG_FIRE,
  RES_ID_GENERAL_EGG_EARTH,
  RES_ID_GENERAL_EGG_WATER,
  RES_ID_GENERAL_EGG_AIR,
  RES_ID_SNAKE,
  GEM_MAIN_RESOURCE_ID,
  GEM_EQUIP_RESOURCE_ID,
  IPFS_BASE,
};
