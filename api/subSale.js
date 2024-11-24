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

  const { username, subSale } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!username || subSale === undefined) {
    console.log('Missing username or subSale');
    return res.status(400).json({ error: 'Username and subSale are required.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Lấy thông tin người dùng từ database
    const users = await sql('SELECT username, sale FROM users WHERE username = $1', [username]);

    // Debugging: Log kết quả truy vấn
    console.log('User data found:', users);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0]; // Lấy thông tin user đầu tiên
    const updatedSale = user.sale - subSale;

    // Cập nhật sale trong database
    await sql('UPDATE users SET sale = $1 WHERE username = $2', [updatedSale, username]);

    // Trả về thông tin đã cập nhật
    return res.status(200).json({
      message: 'User sale updated successfully.',
      updatedUser: {
        ...user,
        sale: updatedSale,
      },
    });
  } catch (error) {
    console.error('Error updating user sale:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
