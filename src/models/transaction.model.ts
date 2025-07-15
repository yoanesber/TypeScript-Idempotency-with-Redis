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
interface TransactionAttributes {
    id: string;
    type: "payment" | "withdrawal" | "disbursement";
    amount: number;
    status: "pending" | "completed" | "failed";
    consumerId: string;
    createdAt: Date;
    updatedAt?: Date;
}

// Define which fields are optional when creating
type TransactionCreationAttributes = Optional<TransactionAttributes, "id" | "createdAt" | "updatedAt">;

@Table({
    tableName: 'transactions',
    timestamps: false,
})
class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id!: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['payment', 'withdrawal', 'disbursement']],
        },
    })
    type!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    amount!: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['pending', 'completed', 'failed']],
        },
    })
    status!: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    consumerId!: string;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt?: Date;
}

export default Transaction;