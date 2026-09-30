import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectsCategories1730000001000 implements MigrationInterface {
  name = 'CreateProjectsCategories1730000001000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `projects` (`id` char(36) NOT NULL, `name` varchar(150) NOT NULL, `description` text NULL, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `PK_projects_id` PRIMARY KEY (`id`))',
    );
    await queryRunner.query(
      'CREATE TABLE `categories` (`id` char(36) NOT NULL, `name` varchar(150) NOT NULL, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `PK_categories_id` PRIMARY KEY (`id`), CONSTRAINT `UQ_categories_name` UNIQUE (`name`))',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `categories`');
    await queryRunner.query('DROP TABLE `projects`');
  }
}
