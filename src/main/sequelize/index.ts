import { Sequelize } from 'sequelize';
import relations from './relations';
import { modelDefiner as invoice } from './models/Invoice';
import { modelDefiner as service } from './models/Service';
import client from './models/Client';
import { join } from 'path';
import init from './init';

const DB_PATH = join(__dirname, 'database/agheri.sqlite');

const modelDefiners = [
	invoice,
	service,
	client,
];

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: DB_PATH,
	logQueryParameters: true,
	benchmark: true,
});

async function register(): Promise<Sequelize> {

  await init(sequelize);
  
  // Define all models according to their files.
  for (const modelDefiner of modelDefiners) {
    modelDefiner(sequelize);
  }

  // Add associations 
  relations(sequelize);

  return sequelize;
}

// Export the sequelize connection instance to be used around our app.
export default register;