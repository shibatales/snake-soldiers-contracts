import { ethers, run } from 'hardhat';
import { RMRKEquipRenderUtils } from '../typechain-types';

async function main() {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');
  const renderUtils: RMRKEquipRenderUtils = await renderUtilsFactory.deploy();
  await renderUtils.deployed();
  console.log('Render Utils deployed at ', renderUtils.address);

  await run('verify:verify', {
    address: renderUtils.address,
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
