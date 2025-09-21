export type Priority = 'high' | 'medium' | 'low';
export interface Task {
    id :string;
    title: string;
    description: string;
    completed: boolean
    priority: Priority;
    createdAt: string
    updatedAT: string
}

export type LogOperation = 'CREATE' | 'UPDATE' | 'DELETE'

export interface LogEntry{
    op: LogOperation
    id: string
    data?: Partial<Task>
}