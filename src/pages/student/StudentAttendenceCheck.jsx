import axios from "axios";
import { useEffect, useState } from "react";
import { Option } from "../../components/Option";
import { StudentAttendenceHistory } from "../../components/studentAttendence/StudentAttendenceHistory";

const StudentAttendenceCheck = () => {
    
    const [term, setTerm] = useState([]);
    const [attendence, setAttendence] = useState([]);

    const studentId = "60070001"
    const hostName = 'http://127.0.0.1:3000/';
    
    const fetchTerm = async () => {
        try {
            const response  = await axios.get(`${hostName}s/studentTerm/${studentId}`);
            setTerm(response.data);
        }catch(error) {
            console.error(error);
        };
    };
    
    const fetchAttendence = async (value) => {
        try{
            const response = await axios.get(`${hostName}s/student/${value}/${studentId}`);
            setAttendence(response.data);
            console.log(response.data)
            // console.log(response.data)
        }catch(error){
            console.error(error)
        }
    }


    const handleSelectOption = (value) => {
        fetchAttendence(value)
    }
    
    useEffect(() => {
        fetchTerm()
    },[]);


    return(
        <div>
            <select className="mb-5 p-2 border border-black rounded-md" name="item" onChange={(e)=> {handleSelectOption(e.target.value)}}>
                <option value={" "}>เลือกปีการศึกษาหรือเทอม</option>
                {
                    term.length > 0 ? <Option term={term}/> : <option>กำโหลดข้อมูล...</option>
                }
            </select>
            <StudentAttendenceHistory object={attendence}/>
        </div>
    );
};
export default StudentAttendenceCheck;