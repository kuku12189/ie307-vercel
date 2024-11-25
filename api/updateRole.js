import {neon} from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {username, rolename} = req.body; // Lấy username và rolename từ request body

    if (!username || !rolename) {
      return res.status(400).json({
        success: false,
        error: 'Username and rolename are required',
      });
    }

    try {
      // Cập nhật role cho user dựa trên username
      const result = await sql`
        UPDATE roles 
        SET rolename = ${rolename} 
        WHERE userid = (SELECT id FROM users WHERE username = ${username});
      `;

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found or role update failed',
        });
      }

      res.status(200).json({
        success: true,
        message: `Role updated to ${rolename} for user ${username}`,
        data: result[0],
      });
    } catch (error) {
      console.error('Error:', error);

      // Xử lý lỗi
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  } else {
    // Xử lý nếu method không phải là POST
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }
}
