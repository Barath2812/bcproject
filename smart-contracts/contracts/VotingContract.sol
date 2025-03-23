// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract VotingContract is Ownable, ReentrancyGuard {
    struct Candidate {
        string name;
        uint256 voteCount;
        bool exists;
    }

    struct Election {
        string title;
        uint256 startTime;
        uint256 endTime;
        bool exists;
        bool isActive;
        uint256 candidateCount;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public electionCount;

    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address voter);
    event ElectionEnded(uint256 indexed electionId);

    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }

    modifier hasNotVoted(uint256 _electionId) {
        require(!hasVoted[_electionId][msg.sender], "Already voted");
        _;
    }

    function createElection(
        string memory _title,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        uint256 electionId = electionCount++;
        elections[electionId] = Election({
            title: _title,
            startTime: _startTime,
            endTime: _endTime,
            exists: true,
            isActive: false,
            candidateCount: 0
        });

        emit ElectionCreated(electionId, _title, _startTime, _endTime);
    }

    function addCandidate(uint256 _electionId, string memory _name) external onlyOwner electionExists(_electionId) {
        Election storage election = elections[_electionId];
        uint256 candidateId = election.candidateCount++;
        
        candidates[_electionId][candidateId] = Candidate({
            name: _name,
            voteCount: 0,
            exists: true
        });

        emit CandidateAdded(_electionId, candidateId, _name);
    }

    function startElection(uint256 _electionId) external onlyOwner electionExists(_electionId) {
        Election storage election = elections[_electionId];
        require(!election.isActive, "Election is already active");
        require(block.timestamp >= election.startTime, "Cannot start before scheduled time");
        
        election.isActive = true;
    }

    function vote(uint256 _electionId, uint256 _candidateId) 
        external 
        nonReentrant 
        electionExists(_electionId) 
        electionActive(_electionId) 
        hasNotVoted(_electionId) 
    {
        require(candidates[_electionId][_candidateId].exists, "Candidate does not exist");

        candidates[_electionId][_candidateId].voteCount++;
        hasVoted[_electionId][msg.sender] = true;

        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    function endElection(uint256 _electionId) external onlyOwner electionExists(_electionId) {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        require(block.timestamp >= election.endTime, "Cannot end before scheduled time");

        election.isActive = false;
        emit ElectionEnded(_electionId);
    }

    function getElectionDetails(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (
            string memory title,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            uint256 candidateCount
        ) 
    {
        Election storage election = elections[_electionId];
        return (
            election.title,
            election.startTime,
            election.endTime,
            election.isActive,
            election.candidateCount
        );
    }

    function getCandidateDetails(uint256 _electionId, uint256 _candidateId) 
        external 
        view 
        electionExists(_electionId) 
        returns (string memory name, uint256 voteCount) 
    {
        Candidate storage candidate = candidates[_electionId][_candidateId];
        require(candidate.exists, "Candidate does not exist");
        return (candidate.name, candidate.voteCount);
    }

    function getResults(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (uint256[] memory) 
    {
        Election storage election = elections[_electionId];
        uint256[] memory results = new uint256[](election.candidateCount);
        
        for (uint256 i = 0; i < election.candidateCount; i++) {
            results[i] = candidates[_electionId][i].voteCount;
        }
        
        return results;
    }
} 