const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
    console.log(`Hash for '${password}': ${hash}`);
});
