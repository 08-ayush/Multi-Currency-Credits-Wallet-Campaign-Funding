import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class CurrencyPlan extends Model<InferAttributes<CurrencyPlan>, InferCreationAttributes<CurrencyPlan>> {
  declare id: CreationOptional<number>;
  declare currency_id: number;
  declare credits: number;
  declare price_paise: number;
}

CurrencyPlan.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    currency_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    credits: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    price_paise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: 'currency_plans',
    timestamps: false,
  }
);
