const Gun = require('gun');
const gun = Gun(['http://localhost:8765/gun']);

gun.get().map().on((data, key) => {
  console.log(`${key}:`, JSON.stringify(data));
}); 