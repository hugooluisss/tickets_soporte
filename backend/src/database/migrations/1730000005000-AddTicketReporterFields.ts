import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketReporterFields1730000005000 implements MigrationInterface {
  name = 'AddTicketReporterFields1730000005000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tickets` MODIFY COLUMN `created_by_id` char(36) NULL');
    await queryRunner.query('ALTER TABLE `tickets` ADD COLUMN `reporter_name` varchar(150) NULL');
    await queryRunner.query('ALTER TABLE `tickets` ADD COLUMN `reporter_email` varchar(255) NULL');
    await queryRunner.query(
      'ALTER TABLE `tickets` ADD COLUMN `reporter_location` varchar(255) NULL',
    );
    await queryRunner.query('ALTER TABLE `projects` ADD COLUMN `webhook_url` varchar(2048) NULL');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `webhook_url`');
    await queryRunner.query('ALTER TABLE `tickets` DROP COLUMN `reporter_location`');
    await queryRunner.query('ALTER TABLE `tickets` DROP COLUMN `reporter_email`');
    await queryRunner.query('ALTER TABLE `tickets` DROP COLUMN `reporter_name`');
    await queryRunner.query(
      'ALTER TABLE `tickets` MODIFY COLUMN `created_by_id` char(36) NOT NULL',
    );
  }
}
