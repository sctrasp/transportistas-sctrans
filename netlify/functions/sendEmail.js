const nodemailer = require("nodemailer");

exports.handler = async (event) => {
    try {
        console.log("== Inizio funzione sendEmail ==");

        const formData = JSON.parse(event.body);

        const { emails, mensaje } = formData;

        console.log("Emails ricevuti:", emails);
        console.log("Messaggio ricevuto:", mensaje);

        if (!emails || emails.length === 0) {
            console.log("Errore: Nessuna email fornita.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No emails provided." }),
            };
        }
        const messaggioFormattato = mensaje.replace(/\n/g, "<br>");
        // Debug SMTP config
        console.log("SMTP config:", {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS ? "*****" : "NOT SET",
        });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const sendEmailPromises = emails.map((email) => {
            console.log("Preparando invio a:", email);
            return transporter.sendMail({
                from: `"Sctrans 👋" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Cotización para Sctrans",
                text: `Buenas,

Estimado colaborador, necesito que me envíen un presupuesto para lo siguiente:

${mensaje}

Saludos.`,

                html: `<p>Buenas,</p>
<p>Estimado colaborador, necesito que me envíen un presupuesto para lo siguiente:</p>
<p>${messaggioFormattato}</p>
<p>Saludos.</p>`,
            });
        });

        await Promise.all(sendEmailPromises);

        console.log("✅ Tutte le email sono state inviate!");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Emails enviadas correctamente!" }),
        };

    } catch (error) {
        console.error("❌ Errore durante l'invio dell'email:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
