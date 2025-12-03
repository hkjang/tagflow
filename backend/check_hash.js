const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = '$2b$10$YQ98DpKaJWlY0kAmQCaveO7K7XqjW2WwY72JZ.RyGHJ8YnNVqhK4u';

bcrypt.compare(password, hash).then(result => {
    console.log(`Password '${password}' matches hash: ${result}`);
});
