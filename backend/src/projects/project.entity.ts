import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 150 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'webhook_url', type: 'varchar', length: 2048, nullable: true }) webhookUrl!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt!: Date;
  ticketCount?: number;
  pendingTicketCount?: number;
}
