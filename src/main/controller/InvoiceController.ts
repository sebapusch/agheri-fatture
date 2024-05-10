import InvoicePDF from '../invoice/pdf';
import { Model, ModelStatic } from 'sequelize';
import { Controller, ListOptions, ListResponse } from './Controller';
import { ServiceTypes } from '../sequelize/models/Service';
import { Nations } from '../sequelize/models/Invoice';
import request from 'request';
import { dialog, shell } from 'electron';
import App from '../App';

const exchangeRateUri = 'https://data-api.ecb.europa.eu/service/data/EXR/D.CHF.EUR.SP00.A?format=jsondata&startPeriod={startPeriod}';
const serviceTypes = [...Object.values(ServiceTypes)] as const;

type Service = {
  name: string,
  type: typeof serviceTypes[number],
  price: number,
  quantity: number,
  totalAmount: number|undefined,
}

export default class InvoiceController extends Controller {
  
  model: ModelStatic<Model>;

  searchable = ['code', 'date', '$client.name$'];

  constructor(app: App) {
    super(app);
    this.model = this.app.sequelize.models.invoice;
    this.register();
  };

  protected register()
  {
    super.register(['update', 'delete']);
    this.app.handle('invoice.preview', async (invoice: any) => this.preview(invoice));
    this.app.handle('invoice.save', async (id: string) => this.save(id));
    this.app.handle('invoice.previewFromId', async (id: string) => this.previewFromId(id));
    this.app.handle('invoice.exchangeRate', this.getChfExchangeRage);
    this.app.handle('invoice.delete', (id: string) => this.delete(id));
    this.app.handle('invoice.progressNum', async () => this.getProgressNum())
    this.app.handle('invoice.update', async (id: string, values: any) => this.update(id, values));
  }

  private async preview(invoice: any) {
    if (invoice.clientId) {
      const { client } = this.sequelize.models;
      const invoiceClient = await client.findByPk(invoice.clientId);

      if (invoiceClient) {
        invoice.client = invoiceClient.get();
      }
    }

    const pdf = new InvoicePDF(invoice);

    return await pdf.render();
  }

  private async previewFromId(id: string): Promise<string> {
    const invoice = await this.find(id);

    const pdf = new InvoicePDF(invoice);
    
    return await pdf.render();
  }

  protected async getChfExchangeRage(): Promise<number>
  {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startPeriod = yesterday.toISOString().split('T')[0];
    const uri = exchangeRateUri.replace('{startPeriod}', startPeriod);
    
    return new Promise((resolve, reject) => {

      request(uri, { json: true }, (err, _, body: any) => {
        if (err) {
          reject(err);
        } else {
          
          const series = Object.values(body.dataSets[0].series) as any[];
          const eurToChf = series[0].observations['0'][0];
          const chfToEur = (1 / eurToChf).toFixed(2);

          resolve(Number(chfToEur));
        }
      });
    });
  }

  protected async store(values: any) {

    const { service } = this.sequelize.models;

    values = await this.prepare(values);

    const created = await this.model.create(values, {
      include: [service],
    });

    this.updateProgressNum(values.code);

    return created.get();
  }

  protected async update(id: string, values: any) {
    const { service } = this.sequelize.models;
    await service.destroy({ where: { invoiceId: id }});
    values = await this.prepare(values);
    const updated = await this.model.update(values, {
      where: { id },
    });
    await service.bulkCreate(
      values.services.map(
        (service: any) => ({invoiceId: id, ...service})));
    return updated[0] > 0;
  }

  protected async list(options: ListOptions): Promise<ListResponse> {
    
    const listOptions = this.buildListOptions(options);

    listOptions.include = this.sequelize.models.client;

    const data = await this.model.findAll(listOptions);

    return {
      data: data.map(row => row.get({plain: true})),
      total: await this.model.count(listOptions),
    }
  }

  protected async delete(id: string): Promise<number> {
    const { service } = this.sequelize.models;

    await service.destroy({ where: { invoiceId: id }});
    
    return await this.model.destroy({ where: { id }});
  }

  protected async find(id: string) {
    const { service, client } = this.sequelize.models;

    const result = await this.model.findByPk(id, {
      include: [client, service],
    });

    if (! result) {
      throw new Error('Fattura non trovata');
    }

    return result.get({
      plain: true
    });
  }

  private async prepare(invoice: any) {
    invoice.services = invoice.services.map((service: Service) => {
      
      if ([ServiceTypes.HOUR, ServiceTypes.LINE].includes(service.type)) {

        service.totalAmount = service.price * service.quantity
      } else {
        service.totalAmount = service.price;
      }

      return service;
    });

    invoice.totalAmount = invoice.services.reduce(
      (total: number, { totalAmount }) => total + totalAmount,
    0);

    if (invoice.nation === Nations.DE) {
      invoice.exchangeRate = null;
    } else if (! invoice.exchangeRate) {
      invoice.exchangeRate = await this.getChfExchangeRage();
    }

    return invoice;
  }

  private getProgressNum(): string {
    const year = (new Date()).getFullYear();
    const progressNum = this.app.config.get('progress_num');

    return `${progressNum}/${year}`;
  }

  private updateProgressNum(code: string) {
    if (code.trim() !== this.getProgressNum()) {
      return;
    }

    const current = this.app.config.get('progress_num') as number;
    this.app.config.set('progress_num', current + 1);
  }

  private async save(id: string): Promise<void>
  {
    const invoice = await this.find(id);
    const code = invoice.code;

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: `Salva fattura ${code}`,
      defaultPath: `${code.replace('/', '-')}.pdf`,
      filters: [
        {name: 'Pdf files', extensions: ['pdf']},
      ],
    });
    
    if (canceled || !filePath) {
      return;
    }

    try {
      await (new InvoicePDF(invoice)).save(filePath);
    } catch (e) {
      throw new Error(`Errore durante il salvataggio del file: ${e}`);
    }
    

    shell.openPath(filePath);
  }
}