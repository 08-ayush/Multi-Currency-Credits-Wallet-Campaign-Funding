import { Transaction } from 'sequelize';
import { Currency, CurrencyPlan } from '../models';

export const currencyRepository = {
  findById(id: number, tx?: Transaction) {
    return Currency.findByPk(id, { transaction: tx });
  },

  findByCode(code: string, tx?: Transaction) {
    return Currency.findOne({ where: { code }, transaction: tx });
  },

  findAll(tx?: Transaction) {
    return Currency.findAll({ order: [['id', 'ASC']], transaction: tx });
  },

  findPlanById(id: number, tx?: Transaction) {
    return CurrencyPlan.findByPk(id, { transaction: tx });
  },

  findPlansByCurrency(currencyId: number, tx?: Transaction) {
    return CurrencyPlan.findAll({
      where: { currency_id: currencyId },
      order: [['credits', 'ASC']],
      transaction: tx,
    });
  },

  findAllPlans(tx?: Transaction) {
    return CurrencyPlan.findAll({ order: [['currency_id', 'ASC'], ['credits', 'ASC']], transaction: tx });
  },
};
