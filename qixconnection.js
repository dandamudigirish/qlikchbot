const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const schema = require('enigma.js/schemas/12.20.0.json');
const engineHost = 'win-c90slbnm6t3';
const enginePort = 4747;
const appId = 'engineData';
const userDirectory = 'win-c90slbnm6t3';
const userId = 'sanjay';
const certificatesPath = './win-c90slbnm6t3';
const readCert = filename => fs.readFileSync(path.resolve(__dirname, certificatesPath, filename));
const appID = "dd283eb9-8702-4e9d-940e-3188c0ff28b5";

const session = enigma.create({
//const config = {
  schema,
  url: `wss://${engineHost}:${enginePort}/app/${appId}`,
  createSocket: url => new WebSocket(url, {
    ca: [readCert('root.pem')],
    key: readCert('client_key.pem'),
    cert: readCert('client.pem'),
    headers: {
      'X-Qlik-User': `UserDirectory=${encodeURIComponent(userDirectory)}; UserId=${encodeURIComponent(userId)}`,
    },
  }),
});

//module.exports = enigma.getService('qix', config).then((qix) => {
 // return qix.global.openApp(appID).then((app) => {
    //window.app = app;
    //return app;
  //});
//});

module.exports = session.open().then((global) => {
console.log('Session was opened successfully');
   return global.openDoc(appID).then((app) => {
    //window.app = app;
     return app;
   });
 });
