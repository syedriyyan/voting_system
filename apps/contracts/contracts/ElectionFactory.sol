// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VotingSystem.sol";

contract ElectionFactory is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    event ElectionCreated(address votingSystem, bytes32 electionId);
    
    mapping(bytes32 => address) public elections;
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    function createElection(bytes32 electionId) external onlyRole(ADMIN_ROLE) {
        require(elections[electionId] == address(0), "Election already exists");
        
        VotingSystem newElection = new VotingSystem();
        elections[electionId] = address(newElection);
        
        emit ElectionCreated(address(newElection), electionId);
    }
}