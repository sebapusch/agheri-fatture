import { join } from 'path';
import ejs from 'ejs';
import { readFile } from 'fs/promises';
import { Nations } from '../../sequelize/models/Invoice';
import { generatePdf } from 'html-pdf-node';
import { createWriteStream } from 'original-fs';
import { ServiceTypes } from '../../sequelize/models/Service';
import { application } from '../../main';


enum Currency {
  EUR = '€',
  CHF = 'chf',
};

type RenderOptions = {
  currency: Currency,
  displayEur: boolean,
  exchangeRate: number,
};

type RenderableInvoice = {
  totalAmount: string,
  totalAmountEur: string|null,
  date: string,
  code: string,
  client: {
    name: string,
    holder: string,
    piva: string,
    zipcode: string,
  },
  services: Array<{
    type: string,
    name: string,
    quantity: number|string,
    price: string,
    priceNum: number,
    totalAmount: number
  }>,
}

type Profile = {
  name: string,
  title: string,
  address: string,
  piva: string,
  billing: {
    name: string,
    bank: string,
    iban: string,
    bic: string,
  }
}

const resourcePath = join(__dirname, '../../static/resources')

const templatePath = join(resourcePath, 'templates/invoice-template.ejs');
const templateStylePath = join(resourcePath, 'template_styles/template-style.css');

export default class InvoicePDF {

  private renderOptions: RenderOptions;
  private invoice: RenderableInvoice;

  public constructor(data: any) {
    this.renderOptions = this.setOptions(data);
    this.invoice = this.setInvoice(data);
  }

  private async style() {
    return readFile(templateStylePath);
  }

  public async save(target: string): Promise<boolean>
  {
    const file = {
      content: await this.render(),
    }

    const options = {
      format: 'A4',
      localUrlAccess: true,
    }

    const pdf: Buffer = await generatePdf(file, options);

    return createWriteStream(target).write(pdf);
  }
  
  public async render(): Promise<string> {

    const style = (await this.style()).toString();

    return new Promise((resolve, reject) => {

      const data = {
        profile: application.config.get('profile'),
        client: this.invoice.client,
        services: this.invoice.services,
        options: this.renderOptions,
        invoice: {
          totalAmount: this.invoice.totalAmount,
          totalAmountEur: this.invoice.totalAmountEur,
          date: this.invoice.date,
          code: this.invoice.code,
        },
        style,
      };

      ejs.renderFile(templatePath, data, (err, str) => {

        if (err) {
          reject(err);
        }

        resolve(str);
      });
    });
  }

  private setOptions(data: any): RenderOptions {
    const renderOptions = {
      currency: Currency.EUR,
      displayEur: false,
      exchangeRate: 0,
    }

    if (data.nation && data.nation === Nations.CH) {
      renderOptions.currency = Currency.CHF;
      renderOptions.displayEur = data.displayEuro ?? false;
      
      if (renderOptions.displayEur) {

        renderOptions.exchangeRate = typeof data.exchangeRate === 'number'
          ? data.exchangeRate
          : 1;
      }
    }

    return renderOptions;
  }

  private setInvoice(data: any): RenderableInvoice {
    const invoice: any = {};

    if (data.date instanceof Date) {
      invoice.date = data.date.toLocaleDateString('it-IT');
    } else {
      invoice.date = (new Date).toLocaleDateString('it-IT');
    }

    invoice.code = data.code ?? '-'

    invoice.client = {
      holder: data.client?.holder ?? '-',
      name: data.client?.name ?? '-',
      address: data.client?.address ?? '-',
      city: data.client?.city,
      state: this.stateTrans(data.client?.state),
      zipcode: data.client?.zipcode ?? '-',
      piva: data.client?.piva ?? '-',
    };

    invoice.services = [];

    if (data.services && Array.isArray(data.services)) {

      invoice.services = data.services.map((service) => ({
        name: service.name ?? '-',
        quantity: service.quantity ?? '-',
        price: this.currencyPrice(service.price ?? 0),
        priceNum: service.price ?? 0,
        type: this.serviceTypeTrans(service.type),
        totalAmount: this.prepareServiceTotalAmount(service),
      }));
    }

    let totalAmount = 0;

    if (typeof (data.totalAmount ?? null) === 'number') {
      totalAmount = data.totalAmount;
    }

    if (this.renderOptions.displayEur) {
      invoice.totalAmountEur = this.currencyPrice(totalAmount, true);
    }

    invoice.totalAmount = this.currencyPrice(totalAmount);

    return invoice;
  }

  private prepareServiceTotalAmount(service: any): string {
    if (!service || !service.price) {
      
      return this.currencyPrice(0);
    }

    if (service.totalAmount) {
      return this.currencyPrice(service.totalAmount);
    }

    if (
      !service.quantity || 
      !service.type || 
      [ServiceTypes.FLAT, ServiceTypes.MIN].includes(service.type)
    ) {
      return this.currencyPrice(service.price);
    }

    return this.currencyPrice(service.price * service.quantity);
  }

  private currencyPrice(price: number, convert: boolean = false): string {
    let currency = this.renderOptions.currency;

    if (convert) {
      price = price * this.renderOptions.exchangeRate;
      currency = Currency.EUR
    }

    return `${currency} ${price}`;
  }

  private serviceTypeTrans(type: string|null): string {
    switch(type) {
      case ServiceTypes.FLAT: return 'Pauschal';
      case ServiceTypes.HOUR: return 'Stunde';
      case ServiceTypes.LINE: return 'Zeile';
      case ServiceTypes.MIN:  return 'Mindenstpreis';
    }

    return '-';
  }

  private stateTrans(state: string|null): string {
    switch(state) {
      case 'DE': return 'Deutschland';
      case 'CH': return 'Schweiz';
    }

    return '-';
  }
}