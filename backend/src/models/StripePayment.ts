import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export type StripePaymentStatus = 'PENDING' | 'COMPLETED';

export class StripePayment extends Model<InferAttributes<StripePayment>, InferCreationAttributes<StripePayment>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare currency_id: number;
  declare checkout_session_id: string;
  declare payment_intent_id: CreationOptional<string | null>;
  declare credits_to_grant: number;
  declare amount_paise: number;
  declare status: CreationOptional<StripePaymentStatus>;
  declare created_at: CreationOptional<Date>;
}

StripePayment.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    currency_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    checkout_session_id: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    payment_intent_id: { type: DataTypes.STRING(255), allowNull: true },
    credits_to_grant: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amount_paise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'COMPLETED'), allowNull: false, defaultValue: 'PENDING' },
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'stripe_payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
