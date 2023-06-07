import { ethers } from 'hardhat';
import { SnakeSoldier } from '../typechain-types';
import { SOLDIER_RANK } from './constants';

async function main() {
  const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  const deployer = (await ethers.getSigners())[0];
  const snakeSoldiers = <SnakeSoldier>(
    snakeSoldierFactory.attach('0x3ab955216BdD76f51fbe02A3fe237D6612BBD09F')
  );
  console.log('Deployer address: ', deployer.address);

  // await snakeSoldiers.giftMint('0x4DaEa5f3bc56Feade3988c878E72670CC330b1bc', SOLDIER_RANK);
  // await snakeSoldiers.giftMint('0x4DaEa5f3bc56Feade3988c878E72670CC330b1bc', SOLDIER_RANK);
  // await snakeSoldiers.giftMint('0xa7E98232fE17aE5509ef554d919e3A5eA7C77F3C', SOLDIER_RANK);
  // await snakeSoldiers.giftMint('0x91a85FF9a0CE0E4a6D75E96068bA16eD315d90C3', SOLDIER_RANK);
  await snakeSoldiers.giftMint(deployer.address, SOLDIER_RANK);
  await snakeSoldiers.giftMint(deployer.address, SOLDIER_RANK);
  await snakeSoldiers.giftMint(deployer.address, SOLDIER_RANK);
  await snakeSoldiers.giftMint(deployer.address, SOLDIER_RANK);
  // await tx.wait();

  // console.log('Gifts sent');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
