import { CircleChevronRight, FileTextIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Userdetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [worklogs, setWorklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterJobCode, setFilterJobCode] = useState('');

  useEffect(() => {
    if (state && state.user) {
      setUser(state.user);
    }
  }, [state]);

  useEffect(() => {
    const fetchWorklogs = async () => {
      if (!user?.USER_ID) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/v1/worklog/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ USER_ID: user.USER_ID }),
        });
        const result = await res.json();
        setWorklogs(result.success ? result.data : []);
      } catch {
        setWorklogs([]);
      }
      setLoading(false);
    };
    if (user?.USER_ID) fetchWorklogs();
  }, [user]);

  // Filter worklogs
  const filteredWorklogs = worklogs.filter(item => {
    let passDate = true;
    const workDate = item.WORK_DATE?.slice(0, 10);
    if (filterStartDate) {
      passDate = workDate >= filterStartDate;
    }
    if (passDate && filterEndDate) {
      passDate = workDate <= filterEndDate;
    }
    let passJob = true;
    if (filterJobCode) {
      passJob = item.JOB_CODE?.toLowerCase().includes(filterJobCode.toLowerCase());
    }
    return passDate && passJob;
  });

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.slice(0, 10).split('-');
    return `${day}-${month}-${year}`;
  };

  // Group filtered worklogs by date
  const grouped = filteredWorklogs.reduce((acc, item) => {
    const date = item.WORK_DATE?.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:4000/v1/reportjob/record',
        {
          from: filterStartDate || "2025-01-01",
          to: filterEndDate || "2100-01-01",
          USER_ID: user.USER_ID,
          JOB_CODE: filterJobCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success && res.data.data?.ref) {
        const refcode = res.data.data.ref;
        const reportUrl = `http://localhost:8080/Reporting/genreport?Refcode=${refcode}`;
        window.open(reportUrl, '_blank');
      } else {
        toast.error('ไม่สามารถสร้างรายงานได้: ' + res.data.message);
      }
    } catch (error) {
      console.error('Report creation failed:', error);
      toast.error('เกิดข้อผิดพลาดขณะสร้างรายงาน');
    }
  };

  if (!user) return <div className="text-center py-10 text-red-500">ไม่พบข้อมูลผู้ใช้งาน</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button
        className="px-3 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl"
        onClick={() => navigate(-1)}
      >
        &larr; กลับ
      </button>
      <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">รายละเอียดผู้ใช้</h2>
      <div className="rounded-xl shadow p-6 space-y-4 border border-gray-200 mb-14">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">ชื่อ</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.USER_NAME}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">รหัสพนักงาน</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.USER_ID}</span>
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">ตำแหน่ง</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.POSITION}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">อีเมล</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap" title={user.EMAIL}>
              {user.EMAIL}
            </span>
          </div>

          <div className="flex-1 min-w-[140px]">
            <span className="block text-gray-500 text-sm">เบอร์โทรศัพท์</span>
            <span className="font-semibold text-gray-800 block truncate overflow-hidden whitespace-nowrap">{user.PHONENUMBER}</span>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-blue-900 mb-4 text-center">งานที่ดำเนินการ</h3>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1 ">วันที่เริ่มต้น</label>
          <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="border-2 border-gray-300 rounded-md px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">วันที่สิ้นสุด</label>
          <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="border-2 border-gray-300 rounded-md px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">หมายเลขงาน</label>
          <input type="text" value={filterJobCode} onChange={e => setFilterJobCode(e.target.value)} className="w-35 border-2 border-gray-300 rounded-md px-2 py-1" placeholder="ค้นหา..." />
        </div>
        <button
          className="px-4 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl cursor-pointer"
          onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterJobCode(''); }}
        >
          ล้างตัวกรอง
        </button>
        <button
          className="ml-auto w-13 h-9 bg-blue-100 hover:bg-blue-200 text-xl text-blue-900 font-medium rounded-xl"
          onClick={() => {
            navigate(`/assign/${user.USER_ID}`, { state: { userId: user.USER_ID } });
            window.scrollTo(0, 0); // Scroll to top
          }}
        >
          +
        </button>

        <button
          className="w-13 h-9 bg-blue-100 hover:bg-blue-200 text-xl text-blue-900 font-semibold rounded-xl flex items-center justify-center"
          onClick={handleExportReport}
        >
          <FileTextIcon className='w-4.5 h-4.5 text-blue-900' />
        </button>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลดข้อมูลงาน...</div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center text-gray-400">ไม่พบข้อมูลงาน</div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="border-2 border-gray-300 rounded-xl mb-3 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-100 hover:from-gray-100 hover:to-blue-50 font-semibold text-blue-900 text-md transition rounded-t-xl outline-none"
                onClick={() => setOpenDate(openDate === date ? null : date)}
              >
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" fill="none" className="text-blue-700 mr-2" viewBox="0 0 20 20">
                    <rect width="20" height="20" rx="5" fill="#2563eb" fillOpacity="0.1" />
                    <path d="M6 10h8M10 6v8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {formatDate(date)}
                </span>
                <span className="ml-2">
                  {openDate === date ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 12l4-4 4 4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </span>
              </button>
              {openDate === date && (
                <div className="p-4 space-y-4 bg-white rounded-b-xl border-t border-gray-400">
                  {grouped[date].map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-400 pb-3 last:border-b-0 hover:scale-101 cursor-pointer"
                      onClick={() => navigate(`/worklog/${item.WORKLOG_ID}`, { state: { worklog: item } })}
                    >
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-600 text-xs mb-1">ช่วงเวลา</span>
                        <span className="font-semibold text-blue-900">{item.TIME_START?.slice(11, 16)} - {item.TIME_END?.slice(11, 16)}</span>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-600 text-xs mb-1">หมายเลขงาน</span>
                        <span className="font-semibold text-blue-900">{item.JOB_CODE}</span>
                      </div>
                      <div className="flex-2 min-w-[180px]">
                        <span className="block text-gray-600 text-xs mb-1">รายละเอียดงาน</span>
                        <span className="font-medium text-gray-800 block truncate max-w-full" title={item.TASK_DETAIL}>{item.TASK_DETAIL}</span>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-600 text-xs mb-1">สถานที่</span>
                        <span className="font-semibold text-blue-900">{item.LOCATION_NAME}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Userdetail;
