import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import { sendAdminNotification, sendThankYouEmail } from './services/emailService.js';
import { sendAdminSMS, sendLeadSMS } from './services/smsService.js';

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

// Get all leads (for admin - can add authentication later)
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leads ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message,
    });
  }
});

// Create new lead (form submission)
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

    // Insert lead into database
    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, course_looking_for, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, courseLookingFor, message || null]
    );

    const newLead = result.rows[0];

    // Send notifications (don't wait for these to complete)
    const leadData = {
      name,
      email,
      phone,
      course_looking_for: courseLookingFor,
      message,
    };

    // Send email notifications
    Promise.all([
      sendAdminNotification(leadData),
      sendThankYouEmail(leadData),
    ])
      .then(([adminEmail, thankYouEmail]) => {
        console.log('Email notifications sent:');
        console.log('  Admin:', adminEmail.success ? '✅' : '❌');
        console.log('  Thank You:', thankYouEmail.success ? '✅' : '❌');
      })
      .catch((err) => {
        console.error('Error sending emails:', err);
      });

    // Send SMS notifications
    Promise.all([sendAdminSMS(leadData), sendLeadSMS(leadData)])
      .then(([adminSMS, leadSMS]) => {
        console.log('SMS notifications sent:');
        console.log('  Admin:', adminSMS.success ? '✅' : '❌');
        console.log('  Lead:', leadSMS.success ? '✅' : '❌');
      })
      .catch((err) => {
        console.error('Error sending SMS:', err);
      });

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully! We will contact you soon.',
      data: newLead,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit lead. Please try again.',
      error: error.message,
    });
  }
});

// Get lead by ID
app.get('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message,
    });
  }
});

// Update lead (for admin - can add authentication later)
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, courseLookingFor, message } = req.body;

    const result = await pool.query(
      `UPDATE leads
       SET name = $1, email = $2, phone = $3, course_looking_for = $4, message = $5
       WHERE id = $6
       RETURNING *`,
      [name, email, phone, courseLookingFor, message, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message,
    });
  }
});

// Delete lead (for admin - can add authentication later)
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message,
    });
  }
});

// Test database connection route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
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
║   📊 API: http://localhost:${PORT}/api                 ║
║                                                       ║
║   Status: ✅ Ready to accept requests                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
