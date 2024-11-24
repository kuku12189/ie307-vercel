import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Xử lý preflight request cho CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*'); // Cho phép mọi nguồn gốc
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Lấy thông tin người dùng từ database
    const users = await sql('SELECT username, password FROM users WHERE username = $1', [username]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0]; // Lấy thông tin user đầu tiên

    // Kiểm tra nếu mật khẩu là "google"
    if (user.password === 'google') {
      return res.status(200).json({
        message: 'SignIn with Google!',
      });
    }

    // Nếu không phải mật khẩu "google", trả về mật khẩu
    return res.status(200).json({
      message: `Mật khẩu là: ${user.password}`,
    });
  } catch (error) {
    console.error('Error processing forgotPassword:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
