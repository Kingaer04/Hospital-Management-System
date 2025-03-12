import MedicalRecord from '../Models/Medical-RecordModel.js';
import StaffData from '../Models/StaffModel.js';
import HospitalAdminAccount from '../Models/AdminModel.js';
import createHttpError from 'http-errors';

export const MedicalRecordController = {
  // Create a new medical record
  createMedicalRecord: async (req, res, next) => {
    try {
      const { 
        patientId, 
        personalInfo, 
        allergies, 
        primaryHospitalId 
      } = req.body;

      // Verify patient and hospital exist
      const doctor = await StaffData.findById(req.user.doctorId);
      if (!doctor) {
        return next(createHttpError(403, 'Doctor not found'));
      }

      const hospital = await HospitalAdminAccount.findById(primaryHospitalId);
      if (!hospital) {
        return next(createHttpError(404, 'Hospital not found'));
      }

      const medicalRecord = new MedicalRecord({
        patientId,
        personalInfo,
        allergies,
        primaryHospitalId,
        createdBy: req.user._id,
        updatedBy: req.user._id
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
      const { medicalRecordId } = req.params;
      const { 
        diagnosis, 
        doctorNotes, 
        treatment, 
        vitalSigns 
      } = req.body;

      // Verify doctor and hospital
      const doctor = await StaffData.findById(req.user.doctorId);
      if (!doctor) {
        return next(createHttpError(403, 'Doctor not found'));
      }

      const medicalRecord = await MedicalRecord.findById(medicalRecordId);
      if (!medicalRecord) {
        return next(createHttpError(404, 'Medical record not found'));
      }

      // Check hospital access
      if (!medicalRecord.hasHospitalAccess(doctor.hospitalId)) {
        return next(createHttpError(403, 'No access to this medical record'));
      }

      const newConsultation = {
        doctorId: req.user.doctorId,
        hospitalId: doctor.hospitalId,
        diagnosis,
        doctorNotes,
        treatment,
        vitalSigns,
        createdBy: req.user._id
      };

      medicalRecord.consultations.push(newConsultation);
      medicalRecord.updatedBy = req.user._id;

      await medicalRecord.save();

      res.status(200).json({
        message: 'Consultation added successfully',
        consultation: newConsultation
      });
    } catch (error) {
      next(error);
    }
  },

  // Update an existing consultation
  updateConsultation: async (req, res, next) => {
    try {
      const { medicalRecordId, consultationId } = req.params;
      const updateData = req.body;

      const medicalRecord = await MedicalRecord.findById(medicalRecordId);
      if (!medicalRecord) {
        return next(createHttpError(404, 'Medical record not found'));
      }

      // Verify doctor and hospital access
      const doctor = await StaffData.findById(req.user.doctorId);
      if (!doctor) {
        return next(createHttpError(403, 'Doctor not found'));
      }

      if (!medicalRecord.hasHospitalAccess(doctor.hospitalId)) {
        return next(createHttpError(403, 'No access to this medical record'));
      }

      // Find and update consultation
      const consultation = medicalRecord.consultations.id(consultationId);
      if (!consultation) {
        return next(createHttpError(404, 'Consultation not found'));
      }

      // Update consultation fields
      Object.keys(updateData).forEach(key => {
        consultation[key] = updateData[key];
      });

      consultation.updatedBy = req.user._id;
      medicalRecord.updatedBy = req.user._id;

      await medicalRecord.save();

      res.status(200).json({
        message: 'Consultation updated successfully',
        consultation
      });
    } catch (error) {
      next(error);
    }
  },

  // Get medical record with access control
  getMedicalRecord: async (req, res, next) => {
    try {
      const { patientId } = req.params;
      console.log(req.user)
      const doctor = await StaffData.findById(req.user.id);
      if (!doctor) {
        return next(createHttpError(403, 'Doctor not found'));
      }

      const medicalRecord = await MedicalRecord.findById(patientId)
        .populate('consultations.doctorId', 'name')
        .populate('consultations.hospitalId', 'name');

      if (!medicalRecord) {
        return res.status(404).json('Medical record not found');
      }

      // Check hospital access
      if (!medicalRecord.hasHospitalAccess(doctor.hospitalId)) {
        return res.status(403).status('No access to this medical record');
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
