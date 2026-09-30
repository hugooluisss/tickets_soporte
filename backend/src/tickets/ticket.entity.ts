import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Category } from '../categories/category.entity';
import { TicketKind } from './ticket-kind.enum';
import { TicketPriority } from './ticket-priority.enum';
import { TicketStatus } from './ticket-status.enum';

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 255 }) title!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'enum', enum: TicketKind, default: TicketKind.TICKET }) kind!: TicketKind;
  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM }) priority!: TicketPriority;
  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.PENDING }) status!: TicketStatus;
  @Column({ name: 'project_id', type: 'char', length: 36, nullable: true }) projectId!: string | null;
  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'project_id' }) project!: Project | null;
  @Column({ name: 'category_id', type: 'char', length: 36, nullable: true }) categoryId!: string | null;
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'category_id' }) category!: Category | null;
  @Column({ name: 'created_by_id', type: 'char', length: 36, nullable: true }) createdById!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'created_by_id' }) createdBy!: User | null;
  @Column({ name: 'reporter_name', type: 'varchar', length: 150, nullable: true }) reporterName!: string | null;
  @Column({ name: 'reporter_email', type: 'varchar', length: 255, nullable: true }) reporterEmail!: string | null;
  @Column({ name: 'reporter_email_notifications', type: 'boolean', default: false }) reporterEmailNotifications!: boolean;
  @Column({ name: 'reporter_location', type: 'varchar', length: 255, nullable: true }) reporterLocation!: string | null;
  @Column({ name: 'assigned_to_id', type: 'char', length: 36, nullable: true }) assignedToId!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'assigned_to_id' }) assignedTo!: User | null;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' }) updatedAt!: Date;
}
