import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1730000000000 implements MigrationInterface {
  name = 'CreateUsers1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE `users` (\n' +
      '  `id` char(36) NOT NULL,\n' +
      '  `email` varchar(255) NOT NULL,\n' +
      '  `password_hash` varchar(255) NOT NULL,\n' +
      '  `first_name` varchar(100) NOT NULL,\n' +
      '  `last_name` varchar(100) NOT NULL,\n' +
      "  `role` enum('admin', 'user') NOT NULL DEFAULT 'user',\n" +
      '  `is_active` tinyint NOT NULL DEFAULT 1,\n' +
      '  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
      '  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n' +
      '  CONSTRAINT `PK_users_id` PRIMARY KEY (`id`),\n' +
      '  CONSTRAINT `UQ_users_email` UNIQUE (`email`)\n' +
    ')');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `users`');
  }
}
