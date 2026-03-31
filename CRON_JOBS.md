# ⏰ CODEC Cron Jobs Documentation

## Overview
CODEC includes automated cron jobs for maintenance, cleanup, and reporting tasks.

## 📋 Scheduled Tasks

### 1. Token Cleanup
**Schedule**: Daily at 2:00 AM (`0 2 * * *`)
**Purpose**: Remove expired authentication tokens
**Action**: Clears tokens that have expired from user accounts

### 2. Orphaned Files Cleanup
**Schedule**: Weekly on Sunday at 3:00 AM (`0 3 * * 0`)
**Purpose**: Remove files that exist in uploads folder but not in database
**Action**: Deletes orphaned files to free up storage space

### 3. Weekly Statistics
**Schedule**: Every Monday at 9:00 AM (`0 9 * * 1`)
**Purpose**: Generate usage statistics
**Action**: Counts users, documents, active users, and storage usage

### 4. Notification Cleanup
**Schedule**: Daily at 1:00 AM (`0 1 * * *`)
**Purpose**: Remove old notifications
**Action**: Deletes notifications older than 30 days

### 5. Inactive User Reminders
**Schedule**: Every Wednesday at 10:00 AM (`0 10 * * 3`)
**Purpose**: Send reminders to inactive users
**Action**: Identifies users inactive for 30+ days (excluding admins)

## 🔧 API Endpoints

### Get Cron Status
```
GET /api/cron/status
Headers: Authorization: Bearer <admin-token>
```
Returns status of all scheduled cron jobs.

### Start All Cron Jobs
```
POST /api/cron/start
Headers: Authorization: Bearer <admin-token>
```
Starts all scheduled cron jobs.

### Stop All Cron Jobs
```
POST /api/cron/stop
Headers: Authorization: Bearer <admin-token>
```
Stops all scheduled cron jobs.

### Manual Cleanup
```
POST /api/cron/cleanup/:type
Headers: Authorization: Bearer <admin-token>
Types: tokens, files, notifications
```
Manually triggers specific cleanup tasks.

## 🚀 Installation

1. Install node-cron:
```bash
npm install node-cron
```

2. Cron jobs start automatically when server starts.

## 📊 Monitoring

- Check server logs for cron job execution
- Use `/api/cron/status` endpoint to monitor job status
- Manual triggers available for immediate cleanup

## ⚠️ Important Notes

- All cron jobs require admin privileges to control
- Jobs run automatically based on server timezone
- Manual cleanup available for immediate needs
- Logs are written to console for debugging

## 🔒 Security

- All cron control endpoints require admin authentication
- Cleanup operations are logged for audit trails
- File operations are restricted to uploads directory
