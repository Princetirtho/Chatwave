const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, defaultValue: 'User' },
  status: { type: DataTypes.STRING, defaultValue: 'Available' },
  avatar: { type: DataTypes.STRING, defaultValue: '👤' },
  publicKey: { type: DataTypes.TEXT },
  privateKey: { type: DataTypes.TEXT },
  lastSeen: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  senderId: { type: DataTypes.UUID, allowNull: false },
  receiverId: { type: DataTypes.UUID, allowNull: false },
  text: { type: DataTypes.TEXT },
  fileUrl: { type: DataTypes.STRING },
  fileType: { type: DataTypes.STRING },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Device = sequelize.define('Device', {
  id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  deviceId: { type: DataTypes.STRING, allowNull: false },
  deviceName: { type: DataTypes.STRING },
  lastActive: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'receivedMessages', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

User.hasMany(Device, { foreignKey: 'userId' });
Device.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Message, Device };
