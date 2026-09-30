import { randomBytes } from 'crypto';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketTrackingToken1730000007000 implements MigrationInterface {
  name = 'AddTicketTrackingToken1730000007000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tickets` ADD COLUMN `tracking_token` varchar(43) NULL');
    const rows: Array<{ id: string }> = await queryRunner.query('SELECT `id` FROM `tickets`');
    const tokens = new Set<string>();
    for (const { id } of rows) {
      let token: string;
      do {
        token = randomBytes(32).toString('base64url');
      } while (tokens.has(token));
      tokens.add(token);
      await queryRunner.query('UPDATE `tickets` SET `tracking_token` = ? WHERE `id` = ?', [
        token,
        id,
      ]);
    }
    await queryRunner.query(
      'ALTER TABLE `tickets` MODIFY COLUMN `tracking_token` varchar(43) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `tickets` ADD CONSTRAINT `UQ_tickets_tracking_token` UNIQUE (`tracking_token`)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tickets` DROP INDEX `UQ_tickets_tracking_token`');
    await queryRunner.query('ALTER TABLE `tickets` DROP COLUMN `tracking_token`');
  }
}
