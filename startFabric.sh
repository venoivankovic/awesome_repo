#!/bin/bash
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"javascript"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ] ; then
	CC_SRC_PATH="../awesome_deploy/awesome_chaincode/go/"
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_SRC_PATH="../awesome_deploy/awesome_chaincode/javascript/"
elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
	CC_SRC_PATH="../awesome_deploy/awesome_chaincode/java"
elif [ "$CC_SRC_LANGUAGE" = "solidity" ]; then
	CC_SRC_PATH="../awesome_deploy/awesome_chaincode/solidity/"
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, java, javascript, and solidity
	exit 1
fi

# clean out any old identites in the wallets
rm -rf javascript/wallet/*
rm -rf java/wallet/*
rm -rf solidity/wallet/*
rm -rf go/wallet/*

# launch network; create channel and join peer to channel
pushd ../test-network
./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn awesome -ccv 1 -cci RegistrationContract:initLedger -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH} -ccep "OR('Org1MSP.peer','Org2MSP.peer')"
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

Next, use the Awesome applications to interact with the deployed Awesome contract.

Instructions for this are:

cd apiserver
./setupCommands.sh -- you can modify this file to setup any configuration of users you want, so number of customers, providers and witnesses
node apiserver.js

In new terminal tab:

cd awesome_webapp
node app 8081 (or any other free port)

navigate to localhost:8081 and open a new tab for each user you want to be ( so a tab for provider1, customer1, witness1 etc.)

EOF
