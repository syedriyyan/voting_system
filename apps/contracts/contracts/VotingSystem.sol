// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

abstract contract Pausable {
    bool private _paused;
    event Paused(address account);
    event Unpaused(address account);

    constructor() {
        _paused = false;
    }

    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function _pause() internal whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function _unpause() internal whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

/**
 * @title VotingSystem
 * @dev Main contract for SecureVote - A privacy-preserving blockchain voting system
 * @notice This contract manages elections, voter registration, and vote casting
 */
contract VotingSystem is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ELECTION_COMMISSIONER_ROLE = keccak256("ELECTION_COMMISSIONER_ROLE");

    // Structs
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
        address creator;
        string[] candidateNames;
        mapping(uint256 => uint256) candidateVotes; // candidateId => voteCount
        mapping(address => bool) hasVoted;
        string metadataURI; // IPFS hash for additional election data
    }

    struct Voter {
        address voterAddress;
        string voterIdHash; // Hashed national ID
        bool isRegistered;
        bool isVerified;
        uint256 registrationTime;
    }

    struct Vote {
        uint256 electionId;
        bytes32 voteHash; // SHA-256 hash of encrypted vote
        uint256 timestamp;
        string encryptedVote; // RSA encrypted vote data
        bytes signature; // Voter's signature
    }

    // State variables
    uint256 private electionCounter;
    mapping(uint256 => Election) public elections;
    mapping(address => Voter) public voters;
    mapping(uint256 => Vote[]) private electionVotes; // electionId => Vote[]
    mapping(address => uint256[]) private voterElections; // voter => electionIds[]

    // Events
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime,
        address creator
    );
    
    event VoterRegistered(address indexed voter, string voterIdHash, uint256 timestamp);
    event VoterVerified(address indexed voter, address verifier);
    
    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        bytes32 voteHash,
        uint256 timestamp
    );
    
    event ElectionEnded(uint256 indexed electionId, uint256 totalVotes);
    event ElectionResultsPublished(uint256 indexed electionId);

    // Modifiers
    modifier onlyVerifiedVoter() {
        require(voters[msg.sender].isVerified, "Voter not verified");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCounter, "Election does not exist");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        require(block.timestamp >= election.startTime, "Election has not started");
        require(block.timestamp <= election.endTime, "Election has ended");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ELECTION_COMMISSIONER_ROLE, msg.sender);
    }

    // ==================== VOTER MANAGEMENT ====================

    /**
     * @notice Register a new voter
     * @param _voterIdHash Hashed national ID for privacy
     */
    function registerVoter(string memory _voterIdHash) external whenNotPaused {
        require(!voters[msg.sender].isRegistered, "Voter already registered");
        require(bytes(_voterIdHash).length > 0, "Invalid voter ID hash");

        voters[msg.sender] = Voter({
            voterAddress: msg.sender,
            voterIdHash: _voterIdHash,
            isRegistered: true,
            isVerified: false,
            registrationTime: block.timestamp
        });

        emit VoterRegistered(msg.sender, _voterIdHash, block.timestamp);
    }

    /**
     * @notice Verify a registered voter (only admins)
     * @param _voter Address of the voter to verify
     */
    function verifyVoter(address _voter) external onlyRole(ADMIN_ROLE) {
        require(voters[_voter].isRegistered, "Voter not registered");
        require(!voters[_voter].isVerified, "Voter already verified");

        voters[_voter].isVerified = true;
        emit VoterVerified(_voter, msg.sender);
    }

    /**
     * @notice Check if a voter is verified
     */
    function isVoterVerified(address _voter) external view returns (bool) {
        return voters[_voter].isVerified;
    }

    // ==================== ELECTION MANAGEMENT ====================

    /**
     * @notice Create a new election
     * @param _title Election title
     * @param _description Election description
     * @param _startTime Election start timestamp
     * @param _endTime Election end timestamp
     * @param _candidateNames Array of candidate names
     * @param _metadataURI IPFS URI for additional data
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string[] memory _candidateNames,
        string memory _metadataURI
    ) external onlyRole(ELECTION_COMMISSIONER_ROLE) whenNotPaused returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_candidateNames.length >= 2, "At least 2 candidates required");
        require(bytes(_title).length > 0, "Title cannot be empty");

        electionCounter++;
        uint256 newElectionId = electionCounter;

        Election storage newElection = elections[newElectionId];
        newElection.id = newElectionId;
        newElection.title = _title;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.isActive = true;
        newElection.totalVotes = 0;
        newElection.creator = msg.sender;
        newElection.metadataURI = _metadataURI;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            newElection.candidateNames.push(_candidateNames[i]);
        }

        emit ElectionCreated(newElectionId, _title, _startTime, _endTime, msg.sender);
        return newElectionId;
    }

    /**
     * @notice Get election details
     */
    function getElection(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            uint256 totalVotes,
            address creator,
            string[] memory candidateNames
        ) 
    {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive,
            election.totalVotes,
            election.creator,
            election.candidateNames
        );
    }

    /**
     * @notice End an election manually
     */
    function endElection(uint256 _electionId) 
        external 
        onlyRole(ELECTION_COMMISSIONER_ROLE) 
        electionExists(_electionId) 
    {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election already ended");
        
        election.isActive = false;
        emit ElectionEnded(_electionId, election.totalVotes);
    }

    // ==================== VOTING ====================

    /**
     * @notice Cast a vote in an election
     * @param _electionId Election ID
     * @param _candidateId Candidate ID (index)
     * @param _encryptedVote RSA encrypted vote data
     * @param _signature Voter's signature
     */
    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        string memory _encryptedVote,
        bytes memory _signature
    ) 
        external 
        onlyVerifiedVoter 
        electionExists(_electionId) 
        electionActive(_electionId)
        nonReentrant 
        whenNotPaused 
    {
        Election storage election = elections[_electionId];
        
        require(!election.hasVoted[msg.sender], "Already voted in this election");
        require(_candidateId < election.candidateNames.length, "Invalid candidate ID");
        require(bytes(_encryptedVote).length > 0, "Invalid encrypted vote");

        // Create vote hash for verification
        bytes32 voteHash = keccak256(abi.encodePacked(
            _electionId,
            msg.sender,
            _candidateId,
            block.timestamp
        ));

        // Store vote
        Vote memory newVote = Vote({
            electionId: _electionId,
            voteHash: voteHash,
            timestamp: block.timestamp,
            encryptedVote: _encryptedVote,
            signature: _signature
        });

        electionVotes[_electionId].push(newVote);
        
        // Update election state
        election.hasVoted[msg.sender] = true;
        election.candidateVotes[_candidateId]++;
        election.totalVotes++;
        
        // Track voter's elections
        voterElections[msg.sender].push(_electionId);

        emit VoteCast(_electionId, msg.sender, voteHash, block.timestamp);
    }

    /**
     * @notice Check if voter has voted in an election
     */
    function hasVoted(uint256 _electionId, address _voter) 
        external 
        view 
        electionExists(_electionId) 
        returns (bool) 
    {
        return elections[_electionId].hasVoted[_voter];
    }

    /**
     * @notice Get election results (only after election ends)
     */
    function getElectionResults(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (string[] memory candidateNames, uint256[] memory votes) 
    {
        Election storage election = elections[_electionId];
        require(!election.isActive || block.timestamp > election.endTime, 
            "Election still ongoing");

        uint256 candidateCount = election.candidateNames.length;
        candidateNames = new string[](candidateCount);
        votes = new uint256[](candidateCount);

        for (uint256 i = 0; i < candidateCount; i++) {
            candidateNames[i] = election.candidateNames[i];
            votes[i] = election.candidateVotes[i];
        }

        return (candidateNames, votes);
    }

    /**
     * @notice Get total number of elections
     */
    function getElectionCount() external view returns (uint256) {
        return electionCounter;
    }

    /**
     * @notice Get voter's election history
     */
    function getVoterElections(address _voter) external view returns (uint256[] memory) {
        return voterElections[_voter];
    }

    // ==================== ADMIN FUNCTIONS ====================

    /**
     * @notice Pause contract (emergency)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Grant election commissioner role
     */
    function addElectionCommissioner(address _commissioner) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        grantRole(ELECTION_COMMISSIONER_ROLE, _commissioner);
    }

    /**
     * @notice Revoke election commissioner role
     */
    function removeElectionCommissioner(address _commissioner) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        revokeRole(ELECTION_COMMISSIONER_ROLE, _commissioner);
    }
}