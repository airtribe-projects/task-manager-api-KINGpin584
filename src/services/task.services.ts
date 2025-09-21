import { promises as fs } from "fs";
import path from 'path'
import {Task,LogEntry,Priority}  from '../types/task.types'
import { randomUUID } from 'crypto';

export class TaskService{
    private tasks = new Map<string,Task>();
    private logPath = path.join(__dirname, '../../db.log');
    private dbPath = path.join(__dirname,'../../tasks.json');
    private isCompacting = false;
    private writeCounter = 0;


    constructor(){
        this.initialise()
    }
    private async initialise(){
        try{
            const dbdata = await fs.readFile(this.dbPath,'utf-8');
            const tasks: Task[] = JSON.parse(dbdata);
            tasks.forEach((task)=>{
                this.tasks.set(task.id,task)
            })

        }catch(error){
            console.log("DB FILE NOT FOUND TRYNIG AGAIN")

        }
        try {
            const logFile = await fs.readFile(this.logPath, 'utf-8');
            const logEntries = logFile.split('\n').filter(line => line.length > 0);

            logEntries.forEach(line => this.applyLogEntry(JSON.parse(line)));

            console.log(`Replayed ${logEntries.length} log entries.`);
        } catch (error) {
      // Log file might not exist, which is okay.
    }

    console.log(`${this.tasks.size} : tasks are loaded`);

    }
    private applyLogEntry(entry: LogEntry): void {
    switch (entry.op) {
      case 'CREATE':
        if (entry.data) this.tasks.set(entry.id, entry.data as Task);
        break;
      case 'UPDATE':
        const existingTask = this.tasks.get(entry.id);
        if (existingTask && entry.data) {
          this.tasks.set(entry.id, { ...existingTask, ...entry.data });
        }
        break;
      case 'DELETE':
        this.tasks.delete(entry.id);
        break;
    }
  }

    private async writeToLog(entry: LogEntry) {
    this.applyLogEntry(entry);
    const logLine = JSON.stringify(entry) + '\n';
    await fs.appendFile(this.logPath, logLine);

    this.writeCounter++;
    if (this.writeCounter > 5) {
      this.compact();
    }
}
    public async compact() {
    if (this.isCompacting) return;
    this.isCompacting = true;
    console.log('⚙️ Starting compaction...');
    
    try {
      const tasksArray = [...this.tasks.values()];
      await fs.writeFile(this.dbPath, JSON.stringify(tasksArray, null, 2));
      await fs.rename(this.dbPath, this.dbPath);
      await fs.truncate(this.logPath);
      this.writeCounter = 0;
      console.log('✅ Compaction successful.');
    } catch (error) {
      console.error('❌ Compaction failed:', error);
    } finally {
      this.isCompacting = false;
    }
  }

  async getAllTasks(priority?: Priority): Promise<Task[]> {
    let tasksArray = [...this.tasks.values()];
    if (priority) {
      tasksArray = tasksArray.filter(task => task.priority === priority);
    }
    return tasksArray;
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAT'>): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: randomUUID(),
      ...taskData,
      createdAt: now,
      updatedAT: now,
    };
    await this.writeToLog({ op: 'CREATE', id: newTask.id, data: newTask });
    return newTask;
  }

  async updateTask(id: string, taskUpdateData: Partial<Task>): Promise<Task | null> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return null;
    }
    const updatedTask = {
      ...existingTask,
      ...taskUpdateData,
      updatedAT: new Date().toISOString(),
    };
    await this.writeToLog({ op: 'UPDATE', id: id, data: updatedTask });
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    if (!this.tasks.has(id)) {
      return false;
    }
    await this.writeToLog({ op: 'DELETE', id });
    return true;
  }
}
