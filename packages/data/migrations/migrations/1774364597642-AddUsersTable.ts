import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUsersTable1774364597642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "nickname" character varying(30)
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_User_nickname"
      ON "User" ("nickname")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_User_nickname"
    `)

    await queryRunner.query(`
      ALTER TABLE "User"
      DROP COLUMN IF EXISTS "nickname"
    `)
  }
}
