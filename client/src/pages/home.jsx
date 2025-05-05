import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, Activity, Award, CreditCard, ArrowUp } from 'lucide-react';
import { useSelector } from 'react-redux'

const Home = () => {
  const { currentAdmin } = useSelector((state) => state.admin)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [patientData, setPatientData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [recentCheckouts, setRecentCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hospital_ID = currentAdmin._id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all required data
        const [
          staffResponse,
          patientsResponse,
          appointmentsResponse,
          pendingAppointmentsResponse,
          completedAppointmentsResponse,
          monthlyPatientsResponse,
          monthlyRevenueResponse,
          topDoctorsResponse,
          recentCheckoutsResponse
        ] = await Promise.all([
          fetch(`/recep-patient/totalStaff/${hospital_ID}`),
          fetch(`/recep-patient/totalPatients/${hospital_ID}`),
          fetch(`/recep-patient/totalAppointments/${hospital_ID}`),
          fetch(`/recep-patient/pendingAppointments/${hospital_ID}`),
          fetch(`/recep-patient/totalCompletedAppointments/${hospital_ID}`),
          fetch(`/recep-patient/monthly-patients/${hospital_ID}`),
          fetch(`/recep-patient/monthly-revenue/${hospital_ID}`),
          fetch(`/recep-patient/topDoctors/${hospital_ID}`),
          fetch(`/recep-patient/recentCheckouts/${hospital_ID}`)
        ]);

        // Parse all responses to JSON
        const staffData = await staffResponse.json();
        const patientsData = await patientsResponse.json();
        const appointmentsData = await appointmentsResponse.json();
        const pendingAppointmentsData = await pendingAppointmentsResponse.json();
        const completedAppointmentsData = await completedAppointmentsResponse.json();
        const monthlyPatients = await monthlyPatientsResponse.json();
        const monthlyRevenue = await monthlyRevenueResponse.json();
        const topDoctorsData = await topDoctorsResponse.json();
        const recentCheckoutsData = await recentCheckoutsResponse.json();

        // Fetch doctors count
        const doctorsResponse = await fetch(`/recep-patient/doctors/${hospital_ID}`);
        const doctorsData = await doctorsResponse.json();
        
        // Calculate receptionists (assuming they're staff members who aren't doctors)
        const receptionistCount = staffData.totalStaff - doctorsData.length;

        // Update state with fetched data
        setStats({
          totalStaff: staffData.totalStaff,
          totalPatients: patientsData.totalPatients,
          totalAppointments: appointmentsData.totalAppointments,
          totalDoctors: doctorsData.length,
          totalReceptionists: receptionistCount,
          pendingAppointments: pendingAppointmentsData.totalPendingAppointments,
          completedAppointments: completedAppointmentsData.totalCompletedAppointments
        });

        setPatientData(monthlyPatients);
        setRevenueData(monthlyRevenue);
        setTopDoctors(topDoctorsData);
        setRecentCheckouts(recentCheckoutsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hospital_ID, selectedYear]);

  // Find best month (highest revenue)
  const bestMonth = revenueData.length ? 
    revenueData.reduce((max, month) => (month.amount > max.amount ? month : max), revenueData[0]) : 
    { month: 'N/A', amount: 0 };

  // Calculate yearly total revenue
  const totalYearlyRevenue = revenueData.reduce((sum, month) => sum + month.amount, 0);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hospital Management Dashboard</h1>
          <p className="text-gray-600">Hospital statistics and performance metrics</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - 70% width */}
          <div className="lg:w-[70%] space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Staff" 
                value={stats.totalStaff} 
                icon={<Users className="h-6 w-6 text-emerald-400" />}
                color="bg-gradient-to-br from-emerald-50 to-teal-50"
                textColor="text-emerald-700"
              />
              <StatCard 
                title="Total Appointments" 
                value={stats.totalAppointments} 
                icon={<Calendar className="h-6 w-6 text-blue-400" />}
                color="bg-gradient-to-br from-blue-50 to-indigo-50"
                textColor="text-blue-700"
              />
              <StatCard 
                title="Doctors" 
                value={stats.totalDoctors} 
                icon={<Activity className="h-6 w-6 text-purple-400" />}
                color="bg-gradient-to-br from-purple-50 to-pink-50"
                textColor="text-purple-700"
              />
              <StatCard 
                title="Receptionists" 
                value={stats.totalReceptionists} 
                icon={<Users className="h-6 w-6 text-orange-400" />}
                color="bg-gradient-to-br from-orange-50 to-amber-50"
                textColor="text-orange-700"
              />
            </div>

            {/* Patient Line Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Patient Registration Trends</h2>
                <div className="flex items-center space-x-2">
                  <label htmlFor="year" className="text-sm text-gray-600">Year:</label>
                  <select 
                    id="year" 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="registeredPatients" 
                      name="Registered Patients" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="unregisteredPatients" 
                      name="Unregistered Patients" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Checkout Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Patient Checkouts</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentCheckouts.slice(0, 5).map((checkout, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-full" 
                                src={checkout.patientId.avatar || "/api/placeholder/40/40"} 
                                alt="Patient" 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {`${checkout.patientId.first_name} ${checkout.patientId.last_name}`}
                              </div>
                              <div className="text-sm text-gray-500">{checkout.patientId.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{checkout.doctorId.name}</div>
                          <div className="text-sm text-gray-500">{checkout.doctorId.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(checkout.checkOut).toLocaleDateString('en-US', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(checkout.checkOut).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            checkout.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {checkout.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side - 30% width */}
          <div className="lg:w-[30%] space-y-6">
            {/* Monthly Revenue Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Revenue ({selectedYear})</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6 }}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Best Month Card */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold opacity-90">Best Performing Month</h3>
                  <p className="text-3xl font-bold mt-2">{bestMonth.month}</p>
                  <p className="mt-1 text-lg opacity-90">${bestMonth.amount.toLocaleString()}</p>
                </div>
                <Award className="h-12 w-12 opacity-90" />
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>
                    {((bestMonth.amount / (totalYearlyRevenue / 12)) * 100 - 100).toFixed(1)}% above monthly average
                  </span>
                </div>
              </div>
            </div>

            {/* Top Doctors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Top Performing Doctors</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topDoctors}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {topDoctors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} appointments`, name]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold opacity-90">Year Summary</h3>
                  <p className="text-3xl font-bold mt-2">${totalYearlyRevenue.toLocaleString()}</p>
                  <p className="mt-1 opacity-90">Total Revenue for {selectedYear}</p>
                </div>
                <CreditCard className="h-12 w-12 opacity-90" />
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm opacity-90">Total Patients</p>
                    <p className="text-lg font-semibold">{stats.totalPatients}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Appointments</p>
                    <p className="text-lg font-semibold">{stats.totalAppointments}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Completed</p>
                    <p className="text-lg font-semibold">{stats.completedAppointments}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Pending</p>
                    <p className="text-lg font-semibold">{stats.pendingAppointments}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, textColor }) => {
  return (
    <div className={`${color} ${textColor} rounded-xl shadow-sm p-6 border border-gray-100`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
        </div>
        <div className="p-2 bg-white bg-opacity-30 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Home;
