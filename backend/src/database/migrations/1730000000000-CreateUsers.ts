import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1730000000000 implements MigrationInterface {
  name = 'CreateUsers1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('admin', 'user')`);
    await queryRunner.query(`CREATE TABLE "users" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "email" character varying(255) NOT NULL,
      "password_hash" character varying NOT NULL,
      "first_name" character varying(100) NOT NULL,
      "last_name" character varying(100) NOT NULL,
      "role" "users_role_enum" NOT NULL DEFAULT 'user',
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_users_email" UNIQUE ("email")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
