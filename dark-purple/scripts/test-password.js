const bcrypt = require('bcryptjs');

const password = 'Admin123!';
const hash = '$2a$10$skY4MW449ZmEHHU7V0S0Iuoj8.1rfASVE2VXtHnQynYdILwlr02Qa';

bcrypt.compare(password, hash).then(result => {
  console.log('Password matches:', result);
  if (!result) {
    console.log('Testing if password needs to be hashed again...');
    bcrypt.hash(password, 10).then(newHash => {
      console.log('New hash would be:', newHash);
    });
  }
}).catch(err => {
  console.error('Error:', err);
});
