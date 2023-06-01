import { BASE_URI_EGGS, BASE_URI_GEMS } from './constants';
import { SnakeSoldier, ElementGem, FactionGem, SkillGem } from '../typechain-types';
import { ethers } from 'hardhat';

async function addMainAssets(
  snakeSoldier: SnakeSoldier,
  elementGem: ElementGem,
  factionGem: FactionGem,
  skillGem: SkillGem,
): Promise<void> {
  console.log('Adding assets to snakes.');

  await snakeSoldier.addEquippableAssetEntries(
    0,
    ethers.constants.AddressZero,
    [
      `${BASE_URI_EGGS}/soldier/generic`, // SOLDIER_EGG = 1;
      `${BASE_URI_EGGS}/commander/generic`, // COMMANDER_EGG = 2;
      `${BASE_URI_EGGS}/general/generic`, // GENERAL_EGG = 3;
      `${BASE_URI_EGGS}/soldier/fire`, // SOLDIER_EGG_FIRE = 4;
      `${BASE_URI_EGGS}/soldier/earth`, // SOLDIER_EGG_EARTH = 5;
      `${BASE_URI_EGGS}/soldier/water`, // SOLDIER_EGG_WATER = 6;
      `${BASE_URI_EGGS}/soldier/air`, // SOLDIER_EGG_AIR = 7;
      `${BASE_URI_EGGS}/commander/fire`, // COMMANDER_EGG_FIRE = 8;
      `${BASE_URI_EGGS}/commander/earth`, // COMMANDER_EGG_EARTH = 9;
      `${BASE_URI_EGGS}/commander/water`, // COMMANDER_EGG_WATER = 10;
      `${BASE_URI_EGGS}/commander/air`, // COMMANDER_EGG_AIR = 11;
      `${BASE_URI_EGGS}/general/fire`, // GENERAL_EGG_FIRE = 12;
      `${BASE_URI_EGGS}/general/earth`, // GENERAL_EGG_EARTH = 13;
      `${BASE_URI_EGGS}/general/water`, // GENERAL_EGG_WATER = 14;
      `${BASE_URI_EGGS}/general/air`, // GENERAL_EGG_AIR = 15;
    ],
    [],
  );
  console.log('Adding assets to gems.');

  await elementGem.addAssetEntry(`${BASE_URI_GEMS}/elements/`);
  await factionGem.addAssetEntry(`${BASE_URI_GEMS}/factions/`);
  await skillGem.addAssetEntry(`${BASE_URI_GEMS}/skills/`);

  console.log('Base assets added.');
}

export default addMainAssets;
