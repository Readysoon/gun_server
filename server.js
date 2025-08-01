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

// Load data from radata-!-okh.tmp file
function loadFromTmpFile() {
  console.log('🔄 Loading data from radata-!-okh.tmp...');
  
  const tmpFilePath = path.join(__dirname, 'radata-!-okh.tmp');
  
  if (!fs.existsSync(tmpFilePath)) {
    console.log('❌ radata-!-okh.tmp file not found');
    return;
  }
  
  try {
    const rawData = fs.readFileSync(tmpFilePath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('✅ Successfully loaded data from tmp file');
    console.log('📊 Data structure:', Object.keys(data));
    
    return data;
  } catch (err) {
    console.log('❌ Error reading tmp file:', err.message);
    return null;
  }
}

// Initialize GUN with loaded data
const gun = Gun({
  web: server,
  chunk: Infinity,
  max: Infinity,
  until: Infinity,
  peers: ['http://192.168.178.115:8765/gun'] // IP von PC A!
});

// Load and inject data from tmp file
const loadedData = loadFromTmpFile();
if (loadedData) {
  console.log('🔄 Injecting data into GUN...');
  
  // Inject each node from the tmp file
  Object.keys(loadedData).forEach(nodeKey => {
    const nodeData = loadedData[nodeKey];
    console.log(`📥 Loading node: ${nodeKey}`);
    
    // Get the GUN reference for this node
    const gunNode = gun.get(nodeKey);
    
    // Extract the actual data (remove metadata)
    const cleanData = {};
    Object.keys(nodeData).forEach(key => {
      if (key !== '' && nodeData[key] && nodeData[key][':']) {
        cleanData[key] = nodeData[key][':'];
      }
    });
    
    // Put the data into GUN
    if (Object.keys(cleanData).length > 0) {
      gunNode.put(cleanData);
      console.log(`✅ Loaded data for ${nodeKey}:`, cleanData);
    }
  });
  
  console.log('✅ Data injection complete!');
}
