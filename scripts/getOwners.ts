import { ethers } from 'hardhat';
import { SnakeSoldier } from '../typechain-types';
import { SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE } from './constants';

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

async function main() {
  const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  const snakeSoldiers = <SnakeSoldier>(
    snakeSoldierFactory.attach('0x3ab955216BdD76f51fbe02A3fe237D6612BBD09F')
  );
  const owners: string[] = [];
  const ids: number[] = [1, 2, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];
  for (let i = 201; i <= 680; i++) {
    ids.push(i);
  }
  console.log(ids.length);
  for (let i = 0; i < ids.length; i++) {
    console.log(i);
    await sleep(500);
    owners.push(await snakeSoldiers.ownerOf(ids[i]));
  }

  // Store owners in a json file
  const fs = require('fs');
  fs.writeFileSync('owners.json', JSON.stringify(owners));

  // tx = await snakeSoldiers.openForAll();
  // await tx.wait();
  // console.log('Next phase enabled');
  // await snakeSoldiers.giftMint('0x91a85FF9a0CE0E4a6D75E96068bA16eD315d90C3', 1);
  // await snakeSoldiers.giftMint('0x47bFF18E462912Ab61a465b2bc229e3857491AA6', 1);
  // await snakeSoldiers.giftMint('0x78FA562DB71c28Af6E0643324CD2b5d3CF2bc6ef', 0);

  console.log('Owners retrieved');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
