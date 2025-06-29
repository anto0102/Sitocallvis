// functions/verify-password.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Metodo non consentito' })
        };
    }

    let password = null; // <<< MODIFICA QUI: Inizializza 'password' a null
    try {
        console.log("Raw event body:", event.body); // Per debug, puoi rimuovere dopo
        const body = JSON.parse(event.body);
        console.log("Parsed body:", body); // Per debug, puoi rimuovere dopo
        
        // Verifica se 'body' esiste e ha la proprietà 'password'
        if (body && typeof body.password === 'string') {
            password = body.password;
        } else {
            // Se 'body' non è valido o manca la proprietà password, gestisci l'errore
            console.error("Il body della richiesta non contiene una proprietà 'password' valida.");
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Richiesta non valida: password mancante.' })
            };
        }
    } catch (error) {
        // Questo errore si verifica se il body della richiesta non è un JSON valido
        console.error("Errore nel parsing del body della richiesta:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: 'Richiesta non valida: formato JSON non corretto.' })
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

    // Ora 'password' è garantita essere una stringa (o null se c'è stato un errore prima)
    if (password === correctPassword) {
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
