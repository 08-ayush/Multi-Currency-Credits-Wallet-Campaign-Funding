import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export type CampaignStatus = 'DRAFT' | 'FUNDED';

export class Campaign extends Model<InferAttributes<Campaign>, InferCreationAttributes<Campaign>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare name: string;
  declare status: CreationOptional<CampaignStatus>;
  declare required_credits: number;
  declare funded_at: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Campaign.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.ENUM('DRAFT', 'FUNDED'), allowNull: false, defaultValue: 'DRAFT' },
    required_credits: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    funded_at: { type: DataTypes.DATE, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'campaigns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
