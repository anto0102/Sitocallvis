// functions/verify-password.js
exports.handler = async function(event, context) {
    // Solo le richieste POST sono accettate per il login
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Metodo non consentito' })
        };
    }

    let password;
    try {
        const body = JSON.parse(event.body);
        password = body.password;
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Richiesta non valida' })
        };
    }

    // Recupera la password segreta dalle variabili d'ambiente di Netlify
    // !!! ASSICURATI DI IMPOSTARE QUESTA VARIABILE SU NETLIFY !!!
    const correctPassword = process.env.SITE_LOGIN_PASSWORD;

    if (!correctPassword) {
        console.error("Variabile d'ambiente SITE_LOGIN_PASSWORD non impostata!");
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Errore di configurazione del server.' })
        };
    }

    if (password === correctPassword) {
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Accesso riuscito!' })
        };
    } else {
        return {
            statusCode: 401, // Unauthorized
            body: JSON.stringify({ success: false, message: 'Password errata.' })
        };
    }
};
