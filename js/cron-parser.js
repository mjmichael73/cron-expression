// Cron expression parser and utilities

const CronParser = {
    // Parse cron expression to human-readable format
    toHumanReadable(expression) {
        const parts = expression.trim().split(/\s+/);
        
        if (parts.length < 5 || parts.length > 6) {
            return 'Invalid cron expression';
        }

        const [minute, hour, day, month, weekday, second] = parts.length === 6 
            ? [parts[1], parts[2], parts[3], parts[4], parts[5], parts[0]]
            : [parts[0], parts[1], parts[2], parts[3], parts[4], null];

        let description = '';

        // Time part
        if (minute === '*' && hour === '*') {
            description = 'Every minute';
        } else if (hour === '*') {
            description = `At ${this.describeMinute(minute)} past every hour`;
        } else if (minute === '0') {
            description = `At ${this.describeHour(hour)}`;
        } else {
            description = `At ${this.describeHour(hour)}:${this.describeMinute(minute, true)}`;
        }

        // Day part
        const dayDesc = this.describeDay(day, weekday);
        if (dayDesc) {
            description += `, ${dayDesc}`;
        }

        // Month part
        if (month !== '*') {
            description += `, ${this.describeMonth(month)}`;
        }

        return description;
    },

    describeMinute(minute, padded = false) {
        if (minute === '*') return 'every minute';
        if (minute.includes('/')) {
            const interval = minute.split('/')[1];
            return `every ${interval} minute${interval !== '1' ? 's' : ''}`;
        }
        if (minute.includes(',')) {
            return `minute${minute.split(',').length > 1 ? 's' : ''} ${minute}`;
        }
        if (minute.includes('-')) {
            return `minutes ${minute}`;
        }
        return padded ? minute.padStart(2, '0') : minute;
    },

    describeHour(hour) {
        if (hour === '*') return 'every hour';
        if (hour.includes('/')) {
            const interval = hour.split('/')[1];
            return `every ${interval} hour${interval !== '1' ? 's' : ''}`;
        }
        if (hour.includes(',')) {
            const hours = hour.split(',').map(h => this.formatHour(h));
            return hours.join(' and ');
        }
        if (hour.includes('-')) {
            const [start, end] = hour.split('-');
            return `${this.formatHour(start)} through ${this.formatHour(end)}`;
        }
        return this.formatHour(hour);
    },

    formatHour(hour) {
        const h = parseInt(hour);
        if (h === 0) return '12:00 AM';
        if (h === 12) return '12:00 PM';
        if (h < 12) return `${h}:00 AM`;
        return `${h - 12}:00 PM`;
    },

    describeDay(day, weekday) {
        const dayPart = [];

        if (day === '*' && weekday === '*') {
            return 'every day';
        }

        if (day !== '*') {
            if (day === 'L') {
                dayPart.push('on the last day of the month');
            } else if (day.includes('/')) {
                const interval = day.split('/')[1];
                dayPart.push(`every ${interval} day${interval !== '1' ? 's' : ''}`);
            } else if (day.includes(',')) {
                dayPart.push(`on day${day.split(',').length > 1 ? 's' : ''} ${day} of the month`);
            } else {
                dayPart.push(`on day ${day} of the month`);
            }
        }

        if (weekday !== '*' && weekday !== '?') {
            const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            if (weekday === '1-5') {
                dayPart.push('on weekdays');
            } else if (weekday === '0,6' || weekday === '6,0') {
                dayPart.push('on weekends');
            } else if (weekday.includes(',')) {
                const days = weekday.split(',').map(d => weekdayNames[parseInt(d)]);
                dayPart.push(`on ${days.join(', ')}`);
            } else if (weekday.includes('-')) {
                const [start, end] = weekday.split('-');
                dayPart.push(`on ${weekdayNames[start]} through ${weekdayNames[end]}`);
            } else {
                dayPart.push(`on ${weekdayNames[parseInt(weekday)]}`);
            }
        }

        return dayPart.join(' and ');
    },

    describeMonth(month) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        if (month.includes('/')) {
            const interval = month.split('/')[1];
            return `every ${interval} month${interval !== '1' ? 's' : ''}`;
        }
        if (month.includes(',')) {
            const months = month.split(',').map(m => {
                const num = parseInt(m);
                return monthNames[num - 1];
            });
            return `in ${months.join(', ')}`;
        }
        if (month.includes('-')) {
            const [start, end] = month.split('-');
            return `from ${monthNames[start - 1]} through ${monthNames[end - 1]}`;
        }
        return `in ${monthNames[parseInt(month) - 1]}`;
    },

    // Calculate next N run times
    getNextRuns(expression, count = 10, timezone = 'local') {
        try {
            const parts = expression.trim().split(/\s+/);
            if (parts.length < 5) return [];

            const [minute, hour, day, month, weekday] = parts;
            const runs = [];
            let currentDate = new Date();
            let attempts = 0;
            const maxAttempts = 10000; // Prevent infinite loops

            while (runs.length < count && attempts < maxAttempts) {
                attempts++;
                currentDate = new Date(currentDate.getTime() + 60000); // Add 1 minute

                if (this.matchesCron(currentDate, minute, hour, day, month, weekday)) {
                    runs.push(new Date(currentDate));
                }
            }

            return runs;
        } catch (error) {
            console.error('Error calculating next runs:', error);
            return [];
        }
    },

    matchesCron(date, minute, hour, day, month, weekday) {
        const m = date.getMinutes();
        const h = date.getHours();
        const d = date.getDate();
        const mo = date.getMonth() + 1;
        const wd = date.getDay();

        return this.matchesField(m, minute) &&
               this.matchesField(h, hour) &&
               (day === '*' || this.matchesField(d, day)) &&
               (month === '*' || this.matchesField(mo, month)) &&
               (weekday === '*' || this.matchesField(wd, weekday));
    },

    matchesField(value, pattern) {
        if (pattern === '*') return true;

        // Handle step values (*/5, 2-10/2)
        if (pattern.includes('/')) {
            const [range, step] = pattern.split('/');
            const stepNum = parseInt(step);
            
            if (range === '*') {
                return value % stepNum === 0;
            }
            
            if (range.includes('-')) {
                const [start, end] = range.split('-').map(Number);
                return value >= start && value <= end && (value - start) % stepNum === 0;
            }
        }

        // Handle ranges (1-5)
        if (pattern.includes('-')) {
            const [start, end] = pattern.split('-').map(Number);
            return value >= start && value <= end;
        }

        // Handle lists (1,3,5)
        if (pattern.includes(',')) {
            return pattern.split(',').map(Number).includes(value);
        }

        // Exact match
        return value === parseInt(pattern);
    },

    // Validate cron expression
    validate(expression) {
        const parts = expression.trim().split(/\s+/);
        
        if (parts.length < 5 || parts.length > 6) {
            return { valid: false, error: 'Cron expression must have 5 or 6 fields' };
        }

        // Basic validation for each field
        const [minute, hour, day, month, weekday] = parts.length === 5 
            ? parts 
            : [parts[1], parts[2], parts[3], parts[4], parts[5]];

        if (!this.isValidField(minute, 0, 59)) {
            return { valid: false, error: 'Invalid minute field (must be 0-59)' };
        }
        if (!this.isValidField(hour, 0, 23)) {
            return { valid: false, error: 'Invalid hour field (must be 0-23)' };
        }
        if (!this.isValidField(day, 1, 31)) {
            return { valid: false, error: 'Invalid day field (must be 1-31)' };
        }
        if (!this.isValidField(month, 1, 12)) {
            return { valid: false, error: 'Invalid month field (must be 1-12)' };
        }
        if (!this.isValidField(weekday, 0, 6)) {
            return { valid: false, error: 'Invalid weekday field (must be 0-6)' };
        }

        return { valid: true };
    },

    isValidField(field, min, max) {
        if (field === '*' || field === '?') return true;
        
        // Handle step values
        if (field.includes('/')) {
            const [range, step] = field.split('/');
            return this.isValidField(range, min, max) && !isNaN(step);
        }

        // Handle ranges
        if (field.includes('-')) {
            const [start, end] = field.split('-').map(Number);
            return start >= min && end <= max && start <= end;
        }

        // Handle lists
        if (field.includes(',')) {
            return field.split(',').every(v => {
                const num = parseInt(v);
                return num >= min && num <= max;
            });
        }

        // Single value
        const num = parseInt(field);
        return !isNaN(num) && num >= min && num <= max;
    }
};