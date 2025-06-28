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
        // *** AGGIUNTA QUI: Imposta il cookie di autenticazione ***
        // Max-Age: Durata del cookie in secondi (es. 1 ora = 3600, 1 giorno = 86400)
        // Path: Il percorso per cui il cookie è valido. '/' lo rende valido per tutto il sito.
        // HttpOnly: Imposta a true per maggiore sicurezza (non accessibile da JavaScript client-side).
        //           Tuttavia, per la verifica lato client nel nostro caso, lo lasciamo false.
        // Secure: Imposta a true se il tuo sito usa HTTPS (raccomandato per Netlify).
        // SameSite: 'Lax' o 'Strict' per prevenire attacchi CSRF.
        const cookieHeader = `streamverse_auth=true; Max-Age=${86400 * 7}; Path=/; Secure; SameSite=Lax`; // Cookie valido per 7 giorni

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': cookieHeader,
                'Content-Type': 'application/json' // Assicurati che questo sia presente
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
