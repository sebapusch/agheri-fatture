import { launch, type PDFOptions } from 'puppeteer';
import { compile } from 'handlebars';
import inlineCss from 'inline-css';

type Options = {
  executablePath: string,
  pdfOptions: PDFOptions,
};

type File = {
  content: string,
};

export async function generatePdf(file: File, options: Options) {

  const {executablePath, pdfOptions} = options;
  const {content} = file;
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ];

  const browser = await launch({
    args,
    executablePath,
  });
  const page = await browser.newPage();

  const data = await inlineCss(content, {url: '/'});
  const template = compile(data, {strict: true});
  const html = template(data);

  await page.setContent(html);

  const pdf = await page.pdf(pdfOptions);

  await browser.close();

  return Buffer.from(Object.values(pdf));
}
