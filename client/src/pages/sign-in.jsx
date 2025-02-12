import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/admin/adminSlice.js';

const tips = [
    "Use your Hospital UID for quick login.",
    "Ensure your email is correctly entered.",
    "Contact support if you encounter any issues."
];

export default function SignIn() {
    const [formData, setFormData] = useState({
        hospital_UID: '',
        hospital_Email: '',
        password: ''
    });
    const { loading, error } = useSelector((state) => state.admin);
    const [visibleTipIndex, setVisibleTipIndex] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        let timer;
        if (loading && !error) {
            setVisibleTipIndex(0); // Show the first tip
            timer = setInterval(() => {
                setVisibleTipIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % tips.length;
                    return nextIndex;
                });
            }, 3000); // Change tip every 3 seconds
        } else {
            setVisibleTipIndex(null); // Hide tips if loading is false or there's an error
        }

        return () => {
            clearInterval(timer); // Cleanup timer on unmount or when loading changes
        };
    }, [loading, error]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(signInFailure(null)); // Clear error after 5 seconds
            }, 5000); // 5000 milliseconds = 5 seconds

            return () => clearTimeout(timer); // Cleanup on unmount
        }
    }, [error, dispatch]);

    function handleChange(event) {
        const { value, name } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        dispatch(signInStart());
        try {
            const res = await fetch('/admin/SignIn', {
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
            navigate('/home');
        } catch (error) {
            dispatch(signInFailure(error.message));
        }
    }

    return (
        <div className={`p-5 relative`}>
            {loading && (
                <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
            )}
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

            <div className='flex gap-3 mt-6 items-center'>
                <img src="/Logo_Images/nhmis_icon.png" alt="Logo Icon" className={`transition-transform duration-500 w-14 ${loading ? 'animate-bounce' : ''}`} />
            </div>

            <div className='flex'>
                <div className="pt-10 flex flex-col ml-10 gap-5"> 
                    <div className='flex flex-col items-center'>
                        <h3 className='font-bold text-3xl mb-2'>Log In to your account</h3>
                        <h6 className='text-[110%]'>Welcome Admin! Please enter your details</h6>
                    </div>
                    <form onSubmit={handleSubmit} className="flex justify-center gap-2 flex-col">
                        <label htmlFor="">Hospital UID</label>
                        <input type="text" placeholder="Hospital UID" className="border p-3 rounded-lg focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]" id="hospital_UID" name="hospital_UID" onChange={handleChange} required />
                        <label htmlFor="">Email</label>
                        <input type="email" placeholder="Email" className="border p-3 rounded-lg focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]" id="email" name="hospital_Email" onChange={handleChange} required />
                        <label htmlFor="">Password</label> 
                        <input type="password" placeholder="Password" className="border p-3 rounded-lg focus:border-[#00A272] focus:outline-none focus:ring-2 focus:ring-[#00A272]" id="password" name="password" onChange={handleChange} required />
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
                        <div className={`fixed top-0 right-0 bg-red-600 text-white p-4 flex w-[27%] z-50 rounded-bl-lg shadow-lg`}>
                            <p className="flex-1">{error}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(signInFailure(null)); // Clear the error
                                }}
                                className="text-white font-bold ml-5 p-1 rounded hover:bg-red-700 hover:rounded-full transition"
                            >
                                &times; {/* Close icon */}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tips section at the bottom */}
            {loading && visibleTipIndex !== null && (
                <div className={`fixed bottom-0 left-0 w-full bg-[#00A272] p-3 text-white transition-transform duration-500 transform z-50`}>
                    <h4 className="font-bold">Tips for Using the Application:</h4>
                    <p>{tips[visibleTipIndex]}</p>
                </div>
            )}

            <div className="image-container">
                <img src="/Authentication_Images/doctor&nurseImage.png" alt="Doctor & Nurse" className='w-[710px] absolute -top-28 right-0' />
            </div>
        </div>
    );
}