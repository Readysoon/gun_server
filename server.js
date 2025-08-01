const Gun = require('gun');
const express = require('express');
const os = require('os');
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


const gun = Gun({
  web: server,
  radisk: true,
  localStorage: false,
  peers: ['http://192.168.178.115:8765/gun'] // IP von PC A!
});

console.log(`Gun has started`);



// 🎯 INTELLIGENTE RADATA LÖSUNG - Automatische Key-Extraktion!
// ===============================================================
// Diese Lösung:
// 1. 📁 Liest automatisch alle root keys aus radata/!
// 2. 🔄 Lädt sie beim Server-Start in die Datenbank
// 3. 📊 Zeigt Statistiken über geladene Daten
// 4. 📡 Triggert automatische Peer-Synchronisation
// 5. 🛡️ Hat Fallback für Fehlerbehandlung
// 6. ⚡ Arbeitet mit GUN's natürlichem Datenformat
// ===============================================================
const intelligentRadataReload = () => {
  console.log('🔄 Intelligente radata reload...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const radataFile = path.join(__dirname, 'radata', '!');
    if (!fs.existsSync(radataFile)) {
      console.log('❌ Keine radata gefunden');
      return;
    }
    
    // Lade und parse radata
    const rawData = fs.readFileSync(radataFile, 'utf8');
    const radataStructure = JSON.parse(rawData);
    
    // Extrahiere automatisch ALLE root keys (außer Metadaten)
    const rootKeys = Object.keys(radataStructure).filter(key => {
      return key !== '>' && key !== 'undefined' && !key.includes('\u001b');
    });
    
    console.log(`📋 Gefundene root keys: ${rootKeys.length}`);
    
    // Lade automatisch ALLE gefundenen keys
    let loadedCount = 0;
    rootKeys.forEach(key => {
      gun.get(key).once((data) => {
        if (data) {
          loadedCount++;
          console.log(`✅ Geladen: ${key}`);
        }
      });
    });
    
    // Warte kurz und zeige Statistik
    setTimeout(() => {
      console.log(`🎯 Radata reload: ${loadedCount}/${rootKeys.length} keys erfolgreich geladen`);
      
      // Automatische Peer-Synchronisation
      console.log('📡 Starte Peer-Sync...');
      rootKeys.forEach(key => {
        gun.get(key).on(() => {}); // Triggert Sync zu Peers
      });
      
    }, 1000);
    
  } catch (err) {
    console.log('❌ Radata reload fehler:', err.message);
    
    // Fallback: Bekannte keys laden
    console.log('🔄 Fallback: Lade bekannte keys...');
    ['shared/data', 'nachricht'].forEach(key => {
      gun.get(key).once(() => {});
    });
  }
  
  console.log('✅ Intelligente radata reload abgeschlossen!');
};

// Ausführung wenn GUN bereit ist
setTimeout(intelligentRadataReload, 2000);