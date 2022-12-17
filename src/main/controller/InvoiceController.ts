import InvoicePDF from '../invoice/pdf/Invoice';
import { Sequelize } from 'sequelize';
import { Controller, ListOptions, ListResponse } from './Controller';
import { ServiceTypes } from '../sequelize/models/Service';
import { Nations } from '../sequelize/models/Invoice';
import request from 'request';
import { dialog, shell } from 'electron';
import { settings, setSettings } from '../helpers';

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
    super.register(['update', 'delete']);
    this.handle('preview', this.preview);
    this.handle('save', async (id: string) => this.save(id));
    this.handle('previewFromId', async (id: string) => this.previewFromId(id));
    this.handle('exchangeRate', this.getChfExchangeRage);
    this.handle('delete', (id: string) => this.delete(id));
    this.handle('progressNum', this.getProgressNum);
  }

  private async preview(invoice: any) {
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
    return new Promise((resolve, reject) => {

      request(exchangeRateUri, { json: true }, (err, _, body: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(body.rates.EUR.toFixed(2) ?? null);
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

    this.updateProgressNum(values.code);

    return created.get();
  }

  protected async list(options: ListOptions): Promise<ListResponse> {
    
    const listOptions = this.buildListOptions(options);

    listOptions.include = 'client';
    
    const { invoice } = this.sequelize.models;

    const data = await invoice.findAll(listOptions);

    return {
      data: data.map(row => row.get({plain: true})),
      total: await invoice.count(listOptions),
    }
  }

  protected async delete(id: string): Promise<number> {
    const { invoice, service } = this.sequelize.models;

    await service.destroy({ where: { invoiceId: id }});
    
    return await invoice.destroy({ where: { id }});
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

  private getProgressNum(): string {
    const year = (new Date()).getFullYear();
    const progressNum = settings('progress_num');

    return `${progressNum}/${year}`;
  }

  private updateProgressNum(code: string) {
    if (code.trim() !== this.getProgressNum()) {
      return;
    }

    setSettings('progress_num', settings('progress_num') + 1);
  }

  private async save(id: string): Promise<void>
  {
    const invoice = await this.find(id);
    const { canceled, filePath } = await dialog.showSaveDialog({});
    
    if (canceled) {
      return;
    }

    const pdf = new InvoicePDF(invoice);
    const path = `${filePath}.pdf`;
    
    await pdf.save(path);

    shell.openPath(path);

    return;
  }
}