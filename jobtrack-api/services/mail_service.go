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

// welcomeTemplateData holds the data passed to the welcome email template.
type welcomeTemplateData struct {
	FirstName string
}

// NewMailService creates a new MailService using SMTP credentials
// loaded from environment variables.
// Parses the reminder HTML template from disk on startup.
func NewMailService() *MailService {
	tmpl, err := template.ParseGlob("templates/*.html")
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

// sendEmail is a shared helper that renders a template and sends it via SMTP.
func (m *MailService) sendEmail(to, subject, templateName string, data any) error {
	var body bytes.Buffer
	if err := m.tmpl.ExecuteTemplate(&body, templateName, data); err != nil {
		return fmt.Errorf("failed to render template %s: %w", templateName, err)
	}

	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		m.from, to, subject, body.String(),
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

// SendWelcome sends a welcome email to a newly registered user.
func (m *MailService) SendWelcome(to, firstName string) error {
	return m.sendEmail(
		to,
		"Welcome to JobTrack!",
		"welcome.html",
		welcomeTemplateData{FirstName: firstName},
	)
}

// SendReminder sends an HTML email notification for a job application reminder.
// The email contains the reminder title, company name and due date.
func (m *MailService) SendReminder(to, reminderTitle, company, dueAt string) error {
	return m.sendEmail(
		to,
		fmt.Sprintf("JobTrack Reminder: %s", reminderTitle),
		"reminder.html",
		reminderTemplateData{
			ReminderTitle: reminderTitle,
			Company:       company,
			DueAt:         dueAt,
		},
	)
}
