import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

// Cấu hình transporter của nodemailer với thông số tương tự từ Spring Boot
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,  // Sử dụng biến môi trường cho thông tin bảo mật
    pass: process.env.SMTP_PASS,
  },
});

export default async function sendMail(req, res) {
  if (req.method === 'POST') {
    const { to, subject, text } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!to || !text) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, or text' });
    }

    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const templatePath = path.join(process.cwd(), 'templates', 'pwTemplate.html');
      const template = fs.readFileSync(templatePath, 'utf8');

      const htmlContent = template
        .replace('[username]', to)
        .replace('[email]', text);

      const mailOptions = {
        from: '"Coffee Shop Support" <coffee_app@pmquoc.org>',
        to: to,
        subject: subject || 'Coffee Shop - Password Recovery',
        html: htmlContent,
      };

      // Sử dụng async/await để gửi email
      const info = await transporter.sendMail(mailOptions);

      // Gửi phản hồi nếu thành công
      res.status(200).json({ message: 'Email sent: ' + info.response });
    } catch (error) {
      // Xử lý lỗi nếu có
      res.status(500).json({ error: 'Error processing email: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
