import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class WalletBalance extends Model<InferAttributes<WalletBalance>, InferCreationAttributes<WalletBalance>> {
  declare id: CreationOptional<number>;
  declare wallet_id: number;
  declare currency_id: number;
  declare balance_credits: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

WalletBalance.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    wallet_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    currency_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    balance_credits: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'wallet_balances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['wallet_id', 'currency_id'] }],
  }
);
