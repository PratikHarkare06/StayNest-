const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        let transporter;

        // Check if we have real credentials
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            // Fallback to Ethereal (Fake SMTP) for testing
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log("⚠️ No EMAIL_USER/PASS found. Using Ethereal Mock Mail.");
        }

        const message = {
            from: `${process.env.FROM_NAME || 'Wanderlust App'} <${process.env.FROM_EMAIL || 'noreply@wanderlust.com'}>`,
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(message);

        console.log("Message sent: %s", info.messageId);

        // If using Ethereal, log the preview URL
        if (!process.env.EMAIL_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

    } catch (error) {
        console.error("Email send failed:", error);
    }
};

module.exports = sendEmail;
