const nodemailer = require("nodemailer");

exports.handler = async (event) => {
    try {
        const formData = JSON.parse(event.body);

        const { emails, mensaje } = formData;

        if (!emails || emails.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No emails provided." }),
            };
        }

        // Configurazione SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Prepara e invia email
        const sendEmailPromises = emails.map((email) => {
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
<p>${mensaje}</p>
<p>Saludos.</p>`,
            });
        });

        await Promise.all(sendEmailPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Emails enviadas correctamente!" }),
        };

    } catch (error) {
        console.error("Error al enviar el email:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
