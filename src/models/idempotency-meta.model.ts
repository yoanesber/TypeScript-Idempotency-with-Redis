import { Optional } from 'sequelize';
import {
    Column,
    CreatedAt,
    DataType,
    Default,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';

// Define the base attribute type
interface IdempotencyMetaAttributes {
    key: string;
    bodyHash: string;
    responsePayload: string;
    createdAt: Date;
    updatedAt?: Date;
    expiredAt?: Date;
}

// Define which fields are optional when creating
type IdempotencyMetaCreationAttributes = Optional<IdempotencyMetaAttributes, "createdAt" | "updatedAt">;

@Table({
    tableName: 'idempotency_meta',
    timestamps: true,
})
class IdempotencyMeta extends Model<IdempotencyMetaAttributes, IdempotencyMetaCreationAttributes> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    key!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    bodyHash!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    responsePayload!: string;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt?: Date;
    
    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    expiredAt?: Date;
}

export {
    IdempotencyMeta,
    IdempotencyMetaAttributes,
    IdempotencyMetaCreationAttributes,
};