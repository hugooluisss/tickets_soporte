import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProjectNameUniqueness1730000003000 implements MigrationInterface {
  name = 'RemoveProjectNameUniqueness1730000003000';
  async up(queryRunner: QueryRunner): Promise<void> {
    const indexes = await queryRunner.query("SHOW INDEX FROM `projects` WHERE `Key_name` = 'UQ_projects_name'");
    if (indexes.length) await queryRunner.query('ALTER TABLE `projects` DROP INDEX `UQ_projects_name`');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` ADD CONSTRAINT `UQ_projects_name` UNIQUE (`name`)');
  }
}
