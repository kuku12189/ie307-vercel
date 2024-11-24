import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, keepLogin, photo } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Kiểm tra trong danh sách người dùng (dummyAccounts không cần lưu trữ)
    const existingUser = await sql('SELECT * FROM users WHERE username = $1', [username]);

    if (existingUser.length > 0) {
      // Kiểm tra mật khẩu
      const user = existingUser[0];
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      // Trả về thông tin người dùng nếu đăng nhập thành công
      return res.status(200).json({
        username: user.username,
        password: user.password,
        phone: user.phone,
        address: user.address,
        picUrl: user.picurl,
        sale: user.sale,
        isKeepLogin: keepLogin,
      });
    }

    // Nếu đăng nhập với Google
    if (password === 'google') {
      const defaultPhoto =
        'https://thesapphirehalong.vn/wp-content/uploads/2022/10/avatar-bua-11.jpg';

      // Tạo người dùng mới
      const newUser = {
        username,
        password,
        phone: '',
        address: '',
        picUrl: photo || defaultPhoto,
        sale: 0,
      };

      await sql(
        'INSERT INTO users (username, password, phone, address, picUrl, sale) VALUES ($1, $2, $3, $4, $5, $6)',
        [newUser.username, newUser.password, newUser.phone, newUser.address, newUser.picUrl, newUser.sale]
      );

      return res.status(201).json({
        message: 'User registered via Google login.',
        password: user.password,
        username: newUser.username,
        phone: newUser.phone,
        address: newUser.address,
        picUrl: newUser.picUrl,
        sale: newUser.sale,
        isKeepLogin: keepLogin,
      });
    }

    // Nếu không tìm thấy tài khoản
    return res.status(401).json({ error: 'Invalid username or password.' });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
