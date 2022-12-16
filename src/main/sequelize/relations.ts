import { Sequelize } from 'sequelize';

export default function(sequelize: Sequelize) {
	const { client, invoice, service } = sequelize.models;

	client.hasMany(invoice);
  	invoice.belongsTo(client);
  	
	invoice.hasMany(service);
	service.belongsTo(invoice, { onDelete: 'cascade' });
}