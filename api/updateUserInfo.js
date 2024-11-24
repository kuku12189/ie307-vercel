import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, phone, address, newPassword } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Kiểm tra người dùng trong bảng
    const existingUsers = await sql('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = existingUsers[0];

    // Chuẩn bị dữ liệu cập nhật
    const updatedPhone = phone || user.phone;
    const updatedAddress = address || user.address;
    const updatedPassword = newPassword && newPassword.trim() !== '' ? newPassword : user.password;

    // Cập nhật thông tin người dùng
    await sql(
      'UPDATE users SET phone = $1, address = $2, password = $3 WHERE username = $4',
      [updatedPhone, updatedAddress, updatedPassword, username]
    );

    return res.status(200).json({
      message: 'User updated successfully.',
      username,
      phone: updatedPhone,
      address: updatedAddress,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
