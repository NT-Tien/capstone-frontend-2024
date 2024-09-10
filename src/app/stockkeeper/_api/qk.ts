export const stockkeeper_qk = {
    tasks: {
        base: ['stockkeeper', 'tasks'],
        all: (props: {page: number, limit: number}) => [...stockkeeper_qk.tasks.base, 'all', props],
        one_byId: (id: string) => ['stockkeeper', 'tasks', 'one_byId', id],
    }
}