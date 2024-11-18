import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignIn() {
  const [formData, setFormData] = React.useState({
    userName: '',
    email: '',
    password: ''
  });
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { value, name } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/user/signUp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      console.log(data);
      if (data.error) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-In');
    } catch (error) {
      setLoading(false);
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
      <div className='flex mt-14'>
        <div className="pt-10 flex flex-col mt-4 ml-10 gap-5"> 
          <div className='flex flex-col'>
            <h3 className='font-bold text-3xl mb-2'>Log In to your account</h3>
            <h6 className='text-[110%]'>Welcome Admin! Please enter your details</h6>
          </div>
          <form onSubmit={handleSubmit} className="flex justify-center gap-2 flex-col">
            <label htmlFor="">Email</label>
            <input type="email" placeholder="Email" className="border p-3 rounded-lg" id="email" name="email" onChange={handleChange} />
            <label htmlFor="">Password</label> 
            <input type="password" placeholder="Password" className="border p-3 rounded-lg" id="password" name="password" onChange={handleChange} />
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
          {error && <p className="text-red-700">{error}</p>}
        </div>
      </div>
      <div className="image-container">
        <img src="../../public/Authentication_Images/doctor&nurseImage.png" alt="Doctor & Nurse" className='w-[710px] absolute -top-28 right-0' />
      </div>
    </div>
  )
}
