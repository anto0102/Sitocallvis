const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metodo non consentito' };
  }

  const { username, password } = JSON.parse(event.body);
  if (!username || !password) {
    return { statusCode: 400, body: 'Tutti i campi sono obbligatori' };
  }

  try {
    await client.connect();
    const db = client.db('streamverse');
    const users = db.collection('users');

    const user = await users.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Credenziali non valide' }),
      };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Credenziali non valide' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login riuscito', user: user.username }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
