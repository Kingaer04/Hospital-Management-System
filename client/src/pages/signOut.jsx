import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignOut({ showModal, setShowModal }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Logic to log out the user
    // For example, clearing user session or token
    navigate('/signIn');
  };

  const handleCancel = () => {
    setShowModal(false);
    navigate('/home');
  };

  return (
    <div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to log out?</p>
            <button onClick={handleSignOut}>Yes</button>
            <button onClick={handleCancel}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}
