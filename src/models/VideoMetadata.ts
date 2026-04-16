import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

interface VideoMetadataAttributes {
  videoId: string;
  lastStatus?: string;
}

class VideoMetadata extends Model<VideoMetadataAttributes> implements VideoMetadataAttributes {
  public videoId!: string;
  public lastStatus!: string;
}

VideoMetadata.init({
  videoId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  lastStatus: {
    type: DataTypes.STRING, // 'live', 'upcoming', 'none'
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'VideoMetadata',
});

export default VideoMetadata;
