import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  bn,
  RES_ID_SOLDIER_EGG,
  RES_ID_SOLDIER_EGG_FIRE,
  RES_ID_SOLDIER_EGG_EARTH,
  RES_ID_SOLDIER_EGG_WATER,
  RES_ID_SOLDIER_EGG_AIR,
  SOLDIER_PRICE,
  COMMANDER_PRICE,
  GENERAL_PRICE,
  SOLDIER_RANK,
  COMMANDER_RANK,
  GENERAL_RANK,
  IPFS_BASE,
  RES_ID_GENERAL_EGG,
  RES_ID_COMMANDER_EGG,
  RES_ID_GENERAL_EGG_EARTH,
  RES_ID_COMMANDER_EGG_EARTH,
} from '../scripts/constants';
import {
  SnakeSoldier,
  ElementGem,
  FactionGem,
  SkillGem,
  SerpenterraPassport,
  RMRKMultiAssetRenderUtils,
} from '../typechain-types';
import { deployAndSetupGems, deployAndSetupSnakes } from '../scripts/deployAndSetup';

const META_URI = 'ipfs://snakes/meta.json';
const DEFAULT_TOKEN_URI = 'ipfs://snakes/generic.json';
const MAX_GIFTS_PER_PHASE = 3;

async function fullFixture(): Promise<{
  snakeSoldiers: SnakeSoldier;
  elementGem: ElementGem;
  factionGem: FactionGem;
  skillGem: SkillGem;
  passport: SerpenterraPassport;
  renderUtils: RMRKMultiAssetRenderUtils;
}> {
  const snakeSoldiers = await deployAndSetupSnakes();
  const { elementGem, factionGem, skillGem, passport } = await deployAndSetupGems(
    snakeSoldiers.address,
  );
  const renderUtilsFactory = await ethers.getContractFactory('RMRKMultiAssetRenderUtils');
  const renderUtils: RMRKMultiAssetRenderUtils = await renderUtilsFactory.deploy();
  return { snakeSoldiers, elementGem, factionGem, skillGem, passport, renderUtils };
}

describe('SnakeSoldiers', async () => {
  let snakeSoldiers: SnakeSoldier;
  let elementGem: ElementGem;
  let factionGem: FactionGem;
  let skillGem: SkillGem;
  let passport: SerpenterraPassport;
  let renderUtils: RMRKMultiAssetRenderUtils;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let buyer2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async () => {
    [owner, buyer, buyer2, ...addrs] = await ethers.getSigners();
    // @ts-ignore
    ({ snakeSoldiers, elementGem, factionGem, skillGem, passport, renderUtils } = await loadFixture(
      fullFixture,
    ));

    await snakeSoldiers
      .connect(buyer)
      .mint(buyer.address, 4, SOLDIER_RANK, { value: SOLDIER_PRICE.mul(4) });
    await snakeSoldiers
      .connect(buyer)
      .mint(buyer.address, 2, COMMANDER_RANK, { value: COMMANDER_PRICE.mul(2) });
    await snakeSoldiers
      .connect(buyer)
      .mint(buyer.address, 1, GENERAL_RANK, { value: GENERAL_PRICE });
    await snakeSoldiers
      .connect(buyer2)
      .mint(buyer2.address, 4, SOLDIER_RANK, { value: SOLDIER_PRICE.mul(4) });
  });

  it('can get owners', async function () {
    expect(await snakeSoldiers.getIdsAndOwners(201, 10)).to.eql([
      [bn(201), bn(202), bn(203), bn(204), bn(205), bn(206), bn(207), bn(208), bn(209), bn(210)],
      [
        buyer.address,
        buyer.address,
        buyer.address,
        buyer.address,
        buyer2.address,
        buyer2.address,
        buyer2.address,
        buyer2.address,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ],
    ]);
  });

  it('can reveal egg', async function () {
    // Generals
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 1)).to.eql([
      [RES_ID_GENERAL_EGG, 0, `${IPFS_BASE}/eggs/general/generic`]
    ]);
    await snakeSoldiers.connect(buyer).revealElement(1);
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 1)).to.eql([
      [RES_ID_GENERAL_EGG_EARTH, 0, `${IPFS_BASE}/eggs/general/earth`]
    ]);

    // Commanders
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 21)).to.eql([
      [RES_ID_COMMANDER_EGG, 0, `${IPFS_BASE}/eggs/commander/generic`]
    ]);
    await snakeSoldiers.connect(buyer).revealElement(21);
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 21)).to.eql([
      [RES_ID_COMMANDER_EGG_EARTH, 0, `${IPFS_BASE}/eggs/commander/earth`]
    ]);

    // Soldiers
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 201)).to.eql([
      [RES_ID_SOLDIER_EGG, 0, `${IPFS_BASE}/eggs/soldier/generic`]
    ]);
    await snakeSoldiers.connect(buyer).revealElement(201);
    await snakeSoldiers.connect(buyer).revealElement(202);
    await snakeSoldiers.connect(buyer).revealElement(203);
    await snakeSoldiers.connect(buyer).revealElement(204);
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 201)).to.eql([
      [RES_ID_SOLDIER_EGG_EARTH, 0, `${IPFS_BASE}/eggs/soldier/earth`]
    ]);
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 202)).to.eql([
      [RES_ID_SOLDIER_EGG_WATER, 0, `${IPFS_BASE}/eggs/soldier/water`]
    ]);
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 203)).to.eql([
      [RES_ID_SOLDIER_EGG_AIR, 0, `${IPFS_BASE}/eggs/soldier/air`]
    ]);
    expect(await renderUtils.getActiveAssets(snakeSoldiers.address, 204)).to.eql([
      [RES_ID_SOLDIER_EGG_FIRE, 0, `${IPFS_BASE}/eggs/soldier/fire`]
    ]);
  });

  it('can claim gems', async function () {
    await elementGem.connect(buyer).claim(1);
    await factionGem.connect(buyer).claim(1);
    await skillGem.connect(buyer).claim(1);
    expect(await elementGem.claimed(1)).to.eql(true);
    expect(await factionGem.claimed(1)).to.eql(true);
    expect(await skillGem.claimed(1)).to.eql(true);
    expect(await snakeSoldiers.pendingChildrenOf(1)).to.eql(
      [
        [bn(1), elementGem.address],
        [bn(1), factionGem.address],
        [bn(1), skillGem.address],
      ]
    )
  });
});
