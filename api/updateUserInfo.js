import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, phone, address, newPassword } = req.body;

  if (!username || (!phone && !address && !newPassword)) {
    return res.status(400).json({ error: 'Username and at least one field to update are required.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Tìm người dùng trong cơ sở dữ liệu
    const existingUser = await sql('SELECT * FROM users WHERE username = $1', [username]);

    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = existingUser[0];
    const updatedPassword = newPassword && newPassword.trim() !== '' ? newPassword : user.password;
    const updatedPhone = phone || user.phone;
    const updatedAddress = address || user.address;

    // Cập nhật thông tin người dùng
    await sql(
      'UPDATE users SET password = $1, phone = $2, address = $3 WHERE username = $4',
      [updatedPassword, updatedPhone, updatedAddress, username]
    );

    return res.status(200).json({
      message: 'User information updated successfully.',
      username,
      phone: updatedPhone,
      address: updatedAddress,
    });
  } catch (error) {
    console.error('Error updating user information:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
