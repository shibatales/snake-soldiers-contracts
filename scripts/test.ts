import { ethers } from 'hardhat';
import { SnakeSoldier, ElementGem, FactionGem, SerpenterraPassport } from '../typechain-types';
import { IPFS_BASE, GEM_MAIN_RESOURCE_ID } from './constants'

async function main() {
  // const snakeSoldierFactory = await ethers.getContractFactory('SnakeSoldier');
  // const snakeSoldier: SnakeSoldier = snakeSoldierFactory.attach('0x424568D837c2dB1A8942CD122fd37721fA62CB02');
  // const elementGemFactory = await ethers.getContractFactory('ElementGem');
  // const elementGem: ElementGem = elementGemFactory.attach(
  //   '0xe30226eCE35D78F951037a4303525Ba819B3d56F',
  // );
  // await elementGem.claim(21);
  // const owners = await snakeSoldier.getOwners(201, 3);
  // console.log(owners);
  const passportFactory = await ethers.getContractFactory('SerpenterraPassport');
  const passport: SerpenterraPassport = passportFactory.attach('0x99afBc47A0363F25b4E6deE575a0c367E4419394');

  const factionGemFactory = await ethers.getContractFactory('FactionGem');
  const factionGem = await factionGemFactory.deploy(
    `${IPFS_BASE}/gems/factions/collectionMeta`,
    `${IPFS_BASE}/gems/factions/generic`,
    '0xAAC0f80a5d281f39A2e7D9dCCC6C0A98ac12F367',
    5000,
    '0x99afBc47A0363F25b4E6deE575a0c367E4419394',
  );
  await factionGem.deployed();
  await factionGem.addResourceEntry(
    GEM_MAIN_RESOURCE_ID,
    0,
    ethers.constants.AddressZero,
    `${IPFS_BASE}/gems/factions/`,
    [],
    [],
  );
  // So faction gem can burn passport on use
  passport.updateFactionGem(factionGem.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
