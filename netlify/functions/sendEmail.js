const nodemailer = require("nodemailer");
const multiparty = require("multiparty");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();

    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return resolve({ statusCode: 500, body: "Error parsing form data." });
      }

      const transportistas = JSON.parse(fields.transportistas[0]);
      const mensaje = fields.mensaje[0];

      // Configurazione SMTP (usa le ENV variables di Netlify)
      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true", // SSL/TLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Leggi il file allegato (se presente)
      let attachments = [];
      if (files.allegato && files.allegato[0].originalFilename) {
        attachments.push({
          filename: files.allegato[0].originalFilename,
          path: files.allegato[0].path,
        });
      }

      try {
        // Invia una mail per ogni transportista
        for (const transportista of transportistas) {
          await transporter.sendMail({
            from: `"Sctrans" <${process.env.SMTP_USER}>`,
            to: transportista.email,
            subject: "Cotización para Sctrans",
            text: `Buenas ${transportista.nombre},\n\nEstimado colaborador, necesito que me envíen un presupuesto para lo siguiente:\n\n${mensaje}\n\nSaludos.`,
            attachments: attachments,
          });
          console.log(`✅ Email enviado a: ${transportista.email}`);
        }

        return resolve({
          statusCode: 200,
          body: "Emails enviados correctamente!",
        });
      } catch (error) {
        console.error("Error enviando emails:", error);
        return resolve({
          statusCode: 500,
          body: "Error enviando emails.",
        });
      }
    });
  });
};
