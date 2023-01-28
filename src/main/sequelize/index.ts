import { Sequelize } from 'sequelize';
import relations from './relations';
import { modelDefiner as invoice } from './models/Invoice';
import { modelDefiner as service } from './models/Service';
import client from './models/Client';
import { join } from 'path';
import init from './init';
import { dirname } from 'path';

const modelDefiners = [
	invoice,
	service,
	client,
];

async function register(databasePath: string): Promise<Sequelize> {

  console.error(dirname(databasePath));
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: databasePath,
    logQueryParameters: true,
    benchmark: true,
  });


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