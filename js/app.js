// Main application logic

class CronBuilder {
    constructor() {
        this.currentMode = 'builder';
        this.currentFormat = 'linux';
        this.currentExpression = '0 0 * * *';
        this.currentMonth = new Date();
        this.selectedValues = {
            minute: [],
            hour: [],
            day: [],
            month: [],
            weekday: []
        };

        this.initializeElements();
        this.attachEventListeners();
        this.generateValueGrids();
        this.updateExpression();
        this.renderPresets();
        this.updateCalendar();
    }

    initializeElements() {
        this.cronExpression = document.getElementById('cronExpression');
        this.humanReadable = document.getElementById('humanReadable');
        this.expressionLabels = document.getElementById('expressionLabels');
        this.copyBtn = document.getElementById('copyBtn');
        this.manualExpression = document.getElementById('manualExpression');
        this.parseBtn = document.getElementById('parseBtn');
        this.nextRuns = document.getElementById('nextRuns');
        this.timezoneSelect = document.getElementById('timezoneSelect');
        this.calendarView = document.getElementById('calendarView');
        this.calendarMonth = document.getElementById('calendarMonth');
        this.prevMonth = document.getElementById('prevMonth');
        this.nextMonth = document.getElementById('nextMonth');
    }

    attachEventListeners() {
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });

        // Format toggle
        document.querySelectorAll('input[name="format"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFormat = e.target.value;
                this.updateExpressionLabels();
            });
        });

        // Copy button
        this.copyBtn.addEventListener('click', () => this.copyExpression());

        // Manual expression
        this.parseBtn.addEventListener('click', () => this.parseManualExpression());
        this.manualExpression.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.parseManualExpression();
        });

        // Builder field changes
        this.attachBuilderListeners();

        // Timezone change
        this.timezoneSelect.addEventListener('change', () => this.updateNextRuns());

        // Calendar navigation
        this.prevMonth.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonth.addEventListener('click', () => this.changeMonth(1));

        // Integration tabs
        document.querySelectorAll('.int-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchIntegrationTab(tab.dataset.tab));
        });

        // Copy code buttons
        document.querySelectorAll('.copy-code-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyCode(btn.dataset.target));
        });
    }

    attachBuilderListeners() {
        // Minute field
        document.querySelectorAll('input[name="minute-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateField('minute'));
        });
        document.getElementById('minuteInterval')?.addEventListener('input', () => this.updateField('minute'));
        document.getElementById('minuteStart')?.addEventListener('input', () => this.updateField('minute'));
        document.getElementById('minuteEnd')?.addEventListener('input', () => this.updateField('minute'));

        // Hour field
        document.querySelectorAll('input[name="hour-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateField('hour'));
        });
        document.getElementById('hourInterval')?.addEventListener('input', () => this.updateField('hour'));
        document.getElementById('hourStart')?.addEventListener('input', () => this.updateField('hour'));
        document.getElementById('hourEnd')?.addEventListener('input', () => this.updateField('hour'));

        // Day field
        document.querySelectorAll('input[name="day-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateField('day'));
        });
        document.getElementById('dayInterval')?.addEventListener('input', () => this.updateField('day'));

        // Month field
        document.querySelectorAll('input[name="month-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateField('month'));
        });
        document.getElementById('monthInterval')?.addEventListener('input', () => this.updateField('month'));

        // Weekday field
        document.querySelectorAll('input[name="weekday-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateField('weekday'));
        });
    }

    generateValueGrids() {
        // Generate minute grid (0-59)
        const minuteGrid = document.getElementById('minuteGrid');
        for (let i = 0; i < 60; i++) {
            const btn = document.createElement('button');
            btn.className = 'value-btn';
            btn.textContent = i;
            btn.dataset.value = i;
            btn.addEventListener('click', () => this.toggleValue('minute', i));
            minuteGrid.appendChild(btn);
        }

        // Generate hour grid (0-23)
        const hourGrid = document.getElementById('hourGrid');
        for (let i = 0; i < 24; i++) {
            const btn = document.createElement('button');
            btn.className = 'value-btn';
            btn.textContent = i;
            btn.dataset.value = i;
            btn.addEventListener('click', () => this.toggleValue('hour', i));
            hourGrid.appendChild(btn);
        }

        // Generate day grid (1-31)
        const dayGrid = document.getElementById('dayGrid');
        for (let i = 1; i <= 31; i++) {
            const btn = document.createElement('button');
            btn.className = 'value-btn';
            btn.textContent = i;
            btn.dataset.value = i;
            btn.addEventListener('click', () => this.toggleValue('day', i));
            dayGrid.appendChild(btn);
        }

        // Month buttons already in HTML
        document.querySelectorAll('.month-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleValue('month', parseInt(btn.dataset.value));
                document.querySelector('input[name="month-type"][value="specific"]').checked = true;
                this.updateField('month');
            });
        });

        // Weekday buttons already in HTML
        document.querySelectorAll('.weekday-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleValue('weekday', parseInt(btn.dataset.value));
                document.querySelector('input[name="weekday-type"][value="specific"]').checked = true;
                this.updateField('weekday');
            });
        });
    }

    toggleValue(field, value) {
        const index = this.selectedValues[field].indexOf(value);
        if (index > -1) {
            this.selectedValues[field].splice(index, 1);
        } else {
            this.selectedValues[field].push(value);
        }
        this.selectedValues[field].sort((a, b) => a - b);

        // Update button state
        const selector = field === 'month' ? '.month-btn' : 
                        field === 'weekday' ? '.weekday-btn' : '.value-btn';
        const container = document.getElementById(`${field}Grid`) || 
                         document.querySelector(field === 'month' ? '.month-grid' : '.weekday-grid');
        
        if (container) {
            container.querySelectorAll(selector).forEach(btn => {
                const btnValue = parseInt(btn.dataset.value);
                btn.classList.toggle('active', this.selectedValues[field].includes(btnValue));
            });
        }

        this.updateField(field);
    }

    updateField(field) {
        const type = document.querySelector(`input[name="${field}-type"]:checked`)?.value;
        const specificDiv = document.getElementById(`${field}Specific`);

        if (specificDiv) {
            specificDiv.style.display = type === 'specific' ? 'block' : 'none';
        }

        this.updateExpression();
    }

    updateExpression() {
        const minute = this.getFieldValue('minute');
        const hour = this.getFieldValue('hour');
        const day = this.getFieldValue('day');
        const month = this.getFieldValue('month');
        const weekday = this.getFieldValue('weekday');

        this.currentExpression = `${minute} ${hour} ${day} ${month} ${weekday}`;
        this.cronExpression.textContent = this.currentExpression;
        this.manualExpression.value = this.currentExpression;

        this.humanReadable.textContent = CronParser.toHumanReadable(this.currentExpression);
        this.updateNextRuns();
        this.updateCalendar();
        this.updateIntegrationCode();
    }

    getFieldValue(field) {
        const type = document.querySelector(`input[name="${field}-type"]:checked`)?.value;

        switch (type) {
            case 'every':
                return '*';
            
            case 'specific':
                return this.selectedValues[field].length > 0 
                    ? this.selectedValues[field].join(',') 
                    : '*';
            
            case 'interval':
                const interval = document.getElementById(`${field}Interval`)?.value || 1;
                return `*/${interval}`;
            
            case 'range':
                const start = document.getElementById(`${field}Start`)?.value || 0;
                const end = document.getElementById(`${field}End`)?.value || 0;
                return `${start}-${end}`;
            
            case 'weekdays':
                return '1-5';
            
            case 'weekends':
                return '0,6';
            
            case 'last':
                return 'L';
            
            default:
                return '*';
        }
    }

    updateExpressionLabels() {
        if (this.currentFormat === 'extended') {
            this.expressionLabels.innerHTML = `
                <span class="field-label">second</span>
                <span class="field-label">minute</span>
                <span class="field-label">hour</span>
                <span class="field-label">day</span>
                <span class="field-label">month</span>
                <span class="field-label">weekday</span>
            `;
        } else {
            this.expressionLabels.innerHTML = `
                <span class="field-label">minute</span>
                <span class="field-label">hour</span>
                <span class="field-label">day</span>
                <span class="field-label">month</span>
                <span class="field-label">weekday</span>
            `;
        }
    }

    switchMode(mode) {
        this.currentMode = mode;

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.toggle('active', content.id === `${mode}Mode`);
        });
    }

    copyExpression() {
        navigator.clipboard.writeText(this.currentExpression).then(() => {
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = '✓';
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        });
    }

    parseManualExpression() {
        const expression = this.manualExpression.value.trim();
        const validation = CronParser.validate(expression);

        if (validation.valid) {
            this.currentExpression = expression;
            this.cronExpression.textContent = expression;
            this.humanReadable.textContent = CronParser.toHumanReadable(expression);
            this.updateNextRuns();
            this.updateCalendar();
            this.updateIntegrationCode();
        } else {
            alert(`Invalid cron expression: ${validation.error}`);
        }
    }

    updateNextRuns() {
        const runs = CronParser.getNextRuns(this.currentExpression, 10);
        
        this.nextRuns.innerHTML = '';
        runs.forEach(run => {
            const runItem = document.createElement('div');
            runItem.className = 'run-item';
            
            const timeStr = run.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const relative = this.getRelativeTime(run);

            runItem.innerHTML = `
                <span class="run-time">${timeStr}</span>
                <span class="run-relative">${relative}</span>
            `;
            
            this.nextRuns.appendChild(runItem);
        });
    }

    getRelativeTime(date) {
        const now = new Date();
        const diff = date - now;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'in less than a minute';
        if (minutes < 60) return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        if (hours < 24) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
        return `in ${days} day${days !== 1 ? 's' : ''}`;
    }

    updateCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        this.calendarMonth.textContent = this.currentMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let html = '<div class="calendar-header">';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            html += `<div class="calendar-day-name">${day}</div>`;
        });
        html += '</div><div class="calendar-grid">';

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
        }

        // Current month days
        const today = new Date();
        const runs = CronParser.getNextRuns(this.currentExpression, 100);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const isScheduled = runs.some(run => 
                run.getDate() === day && 
                run.getMonth() === month && 
                run.getFullYear() === year
            );

            let className = 'calendar-day';
            if (isToday) className += ' today';
            if (isScheduled) className += ' scheduled';

            html += `<div class="${className}">${day}</div>`;
        }

        // Next month days
        const remainingDays = 42 - (firstDay + daysInMonth);
        for (let i = 1; i <= remainingDays; i++) {
            html += `<div class="calendar-day other-month">${i}</div>`;
        }

        html += '</div>';
        this.calendarView.innerHTML = html;
    }

    changeMonth(delta) {
        this.currentMonth = new Date(
            this.currentMonth.getFullYear(),
            this.currentMonth.getMonth() + delta,
            1
        );
        this.updateCalendar();
    }

    renderPresets() {
        const grid = document.querySelector('.presets-grid');
        CronPresets.forEach(preset => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div class="preset-title">${preset.title}</div>
                <div class="preset-expression">${preset.expression}</div>
                <div class="preset-description">${preset.description}</div>
            `;
            card.addEventListener('click', () => {
                this.currentExpression = preset.expression;
                this.cronExpression.textContent = preset.expression;
                this.manualExpression.value = preset.expression;
                this.humanReadable.textContent = CronParser.toHumanReadable(preset.expression);
                this.updateNextRuns();
                this.updateCalendar();
                this.updateIntegrationCode();
                this.switchMode('expression');
            });
            grid.appendChild(card);
        });
    }

    updateIntegrationCode() {
        const expr = this.currentExpression;
        
        document.getElementById('githubCode').textContent = 
`name: Scheduled Job
on:
  schedule:
    - cron: '${expr}'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run scheduled task
        run: echo "Running scheduled job"`;

        document.getElementById('gitlabCode').textContent = 
`scheduled-job:
  script:
    - echo "Running scheduled job"
  only:
    - schedules
  # Set schedule in GitLab UI: ${expr}`;

        document.getElementById('jenkinsCode').textContent = 
`pipeline {
    agent any
    triggers {
        cron('${expr}')
    }
    stages {
        stage('Scheduled Task') {
            steps {
                echo 'Running scheduled job'
            }
        }
    }
}`;

        document.getElementById('linuxCode').textContent = 
`# Edit crontab: crontab -e
${expr} /path/to/your/script.sh

# Or add to /etc/crontab:
${expr} username /path/to/your/script.sh`;
    }

    switchIntegrationTab(tab) {
        document.querySelectorAll('.int-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        document.querySelectorAll('.int-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === tab);
        });
    }

    copyCode(targetId) {
        const code = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.querySelector(`[data-target="${targetId}"]`);
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new CronBuilder();
});