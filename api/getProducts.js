import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // Truy vấn dữ liệu từ bảng products
    const result = await sql`
      SELECT 
        id, 
        name, 
        description, 
        roasted, 
        imagelink_square, 
        imagelink_portrait, 
        ingredients, 
        special_ingredient, 
        prices, 
        average_rating, 
        ratings_count, 
        favourite, 
        type, 
        index
      FROM products
    `;

    // Trả kết quả về dưới dạng JSON
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching products:', error);

    // Xử lý lỗi
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: error.message,
    });
  }
}
