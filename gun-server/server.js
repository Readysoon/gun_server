const Gun = require('gun');
const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost'; // fallback
}

const myIP = getLocalIP();
console.log('My IP address:', myIP);

const server = app.listen(8765, '0.0.0.0', () => {
  console.log(`Server läuft auf http://${myIP}:8765`);
});

// Initialize GUN with loaded data
const gun = Gun({
  web: server,
  file: 'data.json', 
  peers: ['http://192.168.178.115:8765/gun'] // IP von PC A!
});