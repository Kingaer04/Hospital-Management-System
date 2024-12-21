import React, { useState, useEffect } from 'react'

export default function General() {
    const [isEnabled, setIsEnabled] = useState(false);

    const toggleNotification = () => {
        setIsEnabled(!isEnabled);
    };

    const [isPatientTiming, setIsPatientTiming] = useState(false);

    const toggleNotificationIsPatientTiming = () => {
        setIsPatientTiming(!isPatientTiming);
    }

    const [isEnquiry, setIsEnquiry] = useState(false);

    const toggleNotificationIsEnquiry = () => {
        setIsEnquiry(!isEnquiry);
    }

    const [isNewAppointment, setIsNewAppointment] = useState(false);

    const toggleNotificationIsNewAppointment = () => {
        setIsNewAppointment(!isNewAppointment);
    }

    const [isLeave, setIsLeave] = useState(false);

    const toggleNotificationIsLeave = () => {
        setIsLeave(!isLeave);
    }

    return (
        <div className='max-w-[800px]'>
            <div>
                <h1 className='font-bold text-[20px]'>
                    Notification
                </h1>
                <p className='text-[#A9A9A9] text-[12px]'>
                    You'll receive Email on <i>i_am_dananny@gmail.com</i>
                </p>
            </div>
            <hr className='w-[100%]'/>
            <div className='mt-3'>
                <h1 className='font-semibold text-[15px]'>
                    Enable desktop notification
                </h1>
                <p className='text-[#A9A9A9] text-[12px]'>
                    Decide whether you want to be notified on new messages or updates
                </p>
                <div className='mt-1'>
                    <label className='flex items-center cursor-pointer'>
                        <div className='relative'>
                            <input type='checkbox' className='sr-only' checked={isEnabled} onChange={toggleNotification} />
                            <div className='block bg-white border border-[#a9a9a9] w-24 h-7 rounded-md'></div>
                            <div className={`absolute left-0 top-0 w-1/2 h-full flex items-center justify-center transition ${isEnabled ? 'bg-[#00a272] text-white left-1/2' : 'bg-[#a9a9a9] text-black left-0'} rounded-md shadow-inner`}>
                                {isEnabled ? 'On' : <span className='text-black'>Off</span>}
                            </div>
                        </div>
                    </label>
                </div>
            </div>
            <hr className='w-[100%] mt-3'/>
            <div className='mt-3'>
                <p className='text-[#A9A9A9] text-[12px]'>
                    Email Notification
                </p>
                <h1 className='font-semibold text-[15px]'>
                    Indox
                </h1>
                <p className='text-[#A9A9A9] text-[12px]'>
                    Manage your messagge notification preferences.
                </p>
                <div className='mt-5 flex flex-col gap-5'>
                    {/* settings 1 */}
                    <div className='flex gap-3 items-center'>
                        <img src="../../../public/Icons/ant-design_reload-time-outline.png" alt="" className='w-6 h-6'/>
                        <div className='w-40'>
                            <h1 className='font-bold text-[12px]'>
                                Patient timing change
                            </h1>
                            <p className='text-[rgb(169,169,169)] text-[10px]'>
                                Patient reschedule their meet up
                            </p>
                        </div>
                        <div className='ml-10'>
                            <label className='flex items-center cursor-pointer'>
                                <div className='relative'>
                                    <input type='checkbox' className='sr-only peer' checked={isPatientTiming} onChange={toggleNotificationIsPatientTiming} />
                                    <div className='block bg-white border border-[#a9a9a9] w-10 h-6 rounded-full'></div>
                                    <div className='dot absolute left-1 top-1 bg-[#a9a9a9] w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-[#00a272]'></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    {/* setttings 2 */}
                    <div className='flex gap-3 items-center'>
                        <img src="../../../public/Icons/user-plus.png" alt="" className='w-6 h-6'/>
                        <div className='w-40'>
                            <h1 className='font-bold text-[12px]'>
                                New enquiry
                            </h1>
                            <p className='text-[rgb(169,169,169)] text-[10px]'>
                                New patient book on appointment
                            </p>
                        </div>
                        <div className='ml-10'>
                            <label className='flex items-center cursor-pointer'>
                                <div className='relative'>
                                    <input type='checkbox' className='sr-only peer' checked={isEnquiry} onChange={toggleNotificationIsEnquiry} />
                                    <div className='block bg-white border border-[#a9a9a9] w-10 h-6 rounded-full'></div>
                                    <div className='dot absolute left-1 top-1 bg-[#a9a9a9] w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-[#00a272]'></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    {/* setttings 3 */}
                    <div className='flex gap-3 items-center'>
                        <img src="../../../public/Icons/AppointmentIcon.png" alt="" className='w-6 h-6'/>
                        <div className='w-40'>
                            <h1 className='font-bold text-[12px]'>
                                New Appointment
                            </h1>
                            <p className='text-[rgb(169,169,169)] text-[10px]'>
                                Patient Book an Appointment
                            </p>
                        </div>
                        <div className='ml-10'>
                            <label className='flex items-center cursor-pointer'>
                                <div className='relative'>
                                    <input type='checkbox' className='sr-only peer' checked={isNewAppointment} onChange={toggleNotificationIsNewAppointment} />
                                    <div className='block bg-white border border-[#a9a9a9] w-10 h-6 rounded-full'></div>
                                    <div className='dot absolute left-1 top-1 bg-[#a9a9a9] w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-[#00a272]'></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    {/* setttings 4 */}
                    <div className='flex gap-3 items-center'>
                        <img src="../../../public/Icons/calendar.png" alt="" className='w-6 h-6'/>
                        <div className='w-40'>
                            <h1 className='font-bold text-[12px]'>
                                Doctor Apply for Leave
                            </h1>
                            <p className='text-[rgb(169,169,169)] text-[10px]'>
                                Doctor in your team apply for leave
                            </p>
                        </div>
                        <div className='ml-10'>
                            <label className='flex items-center cursor-pointer'>
                                <div className='relative'>
                                    <input type='checkbox' className='sr-only peer' checked={isLeave} onChange={toggleNotificationIsLeave} />
                                    <div className='block bg-white border border-[#a9a9a9] w-10 h-6 rounded-full'></div>
                                    <div className='dot absolute left-1 top-1 bg-[#a9a9a9] w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-[#00a272]'></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
