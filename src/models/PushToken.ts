import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

interface PushTokenAttributes {
  deviceId: string;
  token: string;
  userId?: string;
}

class PushToken extends Model<PushTokenAttributes> implements PushTokenAttributes {
  public deviceId!: string;
  public token!: string;
  public userId!: string;
}

PushToken.init({
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'PushToken',
});

export default PushToken;
