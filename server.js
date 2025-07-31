const Gun = require('gun');
const express = require('express');
const app = express();

app.use(express.static('public'));

const server = app.listen(8765, () => {
  console.log('Server läuft auf http://localhost:8765');
});

Gun({
  web: server,
  peers: ['http://192.168.178.98:8765/gun'] // IP von PC A!
});
