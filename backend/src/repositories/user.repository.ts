import { Transaction } from 'sequelize';
import { User } from '../models';

export const userRepository = {
  findByEmail(email: string, tx?: Transaction) {
    return User.findOne({ where: { email }, transaction: tx });
  },

  findById(id: number, tx?: Transaction) {
    return User.findByPk(id, { transaction: tx });
  },

  create(email: string, passwordHash: string, tx?: Transaction) {
    return User.create({ email, password_hash: passwordHash }, { transaction: tx });
  },
};
