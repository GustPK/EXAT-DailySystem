import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileDown } from 'lucide-react';

const Worklog = () => {
  const [worklogs, setWorklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterJobCode, setFilterJobCode] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.USER_ID;
  const token = localStorage.getItem('token');

  const navigate = useNavigate();

  // ฟังก์ชันแปลงวันที่เป็น DD-MM-YYYY
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.slice(0, 10).split('-');
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchWorklogs = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          'http://localhost:4000/v1/worklog/get',
          { USER_ID: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setWorklogs(res.data.data);
        } else {
          setWorklogs([]);
        }
      } catch (err) {
        setWorklogs([]);
      }
      setLoading(false);
    };
    if (userId && token) fetchWorklogs();
  }, [userId, token]);

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

  const grouped = filteredWorklogs.reduce((acc, item) => {
    const date = item.WORK_DATE?.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleExportReport = async () => {
    try {
      const res = await axios.post(
        'http://localhost:4000/v1/reportjob/record',
        {
          from: filterStartDate || "2025-01-01",
          to: filterEndDate || "2100-01-01",
          USER_ID: userId,
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
        alert('ไม่สามารถสร้างรายงานได้: ' + res.data.message);
      }
    } catch (error) {
      console.error('Report creation failed:', error);
      alert('เกิดข้อผิดพลาดขณะสร้างรายงาน');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center tracking-wide">งานที่ดำเนินการ</h2>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">วันที่เริ่มต้น</label>
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
          className="ml-auto w-13 h-9 bg-blue-100 hover:bg-blue-200 text-2xl text-blue-900 font-regular rounded-xl"
          onClick={() => {
            navigate('/addworklog');
          }}
        >
          +
        </button>
        <button
          className="w-13 h-9 bg-blue-100 hover:bg-blue-200 text-xl text-blue-900 font-semibold rounded-xl flex items-center justify-center"
          onClick={handleExportReport}
        >
          <FileDown className='w-4.5 h-4.5 text-blue-900' />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center text-gray-400">ไม่พบข้อมูลงาน</div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="border border-gray-300 rounded-xl mb-3 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-100 hover:from-gray-100 hover:to-blue-50 hover:scale-101 font-semibold text-blue-900 text-md transition rounded-t-xl outline-none"
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
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-400 pb-3 pl-3 last:border-b-0 hover:scale-101 cursor-pointer"
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
                      <div className="flex-[2] min-w-[180px]">
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

export default Worklog;
