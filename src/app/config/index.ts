import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database: process.env.DATABASE_URL,
  bcrypt_salt: process.env.BCRYPT_SALT_ROUND,
  default_pass: process.env.DEFAULT_PASS,
  secret_key: process.env.JWT_ACCESS_SECRET_KEY,
  refresh_key: process.env.JWT_REFRESH_SECRET_KEY,
  jwt_expireIn: process.env.JWT_EXPIRES_IN,
  refresh_token_expireIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  super_admin_pass: process.env.SUPER_ADMIN_PASS,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
