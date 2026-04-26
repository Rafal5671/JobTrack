// Package worker contains background goroutines for JobTrack.
package worker

import (
	"log"
	"time"

	"jobtrack-api/models"
	"jobtrack-api/services"

	"gorm.io/gorm"
)

// ReminderWorker checks for pending reminders and dispatches email notifications.
type ReminderWorker struct {
	db          *gorm.DB
	mailService *services.MailService
	reminder    *services.ReminderService
	interval    time.Duration
}

// NewReminderWorker creates a new ReminderWorker with the given database.
// The worker checks for pending reminders every hour by default.
func NewReminderWorker(db *gorm.DB) *ReminderWorker {
	return &ReminderWorker{
		db:          db,
		mailService: services.NewMailService(),
		reminder:    services.NewReminderService(db),
		interval:    time.Hour,
	}
}

// StartReminderWorker initializes and starts the reminder worker loop.
// It is designed to run as a goroutine alongside the HTTP server.
func StartReminderWorker(db *gorm.DB) {
	w := NewReminderWorker(db)
	log.Println("Reminder worker started")
	w.run()
}

// run starts the ticker loop that periodically checks for pending reminders.
// The loop runs until the process is terminated.
func (w *ReminderWorker) run() {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	// Run immediately on startup, then on each tick.
	w.process()

	for range ticker.C {
		w.process()
	}
}

// process fetches all pending reminders and dispatches email notifications.
// Each reminder is processed individually — a failure on one does not
// stop the others from being sent.
func (w *ReminderWorker) process() {
	log.Println("Reminder worker: checking pending reminders")

	reminders, err := w.reminder.GetPending()
	if err != nil {
		log.Printf("Reminder worker: failed to fetch pending reminders: %v", err)
		return
	}

	if len(reminders) == 0 {
		log.Println("Reminder worker: no pending reminders")
		return
	}

	log.Printf("Reminder worker: found %d pending reminders", len(reminders))

	for _, reminder := range reminders {
		w.dispatch(reminder)
	}
}

// dispatch sends an email for a single reminder and marks it as sent.
func (w *ReminderWorker) dispatch(reminder models.Reminder) {
	var user models.User
	if err := w.db.First(&user, reminder.UserID).Error; err != nil {
		log.Printf("Reminder worker: user %d not found for reminder %d", reminder.UserID, reminder.ID)
		return
	}

	var application models.Application
	if err := w.db.First(&application, reminder.ApplicationID).Error; err != nil {
		log.Printf("Reminder worker: application %d not found for reminder %d", reminder.ApplicationID, reminder.ID)
		return
	}

	dueAt := reminder.DueAt.Format("Monday, 2 January 2006 at 15:04")

	if err := w.mailService.SendReminder(user.Email, reminder.Title, application.Company, dueAt); err != nil {
		log.Printf("Reminder worker: failed to send email for reminder %d: %v", reminder.ID, err)
		return
	}

	if err := w.reminder.MarkAsSent(reminder.ID); err != nil {
		log.Printf("Reminder worker: failed to mark reminder %d as sent: %v", reminder.ID, err)
		return
	}

	log.Printf("Reminder worker: reminder %d sent to %s", reminder.ID, user.Email)
}
