import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  const { email } = JSON.parse(event.body || '{}');

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email richiesta' })
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await resend.emails.send({
      from: 'Cinema Discovery <noreply@cinemadiscovery.it>',
      to: email,
      subject: 'Il tuo codice di accesso',
      html: `<p>Il tuo codice OTP è: <strong>${otp}</strong></p>`
    });

    // ✏️ Puoi salvare qui l'OTP nel localStorage lato utente o su un DB
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, otp }) // RIMUOVI `otp` in produzione!
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Errore invio email', details: e.message })
    };
  }
}
