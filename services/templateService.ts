import { Task } from '../types';

const TEMPLATE_KEY = 'taskmaster_templates_v1';

export interface TaskTemplate {
    id: string;
    name: string;
    data: Partial<Task>;
}

export const templateService = {
    getTemplates: (): TaskTemplate[] => {
        const stored = localStorage.getItem(TEMPLATE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    saveTemplate: (name: string, task: Partial<Task>): TaskTemplate[] => {
        const templates = templateService.getTemplates();
        const newTemplate: TaskTemplate = {
            id: `TEMP-${Date.now()}`,
            name,
            data: {
                title: task.title,
                description: task.description,
                priority: task.priority,
                tags: task.tags,
                subtasks: task.subtasks?.map(s => ({ ...s, done: false })), // Reset done status
                assignees: task.assignees,
                // We don't save status, dueDate, id, history as they are specific to instance
            }
        };
        const updated = [...templates, newTemplate];
        localStorage.setItem(TEMPLATE_KEY, JSON.stringify(updated));
        return updated;
    },

    deleteTemplate: (id: string): TaskTemplate[] => {
        const templates = templateService.getTemplates();
        const updated = templates.filter(t => t.id !== id);
        localStorage.setItem(TEMPLATE_KEY, JSON.stringify(updated));
        return updated;
    }
};