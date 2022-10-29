import { join } from 'path';
import ejs from 'ejs';
import { readFile } from 'fs/promises';
import path from 'path';
import { readFileSync } from 'fs';
import { generatePdf } from 'html-pdf-node';
import { createWriteStream } from 'original-fs';
import {$toRef} from "vue/macros";

type SavableInvoice = {
  nation: string,
  totalAmount: number,
  date: Date,
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
    quantity: number,
    price: number,
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
const profilePath = join(resourcePath, 'profile.json');
//const logo = path.resolve(join(resourcePath, 'images/logo.png'));

export default class InvoicePDF {

  private readonly profile: Profile;

  public constructor() {
    this.profile = JSON.parse(readFileSync(profilePath).toString());
  }

  private async style() {
    return readFile(templateStylePath);
  }

  public async save(invoice: SavableInvoice, target: string): Promise<boolean>
  {
    const file = {
      content: await this.render(invoice),
    }

    const options = {
      format: 'A4',
      localUrlAccess: true,
    }

    const pdf: Buffer = await generatePdf(file, options);

    return createWriteStream(target).write(pdf);
  }
  
  public async render(invoice: any): Promise<string> {

    const style = (await this.style()).toString();
    const currency = this.getInvoiceCurrency(invoice.nation);
    const helpers = {
      price: (amount: number) => `${currency} ${amount}`,
    };

    return new Promise((resolve, reject) => {

      const data = {
        invoice,
        helpers,
        currency,
        profile: this.profile,
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

  private getInvoiceCurrency(nation: string|null): string {
    switch (nation) {
      case 'CH': return 'CHF';
      case 'DE': return '€';
    }

    return '?';
  }
}