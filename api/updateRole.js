import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { username, rolename } = req.body;

  if (!username || !rolename) {
    return res.status(400).json({ success: false, error: 'Username and Role are required' });
  }

  try {
    // Kiểm tra nếu người dùng có tồn tại
    const userResult = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;
    
    if (userResult.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userId = userResult[0].id;

    // Kiểm tra xem người dùng đã có vai trò hay chưa
    const roleResult = await sql`
      SELECT * FROM roles WHERE userid = ${userId}
    `;
    
    if (roleResult.length === 0) {
      // Nếu không có vai trò, thêm vai trò mới cho người dùng
      const insertResult = await sql`
        INSERT INTO roles (userid, rolename)
        VALUES (${userId}, ${rolename})
      `;

      if (insertResult.count === 0) {
        return res.status(500).json({ success: false, error: 'Role insert failed' });
      }
    } else {
      // Nếu đã có vai trò, cập nhật vai trò
      const updateResult = await sql`
        UPDATE roles
        SET rolename = ${rolename}
        WHERE userid = ${userId}
      `;

      if (updateResult.count === 0) {
        return res.status(500).json({ success: false, error: 'Role update failed' });
      }
    }

    // Trả kết quả thành công
    res.status(200).json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
  }
}
