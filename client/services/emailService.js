const emailService = {
  sendEmail: async (to, subject, body) => {
    try {
      const response = await fetch('/recep-patient/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, body }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }
};

export default emailService;