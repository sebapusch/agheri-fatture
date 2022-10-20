import { DataTypes } from 'sequelize';

const ServiceTypes = {
    FLAT: 'flat',
    HOUR: 'hour',
    LINE: 'line',
    MIN: 'min',
}

const modelDefiner = function (sequelize) {
    sequelize.define('service', {
        id: {
            primaryKey: true,
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        type: {
            allowNull: false,
            type: DataTypes.TEXT,
            validate: {
                isIn: [Object.values(ServiceTypes)]
            }
        },
        quantity: {
            allowNull: true,
            type: DataTypes.INTEGER,
        },
        price: {
            allowNull: false,
            type: DataTypes.REAL
        },
        totalAmount: {
            allowNull: false,
            type: DataTypes.REAL
        },
    });
}

export { modelDefiner, ServiceTypes };