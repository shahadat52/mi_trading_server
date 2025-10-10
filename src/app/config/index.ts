import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database: process.env.DATABASE_URL,
  bcrypt_salt: process.env.BCRYPT_SALT_ROUND,
  default_pass: process.env.DEFAULT_PASS,
  secret_key: process.env.JWT_SECRET_KEY,
  refresh_key: process.env.JWT_REFRESH_TOKEN_SECRET,
  super_admin_pass: process.env.SUPER_ADMIN_PASS,
};
