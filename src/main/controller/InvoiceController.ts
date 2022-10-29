import InvoicePDF from '../invoice/pdf/Invoice';
import { Sequelize } from 'sequelize';
import { Controller, ListOptions, ListResponse } from './Controller';
import { ServiceTypes } from '../sequelize/models/Service';
import { Nations } from '../sequelize/models/Invoice';
import request from 'request';
import { dialog, shell } from 'electron';

const exchangeRateUri = 'https://api.exchangerate.host/latest?base=CHF&symbols=EUR';
const serviceTypes = [...Object.values(ServiceTypes)] as const;

type Service = {
  name: string,
  type: typeof serviceTypes[number],
  price: number,
  quantity: number,
  totalAmount: number|undefined,
}

export default class InvoiceController extends Controller {
  
  constructor(sequelize: Sequelize) {
    super(
      sequelize, 
      'invoice',
      [],
    );
  };

  protected register()
  {
    super.register(['update']);
    this.handle('preview', this.preview);
    this.handle('save', async (id: string) => this.save(id));
    this.handle('previewFromId', async (id: string) => this.previewFromId(id));
    this.handle('exchangeRate', this.getChfExchangeRage);
  }

  private async previewFromId(id: string): Promise<string> {
    const pdf = new InvoicePDF();
    const invoice = await this.find(id);
    
    return await pdf.render(invoice);
  }

  private async preview(invoice: any) {
    const pdf = new InvoicePDF();

    return await pdf.render(invoice);
  }

  protected async getChfExchangeRage(): Promise<number>
  {
    return new Promise((resolve, reject) => {

      request(exchangeRateUri, { json: true }, (err, _, body: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(body.rates.EUR.toFixed(2));
        }
      });
    });
  }

  protected async store(values) {

    const { invoice, service } = this.sequelize.models;

    values = await this.prepare(values);

    const created = await invoice.create(values, {
      include: [service],
    });

    return created.get();
  }

  protected async list(options: ListOptions): Promise<ListResponse> {
    
    const listOptions = this.buildListOptions(options);

    listOptions.include = 'client';
    
    const { invoice } = this.sequelize.models;

    return {
      data: (await invoice.findAll(listOptions)).map(row => row.get({plain: true})),
      total: await invoice.count(listOptions),
    }
  }

  protected async delete(id: string): Promise<number> {
    const { invoice } = this.sequelize.models;

    const options = { 
      where: { id },
      cascade: true,
    };

    return await invoice.destroy(options);
  }

  protected async find(id: string) {
    const { invoice, service, client } = this.sequelize.models;

    const result = await invoice.findByPk(id, {
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

  private async save(id: string): Promise<void>
  {
    const invoice = await this.find(id);
    const { canceled, filePath } = await dialog.showSaveDialog({});
    
    if (canceled) {
      return;
    }

    const pdf = new InvoicePDF();
    const path = `${filePath}.pdf`;
    
    await pdf.save(invoice, path);

    shell.openPath(path);

    return;
  }
}