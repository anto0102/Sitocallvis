const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Debug utile: stampa variabili d’ambiente (può essere rimosso in produzione)
console.log("🌍 ENV:", JSON.stringify(process.env, null, 2));

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'sample_mflix'; // ✅ Corretto: il tuo vero nome del DB

let cachedClient = null;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Metodo non consentito' }),
    };
  }

  console.log("✅ MONGO_URI:", MONGO_URI);

  if (!MONGO_URI) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Variabile MONGO_URI non definita' }),
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

    if (!cachedClient) {
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      cachedClient = client;
    }

    const db = cachedClient.db(DB_NAME);
    const users = db.collection('users');

    const existing = await users.findOne({ email });

    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Email già registrata' }),
      };
    }

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
    console.error('❌ Errore registrazione:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Errore nella registrazione' }),
    };
  }
};
