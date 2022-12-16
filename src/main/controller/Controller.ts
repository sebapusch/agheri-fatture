import { ipcMain, WebContents, IpcMainEvent, WebFrameMain } from 'electron';
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

type ListResponse = {
  total: number,
  data: Array<object>
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

  protected constructor(sequelize: Sequelize, modelName: string, searchable: Array<string> = []) {
    this.sequelize = sequelize;
    this.modelName = modelName;
    this.searchable = searchable;
    this.register();
  };

  protected model() {
    return this.sequelize.models[this.modelName];
  }

  protected register(except: Array<string> = []) {
    const handlerMap = {
      'store': async (values) => this.store(values),
      'list': async (options) => this.list(options),
      'delete': async (id: string) => this.delete(id),
      'update': async (id: string, values) => this.update(id, values),
      'find': async (id: string) => this.find(id),
    }

    for (const event in handlerMap) {
      if (except.includes(event)) {
        continue;
      }

      this.handle(event, handlerMap[event]);
    }
  }

  protected handle(event: string, handler: Function) {

    const eventName = `${this.modelName}.${event}`;

    const response: Response = {
      success: true,
      content: null,
      channel: eventName,
    }

    ipcMain.on(eventName, async (event: IpcMainEvent, ...args) => {
      try {

        this.validateSender(event.senderFrame);

        response.content = await handler(...args);
        response.success = true;

        this.respond(event.sender, response);

      } catch (error) {

        console.log(error);

        response.content = error;
        response.success = false;
        this.respond(event.sender, response);
      }
    });

  }

  private validateSender(frame: WebFrameMain) {
    const senderUrl = new URL(frame.url);

    if (false === ['electronjs.org', 'localhost:8080'].includes(senderUrl.host)) {
      throw new Error('Errore di sicurezza');
    }
  }

  private respond(sender: WebContents, response: Response)
  {
    sender.send(response.channel, response);
  }

  protected async find(id: string) {
    const model = await this.model().findByPk(id);

    if (typeof model === null) {
      throw new Error('Nessun elemento trovato corrispondente alla chiave passata');
    }

    return model!.get({ plain: true });
  }

  protected async store(values) {
    return await this.model().create(values);
  }

  protected async delete(id: string): Promise<number> {
    return await this.model().destroy({
      where: {
        id: id
      }
    });
  }

  protected async update(id: string, values): Promise<boolean> {
    const options = { where: { id } };
    const [updated] = await this.model()
        .update(values, options);

    return updated > 0;
  }

  protected async list(options: ListOptions): Promise<ListResponse> {

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

export { Controller, ListOptions, ListResponse };