import StaffData from '../Models/StaffModel.js'

function getUserParams(body) {
    return {
        name: body.name,
        email: body.email,
        role: body.role,
        avatar: body.avatar,
        phone: body.phone,
        address: body.address,
        gender: body.gender,
        relationshipStatus: body.relationshipStatus,
        licenseNumber: body.licenseNumber,
        nextOfKin: {
            name: body.nextOfKin?.name,
            gender: body.nextOfKin?.gender,
            address: body.nextOfKin?.address,
            email: body.nextOfKin?.email,
            phone: body.nextOfKin?.phone,
            relationshipStatus: body.nextOfKin?.relationshipStatus,
        },
        hospital_ID: body.hospital_ID // If you want to include hospital_ID as well
    };
}

export const staffController = {
    update: async (req, res, next) => {
        try {
            if (req.user.id !== req.params.id) return res.status(401).json({ error: 'Unauthorized! you can only update your account' });
            const updatedUser = await StaffData.findByIdAndUpdate(req.user.id, {
                $set: getUserParams(req.body)
            }, { new: true })
    
            // Check if both old and new passwords are provided
            if (req.body.oldPassword && req.body.newPassword) {
                try {
                    await updatedUser.changePassword(req.body.oldPassword, req.body.newPassword);
                } catch (error) {
                    console.log(error.message);
                    return res.status(400).json({ error: 'Old password is incorrect' });
                }
            } else if (req.body.oldPassword || req.body.newPassword) {
                return res.status(400).json({ error: 'Both old and new passwords must be provided.' });
            }
            updatedUser.changePassword = async function(oldPassword, newPassword) {
                // Check if the old password matches the one in the database
                const isMatch = await this.comparePassword(oldPassword);
                if (!isMatch) {
                    console.log('Old password is incorrectito');
                    throw new Error('Old password is incorrect');
                }
            
                // Update the password
                this.password = newPassword;
                await this.save();
            }
    
            res.status(200).json(updatedUser);
            } catch (error) {
            next(error);
        }
    },

    updateAvailabilityStatus: async (req, res) => {
      const { doctorId, availability_Status } = req.body;
      
      console.log('Received body:', req.body);
      console.log('doctorId:', doctorId);
      console.log('availability_status:', availability_Status);
      console.log('Type of availability_status:', typeof availability_Status);
  
      if (!doctorId) {
          res.status(400);
          throw new Error('Doctor ID is required');
      }
  
      try {
          const staff = await StaffData.findByIdAndUpdate(
              doctorId,
              { 
                  availability_Status: availability_Status !== undefined 
                      ? availability_Status 
                      : true 
              },
              { new: true }
          );
  
          console.log('Updated staff:', staff);
  
          if (!staff) {
              res.status(404);
              throw new Error('Doctor not found');
          }
  
          res.status(200).json({
              message: 'Availability status updated successfully',
              staff: {
                  _id: staff._id,
                  name: staff.name,
                  availability_Status: staff.availability_Status
              }
          });
      } catch (error) {
          console.error('Error in update:', error);
          res.status(500);
          throw new Error('Failed to update availability status: ' + error.message);
      }
  }
}