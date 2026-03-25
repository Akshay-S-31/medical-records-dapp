// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalRecordAccess {
    struct Record {
        uint256 recordId;
        address owner;
        string ipfsCID; // Off-chain storage pointer
        uint256 timestamp;
    }

    // Mapping from record ID to Record details
    mapping(uint256 => Record) private records;

    // Tracks authorized providers: patient => (provider => bool)
    mapping(address => mapping(address => bool)) private permissions;

    event AccessGranted(address indexed patient, address indexed provider);
    event AccessRevoked(address indexed patient, address indexed provider);

    // 1. Patient grants access to a specific provider
    function grantAccess(address _provider) public {
        permissions[msg.sender][_provider] = true;
        emit AccessGranted(msg.sender, _provider);
    }

    // Patient revokes access
    function revokeAccess(address _provider) public {
        permissions[msg.sender][_provider] = false;
        emit AccessRevoked(msg.sender, _provider);
    }

    // 2. Add a new encrypted record pointer to the ledger
    function addRecord(uint256 _recordId, string memory _ipfsCID) public {
        records[_recordId] = Record({
            recordId: _recordId,
            owner: msg.sender,
            ipfsCID: _ipfsCID,
            timestamp: block.timestamp
        });
    }

    // 3. Provider requests the off-chain data pointer
    function requestRecord(uint256 _recordId) public view returns (string memory) {
        Record memory rec = records[_recordId];
        require(rec.owner != address(0), "Record does not exist");

        // Cryptographic Access Verification
        bool isOwner = (msg.sender == rec.owner);
        bool isAuthorized = permissions[rec.owner][msg.sender];
        require(isOwner || isAuthorized, "ACCESS DENIED: Not authorized.");

        // Return only the hash pointer, provider must decrypt off-chain
        return rec.ipfsCID;
    }
}
