// functions/verify-password.js
exports.handler = async function(event, context) {
    // ... (parte iniziale del codice rimane invariata) ...

    const correctPassword = process.env.SITE_LOGIN_PASSWORD;

    if (!correctPassword) {
        console.error("Variabile d'ambiente SITE_LOGIN_PASSWORD non impostata!");
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Errore di configurazione del server.' })
        };
    }

    if (password === correctPassword) {
        // *** Rivedi attentamente questa riga! ***
        // Assicurati che il nome 'streamverse_auth' e il valore 'true' siano ESATTI.
        // Path=/ è fondamentale. Secure per HTTPS (Netlify). Max-Age per la durata.
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
        // ... (parte per password errata rimane invariata) ...
    }
};
