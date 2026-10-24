import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  name: string;

  @OneToMany(() => Task, (task) => task.owner)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}
