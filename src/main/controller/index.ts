import UserController from './ClientController';
import InvoiceController from './InvoiceController';
import { Sequelize } from 'sequelize';

const contolles = [
  UserController,
  InvoiceController,
]

export default function register(sequelize: Sequelize) {
  contolles.forEach(controller => new controller(sequelize));
}