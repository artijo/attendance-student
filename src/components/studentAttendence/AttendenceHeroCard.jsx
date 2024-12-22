
import PropTypes, { element } from "prop-types";
import { DateTime } from 'luxon';
import axios from "axios";
import { useEffect, useState } from "react";


export const AttendenceHeroCard = ({timetable, studentId}) => {
    const [isAllowLocation, setIsAllowLocation] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longtitude, setLongtitude] = useState(null);
    const dt = DateTime.now();
    const getLocation = () => {
        navigator.permissions.query({name:"geolocation"})
            .then((result) => {
                if (result.state === 'granted') {
                    // อนุญาตให้เข้าถึงตำแหน่ง
                    
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(showPostion);
                    }
                    setIsAllowLocation(true);

                } else if (result.state === 'prompt') {
                    // ยังไม่ได้รับการอนุญาต (จะถามผู้ใช้)
                   
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(showPostion);
                    };
                    setIsAllowLocation(false)
                
                } else if(result.state === 'denied'){
                    // ถูกปฏิเสธ permission
                    setIsAllowLocation(false);
                    getLocation()
                };
            })
            .catch((error) => {
                console.error('Error on checking geolocation', error);
            });
    };
    const showPostion = (position) => {
        setLatitude(position.coords.latitude);
        setLongtitude(position.coords.longitude);
    };

    useEffect(() => {
        getLocation()
    })

    const handleButtonClick = async (studingTimeId, timeStart, timeEnd, timeLate) => {
        const utfString = `${dt.year}-${dt.month}-${dt.day}T${dt.hour}:${dt.minute}:${dt.second}`;
        const timeInBangkok = DateTime.fromISO(utfString, { zone: 'UTC' });


        const attendenceInfo = {
            stdId: String(studentId),
            studingTimeId: studingTimeId,
            attTimestamp : timeInBangkok,
            latitude: latitude,
            longtitude : longtitude,
            operatedBy : "student",
            timeStart: timeStart.split(":").map(Number),
            timeEnd: timeEnd.split(":").map(Number), 
            timeLate :timeLate.split(":").map(Number),
        };
        try{
            await axios.post('http://127.0.0.1:3000/s/attendenceSubject', attendenceInfo);
            window.location.reload()
        }catch(error){
            console.error(error);
        };
    };



    const compareTime = (timeStart, timeEnd) => {
        
        const timeS = timeStart.split(":").map(Number);
        const timeE = timeEnd.split(":").map(Number);
        
        if(Number(dt.hour) >= timeS[0] && Number(dt.hour) < timeE[0]){
            return false
        }else{
            
            return true
        }
    }

    const formatTime = (timeString) => {
        const time = timeString.split(":");
        return `${time[0]}:${time[1]}`
    };


    const formatButtonStatus = (status) => {
        switch(status){
            case "PRESENT":
                return "เข้าเรียนทัน"
            case "LATE":
                return "เลท"
            case "ABSENT" : 
                return "ขาด"
            case "LEAVE" :
                return "โดด"
            case "ACTIVITY":
                return "กิจกรรม"
        }
    }


    return(
        <div>
            <div className="container">
              <div className="mb-5">
                <h2>เช็คชื่อเข้าเรียน</h2>
                <p className="text-xs text-gray-500">จำนวนวิชาทั้งหมด - {timetable.length} วิชา</p>
              </div>
              {
                isAllowLocation ? 
                timetable.map((element, index) => (
                    <div key={index}>
                        <div className="heroCard mb-5  border-t-8 border-slate-950 rounded-md p-5 text-right shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                            <div>
                            <h3 className="mb-2">{element.timetable.subject.subNameThai} - ({element.timetable.subject.subNameEng})</h3>
                            <p className="mb-2">เริ่ม { formatTime(element.timetable.timeStart) } - ถึง {formatTime(element.timetable.timeEnd) }</p>
                            <p className="mb-2"><span className="text-red-500">เวลาเลท {formatTime(element.timetable.timeLate)}</span></p>
                            </div>
                            {
                                element.attendance.length  > 0  ?
                                <button type="button"  
                                        className={`border  rounded  font-medium tracking-wider px-5 py-2 mt-5`}
                                        disabled={true}
                                >
                                {
                                    formatButtonStatus(element.attendance[0].attStatus)
                                }
                                </button>

                                :
                                <button type="button"  
                                    className={`border  rounded  font-medium tracking-wider px-5 py-2 mt-5 ${
                                            compareTime(element.timetable.timeStart,element.timetable.timeEnd) ? "bg-white text-gray-200 border-gray-400" : "bg-slate-950 text-white border-slate-950"
                                    }`}
                                    disabled={ compareTime(element.timetable.timeStart, element.timetable.timeEnd) } 
                                    onClick={()=>handleButtonClick(element.studyTimeId, element.timetable.timeStart, element.timetable.timeEnd, element.timetable.timeLate)}
                                >
                                    เช็คชื่อเข้าเรียน
                                </button>

                            }
                            
                            
                        </div>
                    </div>
                ))
                :
                <div>
                    ยังไม่อนุญาติการเข้าถึง หรือ วันนี้ไม่มีเรียน
                </div>
                
              }
              
            </div>
        </div>
    );
};

AttendenceHeroCard.propTypes = {
    timetable: PropTypes.array.isRequired,
    studentId : PropTypes.string.isRequired,
}