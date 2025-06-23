const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metodo non consentito' };
  }

  const { username, email, password } = JSON.parse(event.body);
  if (!username || !email || !password) {
    return { statusCode: 400, body: 'Tutti i campi sono obbligatori' };
  }

  try {
    await client.connect();
    const db = client.db('streamverse');
    const users = db.collection('users');

    const existing = await users.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Email o username già in uso' }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({ username, email, password: hashedPassword });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Registrazione completata' }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
