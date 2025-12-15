import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendAdminNotification, sendThankYouEmail } from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Neon Computer Education API is running',
    timestamp: new Date().toISOString(),
  });
});

// Submit contact form (sends email notifications only)
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, courseLookingFor, message } = req.body;

    // Validation
    if (!name || !email || !phone || !courseLookingFor) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      });
    }

    // Prepare lead data for email notifications
    const leadData = {
      name,
      email,
      phone,
      course_looking_for: courseLookingFor,
      message: message || 'No additional message',
      submitted_at: new Date().toISOString(),
    };

    // Send email notifications (async, don't wait for completion)
    Promise.all([
      sendAdminNotification(leadData),
      sendThankYouEmail(leadData),
    ])
      .then(([adminEmail, thankYouEmail]) => {
        console.log('Email notifications sent:');
        console.log('  Admin Email:', adminEmail.success ? '✅' : '❌');
        console.log('  Thank You Email:', thankYouEmail.success ? '✅' : '❌');
      })
      .catch((err) => {
        console.error('Error sending emails:', err);
      });

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        name: leadData.name,
        email: leadData.email,
        submitted_at: leadData.submitted_at,
      },
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form. Please try again.',
      error: error.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Neon Computer Education Server Running          ║
║                                                       ║
║   📡 Port: ${PORT}                                      ║
║   🌐 URL: http://localhost:${PORT}                     ║
║   📧 Email Service: Active                            ║
║                                                       ║
║   Status: ✅ Ready to accept requests                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
