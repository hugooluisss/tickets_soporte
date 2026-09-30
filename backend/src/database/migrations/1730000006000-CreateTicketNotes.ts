import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketNotes1730000006000 implements MigrationInterface {
  name = 'CreateTicketNotes1730000006000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `ticket_notes` (`id` char(36) NOT NULL, `ticket_id` char(36) NOT NULL, `author_id` char(36) NOT NULL, `content` text NOT NULL, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT `PK_ticket_notes_id` PRIMARY KEY (`id`), INDEX `IDX_ticket_notes_ticket_id` (`ticket_id`), INDEX `IDX_ticket_notes_author_id` (`author_id`), CONSTRAINT `FK_ticket_notes_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE, CONSTRAINT `FK_ticket_notes_author` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT)',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `ticket_notes`');
  }
}
