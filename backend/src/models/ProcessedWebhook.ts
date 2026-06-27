import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class ProcessedWebhook extends Model<
  InferAttributes<ProcessedWebhook>,
  InferCreationAttributes<ProcessedWebhook>
> {
  declare id: CreationOptional<number>;
  declare stripe_event_id: string;
  declare processed_at: CreationOptional<Date>;
}

ProcessedWebhook.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    stripe_event_id: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    processed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'processed_webhooks',
    timestamps: false,
  }
);
