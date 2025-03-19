import React, { useState, useEffect } from 'react';
import { generatePaymentLink, verifyPayment } from '../../../api/services/paystackService';
import HospitalCheckout from './checkout';
import { useLocation } from 'react-router-dom';

const HospitalPaymentIntegration = ({ hospitalId, patientData }) => {
  const [paymentStep, setPaymentStep] = useState('checkout');
  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

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
        email: checkoutData.patient.email || prompt("Please enter patient's email address:"),
        invoiceNumber: `INV-${checkoutData.patient.id}-${Date.now()}`,
        patientName: checkoutData.patient.name,
        hospitalId: hospitalId
      };
  
      // Call the service function imported from paystackService.js
      const result = await generatePaymentLink(invoiceData);
      
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

  // Function to handle email sending
  const handleSendEmail = () => {
    if (!checkoutData.patient.email) {
      const email = prompt("Please enter patient's email address:");
      if (email) {
        setCheckoutData(prevData => ({
          ...prevData,
          patient: {
            ...prevData.patient,
            email
          }
        }));
      } else {
        return; // User cancelled email input
      }
    }

    const subject = `Hospital Invoice #${checkoutData.invoiceNumber || ''}`;
    const body = `Dear ${checkoutData.patient.name},\n\nPlease use the following link to complete your payment: ${paymentLink}\n\nThank you for choosing our hospital.\n\nBest regards,\nHospital Administration`;
    
    window.open(`mailto:${checkoutData.patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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

  // Function to handle successful payment
  const handlePaymentSuccess = () => {
    setPaymentStep('success');
  };

  const verifyPaymentStatus = async (reference) => {
    try {
      setIsLoading(true);
      const result = await verifyPayment(reference);
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
                  <p><span className="font-medium">Patient:</span> {checkoutData.patient.name}</p>
                  <p><span className="font-medium">Patient ID:</span> {checkoutData.patient.id}</p>
                  <p><span className="font-medium">Total Amount:</span> ${checkoutData.total.toFixed(2)}</p>
                </div>
              </div>
              
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
                <button 
                  onClick={handleGeneratePaymentLink}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isLoading ? 'Generating Payment Link...' : 'Proceed to Payment'}
                </button>
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
              
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Send Email to Patient
                </button>
                <button 
                  onClick={checkPaymentStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Check Payment Status
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
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h2 className="text-xl font-semibold mt-4">Payment Completed Successfully</h2>
                <p className="text-gray-600 mt-2">The payment has been processed and confirmed.</p>
              </div>
              
              <button 
                onClick={goBackToCheckout}
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