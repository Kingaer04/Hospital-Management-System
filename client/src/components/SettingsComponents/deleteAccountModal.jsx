import React, { useState } from 'react';

const DeleteAccountModal = ({ isOpen, onClose, onDeactivate }) => {
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const handleDelete = () => {
        if (confirmText.toLowerCase() === 'deactivate') {
            onDelete();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
            <img src="/Icons/delete.png" alt="" className='relative left-[37%] mb-5'/>
                <p className="text-red-600 mb-4">
                    Warning: This action cannot be undone. Your account will be permanently deactivated.
                </p>
                <p className="mb-2">Please type "delete" to confirm:</p>
                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-3">
                    <button 
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleDelete}
                        disabled={confirmText.toLowerCase() !== 'deactivate'}
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
