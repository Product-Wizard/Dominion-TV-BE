import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'database',
  process.env.DB_USER || 'username',
  process.env.DB_PASSWORD || 'password',
  {
    logging: false,
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    dialect: process.env.DB_DIALECT as any,
    port: Number(process.env.DB_PORT),
  }
);

export default sequelize;
