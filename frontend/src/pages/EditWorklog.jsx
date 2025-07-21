import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const EditWorklog = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [worklog, setWorklog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locationList, setLocationList] = useState([]);
    const token = localStorage.getItem('token');

    // ดึงข้อมูลจาก state ที่ส่งมาจาก WorklogDetail
    useEffect(() => {
        if (location.state && location.state.worklog) {
            setWorklog(location.state.worklog);
        } else {
            navigate('/worklog'); // ถ้าไม่มีข้อมูล worklog จะเปลี่ยนเส้นทางไปหน้า worklog
        }
    }, [location.state, navigate]);

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
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // ฟังก์ชันเพื่อให้ค่าที่ไม่มีการกรอกจะเป็น null หรือ ""
        const safe = (value) => (value && value.trim() !== "" ? value : "-----");

        const payload = {
            WORKLOG_ID: worklog?.WORKLOG_ID,
            USER_ID: worklog?.USER_ID || '',
            WORK_DATE: worklog?.WORK_DATE,
            TIME_START: worklog?.TIME_START,
            TIME_END: worklog?.TIME_END,
            TASK_DETAIL: safe(worklog?.TASK_DETAIL), // ใช้ฟังก์ชัน safe
            LOCATION_ID: safe(worklog?.LOCATION_ID),
            JOB_CODE: safe(worklog?.JOB_CODE), // ถ้าผู้ใช้ไม่กรอก จะเป็นค่า ""
            COORDINATOR: safe(worklog?.COORDINATOR), // ถ้าผู้ใช้ไม่กรอก จะเป็นค่า ""
            ACTION_TAKEN: safe(worklog?.ACTION_TAKEN), // ถ้าผู้ใช้ไม่กรอก จะเป็นค่า ""
            PROBLEM: safe(worklog?.PROBLEM), // ถ้าผู้ใช้ไม่กรอก จะเป็นค่า ""
            CREATED_BY: worklog?.USER_ID || '',
        };

        try {
            const response = await fetch('http://localhost:4000/v1/worklog/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.success) {
                alert('✅ แก้ไขข้อมูลสำเร็จ');
                navigate(-2);
            } else {
                alert('เกิดข้อผิดพลาด: ' + result.message);
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }

        setLoading(false);
    };



    if (!worklog) return <div>กำลังโหลดข้อมูล...</div>;

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
                        แก้ไขบันทึก
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
                                    value={worklog.WORK_DATE?.slice(0, 10)}
                                    onChange={(e) => setWorklog({ ...worklog, WORK_DATE: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex-1 flex flex-col ml-10">
                                <p className="mb-2 text-lg font-semibold pl-3">ช่วงเวลา</p>
                                <div className="flex gap-2 pl-3">
                                    <input
                                        type="time"
                                        className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-28 max-w-xs focus:border-blue-500 focus:bg-white transition"
                                        value={worklog.TIME_START?.slice(11, 16)}
                                        onChange={(e) => setWorklog({ ...worklog, TIME_START: e.target.value })}
                                        required
                                    />
                                    <span className="flex items-center">-</span>
                                    <input
                                        type="time"
                                        className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-28 max-w-xs focus:border-blue-500 focus:bg-white transition"
                                        value={worklog.TIME_END?.slice(11, 16)}
                                        onChange={(e) => setWorklog({ ...worklog, TIME_END: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <p className="mb-2 text-lg font-semibold">สถานที่</p>
                                <select
                                    className="p-2 border-2 border-gray-300 rounded-md bg-gray-100 w-full max-w-xs focus:border-blue-500 focus:bg-white transition h-11"
                                    value={worklog.LOCATION_ID}
                                    onChange={(e) => setWorklog({ ...worklog, LOCATION_ID: e.target.value })}
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
                                value={worklog.TASK_DETAIL}
                                onChange={(e) => setWorklog({ ...worklog, TASK_DETAIL: e.target.value })}
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
                                    value={worklog.COORDINATOR}
                                    onChange={(e) => setWorklog({ ...worklog, COORDINATOR: e.target.value })}
                                    placeholder="ชื่อผู้ประสานงาน (ถ้ามี)"
                                />
                            </div>
                            <div className="mt-4">
                                <p className="mb-2 text-lg font-semibold">หมายเลขงาน (ถ้ามี)</p>
                                <input
                                    type="text"
                                    className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-100 focus:border-blue-500 focus:bg-white transition"
                                    value={worklog.JOB_CODE}
                                    onChange={(e) => setWorklog({ ...worklog, JOB_CODE: e.target.value })}
                                    placeholder="หมายเลขงาน (ถ้ามี)"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-lg font-semibold">การดำเนินการ</p>
                        <textarea
                            className="w-full h-28 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
                            value={worklog.ACTION_TAKEN}
                            onChange={(e) => setWorklog({ ...worklog, ACTION_TAKEN: e.target.value })}
                            placeholder="รายละเอียดการดำเนินการ"
                            required
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-lg font-semibold">ปัญหา (ถ้ามี)</p>
                        <textarea
                            className="w-full h-28 p-3 border-2 border-gray-300 rounded-md bg-gray-100 resize-none focus:border-blue-500 focus:bg-white transition"
                            value={worklog.PROBLEM}
                            onChange={(e) => setWorklog({ ...worklog, PROBLEM: e.target.value })}
                            placeholder="ปัญหาที่พบ (ถ้ามี)"
                        />
                    </div>

                    <div className="sm:col-span-2 flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-38 h-11 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg cursor-pointer tracking-wide ${loading
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

export default EditWorklog;
