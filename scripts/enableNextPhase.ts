import { ethers } from 'hardhat';
import { SnakeSoldier } from '../typechain-types';
import { SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE } from './constants';

async function main() {
  const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  const snakeSoldiers = <SnakeSoldier>(
    snakeSoldierFactory.attach('0x7Ffd1c6245c6b1CC1842c3E1eDE93cd70e774b59')
  );
  const tx = await snakeSoldiers.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
  await tx.wait();
  console.log('Next phase enabled');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
