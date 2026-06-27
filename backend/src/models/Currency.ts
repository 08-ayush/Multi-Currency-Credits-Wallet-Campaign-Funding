import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class Currency extends Model<InferAttributes<Currency>, InferCreationAttributes<Currency>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare code: string;
  declare module_name: string;
  declare price_per_credit_paise: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Currency.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    module_name: { type: DataTypes.STRING(50), allowNull: false },
    price_per_credit_paise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'currencies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
