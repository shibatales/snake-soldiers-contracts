import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SnakeSoldier } from '../typechain-types/contracts/SnakeSoldier';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  bn,
  SOLDIER_PRICE,
  COMMANDER_PRICE,
  GENERAL_PRICE,
  SOLDIER_RANK,
  COMMANDER_RANK,
  GENERAL_RANK,
  EMPTY_OVERWRITES,
  RES_ID_SOLDIER_EGG,
  RES_ID_COMMANDER_EGG,
  RES_ID_GENERAL_EGG,
  RES_ID_SOLDIER_EGG_FIRE,
  RES_ID_SOLDIER_EGG_EARTH,
  RES_ID_SOLDIER_EGG_WATER,
  RES_ID_SOLDIER_EGG_AIR,
  RES_ID_COMMANDER_EGG_FIRE,
  RES_ID_COMMANDER_EGG_EARTH,
  RES_ID_COMMANDER_EGG_WATER,
  RES_ID_COMMANDER_EGG_AIR,
  RES_ID_GENERAL_EGG_FIRE,
  RES_ID_GENERAL_EGG_EARTH,
  RES_ID_GENERAL_EGG_WATER,
  RES_ID_GENERAL_EGG_AIR,
  RES_ID_SNAKE,
} from '../scripts/constants';

const META_URI = 'ipfs://snakes/meta.json';
const DEFAULT_TOKEN_URI = 'ipfs://snakes/generic.json';
const MAX_GIFTS_PER_PHASE = 3;

async function snakesFixture(): Promise<Contract> {
  const factory = await ethers.getContractFactory('SnakeSoldier');
  // @ts-ignore
  const token = await factory.deploy(META_URI, DEFAULT_TOKEN_URI, MAX_GIFTS_PER_PHASE);
  await token.deployed();
  await token.addAssetEntry(
    RES_ID_SOLDIER_EGG,
    0,
    ethers.constants.AddressZero,
    'ipfs://soldierEgg',
    [],
    [],
  );
  await token.addAssetEntry(
    RES_ID_COMMANDER_EGG,
    0,
    ethers.constants.AddressZero,
    'ipfs://commanderEgg',
    [],
    [],
  );
  await token.addAssetEntry(
    RES_ID_GENERAL_EGG,
    0,
    ethers.constants.AddressZero,
    'ipfs://generalEgg',
    [],
    [],
  );
  return token;
}

describe('SnakeSoldiers', async () => {
  let token: SnakeSoldier;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async () => {
    [owner, buyer, ...addrs] = await ethers.getSigners();
    // @ts-ignore
    token = await loadFixture(snakesFixture);
  });

  describe('Minting', async function () {
    it('can mint from every rank at the right price', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

      await expect(token.mint(buyer.address, 4, SOLDIER_RANK, { value: SOLDIER_PRICE.mul(4) }))
        .to.emit(token, 'Minted')
        .withArgs(0, buyer.address, 201, 204);
      await expect(token.mint(buyer.address, 2, COMMANDER_RANK, { value: COMMANDER_PRICE.mul(2) }))
        .to.emit(token, 'Minted')
        .withArgs(1, buyer.address, 21, 22);
      await expect(token.mint(buyer.address, 1, GENERAL_RANK, { value: GENERAL_PRICE }))
        .to.emit(token, 'Minted')
        .withArgs(2, buyer.address, 1, 1);

      expect(await token.balanceOf(buyer.address)).to.eql(bn(7));

      // Check balance and withdraw
      const expectedBalance = SOLDIER_PRICE.mul(4).add(COMMANDER_PRICE.mul(2)).add(GENERAL_PRICE);
      expect(await ethers.provider.getBalance(token.address)).to.eql(expectedBalance);

      // Withdraw
      const beneficiary = addrs[0];
      const beneficiaryBalance = await ethers.provider.getBalance(beneficiary.address);
      await token.withdrawRaised(beneficiary.address, expectedBalance);

      const expectedBeneficiaryBalance = beneficiaryBalance.add(expectedBalance);
      expect(await ethers.provider.getBalance(token.address)).to.eql(bn(0));
      expect(await ethers.provider.getBalance(beneficiary.address)).to.eql(
        expectedBeneficiaryBalance,
      );
    });

    it('cannot mint on phase 0', async function () {
      await expect(
        token.mint(buyer.address, 4, SOLDIER_RANK, { value: SOLDIER_PRICE.mul(4) }),
      ).to.be.revertedWithCustomError(token, 'SaleNotOpen');
    });

    it('cannot mint on 0 tokens', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

      await expect(token.mint(buyer.address, 0, SOLDIER_RANK)).to.be.revertedWithCustomError(
        token,
        'MintZero',
      );
    });

    it('cannot mint without the right price tokens', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

      await expect(
        token.mint(buyer.address, 4, SOLDIER_RANK, { value: SOLDIER_PRICE }),
      ).to.be.revertedWithCustomError(token, 'MintUnderpriced');
    });

    it('cannot mint over max supply for any rank', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

      await expect(
        token.mint(buyer.address, 1201, SOLDIER_RANK, { value: SOLDIER_PRICE.mul(901) }),
      ).to.be.revertedWithCustomError(token, 'MintOverMax');
      await expect(
        token.mint(buyer.address, 181, COMMANDER_RANK, { value: COMMANDER_PRICE.mul(136) }),
      ).to.be.revertedWithCustomError(token, 'MintOverMax');
      await expect(
        token.mint(buyer.address, 21, GENERAL_RANK, { value: GENERAL_PRICE.mul(16) }),
      ).to.be.revertedWithCustomError(token, 'MintOverMax');
    });

    describe('Gifts', async function () {
      it('can mint gift for different ranks', async function () {
        await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

        const recipient = addrs[1];
        await expect(token.giftMint(recipient.address, SOLDIER_RANK))
          .to.emit(token, 'Minted')
          .withArgs(0, recipient.address, 201, 201);
        await expect(token.giftMint(recipient.address, COMMANDER_RANK))
          .to.emit(token, 'Minted')
          .withArgs(1, recipient.address, 21, 21);
        await expect(token.giftMint(recipient.address, GENERAL_RANK))
          .to.emit(token, 'Minted')
          .withArgs(2, recipient.address, 1, 1);

        expect(await token.totalGifts()).to.eql(bn(3));
      });

      it('increases max gifts on later phases', async function () {
        await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
        expect(await token.maxGifts()).to.eql(bn(3));

        await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
        expect(await token.maxGifts()).to.eql(bn(6));
      });

      it('cannot mint more gifts than allowed per phase', async function () {
        const recipient = addrs[1];
        await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

        await token.giftMint(recipient.address, SOLDIER_RANK);
        await token.giftMint(recipient.address, SOLDIER_RANK);
        await token.giftMint(recipient.address, SOLDIER_RANK);
        await expect(token.giftMint(recipient.address, SOLDIER_RANK)).to.be.revertedWithCustomError(
          token,
          'MaxGiftsPerPhaseReached',
        );
      });
    });
  });

  describe('Phases', async function () {
    it('cannot enable phases after 4rd', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
      await token.enableNextPhase(
        SOLDIER_PRICE.mul(2),
        COMMANDER_PRICE.mul(2),
        GENERAL_PRICE.mul(2),
      );
      await token.enableNextPhase(
        SOLDIER_PRICE.mul(3),
        COMMANDER_PRICE.mul(3),
        GENERAL_PRICE.mul(3),
      );
      await token.enableNextPhase(
        SOLDIER_PRICE.mul(3),
        COMMANDER_PRICE.mul(3),
        GENERAL_PRICE.mul(3),
      );
      await expect(
        token.enableNextPhase(SOLDIER_PRICE.mul(5), COMMANDER_PRICE.mul(5), GENERAL_PRICE.mul(5)),
      ).to.be.revertedWithCustomError(token, 'MaxPhaseReached');
    });

    it('cannot enable more phases if phases locked', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
      await token.lockPhases();
      await expect(
        token.enableNextPhase(SOLDIER_PRICE.mul(2), COMMANDER_PRICE.mul(2), GENERAL_PRICE.mul(2)),
      ).to.be.revertedWithCustomError(token, 'MaxPhaseReached');
    });

    it('cannot enable next phase with lower price than previous', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);
      await expect(
        token.enableNextPhase(SOLDIER_PRICE.div(2), COMMANDER_PRICE.div(2), GENERAL_PRICE.div(2)),
      ).to.be.revertedWithCustomError(token, 'NextPhasePriceMustBeEqualOrHigher');
    });
  });

  describe('With minted tokens', async function () {
    beforeEach(async () => {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

      await token.mint(buyer.address, 4, SOLDIER_RANK, { value: SOLDIER_PRICE.mul(4) });
      await token.mint(buyer.address, 2, COMMANDER_RANK, { value: COMMANDER_PRICE.mul(2) });
      await token.mint(buyer.address, 1, GENERAL_RANK, { value: GENERAL_PRICE });
    });

    it('can get total and max supply', async function () {
      expect(await token['totalSupply(uint8)'](SOLDIER_RANK)).to.eql(bn(4));
      expect(await token['totalSupply(uint8)'](COMMANDER_RANK)).to.eql(bn(2));
      expect(await token['totalSupply(uint8)'](GENERAL_RANK)).to.eql(bn(1));
      expect(await token['totalSupply()']()).to.eql(bn(7));

      expect(await token['maxSupply(uint8)'](SOLDIER_RANK)).to.eql(bn(1200));
      expect(await token['maxSupply(uint8)'](COMMANDER_RANK)).to.eql(bn(45));
      expect(await token['maxSupply(uint8)'](GENERAL_RANK)).to.eql(bn(5));
      expect(await token['maxSupply()']()).to.eql(bn(1250));
    });

    it('can get max supply on later phases', async function () {
      await token.enableNextPhase(SOLDIER_PRICE, COMMANDER_PRICE, GENERAL_PRICE);

      expect(await token['maxSupply(uint8)'](SOLDIER_RANK)).to.eql(bn(1200 * 2));
      expect(await token['maxSupply(uint8)'](COMMANDER_RANK)).to.eql(bn(45 * 2));
      expect(await token['maxSupply(uint8)'](GENERAL_RANK)).to.eql(bn(5 * 2));
      expect(await token['maxSupply()']()).to.eql(bn(1250 * 2));
    });

    it('can get right token URI on reach rank', async function () {
      expect(await token.tokenURI(201)).to.eql(DEFAULT_TOKEN_URI);
      expect(await token.tokenURI(21)).to.eql(DEFAULT_TOKEN_URI);
      expect(await token.tokenURI(1)).to.eql(DEFAULT_TOKEN_URI);
    });

    describe('With assets added', async function () {
      it('can get asset meta for tokens on each rank', async function () {
        expect(await token.getAssetMetadata(201, RES_ID_SOLDIER_EGG)).to.eql(
          'ipfs://soldierEgg',
        );
        expect(await token.getAssetMetadata(202, RES_ID_SOLDIER_EGG)).to.eql(
          'ipfs://soldierEgg',
        );
        expect(await token.getAssetMetadata(21, RES_ID_COMMANDER_EGG)).to.eql(
          'ipfs://commanderEgg',
        );
        expect(await token.getAssetMetadata(22, RES_ID_COMMANDER_EGG)).to.eql(
          'ipfs://commanderEgg',
        );
        expect(await token.getAssetMetadata(1, RES_ID_GENERAL_EGG)).to.eql('ipfs://generalEgg');
      });

      it('can replace basic eggs for element eggs', async function () {
        await addElementEggsAssets();
        await addElementEggsToTokens();

        expect(await token.getAssetMetadata(201, RES_ID_SOLDIER_EGG_FIRE)).to.eql(
          'ipfs://soldierEgg/fire',
        );
        expect(await token.getAssetMetadata(203, RES_ID_SOLDIER_EGG_WATER)).to.eql(
          'ipfs://soldierEgg/water',
        );
        expect(await token.getAssetMetadata(21, RES_ID_COMMANDER_EGG_EARTH)).to.eql(
          'ipfs://commanderEgg/earth',
        );
        expect(await token.getAssetMetadata(22, RES_ID_COMMANDER_EGG_AIR)).to.eql(
          'ipfs://commanderEgg/air',
        );
        expect(await token.getAssetMetadata(1, RES_ID_GENERAL_EGG_FIRE)).to.eql(
          'ipfs://generalEgg/fire',
        );
      });

      it('can replace element eggs for snake assets', async function () {
        // We replace basic eggs for element eggs first.
        await addElementEggsAssets();
        await addElementEggsToTokens();

        // Now replace for enumerated soldier assets

        await token.addAssetEntry(
          RES_ID_SNAKE,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://soldier/',
          [],
          [],
        );
        await token.setAssetEnumerated(RES_ID_SNAKE, true);
        await token.addAssetToTokens([201, 202], RES_ID_SNAKE, RES_ID_SOLDIER_EGG_FIRE);
        await token.addAssetToTokens([203, 204], RES_ID_SNAKE, RES_ID_SOLDIER_EGG_WATER);
        await token.addAssetToTokens([21], RES_ID_SNAKE, RES_ID_COMMANDER_EGG_EARTH);
        await token.addAssetToTokens([22], RES_ID_SNAKE, RES_ID_COMMANDER_EGG_AIR);
        await token.addAssetToTokens([1], RES_ID_SNAKE, RES_ID_GENERAL_EGG_FIRE);

        const tokenIds = [1, 21, 22, 201, 202, 203, 204];
        for (let i = 0; i < tokenIds.length; i++) {
          await token.connect(buyer).acceptAsset(tokenIds[i], 0, RES_ID_SNAKE);
        }

        expect(await token.getAssetMetadata(201, RES_ID_SNAKE)).to.eql('ipfs://soldier/201');
        expect(await token.getAssetMetadata(203, RES_ID_SNAKE)).to.eql('ipfs://soldier/203');
        expect(await token.getAssetMetadata(21, RES_ID_SNAKE)).to.eql('ipfs://soldier/21');
        expect(await token.getAssetMetadata(22, RES_ID_SNAKE)).to.eql('ipfs://soldier/22');
        expect(await token.getAssetMetadata(1, RES_ID_SNAKE)).to.eql('ipfs://soldier/1');
      });

      async function addElementEggsAssets() {
        // SOLDIERS
        await token.addAssetEntry(
          RES_ID_SOLDIER_EGG_FIRE,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://soldierEgg/fire',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_SOLDIER_EGG_WATER,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://soldierEgg/water',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_SOLDIER_EGG_AIR,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://soldierEgg/air',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_SOLDIER_EGG_EARTH,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://soldierEgg/earth',
          [],
          [],
        );
        // COMMANDERS
        await token.addAssetEntry(
          RES_ID_COMMANDER_EGG_WATER,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://commanderEgg/water',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_COMMANDER_EGG_FIRE,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://commanderEgg/fire',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_COMMANDER_EGG_AIR,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://commanderEgg/air',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_COMMANDER_EGG_EARTH,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://commanderEgg/earth',
          [],
          [],
        );
        // GENERALS
        await token.addAssetEntry(
          RES_ID_GENERAL_EGG_FIRE,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://generalEgg/fire',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_GENERAL_EGG_WATER,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://generalEgg/water',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_GENERAL_EGG_AIR,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://generalEgg/air',
          [],
          [],
        );
        await token.addAssetEntry(
          RES_ID_GENERAL_EGG_EARTH,
          bn(0),
          ethers.constants.AddressZero,
          'ipfs://generalEgg/earth',
          [],
          [],
        );
      }

      async function addElementEggsToTokens() {
        await token.addAssetToTokens([201, 202], RES_ID_SOLDIER_EGG_FIRE, RES_ID_SOLDIER_EGG);
        await token.addAssetToTokens([203, 204], RES_ID_SOLDIER_EGG_WATER, RES_ID_SOLDIER_EGG);
        await token.addAssetToTokens([21], RES_ID_COMMANDER_EGG_EARTH, RES_ID_COMMANDER_EGG);
        await token.addAssetToTokens([22], RES_ID_COMMANDER_EGG_AIR, RES_ID_COMMANDER_EGG);
        await token.addAssetToTokens([1], RES_ID_GENERAL_EGG_FIRE, RES_ID_GENERAL_EGG);

        await token.connect(buyer).acceptAsset(201, 0, RES_ID_SOLDIER_EGG_FIRE);
        await token.connect(buyer).acceptAsset(202, 0, RES_ID_SOLDIER_EGG_FIRE);
        await token.connect(buyer).acceptAsset(203, 0, RES_ID_SOLDIER_EGG_WATER);
        await token.connect(buyer).acceptAsset(204, 0, RES_ID_SOLDIER_EGG_WATER);
        await token.connect(buyer).acceptAsset(21, 0, RES_ID_COMMANDER_EGG_EARTH);
        await token.connect(buyer).acceptAsset(22, 0, RES_ID_COMMANDER_EGG_AIR);
        await token.connect(buyer).acceptAsset(1, 0, RES_ID_GENERAL_EGG_FIRE);
      }
    });
  });
});
