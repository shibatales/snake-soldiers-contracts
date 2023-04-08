import deployContracts from './deploy';

async function main() {
  await deployContracts('0x4c9F1f32A341D50Af9C5F176de42a2aC2f9Ef4a2', false);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
