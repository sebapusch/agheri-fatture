import { ipcMain, WebContents } from 'electron';
import { Sequelize, Op, FindOptions } from 'sequelize';

type ListOptions = {
  attributes?: Array<string>,
  limit: number,
  offset: number,
  query?: string,
  order?: {
    field: string,
    dir: string,
  }
};

type Response = {
  channel: string,
  success: boolean,
  content: any,
}

abstract class Controller {

  protected sequelize: Sequelize;
  protected modelName: string;
  protected searchable: Array<string>;
  protected defaultOrder = ['createdAt', 'DESC'];

  constructor(sequelize: Sequelize, modelName: string, searcheable: Array<string> = []) {
    this.sequelize = sequelize;
    this.modelName = modelName;
    this.searchable = searcheable;
    this.register();
  };

  protected model() {
    return this.sequelize.models[this.modelName];
  }

  protected register() {

    this.handle('store', async (values) => this.store(values));
    this.handle('list', async (options) => this.list(options));
    this.handle('delete', async (id) => this.delete(id));
    this.handle('update', async (id, values) => this.update(id, values))
    this.handle('find', async (id) => this.find(id));

  }

  protected handle(event: string, handler: Function) {

    const eventName = `${this.modelName}.${event}`;

    const response: Response = {
      success: true,
      content: null,
      channel: eventName,
    }

    ipcMain.on(eventName, async (event, ...args) => {
      try {
        response.content = await handler(...args);
        response.success = true;

        console.log(response.content);

        this.responde(event.sender, response);

      } catch (error) {

        console.log(error);

        response.content = error;
        response.success = false;
        this.responde(event.sender, response);
      }
    });

  }

  private responde(sender: WebContents, response: Response)
  {
    sender.send(response.channel, response);
  }

  protected async find(id: string) {
    return (await this.model().findByPk(id))?.get({ plain: true });
  }

  protected async store(values) {
    return await this.model().create(values);
  }

  protected async delete(id: string) {
    return await this.model().destroy({
      where: {
        id: id
      }
    });
  }

  private async update(id: string, values) {
    return await this.model().update(values, {
      where: {
        id,
      }
    });
  }

  protected async list(options: ListOptions) {

    const listOptions = this.buildListOptions(options);

    const data = await this.model().findAll(listOptions);
    const all = await this.model().count(listOptions);

    return {
      data: data.map((row) => row.get()),
      total: all,
    };
  }

  protected buildListOptions(options: ListOptions): FindOptions {
    const listOptions: any = {
      limit: options.limit,
      offset: options.offset,
    };

    if (options.attributes) {
      listOptions.attributes = options.attributes;
    }

    if (options.query && this.searchable.length > 0) {
      const where: any = {
        [Op.or]: {}
      };

      this.searchable.forEach((field) => {
          where[Op.or][field] = {
            [Op.like]: `${options.query}%`,
          }
      });

      listOptions.where = where;
    }

    if (options.order) {

      if (options.order.field.includes('.')) {
        const [relation, field] = options.order.field.split('.');

        listOptions.order = [
          [relation, field, options.order.dir],
        ];
        
      } else {
        listOptions.order = [
          [options.order.field, options.order.dir],
        ];
      }

      
    } else {
      listOptions.order = [this.defaultOrder];
    }

    return listOptions;
  }
}

export { Controller, ListOptions };