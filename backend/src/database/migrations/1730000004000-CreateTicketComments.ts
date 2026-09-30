import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketComments1730000004000 implements MigrationInterface {
  name = 'CreateTicketComments1730000004000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `ticket_comments` (`id` char(36) NOT NULL, `ticket_id` char(36) NOT NULL, `author_id` char(36) NOT NULL, `body` text NOT NULL, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT `PK_ticket_comments_id` PRIMARY KEY (`id`), INDEX `IDX_ticket_comments_ticket_id` (`ticket_id`), INDEX `IDX_ticket_comments_author_id` (`author_id`), CONSTRAINT `FK_ticket_comments_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE, CONSTRAINT `FK_ticket_comments_author` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT)',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `ticket_comments`');
  }
}
