// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ResumeUpload {
    string public name;
    uint256 public resumeCount = 0;
    mapping(uint256 => Resume) public resumes;

    struct Resume {
        uint256 id;
        string hash;
        string description;
        address payable author;
    }

    event ResumeCreated(
        uint256 id,
        string hash,
        string description,
        address payable author
    );

    constructor() {
        name = "ResumeUpload";
    }

    function uploadResume(string memory _imgHash, string memory _description)
        public
    {
        // Make sure the image hash exists
        require(bytes(_imgHash).length > 0);
        // Make sure image description exists
        require(bytes(_description).length > 0);
        // Make sure uploader address exists
        require(msg.sender != address(0));

        // Increment image id
        resumeCount++;

        // Add Image to the contract
        resumes[resumeCount] = Resume(
            resumeCount,
            _imgHash,
            _description,
            payable(msg.sender)
        );
        // Trigger an event
        emit ResumeCreated(
            resumeCount,
            _imgHash,
            _description,
            payable(msg.sender)
        );
    }
}
