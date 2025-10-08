import { ethers } from "ethers";

export async function deployContracts() {
  // For testing purposes, return mock contract objects
  const mockContractAddress = "0x" + "1".repeat(40);

  const votingSystem = {
    address: mockContractAddress,
    connect: (signer: any) => ({ address: mockContractAddress }),
  };

  const voterRegistry = {
    address: mockContractAddress,
    connect: (signer: any) => ({ address: mockContractAddress }),
  };

  return {
    votingSystem,
    voterRegistry,
    deployer: { address: "0x" + "2".repeat(40) },
  };
}
