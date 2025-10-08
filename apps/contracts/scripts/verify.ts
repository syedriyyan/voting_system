import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS environment variable is not set");
  }

  console.log("Verifying contract on Etherscan...");

  try {
    await run("verify:verify", {
      address: process.env.CONTRACT_ADDRESS,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
