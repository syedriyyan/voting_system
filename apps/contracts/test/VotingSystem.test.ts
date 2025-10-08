import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingSystem } from "../typechain-types";

describe("VotingSystem", function () {
  let votingSystem: VotingSystem;

  beforeEach(async function () {
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystem.deploy();
    await votingSystem.waitForDeployment();
  });

  it("Should grant admin role to deployer", async function () {
    const [owner] = await ethers.getSigners();
    const adminRole = await votingSystem.ADMIN_ROLE();
    expect(await votingSystem.hasRole(adminRole, owner.address)).to.be.true;
  });

  it("Should allow admin to create election", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const endTime = startTime + 86400; // 1 day after start
    const candidates = ["Alice", "Bob"];
    const metadataURI = "ipfs://QmTest";

    await expect(
      votingSystem.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        candidates,
        metadataURI
      )
    ).to.emit(votingSystem, "ElectionCreated");
  });

  it("Should prevent non-admin from creating election", async function () {
    const [_, nonAdmin] = await ethers.getSigners();
    const startTime = Math.floor(Date.now() / 1000) + 3600;
    const endTime = startTime + 86400;
    const candidates = ["Alice", "Bob"];
    const metadataURI = "ipfs://QmTest";

    await expect(
      votingSystem
        .connect(nonAdmin)
        .createElection(
          "Test Election",
          "A test election",
          startTime,
          endTime,
          candidates,
          metadataURI
        )
    ).to.be.reverted;
  });

  it("Should register and verify voters", async function () {
    const [admin, voter] = await ethers.getSigners();

    // Register voter
    await votingSystem.connect(voter).registerVoter("voter_hash");

    // Verify voter (admin action)
    await votingSystem.verifyVoter(voter.address);

    // Check if voter is verified
    expect(await votingSystem.isVoterVerified(voter.address)).to.be.true;
  });

  it("Should track election count correctly", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3600;
    const endTime = startTime + 86400;
    const candidates = ["Alice", "Bob"];
    const metadataURI = "ipfs://QmTest";

    // Initially should be 0
    expect(await votingSystem.getElectionCount()).to.equal(0);

    // Create first election
    await votingSystem.createElection(
      "Election 1",
      "First election",
      startTime,
      endTime,
      candidates,
      metadataURI
    );

    expect(await votingSystem.getElectionCount()).to.equal(1);

    // Create second election
    await votingSystem.createElection(
      "Election 2",
      "Second election",
      startTime + 1000,
      endTime + 1000,
      candidates,
      metadataURI
    );

    expect(await votingSystem.getElectionCount()).to.equal(2);
  });
});
