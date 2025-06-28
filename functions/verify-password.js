// functions/verify-password.js
exports.handler = async function(event, context) {
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

    const correctPassword = process.env.SITE_LOGIN_PASSWORD;

    if (!correctPassword) {
        console.error("Variabile d'ambiente SITE_LOGIN_PASSWORD non impostata!");
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Errore di configurazione del server.' })
        };
    }

    if (password === correctPassword) {
        // *** IMPORTANTE: Imposta il cookie di autenticazione esattamente come specificato nel netlify.toml ***
        // Max-Age: Durata del cookie in secondi (es. 7 giorni = 604800)
        // Path: Il percorso per cui il cookie è valido. '/' lo rende valido per tutto il sito.
        // Secure: Imposta a true se il tuo sito usa HTTPS (Netlify lo fa di default).
        // SameSite: 'Lax' o 'Strict' per prevenire attacchi CSRF.
        const cookieHeader = `streamverse_auth=true; Max-Age=604800; Path=/; Secure; SameSite=Lax`; 

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': cookieHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: true, message: 'Accesso riuscito!' })
        };
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify({ success: false, message: 'Password errata.' })
        };
    }
};
