import hre from "hardhat";

async function main() {
  console.log("Deploying AgriTracker...");

  const tracker = await hre.ethers.deployContract("AgriTracker");
  await tracker.waitForDeployment();

  console.log(`AgriTracker deployed to: ${tracker.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
