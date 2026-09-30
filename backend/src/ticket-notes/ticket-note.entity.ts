import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'ticket_notes' })
export class TicketNote {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'ticket_id', type: 'char', length: 36 }) ticketId!: string;
  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'ticket_id' }) ticket!: Ticket;
  @Column({ name: 'author_id', type: 'char', length: 36 }) authorId!: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'author_id' }) author!: User;
  @Column({ type: 'text' }) content!: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' }) createdAt!: Date;
}
