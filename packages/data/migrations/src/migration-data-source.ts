import config from '@data/config'
import * as Entities from '@data/domain'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { DataSource } from 'typeorm'

const envFilePaths = [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../../.env')]

for (const envFilePath of envFilePaths) {
  if (!existsSync(envFilePath)) {
    continue
  }

  process.loadEnvFile(envFilePath)
  break
}

export default (async () => {
  const { database } = await config()

  return new DataSource({
    ...database,
    synchronize: false,
    migrations: [path.join(__dirname, '..', 'migrations', '**', '*.ts')],
    entities: Object.values(Entities)
  })
})()
