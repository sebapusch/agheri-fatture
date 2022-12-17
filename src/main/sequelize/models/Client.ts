import { DataTypes, Sequelize } from 'sequelize';
import { Nations } from './Invoice';

export default function (sequelize: Sequelize) {
  sequelize.define('client', {
    id: {
      primaryKey: true,
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
        allowNull: false,
        type: DataTypes.TEXT,
        unique: true
    },
    holder: {
        type: DataTypes.TEXT
    },
    address: {
        type: DataTypes.TEXT
    },
    zipcode: {
        type: DataTypes.TEXT
    },
    city: {
        type: DataTypes.TEXT
    },
    state: {
        allowNull: false,
        type: DataTypes.TEXT,
        validate: {
            isIn: [Object.values(Nations)],
        }
    },
    piva: {
        type: DataTypes.TEXT
    }
  });
}