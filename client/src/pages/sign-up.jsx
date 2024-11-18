import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';

export default function SignUp() {
  const [formData, setFormData] = React.useState({
    hospitalName: '',
    hospitalRep: '',
    facilityID: '',
    ownership: 'private',
    hospitalEmail: '',
    state: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [step, setStep] = React.useState(1);
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (step === 3) {
      try {
        dispatch(signInStart());
        const res = await fetch('/user/signIn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
        const data = await res.json();
        if (data.error) {
          dispatch(signInFailure(data.error));
          return;
        }
        dispatch(signInSuccess(data));
        navigate('/');
      } catch (error) {
        dispatch(signInFailure(error.message));
      }
    } else {
      setStep(prevStep => prevStep + 1);
    }
  }

  function handlePrevious() {
    if (step > 1) {
      setStep(prevStep => prevStep - 1);
    }
  }

  return (
    <div className='p-5'>
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
        `}
      </style>
      <div className='flex gap-3 mb-5'>
        <img src="../../public/Logo_Images/logoIcon.png" alt="" />
        <img src="../../public/Logo_Images/logoName.png" alt="" className='h-5' />
      </div>
      <div className='flex flex-col text-white mb-5'>
        
      </div>
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
                  <input type="text" placeholder="Hospital Name" name="hospitalName" className="border p-3 rounded-lg" onChange={handleChange} />
                  <label htmlFor="hospitalRep">Hospital Representative</label>
                  <input type="text" placeholder="Hospital Representative" name="hospitalRep" className="border p-3 rounded-lg" onChange={handleChange} />
                  <label htmlFor="facilityID">Facility ID</label>
                  <input type="text" placeholder="Facility ID" name="facilityID" className="border p-3 rounded-lg" onChange={handleChange} />
                  <label htmlFor="ownership">Ownership</label>
                  <select name="ownership" className="border p-3 rounded-lg" onChange={handleChange}>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                  <label htmlFor="hospitalEmail">Hospital Email</label>
                  <input type="email" placeholder="Hospital Email" name="hospitalEmail" className="border p-3 rounded-lg" onChange={handleChange} />
                </>
              )}
              {step === 2 && (
                <>
                  <label htmlFor="state">State</label>
                  <input type="text" placeholder="State" name="state" className="border p-3 rounded-lg" onChange={handleChange} />
                  <label htmlFor="address">Address</label>
                  <input type="text" placeholder="Address" name="address" className="border p-3 rounded-lg" onChange={handleChange} />
                  <label htmlFor="phone">Phone</label>
                  <input type="tel" placeholder="Phone" name="phone" className="border p-3 rounded-lg" onChange={handleChange} />
                </>
              )}
              {step === 3 && (
                <>
                  <label htmlFor="password">Password</label>
                  <input type="password" placeholder="Password" name="password" className="border p-3 rounded-lg" onChange={handleChange} />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input type="password" placeholder="Confirm Password" name="confirmPassword" className="border p-3 rounded-lg" onChange={handleChange} />
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
              {error && <p className="text-red-700">{error}</p>}
          </div>
        </div>
        <div className="image-container">
          <img src="../../public/Authentication_Images/doctor&nurseImage.png" alt="Doctor & Nurse" className='w-[710px] absolute -top-28 right-0' />
        </div>
      </div>
  )
}