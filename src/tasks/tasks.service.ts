import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly tasks: Repository<Task>) {}

  async findAll(ownerId: string, query: QueryTasksDto) {
    const { status, priority, search, page, limit } = query;
    const qb = this.tasks
      .createQueryBuilder('task')
      .where('task.ownerId = :ownerId', { ownerId });

    if (status) qb.andWhere('task.status = :status', { status });
    if (priority) qb.andWhere('task.priority = :priority', { priority });
    if (search) qb.andWhere('task.title ILIKE :search', { search: `%${search}%` });

    const [items, total] = await qb
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(ownerId: string, id: string): Promise<Task> {
    // Scoping by owner means users can never read or change each other's tasks.
    const task = await this.tasks.findOne({ where: { id, ownerId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(ownerId: string, dto: CreateTaskDto): Promise<Task> {
    const task = this.tasks.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      ownerId,
    });
    return this.tasks.save(task);
  }

  async update(ownerId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(ownerId, id);
    const { dueDate, ...rest } = dto;
    Object.assign(task, rest);
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    return this.tasks.save(task);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const task = await this.findOne(ownerId, id);
    await this.tasks.remove(task);
  }

  async summary(ownerId: string) {
    const rows: { status: string; count: string }[] = await this.tasks
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.ownerId = :ownerId', { ownerId })
      .groupBy('task.status')
      .getRawMany();
    return rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = Number(r.count);
      return acc;
    }, {});
  }
}
