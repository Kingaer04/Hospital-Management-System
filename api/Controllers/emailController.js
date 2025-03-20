import { sendEmail } from '../services/emailService.js';

export const sendEmailToPatient = async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, or body' 
      });
    }
    
    const result = await sendEmail(to, subject, body);
    
    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    });
  }
};