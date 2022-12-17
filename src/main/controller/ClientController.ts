import { Model, ModelStatic, Sequelize } from 'sequelize';
import {Controller} from './Controller';

export default class UserController extends Controller {

  model: ModelStatic<Model>;
  
  searchable = ['name', 'holder'];
  
  constructor(sequelize: Sequelize) {
    super(sequelize);
    this.model = sequelize.models.client;
    this.register();
  }

  protected register(): void {
    super.register(['delete']);
    this.handle('delete', (id: string) => this.delete(id));
  }

  protected async delete(id: string): Promise<number> {
    try {
      
      return await super.delete(id);
    } catch (e: any) {

      if (e.name === 'SequelizeForeignKeyConstraintError') {
        
        throw new Error('Impossibile eliminare cliente con fatture associate');
      }

      throw e;
    }
  }
}
