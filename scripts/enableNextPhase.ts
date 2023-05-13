import { ethers } from 'hardhat';
import { SnakeSoldier } from '../typechain-types';
import { SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE } from './constants';

async function main() {
  const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  const snakeSoldiers = <SnakeSoldier>(
    snakeSoldierFactory.attach('0x3ab955216BdD76f51fbe02A3fe237D6612BBD09F')
  );
  let tx = await snakeSoldiers.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
  tx = await snakeSoldiers.openForAll();
  await tx.wait();
  // console.log('Next phase enabled');
  // await snakeSoldiers.giftMint('0x91a85FF9a0CE0E4a6D75E96068bA16eD315d90C3', 1);
  // await snakeSoldiers.giftMint('0x47bFF18E462912Ab61a465b2bc229e3857491AA6', 1);
  // await snakeSoldiers.giftMint('0x78FA562DB71c28Af6E0643324CD2b5d3CF2bc6ef', 0);

  console.log('Gifts sent');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
