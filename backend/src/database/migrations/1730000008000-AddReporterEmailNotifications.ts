import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReporterEmailNotifications1730000008000 implements MigrationInterface {
  name = 'AddReporterEmailNotifications1730000008000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tickets` ADD COLUMN `reporter_email_notifications` boolean NOT NULL DEFAULT false');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tickets` DROP COLUMN `reporter_email_notifications`');
  }
}
