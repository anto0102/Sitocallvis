// netlify/functions/register.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI; // es. mongodb+srv://utente:pass@cluster.mongodb.net/dbname
const DB_NAME = process.env.DB_NAME || 'streamverse';

let cachedClient = null;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Metodo non consentito' }),
    };
  }

  try {
    const { username, email, password } = JSON.parse(event.body);

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Tutti i campi sono obbligatori' }),
      };
    }

    // Connessione MongoDB
    if (!cachedClient) {
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      cachedClient = client;
    }

    const db = cachedClient.db(DB_NAME);
    const users = db.collection('users');

    // Controlla se l'utente esiste già
    const existing = await users.findOne({ email });

    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Email già registrata' }),
      };
    }

    // Crittografa la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea l’utente
    await users.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Registrazione completata' }),
    };
  } catch (err) {
    console.error('Errore registrazione:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Errore nella registrazione' }),
    };
  }
};
