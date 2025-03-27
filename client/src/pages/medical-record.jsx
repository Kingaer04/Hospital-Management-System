import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Paper, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { User as UserIcon, HeartPulse as HeartPulseIcon, FileText as FileTextIcon, Edit as EditIcon, Save as SaveIcon, PlusCircle as PlusCircleIcon, LogOut as LogOutIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

const MedicalRecord = () => {
  const {currentUser} = useSelector(state => state.user);
  const { patientId } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [recordExists, setRecordExists] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    patientId: patientId,
    personalInfo: {
      name: '',
      age: '',
      gender: '',
      bloodGroup: '',
      contactNumber: ''
    },
    allergies: '',
    hospitalId: '',
    vitalSigns: {
      bloodPressure: '',
      sugarLevel: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    }
  });
  const [patient, setPatient] = useState({
    personalInfo: {
      name: '',
      age: '',
      gender: '',
      bloodGroup: '',
      contactNumber: ''
    },
    vitalSigns: {
      bloodPressure: '',
      sugarLevel: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    allergies: [],
    consultations: []
  });
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);
  const [isEditConsultationOpen, setIsEditConsultationOpen] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString(),
    doctorName: '',
    hospital: '',
    diagnosis: '',
    doctorNotes: '',
    treatment: '',
    vitalSigns: { ...patient.vitalSigns }
  });
  const [editingConsultationIndex, setEditingConsultationIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoToHomepage = async () => {
    try {
      // Update availability status to true
      const response = await fetch('/recep-patient/update-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorId: currentUser._id })
      });

      if (!response.ok) {
        throw new Error('Failed to update availability status');
      }

      // Navigate to homepage
      navigate('/');
    } catch (err) {
      setNotification({
        open: true,
        message: 'Error updating status: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await fetch(`/recep-patient/patientData/${patientId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await res.json();
        
        // Calculate age from DoB
        const calculateAge = (dob) => {
          if (!dob) return '';
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          // Adjust age if birthday hasn't occurred yet this year
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          return age.toString();
        };
        
        // Get age from DoB
        const age = calculateAge(data.patient.DoB);
        
        setPatient({
          personalInfo: {
            name: `${data.patient.first_name} ${data.patient.last_name}` || '',
            age: age,
            gender: data.patient.gender || '',
            contactNumber: data.patient.phone || ''
          },
        });
        
        // Also update the newRecord state with the same personal info
        setNewRecord(prev => ({
          ...prev,
          personalInfo: {
            name: `${data.patient.first_name} ${data.patient.last_name}` || '',
            age: age,
            gender: data.patient.gender || '',
            contactNumber: data.patient.phone || ''
          },
        }));
        
      } catch (error) {
        console.log('Error fetching patient data:', error);
      }
    };
    
    fetchPatientData();
  }, [patientId]);

  // Fetch hospitals for dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch(`/recep-patient/fetchHospital/${currentUser._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load hospitals');
        }
        const data = await res.json();
        setHospitals(data.hospital_Name);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setNotification({
          open: true,
          message: 'Failed to load hospitals: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    };

    fetchHospitals();
  }, []);

  // Fetch patient's medical record data by patient ID
  useEffect(() => {
    const fetchPatientMedicalRecord = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/records/medicalRecords/${patientId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (res.status === 409) {
          setRecordExists(false);
          setError(null);
          setLoading(false);
          return;
        } else if (!res.ok) {
          throw new Error('Failed to load medical record');
        }
        
        const data = await res.json();
        console.log("Data: ", data);
        
        // Transform backend data to match frontend structure
        const transformedData = {
          personalInfo: data.personalInfo || {},
          vitalSigns: data.consultations?.length > 0 
            ? data.consultations[data.consultations.length - 1].vitalSigns 
            : {},
          allergies: data.allergies || [],
          consultations: data.consultations?.map(consultation => ({
            id: consultation._id,
            date: new Date(consultation.createdAt).toISOString().split('T')[0],
            time: new Date(consultation.createdAt).toLocaleTimeString(),
            doctorName: consultation.doctorId?.name || 'Unknown Doctor',
            hospital: consultation.hospitalId?.hospital_Name || 'Unknown Hospital',
            diagnosis: consultation.diagnosis || '',
            doctorNotes: consultation.doctorNotes || '',
            treatment: consultation.treatment || '',
            vitalSigns: consultation.vitalSigns || {}
          })) || []
        };
        
        setPatient(transformedData);
        setRecordExists(true);
      } catch (err) {
        console.error('Error fetching record:', err);
        setError(err.message || 'Failed to load medical record');
        setNotification({
          open: true,
          message: 'Failed to load medical record: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientMedicalRecord();

  }, [patientId]);

  const handleOpenNewRecordModal = () => {
    setIsNewRecordModalOpen(true);
  };

  const handleCloseNewRecordModal = () => {
    setIsNewRecordModalOpen(false);
  };

  const handleCreateMedicalRecord = async () => {
    try {
      setSubmitting(true);
      
      // Transform data to match backend structure
      const recordData = {
        patientId: newRecord.patientId,
        personalInfo: newRecord.personalInfo,
        allergies: newRecord.allergies.split(',').map(allergy => allergy.trim()),
        doctorId: currentUser._id
      };
      
      // Create new medical record
      const res = await fetch('/records/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData)
      });
      
      if (!res.ok) {
        throw new Error('Failed to create medical record');
      }
      
      const data = await res.json();
      
      // If successful, add vital signs as first consultation
      if (data.medicalRecord) {
        const consultationData = {
          diagnosis: 'Initial Assessment',
          doctorNotes: 'Initial vital signs recorded',
          treatment: 'None',
          vitalSigns: newRecord.vitalSigns,
          hospitalId: newRecord.hospitalId
        };
        
        await fetch(`/records/${patientId}/consultation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(consultationData)
        });
      }
      
      setNotification({
        open: true,
        message: 'Medical record created successfully',
        severity: 'success'
      });
      
      // Refresh page to show new record
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to create medical record: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
      setIsNewRecordModalOpen(false);
    }
  };

  const handleOpenNewConsultation = () => {
    setCurrentConsultation({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      doctorName: '',
      hospital: '',
      diagnosis: '',
      doctorNotes: '',
      treatment: '',
      vitalSigns: { ...patient.vitalSigns }
    });
    setIsNewConsultationOpen(true);
  };

  const handleSaveNewConsultation = async () => {
    try {
      setSubmitting(true);
      
      // Transform data to match backend structure
      const consultationData = {
        diagnosis: currentConsultation.diagnosis,
        doctorNotes: currentConsultation.doctorNotes,
        treatment: currentConsultation.treatment,
        vitalSigns: currentConsultation.vitalSigns
      };
      
      // Updated endpoint to use patient ID
      const response = await fetch(`/records/${patientId}/consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add consultation');
      }
      
      const result = await response.json();
      
      // Update local state with the returned consultation
      const newConsultation = {
        id: result.consultation._id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        doctorName: currentUser?.name,
        hospital: hospitals,
        diagnosis: result.consultation.diagnosis,
        doctorNotes: result.consultation.doctorNotes,
        treatment: result.consultation.treatment,
        vitalSigns: result.consultation.vitalSigns
      };

      console.log("New Consultation: ", newConsultation);
      
      setPatient(prev => ({
        ...prev,
        consultations: [...prev.consultations, newConsultation],
        vitalSigns: newConsultation.vitalSigns
      }));
      
      setNotification({
        open: true,
        message: 'Consultation added successfully',
        severity: 'success'
      });
      console.log(newConsultation)
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to add consultation: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
      setIsNewConsultationOpen(false);
    }
  };

  const handleOpenEditConsultation = (consultation, index) => {
    setCurrentConsultation(consultation);
    setEditingConsultationIndex(index);
    setIsEditConsultationOpen(true);
  };

  const handleSaveEditedConsultation = async () => {
    try {
      setSubmitting(true);
      
      // Get the consultation ID directly from the consultation object in your state
      const consultationId = patient.consultations[editingConsultationIndex].id;
    
      // Transform data to match backend structure
      const consultationData = {
        doctorId: currentUser._id,
        diagnosis: currentConsultation.diagnosis,
        doctorNotes: currentConsultation.doctorNotes,
        treatment: currentConsultation.treatment,
        vitalSigns: currentConsultation.vitalSigns
      };
      
      // Updated endpoint to use patient ID
      const response = await fetch(`/records/${patientId}/consultation/${consultationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(consultationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update consultation');
      }
      
      const updatedConsultations = [...patient.consultations];
      updatedConsultations[editingConsultationIndex] = currentConsultation;
      
      // If editing the latest consultation, update vital signs
      if (editingConsultationIndex === patient.consultations.length - 1) {
        setPatient(prev => ({
          ...prev,
          consultations: updatedConsultations,
          vitalSigns: currentConsultation.vitalSigns
        }));
      } else {
        setPatient(prev => ({
          ...prev,
          consultations: updatedConsultations
        }));
      }
      
      setNotification({
        open: true,
        message: 'Consultation updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to update consultation: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
      setIsEditConsultationOpen(false);
    }
  };

  const handleGrantHospitalAccess = async (hospitalId) => {
    try {
      // Updated endpoint to use patient ID
      const response = await fetch(
        `/patients/${patientId}/grant-access/${hospitalId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to grant hospital access');
      }
      
      setNotification({
        open: true,
        message: 'Hospital access granted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to grant hospital access: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const renderNewRecordModal = () => {
    return (
      <Dialog 
        open={isNewRecordModalOpen} 
        onClose={handleCloseNewRecordModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#00A272', color: 'white' }}>
          Create New Medical Record
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#00A272', mb: 2 }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={newRecord.personalInfo.name}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev, 
                      personalInfo: {
                        ...prev.personalInfo,
                        name: e.target.value
                      }
                    }))}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={newRecord.personalInfo.age}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev, 
                      personalInfo: {
                        ...prev.personalInfo,
                        age: e.target.value
                      }
                    }))}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={newRecord.personalInfo.gender}
                      label="Gender"
                      onChange={(e) => setNewRecord(prev => ({
                        ...prev, 
                        personalInfo: {
                          ...prev.personalInfo,
                          gender: e.target.value
                        }
                      }))}
                      disabled
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Blood Group"
                    value={newRecord.personalInfo.bloodGroup}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev, 
                      personalInfo: {
                        ...prev.personalInfo,
                        bloodGroup: e.target.value
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={newRecord.personalInfo.contactNumber}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev, 
                      personalInfo: {
                        ...prev.personalInfo,
                        contactNumber: e.target.value
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Allergies (comma separated)"
                    value={newRecord.allergies}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev, 
                      allergies: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Primary Hospital"
                    value={hospitals}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev, 
                      hospitalId: e.target.value
                    }))}
                    disabled
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Vital Signs */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#00A272', mb: 2 }}>
                Vital Signs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Blood Pressure"
                    placeholder="120/80 mmHg"
                    value={newRecord.vitalSigns.bloodPressure}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev,
                      vitalSigns: {
                        ...prev.vitalSigns,
                        bloodPressure: e.target.value
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Sugar Level"
                    placeholder="mg/dL"
                    value={newRecord.vitalSigns.sugarLevel}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev,
                      vitalSigns: {
                        ...prev.vitalSigns,
                        sugarLevel: e.target.value
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Heart Rate"
                    placeholder="bpm"
                    value={newRecord.vitalSigns.heartRate}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev,
                      vitalSigns: {
                        ...prev.vitalSigns,
                        heartRate: e.target.value
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    placeholder="°C"
                    value={newRecord.vitalSigns.temperature}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev,
                      vitalSigns: {
                        ...prev.vitalSigns,
                        temperature: e.target.value
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Weight"
                    placeholder="kg"
                    value={newRecord.vitalSigns.weight}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev,
                      vitalSigns: {
                        ...prev.vitalSigns,
                        weight: e.target.value
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Height"
                    placeholder="cm"
                    value={newRecord.vitalSigns.height}
                    onChange={(e) => setNewRecord(prev => ({
                      ...prev,
                      vitalSigns: {
                        ...prev.vitalSigns,
                        height: e.target.value
                      }
                    }))}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewRecordModal}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateMedicalRecord}
            variant="contained"
            sx={{ 
              backgroundColor: '#00A272', 
              '&:hover': { backgroundColor: '#008060' } 
            }}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Record'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderConsultationModal = (isEditing) => {
    const modalOpen = isEditing ? isEditConsultationOpen : isNewConsultationOpen;
    const handleClose = () => isEditing ? setIsEditConsultationOpen(false) : setIsNewConsultationOpen(false);

    return (
      <Dialog 
        open={modalOpen} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#00A272', color: 'white' }}>
          {isEditing ? 'Edit Consultation' : 'New Consultation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Consultation Details */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#00A272', mb: 2 }}>
                Consultation Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Diagnosis"
                    value={currentConsultation.diagnosis}
                    onChange={(e) => setCurrentConsultation(prev => ({
                      ...prev, 
                      diagnosis: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Doctor's Notes"
                    multiline
                    rows={3}
                    value={currentConsultation.doctorNotes}
                    onChange={(e) => setCurrentConsultation(prev => ({
                      ...prev, 
                      doctorNotes: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Treatment"
                    value={currentConsultation.treatment}
                    onChange={(e) => setCurrentConsultation(prev => ({
                      ...prev, 
                      treatment: e.target.value
                    }))}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Vital Signs */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#00A272', mb: 2 }}>
                Vital Signs
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(currentConsultation.vitalSigns || {}).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      value={value}
                      onChange={(e) => setCurrentConsultation(prev => ({
                        ...prev,
                        vitalSigns: {
                          ...prev.vitalSigns,
                          [key]: e.target.value
                        }
                      }))}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={isEditing ? handleSaveEditedConsultation : handleSaveNewConsultation}
            variant="contained"
            sx={{ 
              backgroundColor: '#00A272', 
              '&:hover': { backgroundColor: '#008060' } 
            }}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading patient data...</Typography>
      </Container>
    );
  }

  if (!recordExists) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#00A272' }}>
            No existing medical record found
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Click the button below to create a new medical record for this patient.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<PlusCircleIcon />}
            sx={{ 
              backgroundColor: '#00A272', 
              '&:hover': { backgroundColor: '#008060' } 
            }}
            onClick={handleOpenNewRecordModal}
          >
            Create Medical Record
          </Button>
          {renderNewRecordModal()}
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Please check that the patient ID is correct and try again.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Notification snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          elevation={6} 
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Personal Information Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#00A272', mb: 2 }}>
            Patient Medical Record
          </Typography>
          
          <Grid container spacing={2}>
            {/* Personal Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#00A272', mb: 2 }}>
                Personal Information
              </Typography>
              {Object.entries(patient.personalInfo).map(([key, value]) => (
                <Box 
                  key={key} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 1,
                    pb: 1,
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {value}
                  </Typography>
                </Box>
              ))}
            </Grid>

            {/* Vital Signs */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#00A272' }}>
                  Vital Signs
                </Typography>
              </Box>
              {Object.entries(patient.vitalSigns || {}).map(([key, value]) => (
                <Box 
                  key={key} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 1,
                    pb: 1,
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {value}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Box>

        {/* Allergies Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#00A272', mb: 2 }}>
            Allergies
          </Typography>
          {patient.allergies.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', color: '#777' }}>
              No allergies recorded
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {patient.allergies.map((allergy, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    backgroundColor: '#ffebee', 
                    color: '#c62828',
                    borderRadius: '16px'
                  }}
                >
                  <Typography variant="body2">{allergy}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        {/* Consultations Section */}
<Box>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
    <Typography variant="h6" sx={{ color: '#00A272' }}>
      Consultation History
    </Typography>
    <Button 
      variant="contained" 
      startIcon={<PlusCircleIcon />}
      onClick={handleOpenNewConsultation}
      sx={{ 
        backgroundColor: '#00A272', 
        '&:hover': { backgroundColor: '#008060' } 
      }}
    >
      Add New Consultation
    </Button>
  </Box>
  
  {patient.consultations.length === 0 ? (
    <Typography variant="body1" sx={{ textAlign: 'center', color: '#777', py: 3 }}>
      No consultations recorded yet
    </Typography>
  ) : (
    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
      {patient.consultations.map((consultation, index) => (
        <Paper 
          key={index} 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 2, 
            borderLeft: '4px solid #00A272',
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">{consultation.diagnosis}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {consultation.date} at {consultation.time}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2">
                  <strong>Doctor:</strong> {consultation.doctorName}
                </Typography>
                <Typography variant="body2">
                  <strong>Hospital:</strong> {consultation.hospital}
                </Typography>
              </Box>
              <Button 
                size="small" 
                startIcon={<EditIcon size={16} />}
                onClick={() => handleOpenEditConsultation(consultation, index)}
                sx={{ color: '#00A272' }}
              >
                Edit
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Doctor Notes:</strong> {consultation.doctorNotes}
              </Typography>
              <Typography variant="body2">
                <strong>Treatment:</strong> {consultation.treatment}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  )}
</Box>
  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
    <Button 
      variant="contained" 
      startIcon={<LogOutIcon />}
      onClick={handleGoToHomepage}
      sx={{ 
        backgroundColor: '#00A272', 
        '&:hover': { backgroundColor: '#008060' } 
      }}
    >
      Go to Homepage
    </Button>
  </Box>

{/* Render modals */}
{renderNewRecordModal()}
{renderConsultationModal(false)}
{renderConsultationModal(true)}
</Paper>
</Container>
);
};

export default MedicalRecord;