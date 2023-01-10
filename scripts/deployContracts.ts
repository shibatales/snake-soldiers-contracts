import { sleep } from './constants';
import { deployAndSetupGems, deployAndSetupSnakes } from './deployAndSetup'

async function main() {
  const snakeSoldiers = await deployAndSetupSnakes();
  await sleep(20);
  const { elementGem, factionGem, skillGem, passport } = await deployAndSetupGems(
    snakeSoldiers.address,
  );

  console.log('Snake Soldiers deployed to ', snakeSoldiers.address);
  console.log('Element Gem deployed to ', elementGem.address);
  console.log('Faction Gem deployed to ', factionGem.address);
  console.log('Skill Gem deployed to ', skillGem.address);
  console.log('Serpenterra Passport deployed to ', passport.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
