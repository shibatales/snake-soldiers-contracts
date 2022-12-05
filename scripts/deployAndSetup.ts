import { ethers } from 'hardhat';
import {
  SnakeSoldier,
  ElementGem,
  FactionGem,
  SkillGem,
  SerpenterraPassport,
} from '../typechain-types';
import {
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
  GEM_MAIN_ASSET_ID,
  IPFS_BASE,
  SOLDIER_PRICE,
  COMMANDER_PRICE,
  GENERAL_PRICE,
  sleep,
} from './constants';



async function deployAndSetupGems(
  snakeSoldiersAddrs: string,
): Promise<{
  elementGem: ElementGem;
  factionGem: FactionGem;
  skillGem: SkillGem;
  passport: SerpenterraPassport;
}> {
  const elementGemFactory = await ethers.getContractFactory('ElementGem');
  const factionGemFactory = await ethers.getContractFactory('FactionGem');
  const skillGemFactory = await ethers.getContractFactory('SkillGem');
  const passportFactory = await ethers.getContractFactory('SerpenterraPassport');

  const passport = await passportFactory.deploy();
  await passport.deployed();
  console.log('Passport deployed');
  // await sleep(12);

  const elementGem = await elementGemFactory.deploy(
    `${IPFS_BASE}/gems/elements/collectionMeta`,
    `${IPFS_BASE}/gems/elements/generic`,
    snakeSoldiersAddrs,
    5000,
  );
  await elementGem.deployed();
  await elementGem.addAssetEntry(
    GEM_MAIN_ASSET_ID,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/gems/elements/`,
    [],
    [],
  );
  console.log('Element gems deployed and configured');
  // await sleep(12);

  const factionGem = await factionGemFactory.deploy(
    `${IPFS_BASE}/gems/factions/collectionMeta`,
    `${IPFS_BASE}/gems/factions/generic`,
    snakeSoldiersAddrs,
    5000,
    passport.address,
  );
  await factionGem.deployed();
  await factionGem.addAssetEntry(
    GEM_MAIN_ASSET_ID,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/gems/factions/`,
    [],
    [],
  );
  // So faction gem can burn passport on use
  passport.updateFactionGem(factionGem.address);
  console.log('Faction gems deployed and configured');
  // await sleep(12);

  const skillGem = await skillGemFactory.deploy(
    `${IPFS_BASE}/gems/skills/collectionMeta`,
    `${IPFS_BASE}/gems/skills/generic`,
    snakeSoldiersAddrs,
    5000,
  );
  await skillGem.deployed();
  await skillGem.addAssetEntry(
    GEM_MAIN_ASSET_ID,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/gems/skills/`,
    [],
    [],
  );

  console.log('Skill gems deployed and configured');
  // await sleep(12);

  return { elementGem, factionGem, skillGem, passport };
}

async function deployAndSetupSnakes(): Promise<SnakeSoldier> {
  const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  const snakeSoldier = await snakeSoldierFactory.deploy(
    `${IPFS_BASE}/soldiers/collectionMetadata`,
    `${IPFS_BASE}/soldiers/unrevealed`,
    20,
  );
  await snakeSoldier.deployed();
  // await sleep(12);
  await snakeSoldier.addAssetEntry(
    RES_ID_SOLDIER_EGG,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/generic`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_COMMANDER_EGG,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/generic`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_GENERAL_EGG,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/generic`,
    [],
    [],
  );
  // await sleep(12);
  await snakeSoldier.addAssetEntry(
    RES_ID_SOLDIER_EGG_FIRE,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/fire`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_SOLDIER_EGG_EARTH,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/earth`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_SOLDIER_EGG_WATER,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/water`,
    [],
    [],
  );
  // await sleep(12);
  await snakeSoldier.addAssetEntry(
    RES_ID_SOLDIER_EGG_AIR,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/air`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_COMMANDER_EGG_FIRE,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/fire`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_COMMANDER_EGG_EARTH,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/earth`,
    [],
    [],
  );
  // await sleep(12);
  await snakeSoldier.addAssetEntry(
    RES_ID_COMMANDER_EGG_WATER,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/water`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_COMMANDER_EGG_AIR,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/air`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_GENERAL_EGG_FIRE,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/fire`,
    [],
    [],
  );
  // await sleep(12);
  await snakeSoldier.addAssetEntry(
    RES_ID_GENERAL_EGG_EARTH,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/earth`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_GENERAL_EGG_WATER,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/water`,
    [],
    [],
  );
  await snakeSoldier.addAssetEntry(
    RES_ID_GENERAL_EGG_AIR,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/air`,
    [],
    [],
  );
  // await sleep(12);

  await snakeSoldier.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
  return snakeSoldier;
}

export {
  deployAndSetupGems,
  deployAndSetupSnakes,
}