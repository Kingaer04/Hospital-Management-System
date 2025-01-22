import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/admin/adminSlice.js';

export default function SignIn() {
  const [formData, setFormData] = useState({
    hospital_UID: '',
    hospital_Email: '',
    password: ''
  });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { loading, error } = useSelector((state) => state.admin);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dispatch(signInFailure(null)), 300); // Wait for slide-out transition
      }, 5000); // 5000 milliseconds = 5 seconds

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [error]);

  function handleChange(event) {
    const { value, name } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/admin/SignIn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await res.json();
      console.log(data);
      if (data.error) {
        dispatch(signInFailure(data.error));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
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
        <img src="/Logo_Images/logoIcon.png" alt="" />
        <img src="/Logo_Images/logoName.png" alt="" className='h-5' />
      </div>
      <div className='flex mt-14'>
        <div className="pt-10 flex flex-col mt-4 ml-10 gap-5"> 
          <div className='flex flex-col'>
            <h3 className='font-bold text-3xl mb-2'>Log In to your account</h3>
            <h6 className='text-[110%]'>Welcome Admin! Please enter your details</h6>
          </div>
          <form onSubmit={handleSubmit} className="flex justify-center gap-2 flex-col">
            <label htmlFor="">Hospital UID</label>
            <input type="text" placeholder="Hospital UID" className="border p-3 rounded-lg" id="hospital_UID" name="hospital_UID" onChange={handleChange} required />
            <label htmlFor="">Email</label>
            <input type="email" placeholder="Email" className="border p-3 rounded-lg" id="email" name="hospital_Email" onChange={handleChange} required />
            <label htmlFor="">Password</label> 
            <input type="password" placeholder="Password" className="border p-3 rounded-lg" id="password" name="password" onChange={handleChange} required />
            <button disabled={loading} className="bg-[#00A272] text-white uppercase rounded-lg hover:opacity-95 disabled:opacity-85 p-3 mt-7">
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-7 text-center">
            <p className="inline mr-2 text-gray-500">Don't have an account?</p>
            <Link to={'/Sign-Up'}>
              <span className="text-[#00A272]">Sign Up</span>
            </Link>
          </div>
          {error && (
            <div className={`fixed top-0 right-0 bg-red-600 text-white p-4 flex w-[27%] z-50 rounded-bl-lg shadow-lg transition-transform transform ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
              <p className="flex-1">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => dispatch(signInFailure(null)), 300); // Clear the error after slide-out
                }}
                className="text-white font-bold ml-5 p-1 rounded hover:bg-red-700 hover:rounded-full transition"
              >
                &times; {/* Close icon */}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="image-container">
        <img src="/Authentication_Images/doctor&nurseImage.png" alt="Doctor & Nurse" className='w-[710px] absolute -top-28 right-0' />
      </div>
    </div>
  );
}