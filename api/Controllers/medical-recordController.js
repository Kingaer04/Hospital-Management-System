import MedicalRecord from '../Models/Medical-RecordModel.js';
import StaffData from '../Models/StaffModel.js';
import HospitalAdminAccount from '../Models/AdminModel.js';
import createHttpError from 'http-errors';
import { console } from 'inspector';

export const MedicalRecordController = {
  // Create a new medical record
  createMedicalRecord: async (req, res, next) => {
    try {
      const {
        personalInfo,
        allergies,
        patientId,
        receptionistId,
        vitalSigns  
      } = req.body;

      const receptionist = await StaffData.findById(req.user.id);
      if (!receptionist) {
        return res.status(403).json('Doctor not found');
      }

      const referenceReceptionist = await StaffData.findById(receptionistId);
      if (!referenceReceptionist) {
        return res.status(400).json('Reference receptionist not found');
      }

      const primaryHospitalId = referenceReceptionist.hospital_ID;

      const existingRecord = await MedicalRecord.findOne({ patientId });
      if (existingRecord) {
        return res.status(409).json('Medical record already exists for this patient');
      }
  
      // Create medical record with the consultation
      const medicalRecord = new MedicalRecord({
        patientId,
        personalInfo,
        allergies,
        primaryHospitalId,
        consultations: [{  
          doctorId: null,
          hospitalId: primaryHospitalId,
          diagnosis: null,
          doctorNotes: null,
          treatment: null,
          vitalSigns,
          createdBy: req.user.id
        }],
        createdBy: req.user.id,
        updatedBy: req.user.id
      });
  
      await medicalRecord.save();
  
      res.status(201).json({
        message: 'Medical record created successfully',
        medicalRecord
      });
    } catch (error) {
      next(error);
    }
  },

  // Add a new consultation to a medical record
  addConsultation: async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const { diagnosis, doctorNotes, treatment, vitalSigns } = req.body;
  
      // Validate input
      if (!diagnosis || !doctorNotes || !treatment) {
        return res.status(400).json('All fields are required');
      }
  
      const doctor = await StaffData.findById(req.user.id);
      if (!doctor) {
        return res.status(403).json('Doctor not found');
      }
  
      const medicalRecord = await MedicalRecord.findOne({ patientId });
      if (!medicalRecord) {
        return res.status(404).json('Medical record not found');
      }
  
      const newConsultation = {
        doctorId: req.user.id,
        hospitalId: doctor.hospital_ID,
        diagnosis,
        doctorNotes,
        treatment,
        vitalSigns,
        createdBy: req.user.id
      };
  
      medicalRecord.consultations.push(newConsultation);
      medicalRecord.updatedBy = req.user.id;
  
      await medicalRecord.save();
      
      res.status(200).json({
        message: 'Consultation added successfully',
        consultation: newConsultation
      });
    } catch (error) {
      console.error("Error adding consultation:", error);
      next(error);
    }
  },

  // Update an existing consultation
  updateConsultation: async (req, res, next) => {
    try {
      const { patientId, consultationId } = req.params;
      const updateData = req.body;

      const medicalRecord = await MedicalRecord.findOne({ patientId });
      if (!medicalRecord) {
        return res.status(404).json('Medical record not found');
      }

      // Verify doctor and hospital access
      const doctor = await StaffData.findById(req.user.id);
      if (!doctor) {
        return res.status(403).json('Doctor not found');
      }

      // Find and update consultation
      const consultation = medicalRecord.consultations.id(consultationId);
      if (!consultation) {
        return res.status(404).json('Consultation not found');
      }

      // Update consultation fields
      Object.keys(updateData).forEach(key => {
        consultation[key] = updateData[key];
      });

      consultation.updatedBy = req.user.id;
      medicalRecord.updatedBy = req.user.id;

      await medicalRecord.save();

      res.status(200).json({
        message: 'Consultation updated successfully',
        consultation
      });
    } catch (error) {
      next(error);
    }
  },

  getMedicalRecord: async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const doctor = await StaffData.findById(req.user.id);
      
      if (!doctor) {
        return res.status(403).json('Doctor not found');
      }
      
      // Changed from findById to findOne with patientId as the search parameter
      const medicalRecord = await MedicalRecord.findOne({ patientId })
        .populate('consultations.doctorId', 'name')
        .populate('consultations.hospitalId', 'hospital_Name');
      
      if (!medicalRecord) {
        return res.status(409).json('Medical record not found');
      }
      
      res.status(200).json(medicalRecord);
    } catch (error) {
      next(error);
    }
  },

  // Grant hospital access to a medical record
  grantHospitalAccess: async (req, res, next) => {
    try {
      const { medicalRecordId, hospitalId } = req.params;

      const medicalRecord = await MedicalRecord.findById(medicalRecordId);
      if (!medicalRecord) {
        return next(createHttpError(404, 'Medical record not found'));
      }

      // Verify requesting doctor's hospital
      const doctor = await StaffData.findById(req.user.doctorId);
      if (!doctor) {
        return next(createHttpError(403, 'Doctor not found'));
      }

      // Only primary hospital or current accessible hospitals can grant access
      if (!medicalRecord.hasHospitalAccess(doctor.hospitalId)) {
        return next(createHttpError(403, 'No permission to grant access'));
      }

      // Prevent duplicate access
      if (!medicalRecord.accessibleHospitals.includes(hospitalId)) {
        medicalRecord.accessibleHospitals.push(hospitalId);
        medicalRecord.updatedBy = req.user._id;
        await medicalRecord.save();
      }

      res.status(200).json({
        message: 'Hospital access granted successfully',
        accessibleHospitals: medicalRecord.accessibleHospitals
      });
    } catch (error) {
      next(error);
    }
  },
}
