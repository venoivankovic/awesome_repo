# awesome_app

Follow these instructions to use the project (tested on my machine, Ubuntu 18.04).

1. Get HyperLedger Fabric prerequisites: https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html
   
   These include docker, docker-compose, cURL and Git for Linux. You probably already have most, if not all of these.

2. Install the Fabric binaries and samples https://hyperledger-fabric.readthedocs.io/en/latest/install.html.
    
   This will add a fabric-samples folder to your machine in the directory you are installing. 
   The Fabric samples are a collection of Fabric sample projects. They can be found here:         https://github.com/hyperledger/fabric-samples

3. Make sure you have these Fabric Node SDK requirements: https://github.com/hyperledger/fabric-sdk-node#build-and-test. 

  * Node.js, version 10 is supported from 10.15.3 and higher
  * Node.js, version 12 is supported from 12.13.1 and higher
  
  I use node version 12.18.1
  Check node version with command:
  ```
  node -v
  ```
  
  * npm tool version 6 or higher
  
  I use node version 6.14.5
  Check node version with command:
  ```
  npm -v
  ```
  
  * docker - Should already be installed from step 2.

4. Clone this repository https://github.com/venoivankovic/awesome_app into the Fabric samples folder.

5. Change directory to the awesome directory you cloned into the Fabric samples folder:

   ```
   cd awesome
   ```
6. Change into the apiserver directory:

   ```
   cd apiserver
   ```
   
7. From here you install the node dependencies, run command:

   ```
   npm install
   ```
   Repeat this with awesome_webapp directory:
   
   ```
   cd awesome_webapp
   ```
   
   ```
   npm install
   ```
   You will only need to install node modules once.
   
8. Run script startFabric.sh from top level awesome_app directory:

   ```
   ./startFabric.sh
   ```
9. Once this has finished cd into the apiserver directory:

   ```
   cd apiserver
   ```
   Then run the setupCommands.sh script. This will register 3 providers, 3 customers and 5 witnesses on the DApp. You can edit this file as you wish.
   
   ```
   ./setupCommands.sh
   ```
   After this you can run the apiserver.js file. This will start the API server on port 8080.
   
   ```
   node apiserver.js
   ```
 10. Then simply start the gui component, here it is on port 8081, choose any free port.

   ```
   cd awesome_webapp
   ``` 
   ```
   node app 8081
   ```
 11. To use the DApp navigate to http://localhost:8081/. For each user open a new tab.
