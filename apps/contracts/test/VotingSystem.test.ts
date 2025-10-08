import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingSystem } from "../typechain-types";

describe("VotingSystem", function () {
  let votingSystem: VotingSystem;

  beforeEach(async function () {
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystem.deploy();
    await votingSystem.deployed();
  });

  it("Should grant admin role to deployer", async function () {
    const [owner] = await ethers.getSigners();
    const adminRole = await votingSystem.ADMIN_ROLE();
    expect(await votingSystem.hasRole(adminRole, owner.address)).to.be.true;
  });

  it("Should allow admin to create election", async function () {
    const electionId = ethers.id("test-election");
    await expect(votingSystem.createElection(electionId, "Test Election"))
      .to.emit(votingSystem, "ElectionCreated")
      .withArgs(electionId, "Test Election");
  });

  it("Should prevent non-admin from creating election", async function () {
    const [_, nonAdmin] = await ethers.getSigners();
    const electionId = ethers.id("test-election");
    await expect(
      votingSystem.connect(nonAdmin).createElection(electionId, "Test Election")
    ).to.be.reverted;
  });
});
