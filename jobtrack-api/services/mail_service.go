// Package services contains the business logic layer for JobTrack.
package services

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
)

// MailService handles sending HTML email notifications via SMTP.
type MailService struct {
	host     string
	port     string
	username string
	password string
	from     string
	tmpl     *template.Template
}

// reminderTemplateData holds the data passed to the reminder email template.
type reminderTemplateData struct {
	ReminderTitle string
	Company       string
	DueAt         string
}

// NewMailService creates a new MailService using SMTP credentials
// loaded from environment variables.
// Parses the reminder HTML template from disk on startup.
func NewMailService() *MailService {
	tmpl, err := template.ParseFiles("templates/reminder.html")
	if err != nil {
		// Template is required — terminate if it cannot be loaded.
		panic(fmt.Sprintf("failed to parse reminder email template: %v", err))
	}

	return &MailService{
		host:     os.Getenv("SMTP_HOST"),
		port:     os.Getenv("SMTP_PORT"),
		username: os.Getenv("SMTP_USERNAME"),
		password: os.Getenv("SMTP_PASSWORD"),
		from:     os.Getenv("SMTP_FROM"),
		tmpl:     tmpl,
	}
}

// SendReminder sends an HTML email notification for a job application reminder.
// The email contains the reminder title, company name and due date.
func (m *MailService) SendReminder(to, reminderTitle, company, dueAt string) error {
	data := reminderTemplateData{
		ReminderTitle: reminderTitle,
		Company:       company,
		DueAt:         dueAt,
	}

	var body bytes.Buffer
	if err := m.tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to render email template: %w", err)
	}

	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: JobTrack Reminder: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		m.from, to, reminderTitle, body.String(),
	)

	var auth smtp.Auth
	// Mailpit does not require authentication in local development.
	if m.username != "" {
		auth = smtp.PlainAuth("", m.username, m.password, m.host)
	}

	addr := fmt.Sprintf("%s:%s", m.host, m.port)
	if err := smtp.SendMail(addr, auth, m.from, []string{to}, []byte(message)); err != nil {
		return fmt.Errorf("failed to send email to %s: %w", to, err)
	}

	return nil
}
