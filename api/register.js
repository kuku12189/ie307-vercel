import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
      const sql = neon(process.env.DATABASE_URL);
      
      // Kiểm tra xem username đã tồn tại chưa
      const existingUser = await sql('SELECT * FROM users WHERE username = $1', [username]);

      if (existingUser.length > 0) {
        return res.status(409).json({ error: 'Username already exists.' });
      }

      // Thêm người dùng mới vào database
      await sql(
        'INSERT INTO users (username, password, phone, address, picUrl, sale) VALUES ($1, $2, $3, $4, $5, $6)', 
        [username, password, '', '', 'https://thesapphirehalong.vn/wp-content/uploads/2022/10/avatar-bua-11.jpg', 0]
      );

      return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('Error during registration:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}
