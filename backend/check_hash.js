const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = '$2b$10$HTpaXSAsLU7x.ckhvKF2o.jx9eV4g/caSeOVzpwcpkUhsVuMQvuwG';

bcrypt.compare(password, hash).then(result => {
    console.log(`Password '${password}' matches hash: ${result}`);
});
