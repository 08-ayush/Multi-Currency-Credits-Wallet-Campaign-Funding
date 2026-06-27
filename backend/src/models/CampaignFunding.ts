import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class CampaignFunding extends Model<
  InferAttributes<CampaignFunding>,
  InferCreationAttributes<CampaignFunding>
> {
  declare id: CreationOptional<number>;
  declare campaign_id: number;
  declare ledger_entry_id: number;
  declare created_at: CreationOptional<Date>;
}

CampaignFunding.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    campaign_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    ledger_entry_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'campaign_fundings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);
