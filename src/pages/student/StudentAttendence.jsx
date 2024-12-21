import axios from "axios";
import { useEffect, useState } from "react";
import { DateTime } from 'luxon'
import { AttendenceHeroCard } from "../../components/studentAttendence/AttendenceHeroCard.jsx";


export const StudentAttendence = () => {
    // const [attendanceInfomation, setAttendenceInfomation] = useState([]);
    const [timeTable, setTimetable] = useState([]);
    const stdId = '60070001' // สมมุติว่าได้ ข้อมูลนักเรียนแล้ว
    const classroom = 'b6e081ab-66bd-4c2c-bac7-91e1294bb389' //สมมุติได้ห้องที่อยู่เทอมปัจจุบัน
    const hostName = 'http://127.0.0.1:3000/';
    // const dateObject = new Date();
    const dt = DateTime.now();
    

    const fetchTimeTable =  async () => {
      try{
        const response = await axios.get(`${hostName}s/studentTimetable/${classroom}/${dt.weekday}`);
        setTimetable(response.data);
        console.log(response.data)
      }catch(err){
        console.error(err)
      };
    };

    
   

    useEffect(() => {
      fetchTimeTable()
    },[])


  
    return(
        <div>
            <AttendenceHeroCard timetable={timeTable} studentId={stdId} />
        </div>
    );
};