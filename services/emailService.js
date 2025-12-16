import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    }
  });
};

// Send email notification to admin
export const sendAdminNotification = async (leadData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `New Lead: ${leadData.name} - ${leadData.course_looking_for}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00d4ff, #a855f7); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #0284c7; }
            .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #00d4ff; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Lead Received!</h1>
              <p>Someone is interested in your courses</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${leadData.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${leadData.email}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${leadData.phone}</div>
              </div>
              <div class="field">
                <div class="label">Course Interested In:</div>
                <div class="value">${leadData.course_looking_for}</div>
              </div>
              ${leadData.message ? `
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${leadData.message}</div>
                </div>
              ` : ''}
              <div class="field">
                <div class="label">Submitted At:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from Neon Computer Education</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send thank you email to lead
export const sendThankYouEmail = async (leadData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: leadData.email,
      subject: '🎉 Thank You for Your Interest - Neon Computer Education',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00d4ff, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: white; padding: 20px; border-left: 4px solid #00d4ff; margin: 20px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #00d4ff, #a855f7); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Neon Computer Education! 🚀</h1>
            </div>
            <div class="content">
              <h2>Hi ${leadData.name},</h2>
              <p>Thank you for your interest in our <strong>${leadData.course_looking_for}</strong> course!</p>

              <div class="highlight">
                <h3>🎁 Special Offer: Up to 30% OFF!</h3>
                <p>As a new inquiry, you're eligible for our limited-time discount on all courses.</p>
              </div>

              <p>Our team will contact you within 24 hours to discuss:</p>
              <ul>
                <li>Course details and curriculum</li>
                <li>Batch timings and schedules</li>
                <li>Your special discount offer</li>
                <li>Any questions you might have</li>
              </ul>

              <h3>Why Choose Neon Computer Education?</h3>
              <ul>
                <li>✅ Expert instructors with industry experience</li>
                <li>✅ Hands-on practical training</li>
                <li>✅ Placement assistance</li>
                <li>✅ Flexible timing options</li>
                <li>✅ Industry-recognized certification</li>
              </ul>

              <center>
                <a href="tel:+919876543210" class="cta-button">Call Us: +91 9876543210</a>
              </center>

              <p>Looking forward to helping you achieve your career goals!</p>

              <p>Best Regards,<br>
              <strong>Team Neon Computer Education</strong></p>
            </div>
            <div class="footer">
              <p>Neon Computer Education | Main Street, Tech City | Pin: 123456</p>
              <p>Email: info@neoncomputereducation.com | Phone: +91 9876543210</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Thank you email sent to lead:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending thank you email:', error);
    return { success: false, error: error.message };
  }
};
