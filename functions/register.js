const { MongoClient } = require("mongodb");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Metodo non consentito" }),
    };
  }

  const { email, password } = JSON.parse(event.body);
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("streamverse");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (user) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email già registrata" }),
      };
    }

    await users.insertOne({ email, password });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Registrazione riuscita" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore interno" }),
    };
  } finally {
    await client.close();
  }
};
