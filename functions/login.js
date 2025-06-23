const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async function(event) {
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
    const db = client.db("sample_mflix");
    const users = db.collection("users");

    const user = await users.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Credenziali non valide" }),
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Credenziali non valide" }),
      };
    }

    const userData = {
      username: user.username,
      email: user.email,
      subscription: user.subscription || "Gratuito",
      joinDate: user.joinDate || new Date(user.createdAt || user._id.getTimestamp()).toISOString().split("T")[0]
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login effettuato", user: userData }),
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
