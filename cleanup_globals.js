const fs = require('fs');
const path = require('path');

const files = ['find_popup.js', 'find_globally.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

try {
  fs.unlinkSync(__filename);
} catch (e) {}
