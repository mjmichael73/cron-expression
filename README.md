# ⏰ Cron Expression Builder & Visualizer

A comprehensive tool for building, testing, and visualizing cron schedules. Perfect for developers working with scheduled tasks across different platforms.

## ✨ Features

### 🔧 Visual Builder
- **Point-and-click Interface** - Build cron expressions without memorizing syntax
- **Field-by-field Configuration** - Separate controls for minute, hour, day, month, weekday
- **Multiple Input Modes** - Every, specific values, intervals, ranges
- **Smart Defaults** - Common patterns readily available

### ⌨️ Expression Editor
- **Manual Input** - Type cron expressions directly
- **Syntax Validation** - Real-time validation and error messages
- **Quick Reference** - Built-in syntax guide
- **Special Characters** - Support for *, /, -, ,, L, W, #

### 📚 Common Presets
- Ready-made templates for common schedules
- One-click application
- Descriptions for each preset

### 📅 Next Run Preview
- See next 10 scheduled executions
- Relative time display (in X minutes/hours/days)
- Multiple timezone support
- Accurate calculations

### 📊 Calendar Visualization
- Month view with highlighted run days
- Navigate through months
- Visual indication of today and scheduled days
- Pattern recognition at a glance

### 🔧 Platform Integration
- **GitHub Actions** - Ready-to-use workflow YAML
- **GitLab CI** - Pipeline configuration
- **Jenkins** - Jenkinsfile with cron trigger
- **Linux Crontab** - Traditional cron format

## 🚀 Live Demo

Visit: [https://yourusername.github.io/cron-builder](https://yourusername.github.io/cron-builder)

## 📖 Usage Guide

### Building a Cron Expression

1. **Select Mode** - Choose Visual Builder, Expression Editor, or Presets
2. **Configure Fields** - Set minute, hour, day, month, weekday
3. **Preview** - See human-readable description and next run times
4. **Visualize** - Check calendar for run pattern
5. **Copy** - Use in your CI/CD platform

### Common Patterns

| Schedule | Expression | Description |
|----------|-----------|-------------|
| Every minute | `* * * * *` | Runs every minute |
| Every hour | `0 * * * *` | Runs at minute 0 of every hour |
| Daily at midnight | `0 0 * * *` | Runs once a day |
| Weekdays at 9 AM | `0 9 * * 1-5` | Monday-Friday at 9:00 AM |
| Every 15 minutes | `*/15 * * * *` | Four times per hour |

## 🎯 Cron Syntax