import mongoose from 'mongoose';

const VitalSignSchema = new mongoose.Schema({
  bloodPressure: { 
    type: String, 
    trim: true 
  },
  sugarLevel: { 
    type: String, 
    trim: true 
  },
  heartRate: { 
    type: String, 
    trim: true 
  },
  temperature: { 
    type: String, 
    trim: true 
  },
  weight: { 
    type: String, 
    trim: true 
  },
  height: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

const ConsultationSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    default: Date.now 
  },
  time: { 
    type: String 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StaffData',
  },
  hospitalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HospitalAdminAccount', 
  },
  diagnosis: { 
    type: String, 
    trim: true 
  },
  doctorNotes: { 
    type: String, 
    trim: true 
  },
  treatment: { 
    type: String, 
    trim: true 
  },
  vitalSigns: VitalSignSchema,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StaffData' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StaffData' 
  }
}, { timestamps: true });

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PatientData', 
    required: true 
  },
  personalInfo: {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    age: { 
      type: Number 
    },
    gender: { 
      type: String, 
      enum: ['Male', 'Female'] 
    },
    bloodGroup: { 
      type: String, 
      trim: true 
    },
    contactNumber: { 
      type: String, 
      trim: true 
    }
  },
  allergies: [{ 
    type: String, 
    trim: true 
  }],
  primaryHospitalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HospitalAdminAccount' 
  },
  consultations: [ConsultationSchema],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StaffData' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StaffData' 
  }
}, { 
  timestamps: true,
  methods: {
    hasHospitalAccess(hospitalId) {
      return this.accessibleHospitals.includes(hospitalId) || 
             this.primaryHospitalId.equals(hospitalId);
    }
  }
});

export default mongoose.model('MedicalRecord', MedicalRecordSchema);