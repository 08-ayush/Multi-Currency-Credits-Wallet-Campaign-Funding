import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class Wallet extends Model<InferAttributes<Wallet>, InferCreationAttributes<Wallet>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Wallet.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
