import { ethers } from 'hardhat';
import { RMRKMultiAssetRenderUtils } from '../typechain-types';

async function main() {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils: RMRKMultiAssetRenderUtils = await renderUtilsFactory.deploy();
  console.log('Render Utils (Multiasset) deployed at ', renderUtils.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
