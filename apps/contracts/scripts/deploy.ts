import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy VoterRegistry
  const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
  const voterRegistry = await VoterRegistry.deploy();
  await voterRegistry.deployed();
  console.log("VoterRegistry deployed to:", voterRegistry.address);

  // Deploy ElectionFactory
  const ElectionFactory = await ethers.getContractFactory("ElectionFactory");
  const electionFactory = await ElectionFactory.deploy();
  await electionFactory.deployed();
  console.log("ElectionFactory deployed to:", electionFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });