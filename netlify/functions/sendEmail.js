const nodemailer = require("nodemailer");
const multiparty = require("multiparty");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    return new Promise((resolve, reject) => {
        const form = new multiparty.Form();

        form.parse(event, async (err, fields, files) => {
            if (err) {
                console.error("Error parsing form: ", err);
                return resolve({
                    statusCode: 400,
                    body: JSON.stringify({ error: "Invalid form data" }),
                });
            }

            try {
                const emails = fields.emails[0].split(",");
                const mensaje = fields.mensaje[0];

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

                return resolve({
                    statusCode: 200,
                    body: JSON.stringify({ message: "Emails enviadas correctamente!" }),
                });

            } catch (error) {
                console.error("Error al enviar el email:", error);
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message }),
                });
            }
        });
    });
};
