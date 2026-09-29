import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTickets1730000002000 implements MigrationInterface {
  name = 'CreateTickets1730000002000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE `tickets` (`id` char(36) NOT NULL, `title` varchar(255) NOT NULL, `description` text NULL, `kind` enum('ticket','bug','suggestion','feature') NOT NULL DEFAULT 'ticket', `priority` enum('high','medium','low') NOT NULL DEFAULT 'medium', `status` enum('pending','in_progress','done','cancelled') NOT NULL DEFAULT 'pending', `project_id` char(36) NULL, `category_id` char(36) NULL, `created_by_id` char(36) NOT NULL, `assigned_to_id` char(36) NULL, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `PK_tickets_id` PRIMARY KEY (`id`), INDEX `IDX_tickets_project_id` (`project_id`), INDEX `IDX_tickets_category_id` (`category_id`), INDEX `IDX_tickets_created_by_id` (`created_by_id`), INDEX `IDX_tickets_assigned_to_id` (`assigned_to_id`), CONSTRAINT `FK_tickets_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL, CONSTRAINT `FK_tickets_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL, CONSTRAINT `FK_tickets_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT, CONSTRAINT `FK_tickets_assigned_to` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL)");
  }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE `tickets`'); }
}
