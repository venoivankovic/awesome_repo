'use strict';

var {
  Gateway,
  Wallets
} = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

const getWalletPath = async (org) => {
  let walletPath;
  if (org == "Org1" || org == "org1") {
    walletPath = path.join(process.cwd(), 'wallet/org1');

  } else if (org == "Org2" || org == "org2") {
    walletPath = path.join(process.cwd(), 'wallet/org2');
  } else if (org == "Org3" || org == "org3") {
    walletPath = path.join(process.cwd(), 'wallet/org2');
  } else
    return null
  return walletPath
}

const isUserRegistered = async (username, userOrg) => {
  const walletPath = await getWalletPath(userOrg)
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  const userIdentity = await wallet.get(username);
  if (userIdentity) {
    console.log(`An identity for the user ${username} exists in the wallet`);
    return true
  }
  return false
}

const getCCP = async (org) => {
  let ccpPath;
  if (org == "Org1" || org == "org1") {
    ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');

  } else if (org == "Org2" || org == "org2" || org == "Org3" || org == "org3") {
    ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
  } else
    return null
  const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
  const ccp = JSON.parse(ccpJSON);
  //console.log(ccpJSON);
  /*fs.close(ccpPath, (err) => {
    if (err)
      console.error('Failed to close file', err);
    else {
      console.log("\n> File Closed successfully");
    }
  });*/
  return ccp
}

//exports.getRegisteredUser = getRegisteredUser

module.exports = {
  getCCP: getCCP,
  getWalletPath: getWalletPath,
  //  getRegisteredUser: getRegisteredUser,
  isUserRegistered: isUserRegistered,
  //  registerAndGerSecret: registerAndGerSecret

}
