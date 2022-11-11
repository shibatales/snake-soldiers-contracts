import { ethers } from 'hardhat';
import { SnakeSoldier, ElementGem, FactionGem, SkillGem } from '../typechain-types';
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
  GEM_MAIN_RESOURCE_ID,
  IPFS_BASE,
} from './constants';

async function main() {
  const elementGemFactory = await ethers.getContractFactory('ElementGem');
  const factionGemFactory = await ethers.getContractFactory('FactionGem');
  const skillGemFactory = await ethers.getContractFactory('SkillGem');
  const passportFactory = await ethers.getContractFactory('SerpenterraPassport');
  const snakeSoldiers = await deployAndSetupSnakes();

  const passport = await passportFactory.deploy();
  await passport.deployed();

  const elementGem = await elementGemFactory.deploy(
    `${IPFS_BASE}/gems/elements/collectionMeta`,
    `${IPFS_BASE}/gems/elements/generic`,
    snakeSoldiers.address,
    5000,
  );
  await elementGem.deployed();
  await elementGem.addResourceEntry(
    GEM_MAIN_RESOURCE_ID,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/gems/elements/`,
    [],
    [],
  );

  const factionGem = await factionGemFactory.deploy(
    `${IPFS_BASE}/gems/factions/collectionMeta`,
    `${IPFS_BASE}/gems/factions/generic`,
    snakeSoldiers.address,
    5000,
    passport.address,
  );
  await factionGem.deployed();
  await factionGem.addResourceEntry(
    GEM_MAIN_RESOURCE_ID,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/gems/factions/`,
    [],
    [],
  );
  // So faction gem can burn passport on use
  passport.updateFactionGem(factionGem.address);

  const skillGem = await skillGemFactory.deploy(
    `${IPFS_BASE}/gems/skills/collectionMeta`,
    `${IPFS_BASE}/gems/skills/generic`,
    snakeSoldiers.address,
    5000,
  );
  await skillGem.deployed();
  await skillGem.addResourceEntry(
    GEM_MAIN_RESOURCE_ID,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/gems/skills/`,
    [],
    [],
  );

  console.log('Snake Soldiers deployed to ', snakeSoldiers.address);
  console.log('Element Gem deployed to ', elementGem.address);
  console.log('Faction Gem deployed to ', factionGem.address);
  console.log('Skill Gem deployed to ', skillGem.address);
  console.log('Serpenterra Passport deployed to ', passport.address);
}

async function deployAndSetupSnakes(): Promise<SnakeSoldier> {
  const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  const snakeSoldier = await snakeSoldierFactory.deploy(
    'ipfs://snakeMetadata',
    'ipfs://genericSoldierData',
    20,
  );
  await snakeSoldier.deployed();
  await snakeSoldier.addResourceEntry(
    RES_ID_SOLDIER_EGG,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/generic`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_COMMANDER_EGG,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/generic`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_GENERAL_EGG,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/generic`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_SOLDIER_EGG_FIRE,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/fire`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_SOLDIER_EGG_EARTH,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/earth`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_SOLDIER_EGG_WATER,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/water`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_SOLDIER_EGG_AIR,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/soldier/air`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_COMMANDER_EGG_FIRE,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/fire`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_COMMANDER_EGG_EARTH,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/earth`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_COMMANDER_EGG_WATER,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/water`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_COMMANDER_EGG_AIR,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/commander/air`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_GENERAL_EGG_FIRE,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/fire`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_GENERAL_EGG_EARTH,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/earth`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_GENERAL_EGG_WATER,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/water`,
    [],
    [],
  );
  await snakeSoldier.addResourceEntry(
    RES_ID_GENERAL_EGG_AIR,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/eggs/general/air`,
    [],
    [],
  );

  return snakeSoldier;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
