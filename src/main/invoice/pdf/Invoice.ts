import { join } from 'path';
import ejs from 'ejs';
import { readFile } from 'fs/promises';
import path from 'path';
import { readFileSync } from 'fs';
import { generatePdf } from 'html-pdf-node';
import { createWriteStream } from 'original-fs';

type Invoice = {
  nation: string,
  client: {
    name: string|null,
    holder: string|null,
    piva: string|null,
    zipcode: string|null,
  },
  services: Array<{
    type: string,
    name: string,
    quantity: number|null,
    price: number|null,
  }>
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
const logo = path.resolve(join(resourcePath, 'images/logo.png'));

export default class InvoicePDF {

  private profile: Profile;

  public constructor() {
    this.profile = JSON.parse(readFileSync(profilePath).toString());
  }

  private async style() {
    return readFile(templateStylePath);
  }

  public async save(invoice: any, target: string): Promise<boolean>
  {
    const file = {
      content: await this.render(invoice),
    }

    const options = {
      format: 'A4',
      localUrlAccess: true
    }

    const pdf: Buffer = await generatePdf(file, options);

    return createWriteStream(target).write(pdf);
  }
  
  public async render(invoice: any): Promise<string> {

    const style = (await this.style()).toString();

    return new Promise((resolve, reject) => {

      const currency = 
        invoice.nation === 'CH' 
          ? 'CHF' 
          : invoice.nation === 'DE' 
            ? '€' 
            : '?';

      const price = (amount: number) => `${currency} ${amount}`;


      console.log(path.normalize('file://' + path.resolve(join(resourcePath)) + '/images/test.png'));
      const data = {
        ...invoice,
        chf: invoice.nation === 'CH',
        currency,
        path: 'file://' + path.resolve(join(resourcePath)) + '/images/test.png',
        price,
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

}