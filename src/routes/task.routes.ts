import { Request,Response,Router } from "express";
import { TaskService } from "../services/task.services";
import { validate, createTaskSchema, updateTaskSchema } from '../middleware/validation.middleware';
import { Priority } from '../types/task.types';

const router = Router();
// Create a single instance of the service to maintain state
const taskService = new TaskService(); 

// GET all tasks with optional priority filter
router.get('/tasks', async (req: Request, res: Response) => {
  const priority = req.query.priority as Priority | undefined;
  if (priority && !['high', 'medium', 'low'].includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority filter.' });
  }
  const tasks = await taskService.getAllTasks(priority);
  res.json(tasks);
});

// GET a single task by ID
router.get('/tasks/:id', async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json(task);
});

// POST (create) a new task
router.post('/tasks', validate(createTaskSchema), async (req: Request, res: Response) => {
  const newTask = await taskService.createTask(req.body);
  res.status(201).json(newTask);
});

// PATCH (update) an existing task
router.patch('/tasks/:id', validate(updateTaskSchema), async (req: Request, res: Response) => {
  const updatedTask = await taskService.updateTask(req.params.id, req.body);
  if (!updatedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json(updatedTask);
});

// DELETE a task
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  const success = await taskService.deleteTask(req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(204).send(); // 204 No Content for successful deletion
});


// You can export the router and the service instance for graceful shutdown
export { router as taskRoutes, taskService };
