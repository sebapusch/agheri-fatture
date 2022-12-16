import { DataTypes } from 'sequelize';

const Nations = {
    DE: 'DE',
    CH: 'CH'
}

const modelDefiner = function(sequelize) {
    sequelize.define('invoice', {
        id: {
            primaryKey: true,
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
        },
        code: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        date: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        nation: {
            allowNull: false,
            type: DataTypes.TEXT,
            validate: {
                isIn: [Object.values(Nations)]
            }
        },
        exchangeRate: {
            allowNull: true,
            type: DataTypes.REAL
        },
        totalAmount: {
            allowNull: false,
            type: DataTypes.REAL
        },
        displayEuro: {
            allowNull: true,
            type: DataTypes.BOOLEAN
        }
    });
}

export { modelDefiner, Nations };