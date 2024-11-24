import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Xử lý preflight request cho CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*'); // Cho phép mọi nguồn gốc
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, picUrl } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!username || !picUrl) {
    return res.status(400).json({ error: 'Username and picUrl are required.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Lấy danh sách người dùng
    const users = await sql('SELECT * FROM users WHERE username = $1', [username]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0]; // Lấy thông tin user đầu tiên

    // Cập nhật picUrl trong database
    await sql('UPDATE users SET picUrl = $1 WHERE username = $2', [picUrl, username]);

    // Trả về thông tin đã cập nhật
    return res.status(200).json({
      message: 'User picture updated successfully.',
      updatedUser: {
        ...user,
        picUrl,
      },
    });
  } catch (error) {
    console.error('Error updating user picture:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
