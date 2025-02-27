import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import statesAndLGAs from '../components/SettingsComponents/stateLGA.jsx';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedLGA, setSelectedLGA] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [lgas, setLgas] = useState([]);
  const [formData, setFormData] = useState({
    hospital_Name: '',
    hospital_Representative: '',
    hospital_UID: '',
    ownership: 'private',
    hospital_Email: '',
    hospital_Address: {
      hospital_State: selectedState || '',
      hospital_LGA: selectedLGA || '',
      hospital_Address_Number: '',
      hospital_Address_Street: '',
    },
    hospital_Phone: '',
    password: '',
    confirmPassword: ''
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // If the field is password, evaluate its strength
    if (name === 'password') {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  }

  useEffect(() => {
    if (error) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        const clearErrorTimer = setTimeout(() => dispatch(signInFailure(null)), 300); // Wait for slide-out transition
        return () => clearTimeout(clearErrorTimer);
      }, 5000); // 5000 milliseconds = 5 seconds

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [error]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (step === 3) {
      const { password, confirmPassword } = formData;

      // Check if password length is at least 8 characters
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        setLoading(true);
        const res = await fetch('/admin/SignUp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
        const data = await res.json();
        if (data.error) {
          setLoading(false);
          setError(data.error);
          return;
        }
        setLoading(false);
        setError(null);
        navigate('/Sign-In');
      } catch (error) {
        setLoading(false);
        setError('An unexpected error occurred. Please try again.');
      }
    } else {
      setStep(prevStep => prevStep + 1);
    }
  }

  useEffect(() => {
    if (selectedState) {
        setLgas(statesAndLGAs[selectedState] || []);
    } else {
        setLgas([]);
    }
  }, [selectedState]);

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedLGA('');
  };

  const handleLGAChange = (e) => {
      setSelectedLGA(e.target.value);
  };

  function handlePrevious() {
    if (step > 1) {
      setStep(prevStep => prevStep - 1);
    }
  }

  useEffect(() => {
    console.log(formData);
  },[])

  const [passwordStrength, setPasswordStrength] = React.useState('');

  // Function to evaluate password strength
  const evaluatePasswordStrength = (password) => {
    let strength = 'weak';
    if (password.length >= 8) {
      if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        strength = 'strong';
      } else if (/[A-Z]/.test(password) || /[0-9]/.test(password)) {
        strength = 'good';
      }
    }
    return strength;
  };

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      hospital_LGA: selectedLGA,
      hospital_State: selectedState,
    }));
  }, [selectedState, selectedLGA]);

  return (
    <div className='p-5'>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-50">
          <img src="Logo_Images/logoIcon.png" alt="Logo" className="animate-logo mb-4" />
          <div className="text-white p-4 mb-2">
            Please wait while we process your details to create your account.
          </div>
          <div className="loader"></div>
        </div>
      )}
      <style>
        {`
          @media (max-width: 1200px) {
            .flex {
              display: flex;
              justify-content: center;
              align-item: center;
            }
            .mt-14 {
              margin-top: 2rem; /* Adjust as needed */
            }
            .image-container {
              display: none; /* Hide the image by default */
            }
          }
          @media (min-width: 1201px) {
            .image-container {
              display: block; /* Show the image when above 1200px */
            }
          }
          .transition-transform {
            transition: transform 0.3s ease-in-out;
          }
          /* Animation for the logo */
          @keyframes logoAnim {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .animate-logo {
            animation: logoAnim 1.5s infinite;
          }
          /* Loader styles */
          .loader {
            border: 8px solid rgba(255, 255, 255, 0.2);
            border-top: 8px solid #00A272;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className='flex gap-3 mb-5'>
        <img src="/Logo_Images/logoIcon.png" alt="" />
        <img src="/Logo_Images/logoName.png" alt="" className='h-5' />
      </div>
      <div className='flex flex-col text-white mb-5'></div>
      <div className='flex'>
        <div className="pt-10 flex flex-col mt-4 ml-10 gap-5"> 
          <div className='flex flex-col'>
            <h3 className='font-bold text-3xl mb-2'>Welcome! Please enter your details</h3>
            <h6 className='text-2xl mb-2 text-black'>
              {step === 1 ? 'Hospital Info' : step === 2 ? 'Contact Details' : 'Create Password'}
            </h6>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-4 border border-gray-300 rounded-lg bg-white">
            <form onSubmit={handleSubmit} className="flex justify-center gap-2 flex-col">
              {step === 1 && (
                <>
                  <label htmlFor="hospitalName">Hospital Name</label>
                  <input type="text" placeholder="Hospital Name" name="hospital_Name" className="border p-3 rounded-lg" onChange={handleChange} required />
                  <label htmlFor="hospitalRep">Hospital Representative</label>
                  <input type="text" placeholder="Hospital Representative" name="hospital_Representative" className="border p-3 rounded-lg" onChange={handleChange} required />
                  <label htmlFor="hospital_UID">Facility ID</label>
                  <input type="text" placeholder="Facility ID" name="hospital_UID" className="border p-3 rounded-lg" onChange={handleChange} required />
                  <label htmlFor="ownership">Ownership</label>
                  <select name="ownership" className="border p-3 rounded-lg" onChange={handleChange} required>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </>
              )}
              {step === 2 && (
                <>
                  <label htmlFor="hospital_Email">Hospital Email</label>
                  <input type="email" placeholder="Hospital Email" name="hospital_Email" className="border p-3 rounded-lg" onChange={handleChange} required />
                  <label htmlFor="hospital_Phone">Hospital Phone</label>
                  <input type="text" placeholder="Hospital Phone Number" name="hospital_Phone" className="border p-3 rounded-lg" onChange={handleChange} required />
                  <div>
                    <select 
                        id="hospitalState" 
                        className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'
                        value={selectedState}
                        name='hospital_State'
                        onChange={handleStateChange}
                        required
                    >
                        <option value="">Select State</option>
                        {Object.keys(statesAndLGAs).map((state) => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <select 
                        id="hospitalLGA" 
                        className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]'
                        value={selectedLGA}
                        onChange={handleLGAChange}
                        disabled={!selectedState}
                        name='hospital_LGA'
                        required
                    >
                        <option value="">Select LGA</option>
                        {lgas.map((lga) => (
                            <option key={lga} value={lga}>{lga}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="hospital_Address_Number" className='text-[14px]'>
                        Number
                    </label>
                    <input type="text" name="hospital_Address_Number" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' onChange={handleChange}/>
                  </div>
                  <div>
                    <label htmlFor="hospital_Address_Street" className='text-[14px]'>
                        Street
                    </label>
                    <input type="text" name="hospital_Address_Street" className='w-full border border-[#E0E0E0] p-2 rounded-[5px] mt-1 focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]' onChange={handleChange}/>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    className={`border p-3 rounded-lg transition-colors duration-300 
                                ${passwordStrength === 'strong' ? 'border-green-500' : 
                                  passwordStrength === 'good' ? 'border-yellow-600' : 
                                  passwordStrength === 'weak' ? 'border-red-600' : 'border-gray-300'}`}
                    onChange={handleChange}
                    required
                  />
                  {passwordStrength && (
                    <div className={`mt-1 text-${passwordStrength === 'strong' ? 'green-500' : passwordStrength === 'good' ? 'yellow-600' : 'red-600'}`}>
                      {`Password strength: ${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`}
                    </div>
                  )}
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    className="border p-3 rounded-lg border-gray-300"
                    onChange={handleChange}
                    required
                  />
                </>
              )}
              <div className="flex justify-between mt-7">
                {step > 1 && (
                  <button type="button" onClick={handlePrevious} className="bg-gray-300 text-black uppercase rounded-lg p-3 hover:opacity-95">
                    Previous
                  </button>
                )}
                <button disabled={loading} className="bg-[#00A272] text-white uppercase rounded-lg hover:opacity-95 disabled:opacity-85 p-3">
                  {step === 3 ? (loading ? 'Loading...' : 'Sign Up') : 'Next'}
                </button>
              </div>
            </form>
          </div>
          <div className="mt-7">
            <p className="inline mr-2 text-gray-400">Already have an account?</p>
            <Link to={'/Sign-In'}>
              <span className="text-[#00A272]">Log In</span>
            </Link>
          </div>
          {error && (
            <div className={`fixed top-0 right-0 bg-red-600 text-white p-4 flex w-[27%] z-50 rounded-bl-lg shadow-lg transition-transform transform ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
              <p className="flex-1">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => setError(null), 300); // Wait for slide-out transition
                }}
                className="text-white font-bold ml-5 p-1 rounded hover:bg-red-700 hover:rounded-full transition"
              >
                &times; {/* Close icon */}
              </button>
            </div>
          )}
        </div>
        <div className="image-container">
          <img src="/Authentication_Images/doctor&nurseImage.png" alt="Doctor & Nurse" className='w-[710px] absolute -top-28 right-0' />
        </div>
      </div>
    </div>
  );
}