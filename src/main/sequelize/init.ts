import { Sequelize } from "sequelize";

export default async function init(sequelize: Sequelize) {
  await sequelize.query(`CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      holder TEXT,
      address TEXT,
      zipcode TEXT,
      city TEXT,
      state TEXT,
      piva TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
  )`);

  await sequelize.query(`CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    date INTEGER NOT NULL,
    nation TEXT NOT NULL,
    exchangeRate REAL,
    totalAmount REAL NOT NULL,
    displayEuro INTEGER,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    clientId INTEGER NOT NULL,
    FOREIGN KEY (clientId) REFERENCES clients(id)
  )`);

  await sequelize.query(`CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT NOT NULL,
    quantity INTEGER,
    price REAL NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    totalAmount REAL NOT NULL,
    invoiceId INTEGER NOT NULL,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id)
  )`);
}
