"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class VideoMetadata extends sequelize_1.Model {
    videoId;
    lastStatus;
}
VideoMetadata.init({
    videoId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    lastStatus: {
        type: sequelize_1.DataTypes.STRING, // 'live', 'upcoming', 'none'
        allowNull: true,
    }
}, {
    sequelize: database_1.default,
    modelName: 'VideoMetadata',
});
exports.default = VideoMetadata;
