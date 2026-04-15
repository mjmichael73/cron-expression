// Common cron presets

const CronPresets = [
    {
        title: 'Every minute',
        expression: '* * * * *',
        description: 'Runs every single minute'
    },
    {
        title: 'Every 5 minutes',
        expression: '*/5 * * * *',
        description: 'Runs every 5 minutes'
    },
    {
        title: 'Every 15 minutes',
        expression: '*/15 * * * *',
        description: 'Runs every 15 minutes'
    },
    {
        title: 'Every 30 minutes',
        expression: '*/30 * * * *',
        description: 'Runs every 30 minutes'
    },
    {
        title: 'Every hour',
        expression: '0 * * * *',
        description: 'Runs at the start of every hour'
    },
    {
        title: 'Every 2 hours',
        expression: '0 */2 * * *',
        description: 'Runs every 2 hours'
    },
    {
        title: 'Every day at midnight',
        expression: '0 0 * * *',
        description: 'Runs once a day at 12:00 AM'
    },
    {
        title: 'Every day at noon',
        expression: '0 12 * * *',
        description: 'Runs once a day at 12:00 PM'
    },
    {
        title: 'Every weekday at 9 AM',
        expression: '0 9 * * 1-5',
        description: 'Runs Monday through Friday at 9:00 AM'
    },
    {
        title: 'Every weekend at 10 AM',
        expression: '0 10 * * 0,6',
        description: 'Runs Saturday and Sunday at 10:00 AM'
    },
    {
        title: 'Every Monday at 8 AM',
        expression: '0 8 * * 1',
        description: 'Runs every Monday morning at 8:00 AM'
    },
    {
        title: 'First day of month',
        expression: '0 0 1 * *',
        description: 'Runs at midnight on the 1st of every month'
    },
    {
        title: 'Every Sunday at midnight',
        expression: '0 0 * * 0',
        description: 'Weekly run every Sunday at 12:00 AM'
    },
    {
        title: 'Business hours',
        expression: '0 9-17 * * 1-5',
        description: 'Every hour from 9 AM to 5 PM on weekdays'
    },
    {
        title: 'Every quarter (3 months)',
        expression: '0 0 1 */3 *',
        description: 'Runs on the 1st day every 3 months'
    },
    {
        title: 'Twice daily',
        expression: '0 0,12 * * *',
        description: 'Runs at midnight and noon every day'
    }
];