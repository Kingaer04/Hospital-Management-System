import React, { useState } from 'react';

const HospitalCheckout = () => {
  const [patient, setPatient] = useState({
    name: 'John Doe',
    id: 'PT-12345',
    isRegistered: true,
    admissionDate: '2025-03-10',
  });

  const [billing, setBilling] = useState({
    fixedPrice: false,
    bedDays: 0,
    bedHours: 0,
    admissionFee: true,
    consultationFee: true,
    surgeryFee: false,
    selectedSurgery: '',
    otherSurgery: '',
    otherSurgeryPrice: 0,
    medications: [],
    newMedication: { name: '', price: 0 },
    wardType: 'normal',
  });

  const priceList = {
    admissionFee: 250,
    consultationFee: 150,
    bedPerDay: 200,
    bedPerHour: 15,
    surgeries: {
      minor: 1500,
      major: 5000,
      cardiac: 8000,
    },
    wardTypes: {
      normal: 0,
      regular: 100,
      firstClass: 350,
    },
    unregisteredFee: 100,
  };

  const handleMedicationAdd = () => {
    if (billing.newMedication.name && billing.newMedication.price > 0) {
      setBilling({
        ...billing,
        medications: [...billing.medications, { ...billing.newMedication }],
        newMedication: { name: '', price: 0 },
      });
    }
  };

  const handleMedicationRemove = (index) => {
    const updatedMedications = [...billing.medications];
    updatedMedications.splice(index, 1);
    setBilling({ ...billing, medications: updatedMedications });
  };

  const calculateTotal = () => {
    if (billing.fixedPrice) return 0;
    
    let total = 0;
    
    // Add admission fee
    if (billing.admissionFee) {
      total += priceList.admissionFee;
    }
    
    // Add consultation fee
    if (billing.consultationFee) {
      total += priceList.consultationFee;
    }
    
    // Add bed charges
    if (billing.bedDays > 0) {
      total += billing.bedDays * priceList.bedPerDay;
    }
    if (billing.bedHours > 0) {
      total += billing.bedHours * priceList.bedPerHour;
    }
    
    // Add surgery fee
    if (billing.surgeryFee) {
      if (billing.selectedSurgery === 'other') {
        total += Number(billing.otherSurgeryPrice);
      } else if (billing.selectedSurgery) {
        total += priceList.surgeries[billing.selectedSurgery];
      }
    }
    
    // Add medications
    billing.medications.forEach(med => {
      total += Number(med.price);
    });
    
    // Add ward type charges
    total += priceList.wardTypes[billing.wardType];
    
    // Add unregistered fee if applicable
    if (!patient.isRegistered) {
      total += priceList.unregisteredFee;
    }
    
    return total;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Patient Checkout</h1>
              <p className="text-emerald-100">Billing and Payment</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{patient.name}</p>
              <p className="text-emerald-100">ID: {patient.id}</p>
              <p className="text-emerald-100">Admission: {patient.admissionDate}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Billing Options */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Billing Options</h2>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="fixedPrice" 
                      checked={billing.fixedPrice}
                      onChange={() => setBilling({...billing, fixedPrice: !billing.fixedPrice})}
                      className="form-checkbox h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="fixedPrice" className="ml-2 text-gray-700">Fixed Price</label>
                  </div>
                </div>

                <div className={billing.fixedPrice ? "opacity-50 pointer-events-none" : ""}>
                  {/* Admission Fee */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="admissionFee" 
                        checked={billing.admissionFee}
                        onChange={() => setBilling({...billing, admissionFee: !billing.admissionFee})}
                        className="form-checkbox h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="admissionFee" className="ml-2 text-gray-700">Admission Fee</label>
                    </div>
                    <span className="font-medium">${priceList.admissionFee}</span>
                  </div>

                  {/* Consultation Fee */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="consultationFee" 
                        checked={billing.consultationFee}
                        onChange={() => setBilling({...billing, consultationFee: !billing.consultationFee})}
                        className="form-checkbox h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="consultationFee" className="ml-2 text-gray-700">Consultation Fee</label>
                    </div>
                    <span className="font-medium">${priceList.consultationFee}</span>
                  </div>

                  {/* Bed Charges */}
                  <div className="py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-gray-700">Bed Charges</label>
                      <div className="flex space-x-2">
                        <span className="text-sm text-gray-500">${priceList.bedPerDay}/day</span>
                        <span className="text-sm text-gray-500">${priceList.bedPerHour}/hour</span>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          min="0" 
                          value={billing.bedDays}
                          onChange={(e) => setBilling({...billing, bedDays: parseInt(e.target.value) || 0})}
                          className="form-input w-16 h-8 text-center rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                        />
                        <span className="ml-2 text-gray-700">Days</span>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          min="0" 
                          value={billing.bedHours}
                          onChange={(e) => setBilling({...billing, bedHours: parseInt(e.target.value) || 0})}
                          className="form-input w-16 h-8 text-center rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                        />
                        <span className="ml-2 text-gray-700">Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Surgery Fee */}
                  <div className="py-2 border-b border-gray-200">
                    <div className="flex items-center mb-2">
                      <input 
                        type="checkbox" 
                        id="surgeryFee" 
                        checked={billing.surgeryFee}
                        onChange={() => setBilling({...billing, surgeryFee: !billing.surgeryFee})}
                        className="form-checkbox h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="surgeryFee" className="ml-2 text-gray-700">Surgery</label>
                    </div>
                    {billing.surgeryFee && (
                      <div className="ml-7 space-y-2">
                        <select 
                          value={billing.selectedSurgery}
                          onChange={(e) => setBilling({...billing, selectedSurgery: e.target.value})}
                          className="form-select w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                        >
                          <option value="">Select Surgery Type</option>
                          <option value="minor">Minor Surgery (${priceList.surgeries.minor})</option>
                          <option value="major">Major Surgery (${priceList.surgeries.major})</option>
                          <option value="cardiac">Cardiac Surgery (${priceList.surgeries.cardiac})</option>
                          <option value="other">Other (specify)</option>
                        </select>
                        
                        {billing.selectedSurgery === 'other' && (
                          <div className="flex space-x-2">
                            <input 
                              type="text" 
                              placeholder="Specify surgery" 
                              value={billing.otherSurgery}
                              onChange={(e) => setBilling({...billing, otherSurgery: e.target.value})}
                              className="form-input flex-1 rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                            />
                            <input 
                              type="number" 
                              placeholder="Price" 
                              value={billing.otherSurgeryPrice}
                              onChange={(e) => setBilling({...billing, otherSurgeryPrice: parseFloat(e.target.value) || 0})}
                              className="form-input w-24 rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ward Type */}
                  <div className="py-2 border-b border-gray-200">
                    <label className="block text-gray-700 mb-2">Ward Type</label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="normalWard" 
                          name="wardType" 
                          value="normal"
                          checked={billing.wardType === 'normal'}
                          onChange={() => setBilling({...billing, wardType: 'normal'})}
                          className="form-radio h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="normalWard" className="ml-2 text-gray-700">Normal</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="regularWard" 
                          name="wardType" 
                          value="regular"
                          checked={billing.wardType === 'regular'}
                          onChange={() => setBilling({...billing, wardType: 'regular'})}
                          className="form-radio h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="regularWard" className="ml-2 text-gray-700">Regular (+${priceList.wardTypes.regular})</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="firstClassWard" 
                          name="wardType" 
                          value="firstClass"
                          checked={billing.wardType === 'firstClass'}
                          onChange={() => setBilling({...billing, wardType: 'firstClass'})}
                          className="form-radio h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="firstClassWard" className="ml-2 text-gray-700">First Class (+${priceList.wardTypes.firstClass})</label>
                      </div>
                    </div>
                  </div>

                  {/* Patient Registration Status */}
                  <div className="py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="isRegistered" 
                          checked={patient.isRegistered}
                          onChange={() => setPatient({...patient, isRegistered: !patient.isRegistered})}
                          className="form-checkbox h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="isRegistered" className="ml-2 text-gray-700">Patient is Registered</label>
                      </div>
                      {!patient.isRegistered && (
                        <span className="text-red-500 font-medium">+${priceList.unregisteredFee} fee</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Medications & Summary */}
            <div className="space-y-6">
              {/* Medications */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Medications</h2>
                
                <div className={billing.fixedPrice ? "opacity-50 pointer-events-none" : ""}>
                  <div className="flex space-x-2 mb-4">
                  <input
  type="text"
  placeholder="Medication name"
  value={billing.newMedication.name}
  onChange={(e) => setBilling({
    ...billing,
    newMedication: {...billing.newMedication, name: e.target.value}
  })}
  className="form-input flex-1 rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
/>
<input
  type="number"
  placeholder="Price"
  value={billing.newMedication.price}
  onChange={(e) => setBilling({
    ...billing,
    newMedication: {...billing.newMedication, price: parseFloat(e.target.value) || 0}
  })}
  className="form-input w-24 rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
/>
<button
  onClick={handleMedicationAdd}
  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
>
  Add
</button>
  </div>

{/* Medication List */}
<div className="max-h-60 overflow-y-auto">
  {billing.medications.length > 0 ? (
    <ul className="divide-y divide-gray-200">
      {billing.medications.map((medication, index) => (
        <li key={index} className="py-2 flex justify-between items-center">
          <span>{medication.name}</span>
          <div className="flex items-center">
            <span className="mr-3">${medication.price.toFixed(2)}</span>
            <button
              onClick={() => handleMedicationRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 text-center py-4">No medications added</p>
  )}
</div>
  </div>
</div>
  </div>

  {/* Billing Summary */}
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
<h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Summary</h2>

{billing.fixedPrice ? (
  <div className="mb-4">
<label className="block text-gray-700 mb-2">Fixed Price Amount</label>
<input
  type="number"
  min="0"
  placeholder="Enter total amount"
  className="form-input w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200"
/>
  </div>
) : (
  <div className="space-y-2 mb-4">
{billing.admissionFee && (
  <div className="flex justify-between">
    <span className="text-gray-600">Admission Fee</span>
    <span className="font-medium">${priceList.admissionFee.toFixed(2)}</span>
  </div>
)}
{billing.consultationFee && (
  <div className="flex justify-between">
    <span className="text-gray-600">Consultation Fee</span>
    <span className="font-medium">${priceList.consultationFee.toFixed(2)}</span>
  </div>
)}
{(billing.bedDays > 0 || billing.bedHours > 0) && (
  <div className="flex justify-between">
    <span className="text-gray-600">Bed Charges</span>
    <span className="font-medium">
      ${((billing.bedDays * priceList.bedPerDay) + (billing.bedHours * priceList.bedPerHour)).toFixed(2)}
    </span>
  </div>
)}
{billing.surgeryFee && billing.selectedSurgery && (
  <div className="flex justify-between">
    <span className="text-gray-600">
      {billing.selectedSurgery === 'other' ? billing.otherSurgery || 'Other Surgery' : 
        billing.selectedSurgery.charAt(0).toUpperCase() + billing.selectedSurgery.slice(1) + ' Surgery'}
    </span>
    <span className="font-medium">
      ${billing.selectedSurgery === 'other' ? 
        billing.otherSurgeryPrice.toFixed(2) : 
        priceList.surgeries[billing.selectedSurgery].toFixed(2)}
    </span>
  </div>
)}
{billing.medications.length > 0 && (
  <div className="flex justify-between">
    <span className="text-gray-600">Medications</span>
    <span className="font-medium">
      ${billing.medications.reduce((sum, med) => sum + Number(med.price), 0).toFixed(2)}
    </span>
  </div>
)}
{billing.wardType !== 'normal' && (
  <div className="flex justify-between">
    <span className="text-gray-600">Ward Upgrade</span>
    <span className="font-medium">${priceList.wardTypes[billing.wardType].toFixed(2)}</span>
  </div>
)}
{!patient.isRegistered && (
  <div className="flex justify-between">
    <span className="text-gray-600">Unregistered Patient Fee</span>
    <span className="font-medium">${priceList.unregisteredFee.toFixed(2)}</span>
  </div>
)}
<div className="border-t border-gray-200 pt-2 mt-2">
  <div className="flex justify-between font-semibold">
    <span>Total</span>
    <span className="text-emerald-700">${calculateTotal().toFixed(2)}</span>
  </div>
</div>
  </div>
)}

{/* Payment Buttons */}
<div className="space-y-3">
  <button className="w-full py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
    Proceed to Payment
  </button>
  <button className="w-full py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
    Print Invoice
  </button>
</div>
          </div>
        </div>
      </div>
    </div>
  
    </div>
  )}

export default HospitalCheckout;
