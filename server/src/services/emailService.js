import nodemailer from "nodemailer";
import fs from "fs-extra";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix __dirname issue
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (to, subject, templateName, replacements) => {
  try {
    console.log(`Sending email with template: ${templateName}`);

    if (!templateName) {
      throw new Error("Template name is missing!");
    }

    const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
    console.log(`Loading email template from: ${templatePath}`);

    const source = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);
    const html = template(replacements);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"DevConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html, // ✅ Send HTML content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.response}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// ✅ Ensure the function is exported correctly
export default sendEmail;
