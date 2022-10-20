import { Sequelize } from 'sequelize';
import {Controller} from './Controller';

export default class UserController extends Controller {
  
  constructor(sequelize: Sequelize) {
    super(sequelize, 'client', ['name', 'holder']);
  } 
}