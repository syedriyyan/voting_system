// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./libraries/CryptoLib.sol";

contract VoterRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Voter {
        bool isRegistered;
        bytes32 identityHash;
        address walletAddress;
    }

    mapping(address => Voter) public voters;
    mapping(bytes32 => bool) public usedIdentities;

    event VoterRegistered(address indexed voter, bytes32 identityHash);
    event VoterDeregistered(address indexed voter);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    function registerVoter(address voter, bytes32 identityHash) 
        external 
        onlyRole(REGISTRAR_ROLE) 
    {
        require(!voters[voter].isRegistered, "Voter already registered");
        require(!usedIdentities[identityHash], "Identity already registered");

        voters[voter] = Voter({
            isRegistered: true,
            identityHash: identityHash,
            walletAddress: voter
        });

        usedIdentities[identityHash] = true;
        emit VoterRegistered(voter, identityHash);
    }

    function deregisterVoter(address voter) 
        external 
        onlyRole(REGISTRAR_ROLE) 
    {
        require(voters[voter].isRegistered, "Voter not registered");

        bytes32 identityHash = voters[voter].identityHash;
        delete voters[voter];
        delete usedIdentities[identityHash];

        emit VoterDeregistered(voter);
    }

    function isVoterRegistered(address voter) external view returns (bool) {
        return voters[voter].isRegistered;
    }
}