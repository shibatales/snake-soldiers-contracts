import { ethers, run } from 'hardhat';
import { ElementGem, FactionGem, SerpenTerraPassport, SkillGem } from '../typechain-types';
import * as C from './constants';
import { getDeployedContracts } from './utils';

async function main() {
  const { snakeSoldiers } = await getDeployedContracts();

  const elementGemFactory = await ethers.getContractFactory('ElementGem');
  const factionGemFactory = await ethers.getContractFactory('FactionGem');
  const skillGemFactory = await ethers.getContractFactory('SkillGem');
  const serpenTerraPassportFactory = await ethers.getContractFactory('SerpenTerraPassport');

  const passport = <SerpenTerraPassport>(
    await serpenTerraPassportFactory.deploy(ethers.constants.AddressZero)
  );

  await passport.deployed();
  console.log(`SerpenTerra Passport deployed to ${passport.address}`);

  const elementGem = <ElementGem>(
    await elementGemFactory.deploy(
      C.ELEMENT_GEM_COLLECTION_METADATA,
      snakeSoldiers.address,
      C.MAX_SUPPLY_FOR_GEMS,
    )
  );

  const skillGem = <SkillGem>(
    await skillGemFactory.deploy(
      C.SKILL_GEM_COLLECTION_METADATA,
      snakeSoldiers.address,
      C.MAX_SUPPLY_FOR_GEMS,
    )
  );

  const factionGem = <FactionGem>(
    await factionGemFactory.deploy(
      C.FACTION_GEM_COLLECTION_METADATA,
      snakeSoldiers.address,
      C.MAX_SUPPLY_FOR_GEMS,
      passport.address,
    )
  );

  await elementGem.deployed();
  console.log(`Element Gem deployed to ${elementGem.address}`);
  await skillGem.deployed();
  console.log(`Skill Gem deployed to ${skillGem.address}`);
  await factionGem.deployed();
  console.log(`Faction Gem deployed to ${factionGem.address}`);

  await run('verify:verify', {
    address: passport.address,
    constructorArguments: [ethers.constants.AddressZero],
  });
  await run('verify:verify', {
    address: elementGem.address,
    constructorArguments: [
      C.ELEMENT_GEM_COLLECTION_METADATA,
      snakeSoldiers.address,
      C.MAX_SUPPLY_FOR_GEMS,
    ],
  });
  await run('verify:verify', {
    address: factionGem.address,
    constructorArguments: [
      C.FACTION_GEM_COLLECTION_METADATA,
      snakeSoldiers.address,
      C.MAX_SUPPLY_FOR_GEMS,
      passport.address,
    ],
  });
  await run('verify:verify', {
    address: skillGem.address,
    constructorArguments: [
      C.SKILL_GEM_COLLECTION_METADATA,
      snakeSoldiers.address,
      C.MAX_SUPPLY_FOR_GEMS,
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
