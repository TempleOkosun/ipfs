// Required imports
import React from "react";
import { useState, useEffect } from "react";
import { StyledDropZone } from 'react-drop-zone';
import "react-drop-zone/dist/styles.css";
import { FileIcon, defaultStyles } from 'react-file-icon';
import "bootstrap/dist/css/bootstrap.css";
import { Table } from 'reactstrap';
import getWeb3 from "../utils/getWeb3";
import fileReaderPullStream from "pull-file-reader";
import ipfs from '../utils/ipfs';
import Moment from "react-moment";
import {web3SetUp} from '../utils/web3SetUp';
import DappDriveContract from "../contracts/DappDrive.json";


export function Home() {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [contract, setContract] = useState(null);
    const [dappDriveFiles, setDappDriveFiles] = [];

    const web3SetUp = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = DappDriveContract.networks[networkId];
            const instance = await new web3.eth.Contract(DappDriveContract.abi,deployedNetwork && deployedNetwork.address
            );

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            setWeb3(web3);
            setAccounts(accounts);
            setContract(instance);
            await getFiles();

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.error(error);
        }
    };


    const getFiles = async () => {
        try {
            let filesLength = await contract.methods.getLength().call({ from: accounts[0] });
            let files = [];
            for (let i = 0; i < filesLength; i++) {
                let file = await contract.methods.getFile(i).call({ from: accounts[0] });
                files.push(file);
            }
            setDappDriveFiles(...dappDriveFiles, files);
        } catch (error) {
            console.log(error);
        }
    };


    const onDrop = async (file) => {
        try {
            const stream = fileReaderPullStream(file);
            const result = await ipfs.add(stream);
            const timestamp = Math.round(+new Date() / 1000);
            const type = file.name.substr(file.name.lastIndexOf(".")+1);
            let uploaded = await contract.methods.add(result[0].hash, file.name, type, timestamp).send({from: accounts[0], gas: 300000})
            console.log(uploaded);
            await getFiles();
        } catch (error) {
            console.log(error);
        }
    };

    if (!web3) {
        return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
        <div className="container pt-3">
            <StyledDropZone onDrop={onDrop} />
            <Table>
                <thead>
                <tr>
                    <th width="7%" scope="row">
                        Type
                    </th>
                    <th className="text-left">File Name</th>
                    <th className="text-right">Date</th>
                </tr>
                </thead>
                <tbody>
                {dappDriveFiles !== [] ? dappDriveFiles.map((item, key)=>(
                    <tr>
                        <th>
                            <FileIcon
                                size={30}
                                extension={item[2]}
                                {...defaultStyles[item[2]]}
                            />
                        </th>
                        <th className="text-left"><a href={"https://gateway.ipfs.io/ipfs/"+item[0]}>{item[1]}</a></th>
                        <th className="text-right">
                            <Moment format="YYYY/MM/DD" unix>{item[3]}</Moment>
                        </th>
                    </tr>
                )) : null}
                </tbody>
            </Table>
        </div>
    );




}
