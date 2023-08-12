import { ethers } from 'hardhat';
import { SnakeSoldier } from '../typechain-types';
import { SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE } from './constants';
import { getDeployedContracts } from './utils';

async function main() {
  const { elementGem, factionGem, skillGem } = await getDeployedContracts();
  await elementGem.setClaimActive();
  await factionGem.setClaimActive();
  await skillGem.setClaimActive();
  console.log('Transactions sent.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
