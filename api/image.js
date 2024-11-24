import multer from 'multer';
import cloudinary from 'cloudinary';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình Multer để sử dụng bộ nhớ tạm
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Hàm tải tệp lên Cloudinary dưới dạng bất đồng bộ
const uploadFile = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder,
    });

    return {
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
    };
  } catch (error) {
    throw new Error('Error uploading to Cloudinary: ' + error.message);
  }
}

export default async function upImage(req, res) {
  if (req.method === 'POST') {
    // Sử dụng async/await cho Multer upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Error in file upload: ' + err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        const file = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`; // Chuyển buffer thành base64
        const folder = 'rn72'; // Tên folder trong Cloudinary

        // Gửi ảnh lên Cloudinary
        const result = await uploadFile(file, folder);

        if (result) {
          return res.status(200).json({
            secureUrl: result.secure_url,
            url: result.url,
            public_id: result.public_id,
          });
        }

        return res.status(500).json({ error: 'Failed to upload file' });
      } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
