import React from 'react'

const Hero = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-36 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl w-full flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-6 text-center">EXAT Daily System</h1>
        <p className="text-xl sm:text-2xl text-gray-700 text-center max-w-2xl">
          ระบบบันทึกการดำเนินงานประจำวัน <br />
          เพิ่มงานใหม่ ดูประวัติงาน และจัดการข้อมูลได้อย่างสะดวก
        </p>
      </div>
    </div>
  )
}

export default Hero
