import { ethers } from 'hardhat';
import { SnakeSoldier } from '../typechain-types';
import { BASE_URI_EGGS } from './constants';
import { SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE } from './constants';
import owners from '../owners.json';
import { token } from '../typechain-types/@openzeppelin/contracts';
import { delay } from '@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  const snakeSoldiers = <SnakeSoldier>(
    snakeSoldierFactory.attach('0x8F64Ce931f0D36430B971548b81264EeF3bD9B97')
  );
  const ids: number[] = [
    1, 2, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
  ];
  for (let i = 201; i <= 680; i++) {
    ids.push(i);
  }

  console.log('Adding assets to snakes.');

  let tx = await snakeSoldiers.addEquippableAssetEntries(
    0,
    ethers.constants.AddressZero,
    [
      `${BASE_URI_EGGS}/soldier/fire`, // SOLDIER_EGG_FIRE = 1;
      `${BASE_URI_EGGS}/soldier/earth`, // SOLDIER_EGG_EARTH = 2;
      `${BASE_URI_EGGS}/soldier/water`, // SOLDIER_EGG_WATER = 3;
      `${BASE_URI_EGGS}/soldier/air`, // SOLDIER_EGG_AIR = 4;
      `${BASE_URI_EGGS}/commander/fire`, // COMMANDER_EGG_FIRE = 5;
      `${BASE_URI_EGGS}/commander/earth`, // COMMANDER_EGG_EARTH = 6;
      `${BASE_URI_EGGS}/commander/water`, // COMMANDER_EGG_WATER = 7;
      `${BASE_URI_EGGS}/commander/air`, // COMMANDER_EGG_AIR = 8;
      `${BASE_URI_EGGS}/general/fire`, // GENERAL_EGG_FIRE = 9;
      `${BASE_URI_EGGS}/general/earth`, // GENERAL_EGG_EARTH = 10;
      `${BASE_URI_EGGS}/general/water`, // GENERAL_EGG_WATER = 11;
      `${BASE_URI_EGGS}/general/air`, // GENERAL_EGG_AIR = 12;
    ],
    [],
  );
  await tx.wait();
  console.log('Eggs assets added.');

  await snakeSoldiers.setPaused(true);
  await snakeSoldiers.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
  await snakeSoldiers.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
  console.log('Paused and enabled 2 phases');
  await delay(12000);

  tx = await snakeSoldiers.migrate(owners.slice(0, 2), 2);
  await tx.wait();
  tx = await snakeSoldiers.migrate(owners.slice(2, 20), 1);
  await tx.wait();
  for (let i = 20; i < 500; i += 48) {
    console.log('Migrating from ', i, ' to ', i + 48);
    let tx = await snakeSoldiers.migrate(owners.slice(i, i + 48), 0);
    await tx.wait();
  }

  console.log('Owners Migrated');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
