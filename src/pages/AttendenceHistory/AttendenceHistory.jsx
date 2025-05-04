import axios from "axios";
import { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";
import { TapAttendenceSummaryOpen } from "../../components/tapAttendenceSummaryOpen";
import AttedenceByDaySummarize from "./AttedenceByDaySummarize";

function AttendenceHistory() {
    const [termList, setTermList] = useState([]);
    const [selectTerm, setSelectTerm] = useState(0);
    const [isTabOpen, setIsTabOpen] = useState(new Array(3).fill(false));

    const handleIsTabOpen = (index) => {
        let newIsTabOpen = isTabOpen.slice();
        newIsTabOpen[index] = !newIsTabOpen[index];
        setIsTabOpen(newIsTabOpen);
        sessionStorage.setItem("savedIsTapOpenArray", [...newIsTabOpen]);
    };

    const callStudentTermList = async () => {
        try {
            const response = await axios.get(`${HOSTNAME}/s/term`);
            if (response.status === 200) {
                setTermList(response.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error(error);
        };
    };

    useEffect(() => {
        const arrayState = sessionStorage.getItem("savedIsTapOpenArray");
        if (arrayState != null) {
            const newArray = arrayState.split(",").map((string_boolean) => string_boolean === "true" ? true : false);
            setIsTabOpen(newArray);
        } else {
            setIsTabOpen(new Array(3).fill(false));
        }
    }, []);

    useEffect(() => {
        callStudentTermList();
    }, []);


    return (
        <div className="grid grid-cols-1 gap-4 sm:max-w-md md:max-w-lg mx-auto p-2">
            <div>
                <h2 className="text-2xl font-semibold text-left text-primary font-heading">ประวัติการเข้าเรียน</h2>
                <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
            </div>
            <div>
                <p className="text-sm text-text-color-alt ml-1 mb-0.5">ปีและเทอมการศึกษา</p>
                <select className="border border-gray-300 rounded-md px-1.5 bg-white text-base" onChange={(e) => setSelectTerm(e.target.value)}>
                    {termList.map((term, index) => (
                        <option key={index} value={index}>ปีการศึกษา {term.academicYear + 543} เทอม {term.semester}</option>
                    ))}
                </select>
            </div>
            <div>
                <TapAttendenceSummaryOpen
                    isTabOpen={isTabOpen}
                    title="การเข้าเรียนตามวัน"
                    handleIsTabOpen={handleIsTabOpen}
                    index={0}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                >
                    { termList[selectTerm] && (
                        <AttedenceByDaySummarize
                            term={termList[selectTerm]}
                        />
                    )}
                    
                </TapAttendenceSummaryOpen>
            </div>
        </div>
    );
};

export default AttendenceHistory;