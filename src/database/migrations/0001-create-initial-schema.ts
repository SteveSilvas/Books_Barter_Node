import { DataTypes, QueryInterface } from 'sequelize';
import type { Migration } from '../migrator';

const TIMESTAMPS = {
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true },
};

const UUID_PK = {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    Uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
    },
};

/** Verdadeiro se o schema inicial já existe (ex.: banco criado antes por sequelize.sync). */
async function schemaExists(queryInterface: QueryInterface): Promise<boolean> {
    const tables = (await queryInterface.showAllTables()).map((t) =>
        typeof t === 'string' ? t : (t as { tableName: string }).tableName,
    );
    return tables.some((name) => name.toLowerCase() === 'users');
}

/** Cria o schema inicial: as 9 tabelas, chaves estrangeiras e índices únicos. */
export const up: Migration = async ({ context }) => {
    const { queryInterface } = context;

    // Baseline idempotente: se as tabelas já existem, apenas registra a migração.
    if (await schemaExists(queryInterface)) {
        return;
    }

    await queryInterface.createTable('Users', {
        ...UUID_PK,
        Name: { type: DataTypes.STRING, allowNull: false },
        Birth: { type: DataTypes.DATE, allowNull: true },
        Email: { type: DataTypes.STRING, allowNull: false, unique: true },
        Pass: { type: DataTypes.STRING, allowNull: true },
        Provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'local' },
        ...TIMESTAMPS,
    });

    await queryInterface.createTable('Categories', {
        ...UUID_PK,
        Description: { type: DataTypes.STRING, allowNull: false },
        ...TIMESTAMPS,
    });

    await queryInterface.createTable('BookStatuses', {
        Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        Name: { type: DataTypes.STRING, allowNull: false, unique: true },
        Description: { type: DataTypes.STRING, allowNull: false },
        ...TIMESTAMPS,
    });

    await queryInterface.createTable('Addresses', {
        ...UUID_PK,
        Rua: { type: DataTypes.STRING, allowNull: false },
        Numero: { type: DataTypes.STRING, allowNull: false },
        Complemento: { type: DataTypes.STRING, allowNull: false },
        Bairro: { type: DataTypes.STRING, allowNull: false },
        Cep: { type: DataTypes.INTEGER, allowNull: false },
        Cidade: { type: DataTypes.STRING, allowNull: false },
        Estado: { type: DataTypes.STRING, allowNull: false },
        Pais: { type: DataTypes.STRING, allowNull: false },
        ...TIMESTAMPS,
    });

    await queryInterface.createTable('Books', {
        ...UUID_PK,
        Title: { type: DataTypes.STRING, allowNull: false },
        Autor: { type: DataTypes.STRING, allowNull: false },
        CategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Categories', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        StatusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'BookStatuses', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        CreationDate: { type: DataTypes.DATE, allowNull: true },
        CreationLocality: { type: DataTypes.STRING, allowNull: true },
        ...TIMESTAMPS,
    });

    await queryInterface.createTable('BookCopies', {
        ...UUID_PK,
        ISBN: { type: DataTypes.STRING, allowNull: true },
        Editora: { type: DataTypes.STRING, allowNull: false },
        TypePrint: { type: DataTypes.STRING, allowNull: false },
        PublicationDate: { type: DataTypes.DATE, allowNull: false },
        PublicationLocality: { type: DataTypes.STRING, allowNull: true },
        ...TIMESTAMPS,
    });

    await queryInterface.createTable('Follows', {
        ...UUID_PK,
        FollowerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        FollowingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        ...TIMESTAMPS,
    });
    await queryInterface.addIndex('Follows', ['FollowerId', 'FollowingId'], {
        unique: true,
        name: 'follows_follower_following_unique',
    });

    await queryInterface.createTable('FavoriteBooks', {
        ...UUID_PK,
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        BookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Books', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        ...TIMESTAMPS,
    });
    await queryInterface.addIndex('FavoriteBooks', ['UserId', 'BookId'], {
        unique: true,
        name: 'favorite_books_user_book_unique',
    });

    await queryInterface.createTable('FavoriteShelves', {
        ...UUID_PK,
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        ShelfOwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'Id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        ...TIMESTAMPS,
    });
    await queryInterface.addIndex('FavoriteShelves', ['UserId', 'ShelfOwnerId'], {
        unique: true,
        name: 'favorite_shelves_user_owner_unique',
    });
}

/** Remove o schema inicial (ordem inversa para respeitar as FKs). */
export const down: Migration = async ({ context }) => {
    const { queryInterface } = context;
    for (const table of [
        'FavoriteShelves',
        'FavoriteBooks',
        'Follows',
        'BookCopies',
        'Books',
        'Addresses',
        'BookStatuses',
        'Categories',
        'Users',
    ]) {
        await queryInterface.dropTable(table);
    }
}
