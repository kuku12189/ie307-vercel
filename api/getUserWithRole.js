import {neon} from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // Truy vấn thông tin user kèm role
    const result = await sql`
      SELECT 
        u.id AS user_id, 
        u.username, 
        u.password, 
        u.phone, 
        u.address, 
        u.picUrl, 
        u.sale, 
        r.rolename 
      FROM 
        users u
      LEFT JOIN 
        roles r 
      ON 
        u.id = r.userid
    `;

    // Trả kết quả về dưới dạng JSON
    res.status(200).json({
      success: true,
      data: result,
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
}
