import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SearchBar from '../components/searchBar';
import PatientTable from '../components/tableComponet';
import { Calendar } from '@/components/ui/calendar';

export default function ReceptionistHome() {
  return (
    <div className="p-5 w-[100%]">
      <div className="mb-8">
        <h5 className='font-bold text-[18px]'>
          Welcome, Anny
        </h5>
        <p className="text-[#A9A9A9] text-[11px] font-[400]">
          Here's an insight of your activity
        </p>
      </div>
      <div className="flex flex-wrap w-[100%] gap-[5%]">
        <div className="Width">
          {/* Card Rendering */}
                <div className="flex flex-wrap gap-4 mb-4">
                {/* Card One  */}
                <div className='p-5 w-full sm:w-[calc(33%-1rem)] rounded-[10px] Shadow min-w-[250px]'>
                  <p className="text-[15px] text-[#A9A9A9]">
                  Total Patient
                  </p>
                  <div className='mt-8 flex justify-between items-center font-bold'>
                  <p>18</p>
                  <Diversity1OutlinedIcon sx={{ fill:"#00A272" }}/>
                  </div>
                </div>
                {/* Card Two  */}
                <div className='p-5 w-full sm:w-[calc(33%-1rem)] rounded-[10px] Shadow min-w-[250px]'>
                  <p className="text-[15px] text-[#A9A9A9]">
                  Total Staff
                  </p>
                  <div className='mt-8 flex justify-between items-center font-bold'>
                  <p>18</p>
                  <BadgeOutlinedIcon sx={{ fill:"#00A272" }}/>
                  </div>
                </div>
                {/* Card Three  */}
                <div className='p-5 w-full sm:w-[calc(33%-1rem)] rounded-[10px] Shadow min-w-[250px]'>
                  <p className="text-[15px] text-[#A9A9A9]">
                  Appointment
                  </p>
                  <div className='mt-8 flex justify-between items-center font-bold'>
                  <p>18</p>
                  <CalendarMonthOutlinedIcon sx={{ fill:"#00A272" }}/>
                  </div>
                </div>
                </div>
                <div className='mt-[40px] border border-[#A9A9A9] p-[4%] rounded-[10px]'>
                <p className='font-bold text-[100%]'>
                  Search For Patient By Name or ID
                </p>
                <SearchBar/>
                <div className="flex flex-wrap items-center mt-2 gap-3">
                  <p className='text-[65%]'>
                  Status: Available
                  </p>
                  <p className='text-[65%]'>
                  Patient's Name: Samuel Sophia
                  </p>
                  <p className='text-[65%]'>
                  Patient's ID: 001
                  </p>
                  <button className='bg-[#00A272] text-white text-[65%] rounded-sm p-3'>
                  Book new Appointment
                  </button>
                </div>
                </div>
                <div>
                <p className='mt-10 font-bold'>Patient's Data</p>
                {/* <PatientTable/> */}
          </div>
        </div>
        <div className='w-[23%] Flex flex-col Image-container'>
          <div className="border border-[#A9A99A9] rounded-[10px] p-3">
            <Calendar/>
          </div>
          <div className='mt-[30px] ml-5'>
            <p>
              Doctor
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
