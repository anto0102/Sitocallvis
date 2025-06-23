const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI; // Impostato su Netlify come variabile ambiente
const client = new MongoClient(uri);

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Metodo non consentito" }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Username e password obbligatori" }),
      };
    }

    await client.connect();
    const db = client.db("streamverse");
    const collection = db.collection("utenti");

    // Cerca per username o email
    const user = await collection.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user || user.password !== password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Credenziali non valide" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login effettuato", user: user.username }),
    };

  } catch (err) {
    console.error("Errore nel login:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Errore del server" }),
    };
  } finally {
    await client.close();
  }
};
