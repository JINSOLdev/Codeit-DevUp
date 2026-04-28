import path from 'node:path'

export const config = () => ({
  database: {
    type: 'postgres',
    timezone: '+00:00',
    charset: 'utf8',
    synchronize: false,
    logging: false,
    bigNumberStrings: false,
    migrations: [path.join(__dirname, '..', '..', '..', '..', 'migrations', '**', '*.ts')],
    cli: {
      migrationsDir: path.join(__dirname, '..', '..', '..', '..', 'migrations')
    },
    migrationsTableName: 'MigrationTable',
    logger: 'debug'
  }
})
