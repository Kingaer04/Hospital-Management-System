import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Snackbar, Alert, CircularProgress } from '@mui/material';
import { User as UserIcon, HeartPulse as HeartPulseIcon, FileText as FileTextIcon, Edit as EditIcon, Save as SaveIcon, PlusCircle as PlusCircleIcon } from 'lucide-react';

const MedicalRecord = () => {
  const { patientId } = useParams(); // Get patient ID from URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
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


  // Fetch patient's medical record data by patient ID
  useEffect(() => {
    const fetchPatientMedicalRecord = async () => {
      try {
        setLoading(true);
        
        const res = await fetch (`/Records//medicalRecords/${patientId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await res.json();
        console.log("Data: ", data);
        setLoading(false);
        
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
            hospital: consultation.hospitalId?.name || 'Unknown Hospital',
            diagnosis: consultation.diagnosis || '',
            doctorNotes: consultation.doctorNotes || '',
            treatment: consultation.treatment || '',
            vitalSigns: consultation.vitalSigns || {}
          })) || []
        };
        
        setPatient(transformedData);
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
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached');
        setLoading(false);
        setError('Request timed out. Please try again.');
        setNotification({
          open: true,
          message: 'Request timed out. Please try again.',
          severity: 'error'
        });
      }
    }, 15000); // 15 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [patientId]);

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
      const result = await fetchAPI(
        `/patients/${patientId}/consultation`, 
        'POST',
        consultationData
      );
      
      // Update local state with the returned consultation
      const newConsultation = {
        id: result.consultation._id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        doctorName: 'Current Doctor', // This would ideally come from the user context
        hospital: 'Current Hospital', // This would ideally come from the user context
        diagnosis: result.consultation.diagnosis,
        doctorNotes: result.consultation.doctorNotes,
        treatment: result.consultation.treatment,
        vitalSigns: result.consultation.vitalSigns
      };
      
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
      
      const consultation = patient.consultations[editingConsultationIndex];
      
      // Transform data to match backend structure
      const consultationData = {
        diagnosis: currentConsultation.diagnosis,
        doctorNotes: currentConsultation.doctorNotes,
        treatment: currentConsultation.treatment,
        vitalSigns: currentConsultation.vitalSigns
      };
      
      // Updated endpoint to use patient ID
      await fetchAPI(
        `/patients/${patientId}/consultation/${consultation.id}`, 
        'PUT', // Changed from POST to PUT for update
        consultationData
      );
      
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
      await fetchAPI(
        `/patients/${patientId}/grant-access/${hospitalId}`,
        'POST'
      );
      
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
                  <Grid item xs={12} key={key}>
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
              sx={{ 
                backgroundColor: '#00A272', 
                '&:hover': { backgroundColor: '#008060' } 
              }}
              onClick={handleOpenNewConsultation}
            >
              New Consultation
            </Button>
          </Box>

          {patient.consultations.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', color: '#777' }}>
              No consultations yet
            </Typography>
          ) : (
            patient.consultations.map((consultation, index) => (
              <Paper 
                key={consultation.id || index} 
                elevation={2} 
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  borderLeft: `4px solid #00A272` 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#00A272' }}>
                    {consultation.date} at {consultation.time}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEditConsultation(consultation, index)}
                  >
                    Edit
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Doctor:</strong> {consultation.doctorName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Hospital:</strong> {consultation.hospital}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Diagnosis:</strong> {consultation.diagnosis}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Doctor's Notes:</strong> {consultation.doctorNotes}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Treatment:</strong> {consultation.treatment}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))
          )}
        </Box>

        {/* New Consultation Modal */}
        {renderConsultationModal(false)}

        {/* Edit Consultation Modal */}
        {renderConsultationModal(true)}
      </Paper>
    </Container>
  );
};

export default MedicalRecord;