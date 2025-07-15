import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
    await queryInterface.createTable("idempotency_meta", {
        key: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        bodyHash: {
            type: DataTypes.TEXT,
            allowNull: false,

        },
        responsePayload: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: queryInterface.sequelize.literal("CURRENT_TIMESTAMP"),
        },
        expiredAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal("CURRENT_TIMESTAMP + INTERVAL '1 hour'"), // Default TTL of 1 hour
        },
    });
}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("idempotency_meta");
}
