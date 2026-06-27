import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export type LedgerEntryType = 'PURCHASE' | 'SPEND';
export type LedgerReferenceType = 'PAYMENT' | 'CAMPAIGN';

export class WalletLedger extends Model<InferAttributes<WalletLedger>, InferCreationAttributes<WalletLedger>> {
  declare id: CreationOptional<number>;
  declare wallet_id: number;
  declare currency_id: number;
  declare entry_type: LedgerEntryType;
  declare credits_delta: number;
  declare reference_type: LedgerReferenceType;
  declare reference_id: number;
  declare created_at: CreationOptional<Date>;
}

WalletLedger.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    wallet_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    currency_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    entry_type: { type: DataTypes.ENUM('PURCHASE', 'SPEND'), allowNull: false },
    credits_delta: { type: DataTypes.INTEGER, allowNull: false },
    reference_type: { type: DataTypes.ENUM('PAYMENT', 'CAMPAIGN'), allowNull: false },
    reference_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'wallet_ledger',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
