import { ethers } from 'hardhat';
import { RMRKMultiResourceRenderUtils } from '../typechain-types';

async function main() {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiResourceRenderUtils');
  const renderUtils: RMRKMultiResourceRenderUtils = await renderUtilsFactory.deploy();
  console.log('Render Utils (Multiresource) deployed at ', renderUtils.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
