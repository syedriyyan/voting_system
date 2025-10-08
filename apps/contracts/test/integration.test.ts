import { expect } from "chai";
import { ethers } from "hardhat";

describe("Integration Tests", function () {
  it("Should allow complete voting flow", async function () {
    // Deploy VotingSystem contract directly
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy();
    await votingSystem.waitForDeployment();

    // Get signers
    const [admin, voter1, voter2] = await ethers.getSigners();

    // Register voters
    await votingSystem.connect(voter1).registerVoter("voter1_hash");
    await votingSystem.connect(voter2).registerVoter("voter2_hash");

    // Verify voters (admin action)
    await votingSystem.verifyVoter(voter1.address);
    await votingSystem.verifyVoter(voter2.address);

    // Create election
    const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const endTime = startTime + 86400; // 1 day after start
    const candidates = ["Alice", "Bob"];
    const metadataURI = "ipfs://QmTest";

    const tx = await votingSystem.createElection(
      "Test Election",
      "A test election",
      startTime,
      endTime,
      candidates,
      metadataURI
    );

    // Get the election ID from the transaction receipt
    const receipt = await tx.wait();
    const electionId = 1; // First election has ID 1

    // Verify voters are verified
    expect(await votingSystem.isVoterVerified(voter1.address)).to.be.true;
    expect(await votingSystem.isVoterVerified(voter2.address)).to.be.true;

    // Verify election exists
    const election = await votingSystem.getElection(electionId);
    expect(election.title).to.equal("Test Election");
  });
});
