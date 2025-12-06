import dotenv from 'dotenv';

dotenv.config();

// Dummy SMS provider - Replace with actual SMS API integration
// Popular SMS providers in India: Twilio, MSG91, Fast2SMS, TextLocal

export const sendAdminSMS = async (leadData) => {
  try {
    const message = `New Lead from ${leadData.name} for ${leadData.course_looking_for}. Contact: ${leadData.phone}`;

    console.log('📱 SMS Service Configuration:');
    console.log('Provider:', process.env.SMS_PROVIDER);
    console.log('To:', process.env.ADMIN_PHONE);
    console.log('Message:', message);

    // Dummy implementation - logs instead of sending
    if (process.env.SMS_PROVIDER === 'dummy') {
      console.log('✅ SMS would be sent (Dummy mode - No actual SMS sent)');
      return {
        success: true,
        message: 'SMS logged (dummy mode)',
        provider: 'dummy',
      };
    }

    // TODO: Implement actual SMS provider integration
    // Example for Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ADMIN_PHONE,
    });

    return {
      success: true,
      messageId: result.sid,
      provider: 'twilio',
    };
    */

    // Example for MSG91:
    /*
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': process.env.MSG91_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: process.env.SMS_SENDER_ID,
        route: '4',
        country: '91',
        sms: [
          {
            message: message,
            to: [process.env.ADMIN_PHONE],
          },
        ],
      }),
    });

    const data = await response.json();
    return {
      success: true,
      messageId: data.request_id,
      provider: 'msg91',
    };
    */

    // Example for Fast2SMS:
    /*
    const params = new URLSearchParams({
      authorization: process.env.FAST2SMS_API_KEY,
      sender_id: process.env.SMS_SENDER_ID,
      message: message,
      language: 'english',
      route: 'p',
      numbers: process.env.ADMIN_PHONE.replace('+91', ''),
    });

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    return {
      success: data.return,
      messageId: data.request_id,
      provider: 'fast2sms',
    };
    */

    return {
      success: false,
      error: 'SMS provider not configured',
    };
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Send SMS to lead (optional - for OTP or confirmation)
export const sendLeadSMS = async (leadData) => {
  try {
    const message = `Thank you ${leadData.name} for showing interest in ${leadData.course_looking_for}. We will contact you soon! - Neon Computer Education`;

    console.log('📱 Sending SMS to lead:', leadData.phone);
    console.log('Message:', message);

    if (process.env.SMS_PROVIDER === 'dummy') {
      console.log('✅ Lead SMS would be sent (Dummy mode)');
      return {
        success: true,
        message: 'SMS logged (dummy mode)',
        provider: 'dummy',
      };
    }

    // Implement actual SMS sending here based on your provider

    return {
      success: false,
      error: 'SMS provider not configured',
    };
  } catch (error) {
    console.error('❌ Error sending SMS to lead:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Configuration instructions
export const getSMSProviderInstructions = () => {
  return {
    twilio: {
      description: 'Twilio - Reliable international SMS provider',
      setup: 'Install: npm install twilio',
      envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
      website: 'https://www.twilio.com',
    },
    msg91: {
      description: 'MSG91 - Popular Indian SMS provider',
      setup: 'No additional package needed (uses fetch)',
      envVars: ['MSG91_API_KEY', 'SMS_SENDER_ID'],
      website: 'https://msg91.com',
    },
    fast2sms: {
      description: 'Fast2SMS - Indian SMS provider',
      setup: 'No additional package needed (uses fetch)',
      envVars: ['FAST2SMS_API_KEY', 'SMS_SENDER_ID'],
      website: 'https://www.fast2sms.com',
    },
  };
};
