import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, FileDown, List, MoveDown, MoveUp, Rows3 } from 'lucide-react';
import { toast } from 'react-toastify';

const Worklog = () => {
  const [worklogs, setWorklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterJobCode, setFilterJobCode] = useState('');
  const [dateList, setDateList] = useState(true);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const updateDateList = () => setDateList(prev => !prev);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.USER_ID;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.slice(0, 10).split('-');
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (location.state?.dateList !== undefined) {
      setDateList(location.state.dateList);
    }
  }, [location.state]);
  
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
      } catch {
        setWorklogs([]);
      }
      setLoading(false);
    };
    if (userId && token) fetchWorklogs();
  }, [userId, token]);

  const filteredWorklogs = worklogs.filter(item => {
    const workDate = item.WORK_DATE?.slice(0, 10);
    const passDate =
      (!filterStartDate || workDate >= filterStartDate) &&
      (!filterEndDate || workDate <= filterEndDate);

    const passJob = !filterJobCode || item.JOB_CODE?.toLowerCase().includes(filterJobCode.toLowerCase());

    return passDate && passJob;
  });

  const grouped = filteredWorklogs.reduce((acc, item) => {
    const date = item.WORK_DATE?.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const flatList = Object.values(grouped).flat();

  const sortedFlatList = useMemo(() => {
    if (!sortConfig.key) return flatList;
    const sorted = [...flatList].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (sortConfig.key === 'WORK_DATE') {
        return (new Date(aVal) - new Date(bVal)) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
      return aVal.localeCompare(bVal) * (sortConfig.direction === 'asc' ? 1 : -1);
    });
    return sorted;
  }, [flatList, sortConfig]);

  const requestSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

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
          headers: { Authorization: `Bearer ${token}` },
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
      toast.error('เกิดข้อผิดพลาดขณะสร้างรายงาน');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 overflow-x-hidden min-h-screen">
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
        <button className="px-4 h-9 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl cursor-pointer" onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterJobCode(''); }}>
          ล้างตัวกรอง
        </button>

        <button className="ml-auto w-13 h-9 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl flex items-center justify-center" onClick={updateDateList}>
          {dateList === true ? <Rows3 className='w-4.5 h-4.5 text-blue-900' /> : <List className='w-4.5 h-4.5 text-blue-900' />}
        </button>
        <button className="w-13 h-9 bg-blue-100 hover:bg-blue-200 text-2xl text-blue-900 font-regular rounded-xl" onClick={() => navigate('/addworklog', { state: { dateList } })}>
          +
        </button>
        <button className="w-13 h-9 bg-blue-100 hover:bg-blue-200 font-semibold rounded-xl flex items-center justify-center" onClick={handleExportReport}>
          <FileDown className='w-4.5 h-4.5 text-blue-900' />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center text-gray-400">ไม่พบข้อมูลงาน</div>
        ) : dateList === false ? (
          <div>
            {/* Header Row */}
            <div className="hidden sm:flex sm:flex-row sm:items-center gap-2 sm:gap-8 border-y border-gray-300 bg-gray-100 py-5 pl-3 text-md font-semibold text-gray-700">
              <div className="flex-1 min-w-[120px] cursor-pointer flex items-center gap-1" onClick={() => requestSort('WORK_DATE')}>
                วันที่ {sortConfig.key === 'WORK_DATE' ? (sortConfig.direction === 'asc' ? <MoveDown className='w-4 h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-[120px]">ช่วงเวลา</div>
              <div className="flex-2 min-w-[180px] cursor-pointer flex items-center gap-1" onClick={() => requestSort('TASK_DETAIL')}>
                รายละเอียดงาน {sortConfig.key === 'TASK_DETAIL' ? (sortConfig.direction === 'asc' ? <MoveDown className='w-4 h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-[120px] cursor-pointer flex items-center gap-1" onClick={() => requestSort('LOCATION_NAME')}>
                สถานที่ {sortConfig.key === 'LOCATION_NAME' ? (sortConfig.direction === 'asc' ? <MoveDown className='w- h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-[120px] cursor-pointer flex items-center gap-1" onClick={() => requestSort('JOB_CODE')}>
                หมายเลขงาน {sortConfig.key === 'JOB_CODE' ? (sortConfig.direction === 'asc' ? <MoveDown className='w-4 h-4' /> : <MoveUp className='w-4 h-4' />) : <ArrowUpDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Data Rows */}
            {sortedFlatList.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-y border-gray-200 py-4 pl-3 last:border-b-0 cursor-pointer"
                onClick={() => navigate(`/worklog/${item.WORKLOG_ID}`, { state: { worklog: item, dateList } })}>
                <div className="flex-1 min-w-[120px]">
                  <span className="block text-gray-600 text-xs sm:hidden mb-1">วันที่</span>
                  <span className="font-semibold text-blue-900">{formatDate(item.WORK_DATE?.slice(0, 10))}</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <span className="block text-gray-600 text-xs sm:hidden mb-1">ช่วงเวลา</span>
                  <span className="font-semibold text-blue-900">{item.TIME_START?.slice(11, 16)} - {item.TIME_END?.slice(11, 16)}</span>
                </div>
                <div className="flex-2 min-w-[180px]">
                  <span className="block text-gray-600 text-xs sm:hidden mb-1">รายละเอียดงาน</span>
                  <span className="font-medium text-gray-800 block truncate max-w-full" title={item.TASK_DETAIL}>{item.TASK_DETAIL}</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <span className="block text-gray-600 text-xs sm:hidden mb-1">สถานที่</span>
                  <span className="font-medium text-blue-900">{item.LOCATION_NAME}</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <span className="block text-gray-600 text-xs sm:hidden mb-1">หมายเลขงาน</span>
                  <span className="font-semibold text-blue-900">{item.JOB_CODE}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="rounded-xl border border-gray-200 bg-white shadow-md">
                <div className="bg-blue-50 px-5 py-3 rounded-t-xl border-b border-blue-200">
                  <h3 className="text-blue-900 text-base font-semibold tracking-wide">
                    {formatDate(date)}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {grouped[date].map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-5 py-4 transition cursor-pointer"
                      onClick={() => navigate(`/worklog/${item.WORKLOG_ID}`, { state: { worklog: item, dateList } })}>
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-500 text-xs mb-1">ช่วงเวลา</span>
                        <span className="font-semibold text-blue-900 text-md">{item.TIME_START?.slice(11, 16)} - {item.TIME_END?.slice(11, 16)}</span>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-500 text-xs mb-1">หมายเลขงาน</span>
                        <span className="font-semibold text-blue-900 text-md">{item.JOB_CODE}</span>
                      </div>
                      <div className="flex-[2] min-w-[180px]">
                        <span className="block text-gray-500 text-xs mb-1">รายละเอียดงาน</span>
                        <span className="font-medium text-gray-800 text-md truncate block max-w-full" title={item.TASK_DETAIL}>{item.TASK_DETAIL}</span>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <span className="block text-gray-500 text-xs mb-1">สถานที่</span>
                        <span className="font-semibold text-blue-900 text-md">{item.LOCATION_NAME}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Worklog;
