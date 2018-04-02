# INSTALLATION GUIDE

1. Download source code to the host machine
  ```
  > git clone https://github.com/captainviet/electionserver
  ```
2. Copy `options.js` file from template file
  ```
  > cp app/expose/options.js.template app/expose/options.js
  ```
3. Edit available API endpoints - `app/expose/options.js`
  ```
  app/expose/options.js
  registry = {
    candidate: {
      list: '/candidate/list/', // register endpoint /candidate/list/
    },
    vote: {
      list: '/vote/list/', // register endpoint /vote/list
      exists: '/vote/exists/:name',
    },
  }

  dev = {
    all: [{ // array of path-method pairs for environment dev-all (development - all)
      path: registry.candidate.list, // path extracted from registry (recommended)
      method: get,
    }],
  }

  prod = {
    vote: [{ // array of path-method pairs for environment prod-vote (production - vote)
      path: registry.candidate.list,
      method: get,
    }],
    chase: [{ // array of path-method pairs for environment prod-chase (production - chase)
      path: registry.vote.list,
      method: get,
    }],
  }
  ```
4. Copy `config.js` file from template file
  ```
  > cp app/config.js.template app/config.js
  ```
5. Edit server environment configuration - `app/config.js`
  ```
  app/config.js
  app: { // application-specific
    mongo: 'mongodb://username:password@host:port/', // mongodb URL - can be either cloud or local
    db: 'election', // name of the db
    port: 3000, // port number of the application
    expose: { // API endpoint exposure, refer to options.js for more details
      env: 'dev',
      domain: 'all',
    },
  },
  crypto: { // cryptography-specific
    privateKey: './privateKey', // path to the application private key
    publicKey: './publicKey', // path to the application public key
  },
  wp: {
    endpoint: 'http://vnntu.com/wp-json', // API endpoint of vnntu.com
    username: 'admin username',
    password: 'admin password',
    limit: 100, // API content limit (recommended 100)
  }
  ```
6. Install `node` dependencies
  ```
  npm install
  ```
7. Verify the application
  ```
  node index.js
  ```

# DEPLOYMENT GUIDE

1. Create a VM instance (**Ubuntu 14/16** *recommended*) on the cloud platform of choice: [Google Cloud](https://cloud.google.com) (*recommended*), AWS, Azure...
2. Install [git](https://gist.github.com/derhuerst/1b15ff4652a867391f03) (if not available)
3. Install [node](http://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/) (if not available)
2. Follow **Installation Guide** to install source code to the VM instance
3. Install process manager `pm2`
  ```
  npm i -g pm2
  ```
4. Go to the application folder and run the application as a process managed by `pm2`
  ```
  cd electionserver/
  pm2 start index.js --name election --watch .
  ```
5. Verify process running
  ```
  pm2 logs
  ```
6. [Configure `nginx` as reverse proxy](https://medium.com/@utkarsh_verma/configure-nginx-as-a-web-server-and-reverse-proxy-for-nodejs-application-on-aws-ubuntu-16-04-server-872922e21d38)

# *You're good to go!*
# *Good luck deploying Election Portal!*
