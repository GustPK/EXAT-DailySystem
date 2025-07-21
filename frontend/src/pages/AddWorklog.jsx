import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AddWorklog = () => {
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [jobDetail, setJobDetail] = useState('');
  const [location, setLocation] = useState('');
  const [locationList, setLocationList] = useState([]);
  const [jobNumber, setJobNumber] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [action, setAction] = useState('');
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // ดึงข้อมูลสถานที่จาก API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:4000/v1/location/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.success) {
          setLocationList(result.data);
        } else {
          console.error('ไม่สามารถโหลดสถานที่ได้:', result.message);
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      USER_ID: user?.USER_ID || '',
      WORK_DATE: date,
      TIME_START: timeStart,
      TIME_END: timeEnd,
      TASK_DETAIL: jobDetail,
      LOCATION_ID: location,
      JOB_CODE: jobNumber,
      COORDINATOR: coordinator,
      ACTION_TAKEN: action,
      PROBLEM: problem,
      CREATED_BY: user?.USER_ID || '',
    };

    try {
      const response = await fetch('http://localhost:4000/v1/worklog/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ บันทึกข้อมูลสำเร็จ');
        setDate('');
        setTimeStart('');
        setTimeEnd('');
        setJobDetail('');
        setLocation('');
        setJobNumber('');
        setCoordinator('');
        setAction('');
        setProblem('');
        navigate('/worklog');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white px-6 py-5 max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            className="px-3 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl"
            onClick={() => navigate(-1)}
          >
            &larr; กลับ
          </button>
          <h2 className="text-2xl font-bold text-blue-900 text-center sm:text-left lg:text-2xl sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
            บันทึกข้อมูลการดำเนินงาน
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex flex-col">
                <p className="mb-2 text-lg font-semibold">วันที่</p>
                <input
                  type="date"
                  className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-40 max-w-xs focus:border-blue-500 focus:bg-white transition"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1 flex flex-col ml-10">
                <p className="mb-2 text-lg font-semibold pl-3">ช่วงเวลา</p>
                <div className="flex gap-2 pl-3">
                  <input
                    type="time"
                    className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-28 max-w-xs focus:border-blue-500 focus:bg-white transition"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    required
                  />
                  <span className="flex items-center">-</span>
                  <input
                    type="time"
                    className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-28 max-w-xs focus:border-blue-500 focus:bg-white transition"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <p className="mb-2 text-lg font-semibold">สถานที่</p>
                <select
                  className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-full max-w-xs focus:border-blue-500 focus:bg-white transition h-11"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                >
                  <option value="">เลือกสถานที่</option>
                  {locationList.map((loc) => (
                    <option key={loc.LOCATION_ID} value={loc.LOCATION_ID}>
                      {loc.LOCATION_NAME}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-6">
            <div className="flex-1 flex flex-col">
              <p className="mb-2 text-lg font-semibold">รายละเอียดงาน</p>
              <textarea
                className="w-full h-35 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
                value={jobDetail}
                onChange={(e) => setJobDetail(e.target.value)}
                placeholder="รายละเอียดงาน"
                required
              />
            </div>
            <div className="w-full sm:w-56 flex flex-col justify-between">
              <div>
                <p className="mb-2 text-lg font-semibold">ผู้ประสานงาน (ถ้ามี)</p>
                <input
                  type="text"
                  className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-100 focus:border-blue-500 focus:bg-white transition"
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  placeholder="ชื่อผู้ประสานงาน (ถ้ามี)"
                />
              </div>
              <div className="mt-4">
                <p className="mb-2 text-lg font-semibold">หมายเลขงาน (ถ้ามี)</p>
                <input
                  type="text"
                  className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-100 focus:border-blue-500 focus:bg-white transition"
                  value={jobNumber}
                  onChange={(e) => setJobNumber(e.target.value)}
                  placeholder="หมายเลขงาน (ถ้ามี)"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-lg font-semibold">การดำเนินการ</p>
            <textarea
              className="w-full h-28 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="รายละเอียดการดำเนินการ"
              required
            />
          </div>

          <div>
            <p className="mb-2 text-lg font-semibold">ปัญหา (ถ้ามี)</p>
            <textarea
              className="w-full h-28 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="ปัญหาที่พบ (ถ้ามี)"
            />
          </div>

          <div className="sm:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`mb-6 w-38 h-11 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg cursor-pointer tracking-wide ${loading
                ? 'bg-black cursor-not-allowed border-gray-500'
                : 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:scale-102'
                }`}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorklog;
