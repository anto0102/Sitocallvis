const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'streamverse';

let cachedClient = null;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Metodo non consentito' }),
    };
  }

  // ✅ Log utile per capire se MONGO_URI è definito
  console.log("MONGO_URI:", MONGO_URI);

  if (!MONGO_URI) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Variabile MONGO_URI non definita nell\'ambiente' }),
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

    // ✅ Connessione a MongoDB
    if (!cachedClient) {
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      cachedClient = client;
    }

    const db = cachedClient.db(DB_NAME);
    const users = db.collection('users');

    // 🔁 Controlla se l'utente esiste già
    const existing = await users.findOne({ email });

    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Email già registrata' }),
      };
    }

    // 🔐 Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

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
