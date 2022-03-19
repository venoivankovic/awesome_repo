/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
  Wallets,
	Gateway
} = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const {
  buildCAClient,
  registerAndEnrollUser
} = require('./util/CAUtil.js');
const {
  buildCCPOrg1,
  buildCCPOrg2,
  buildWallet
} = require('./util/AppUtil.js');
const helper = require('./util/helper')

const mspOrg1 = 'Org1MSP';
const mspOrg2 = 'Org2MSP';

async function connectToOrg1CA(UserID, org) {
  console.log('\n--> Register and enrolling new user');
  const ccpOrg1 = buildCCPOrg1();
  const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca.org1.example.com');

  const walletPathOrg1 = path.join(__dirname, 'wallet/org1');
  const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

  await registerAndEnrollUser(caOrg1Client, walletOrg1, mspOrg1, UserID, 'org1.department1');
  addToPool(UserID, org);

}

async function connectToOrg2CA(UserID, org) {
  console.log('\n--> Register and enrolling new user');
  const ccpOrg2 = buildCCPOrg2();
  const caOrg2Client = buildCAClient(FabricCAServices, ccpOrg2, 'ca.org2.example.com');

  const walletPathOrg2 = path.join(__dirname, 'wallet/org2');
  const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);

  await registerAndEnrollUser(caOrg2Client, walletOrg2, mspOrg2, UserID, 'org2.department1');

  //add to witness pool here!
  console.log(org);
  console.log(UserID);
    addToPool(UserID, org);
}

async function addToPool(username, orgname) {
  //console.log("hi");
  let ccp = await helper.getCCP(orgname);
  let walletPath = await helper.getWalletPath(orgname);
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);
  const identity = await wallet.get(username);
  if (!identity) {
    console.log('An identity for the user does not exist in the wallet');
    console.log('Run the registerUser.js application before retrying');
    return;
  }
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: username,
    discovery: {
      enabled: true,
      asLocalhost: true
    }
  });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('awesome');
  let result;
  let identifier;
  let message;
  if (orgname === 'Org3' || orgname === 'org3') {
    result = await contract.submitTransaction("RegistrationContract:registerWitness");
    message = `Successfully registered witness`;
  } else if (orgname === 'Org2' || orgname === 'org2') {
    console.log("here");
    result = await contract.submitTransaction("RegistrationContract:registerCustomer");
    message = `Successfully registered customer`;
  } else if (orgname === 'Org1' || orgname === 'org1'){
    console.log("here");
    result = await contract.submitTransaction("RegistrationContract:registerProvider");
    message = `Successfully registered provider`;
  }
	await gateway.disconnect();
}

async function main() {

  if (process.argv[2] === undefined && process.argv[3] === undefined) {
    console.log('Usage: node registerEnrollUser.js org userID');
    process.exit(1);
  }

  const org = process.argv[2];
  const userId = process.argv[3];

  try {

    if (org === 'Org1' || org === 'org1') {
      await connectToOrg1CA(userId, org);
    } else if (org === 'Org2' || org === 'org2' || org === 'Org3' || org === 'org3') {
      await connectToOrg2CA(userId, org);
    } else {
      console.log('Usage: node registerEnrollUser.js org userID');
      console.log('Org must be Org1, Org2 org org3');
    }
  } catch (error) {
    console.error(`Error in enrolling admin: ${error}`);
    process.exit(1);
  }
}

main();
