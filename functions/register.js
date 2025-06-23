const { MongoClient } = require("mongodb");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Metodo non consentito" }),
    };
  }

  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Email e password sono obbligatori" }),
    };
  }

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("streamverse");
    const users = db.collection("users");

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email già registrata" }),
      };
    }

    // Salva password in chiaro (solo per test)
    await users.insertOne({ email, password });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Registrazione riuscita" }),
    };
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore interno al server" }),
    };
  } finally {
    await client.close();
  }
};
