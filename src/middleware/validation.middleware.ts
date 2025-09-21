import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { Priority } from '../types/task.types';

const priorityEnum: [Priority, ...Priority[]] = ['low', 'medium', 'high'];

// Schema for creating a new task 
export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional().default(''),
  completed: z.boolean().default(false),
  priority: z.enum(priorityEnum).default('medium'),
});

// Schema for updating an existing task (--all fields optional)
export const updateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(priorityEnum).optional(),
});


export const validate = (schema: z.ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error.message);
      }
      next(error);
    }
  };