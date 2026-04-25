const bcrypt = require('bcryptjs');

const hash = '$2b$10$Y.LgHKJ7NHAuzd8Ff0MGXu4eou4xKPD1GqOwemotcccCUxRnY9e3e';
const password = 'Admin@123';

async function check() {
  const isValid = await bcrypt.compare(password, hash);
  console.log('Is valid:', isValid);
}

check();
