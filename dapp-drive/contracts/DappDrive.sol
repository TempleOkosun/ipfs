// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;


contract DappDrive {

    // A struct that contains the information of file uploaded
    struct File{
        string hash;
        string fileName;
        string fileType;
        uint date;
    }

    // A mapping of addresses and the file they contain
    mapping(address => File[]) files; // Every address will contain an array of files

    function add(string memory _hash, string memory _fileName, string memory _fileType, uint _date) public {
        files[msg.sender].push(File({hash: _hash, fileName: _fileName, fileType: _fileType, date: _date}));
    }

    function getFile(uint _index) public view returns (string memory, string memory, string memory, uint){
        File memory file = files[msg.sender][_index];
        return (file.hash, file.fileName, file.fileType, file.date);
    }

    function getLength() public view returns(uint) {
        return files[msg.sender].length;
    }



}

