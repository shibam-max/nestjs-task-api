import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task, TaskPriority, TaskStatus } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  const repo = {
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => ({ id: 'task-1', ...data })),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [TasksService, { provide: getRepositoryToken(Task), useValue: repo }],
    }).compile();
    service = moduleRef.get(TasksService);
  });

  it('creates a task owned by the current user', async () => {
    const task = await service.create('user-1', { title: 'Write tests', priority: TaskPriority.HIGH });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Write tests', ownerId: 'user-1', dueDate: null }),
    );
    expect(task.id).toBe('task-1');
  });

  it("does not return another user's task", async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('user-2', 'task-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'task-1', ownerId: 'user-2' } });
  });

  it('updates only the provided fields', async () => {
    repo.findOne.mockResolvedValue({ id: 'task-1', title: 'Old', status: TaskStatus.TODO, ownerId: 'user-1' });
    const updated = await service.update('user-1', 'task-1', { status: TaskStatus.DONE });
    expect(updated.status).toBe(TaskStatus.DONE);
    expect(updated.title).toBe('Old');
  });
});
