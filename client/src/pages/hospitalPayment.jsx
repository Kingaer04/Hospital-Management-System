import React, { useState, useEffect } from 'react';
import HospitalCheckout from './checkout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import emailService from '../../services/emailService';
import { useParams } from 'react-router-dom';

const paystackService = {
  generatePaymentLink: async (invoiceData) => {
    try {
      const response = await fetch('/recep-patient/invoices/payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating payment link:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate payment link'
      };
    }
  },
  
  verifyPayment: async (reference) => {
    try {
      const response = await fetch(`/recep-patient/payments/verify/${reference}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify payment'
      };
    }
  },
  
  recordCashPayment: async (paymentData) => {
    try {
      const response = await fetch('/recep-patient/payments/record-cash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error recording cash payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to record cash payment'
      };
    }
  }
};

const HospitalPaymentIntegration = ({ patientData }) => {
  const {appointmentId} = useParams();
  const {currentUser} = useSelector((state) => state.user);
  const navigate = useNavigate();
  const hospitalId = currentUser.hospital_ID;
  const [paymentStep, setPaymentStep] = useState('checkout');
  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cashAmount, setCashAmount] = useState('');
  const location = useLocation();

  const appointmentService = {
    updateAppointmentStatus: async (appointmentId, checkOut) => {
      try {
        const response = await fetch(`/recep-patient/appointments/update-checkOut/${appointmentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checkOut }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return {
          success: true,
          appointment: data
        };
      } catch (error) {
        console.error('Error updating appointment status:', error);
        return {
          success: false,
          error: error.message || 'Failed to update appointment status'
        };
      }
    }
  };

  // Function to handle the checkout submission
  const handleCheckoutComplete = async (billingData) => {
    setCheckoutData(billingData);
    setPaymentStep('confirmation');
  };

  // Function to generate payment link
  const handleGeneratePaymentLink = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      // Format the invoice data as expected by your backend
      const invoiceData = {
        amount: checkoutData.total,
        email: checkoutData.patient.email,
        invoiceNumber: `INV-${checkoutData.patient._id}-${Date.now()}`,
        patientName: `${checkoutData.patient.frst_name} ${checkoutData.patient.last_name}`,
        patientId: checkoutData.patient._id,
        hospitalId: hospitalId
      };
  
      // Call the service function
      const result = await paystackService.generatePaymentLink(invoiceData);
      
      // Handle the successful response
      if (result.success) {
        setPaymentLink(result.paymentLink);
        setPaymentReference(result.reference);
        setPaymentStep('payment');
      } else {
        setError(result.error || 'Failed to generate payment link');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate payment link');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle cash payment
  const handleCashPayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate cash amount
      if (!cashAmount || parseFloat(cashAmount) < checkoutData.total) {
        setError('The amount entered must be equal to or greater than the total amount');
        setIsLoading(false);
        return;
      }
      
      // Format the payment data
      const paymentData = {
        amount: parseFloat(cashAmount),
        invoiceNumber: `INV-${checkoutData.patient._id}-${Date.now()}`,
        patientId: checkoutData.patient._id,
        patientName: `${checkoutData.patient.frst_name} ${checkoutData.patient.last_name}`,
        patientEmail: checkoutData.patient.email,
        hospitalId: hospitalId,
        paymentMethod: 'cash',
        recordedBy: currentUser._id
      };
      
      // Call the service function
      const result = await paystackService.recordCashPayment(paymentData);
      
      if (result.success) {
        handlePaymentSuccess();
      } else {
        setError(result.error || 'Failed to record cash payment');
      }
    } catch (err) {
      setError(err.message || 'Failed to record cash payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError(null);
  };

  // Function to handle email sending using the new email service
  const handleSendEmail = async () => {
    setEmailSending(true);
    setError(null);
    
    try {
      const patientEmail = 'danielanifowoshe04@gmail.com';
      const subject = `Hospital Invoice #${checkoutData.invoiceNumber}`;
      const body = `Dear ${checkoutData.patient.first_name} ${checkoutData.patient.last_name},\n\nPlease use the following link to complete your payment: ${paymentLink}\n\nThank you for choosing our hospital.\n\nBest regards,\nHospital Administration`;
      
      const result = await emailService.sendEmail(patientEmail, subject, body);
      
      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000); // Reset after 3 seconds
      } else {
        setError(`Failed to send email: ${result.error}`);
      }
    } catch (err) {
      setError(`Error sending email: ${err.message}`);
    } finally {
      setEmailSending(false);
    }
  };

  // Function to copy payment link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(paymentLink)
      .then(() => alert('Payment link copied to clipboard!'))
      .catch(() => alert('Failed to copy payment link'));
  };

  // Function to go back to checkout
  const goBackToCheckout = () => {
    setPaymentStep('checkout');
  };

  // Updated handlePaymentSuccess function
  const handlePaymentSuccess = async () => {
    try {
      if (appointmentId) {
        const updateResult = await appointmentService.updateAppointmentStatus(appointmentId, 'paid');
        
        if (updateResult.success) {
          console.log('Successfully updated appointment status to paid');
        } else {
          console.warn('Failed to update appointment status:', updateResult.error);
        }
      } else {
        console.warn('No appointment ID provided in checkout data');
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
    
    // Continue with successful payment flow
    setPaymentStep('success');
  };

  const verifyPaymentStatus = async (reference) => {
    try {
      setIsLoading(true);
      const result = await paystackService.verifyPayment(reference);
      if (result.success) {
        handlePaymentSuccess();
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      setError(err.message || 'Error verifying payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check payment status
  const checkPaymentStatus = () => {
    if (paymentReference) {
      verifyPaymentStatus(paymentReference);
    } else {
      setError('No payment reference available');
    }
  };

  // Effect to handle payment callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference');
    
    if (reference && paymentReference) {
      // Verify payment if user is returning from payment page
      verifyPaymentStatus(reference);
    }
  }, [location, paymentReference]);

  // Render based on current step
  switch (paymentStep) {
    case 'checkout':
      return <HospitalCheckout onComplete={handleCheckoutComplete} initialPatientData={patientData} />;
    
    case 'confirmation':
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
              <h1 className="text-2xl font-bold">Payment Confirmation</h1>
              <p className="text-emerald-100">Review your billing details before proceeding to payment</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Billing Summary</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p><span className="font-medium">Patient:</span> {checkoutData.patient.first_name} {checkoutData.patient.last_name}</p>
                  <p><span className="font-medium">Total Amount:</span> ${checkoutData.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'online' ? 'border-2 border-emerald-600' : 'border-gray-200'}`}
                    onClick={() => handlePaymentMethodChange('online')}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          checked={paymentMethod === 'online'} 
                          onChange={() => handlePaymentMethodChange('online')}
                          className="form-radio h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">Online Payment</h3>
                        <p className="text-sm text-gray-500">Generate a payment link for the patient to pay online</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cash' ? 'border-2 border-emerald-600' : 'border-gray-200'}`}
                    onClick={() => handlePaymentMethodChange('cash')}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          checked={paymentMethod === 'cash'} 
                          onChange={() => handlePaymentMethodChange('cash')}
                          className="form-radio h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">Cash Payment</h3>
                        <p className="text-sm text-gray-500">Process a cash payment received from the patient</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {paymentMethod === 'cash' && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Cash Payment Details</h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Amount Received</label>
                      <input 
                        type="number" 
                        value={cashAmount} 
                        onChange={(e) => setCashAmount(e.target.value)}
                        className="form-input w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                        placeholder="Enter amount received"
                        min={checkoutData.total}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}
              
              <div className="flex space-x-4">
                <button 
                  onClick={goBackToCheckout}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back to Checkout
                </button>
                {paymentMethod === 'online' ? (
                  <button 
                    onClick={handleGeneratePaymentLink}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Generating Payment Link...' : 'Generate Payment Link'}
                  </button>
                ) : (
                  <button 
                    onClick={handleCashPayment}
                    disabled={isLoading || !cashAmount}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Process Cash Payment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'payment':
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
              <h1 className="text-2xl font-bold">Payment Link Generated</h1>
              <p className="text-emerald-100">Share this link with the patient to complete payment</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p><span className="font-medium">Patient:</span> {checkoutData.patient.name}</p>
                  <p><span className="font-medium">Total Amount:</span> ${checkoutData.total.toFixed(2)}</p>
                  <p><span className="font-medium">Reference:</span> {paymentReference}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Payment Link</label>
                <div className="flex">
                  <input 
                    type="text" 
                    value={paymentLink} 
                    readOnly 
                    className="flex-1 form-input rounded-l-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                  <button 
                    onClick={copyLinkToClipboard}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}
              
              {emailSent && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                  Email sent successfully!
                </div>
              )}
              
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={handleSendEmail}
                  disabled={emailSending}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {emailSending ? 'Sending...' : 'Send Email to Patient'}
                </button>
                <button 
                  onClick={checkPaymentStatus}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isLoading ? 'Checking...' : 'Check Payment Status'}
                </button>
                <button 
                  onClick={goBackToCheckout}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'success':
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
              <h1 className="text-2xl font-bold">Payment Successful</h1>
              <p className="text-emerald-100">Thank you for your payment</p>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h2 className="text-xl font-semibold mt-4">Payment Completed Successfully</h2>
                <p className="text-gray-600 mt-2">The payment has been processed and confirmed.</p>
              </div>
              
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    
    default:
      return <div>Loading...</div>;
  }
};

export default HospitalPaymentIntegration;
