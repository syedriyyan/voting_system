import { expect } from "chai";
import { ethers } from "hardhat";

describe("Integration Tests", function () {
  it("Should allow complete voting flow", async function () {
    // Deploy contracts
    const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
    const voterRegistry = await VoterRegistry.deploy();
    await voterRegistry.deployed();

    const ElectionFactory = await ethers.getContractFactory("ElectionFactory");
    const electionFactory = await ElectionFactory.deploy();
    await electionFactory.deployed();

    // Get signers
    const [admin, voter1, voter2] = await ethers.getSigners();

    // Register voters
    const voter1Hash = ethers.id("voter1");
    const voter2Hash = ethers.id("voter2");
    await voterRegistry.registerVoter(voter1.address, voter1Hash);
    await voterRegistry.registerVoter(voter2.address, voter2Hash);

    // Create election
    const electionId = ethers.id("test-election");
    await electionFactory.createElection(electionId);
    const electionAddress = await electionFactory.elections(electionId);
    const votingSystem = await ethers.getContractAt(
      "VotingSystem",
      electionAddress
    );

    // Cast votes
    const vote1 = ethers.hexlify(ethers.randomBytes(32));
    const vote2 = ethers.hexlify(ethers.randomBytes(32));

    await votingSystem.grantRole(
      await votingSystem.VOTER_ROLE(),
      voter1.address
    );
    await votingSystem.grantRole(
      await votingSystem.VOTER_ROLE(),
      voter2.address
    );

    await votingSystem.connect(voter1).castVote(electionId, vote1);
    await votingSystem.connect(voter2).castVote(electionId, vote2);

    // Verify votes are recorded
    expect(await votingSystem.hasVoted(electionId, voter1.address)).to.be.true;
    expect(await votingSystem.hasVoted(electionId, voter2.address)).to.be.true;
  });
});
