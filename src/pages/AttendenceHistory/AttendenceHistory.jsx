import axios from "axios";
import { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";
import { TapAttendenceSummaryOpen } from "../../components/tapAttendenceSummaryOpen";
import AttedenceByDaySummarize from "./AttedenceByDaySummarize";
import AttendenceBySubjectSumarize from "./AttendenceBySubjectSumarize";
import BehaviorTransaction from "./BehaviorTransaction";

function AttendenceHistory() {
  const [subjectlist, setSubjectList] = useState([]);
  const [termList, setTermList] = useState([]);
  const [selectTerm, setSelectTerm] = useState(null);
  const [isTabOpen, setIsTabOpen] = useState(new Array(3).fill(false));

  const handleSelectTerm = (value) => {
    const termlists = termList;
    const findTerm = termlists.find((term) => term.termId === value);
    setSelectTerm(findTerm);
  };

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
        setSelectTerm(response.data[0]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const callSubjectList = async (term) => {
    try {
      const termId = term.termId;
      const response = await axios.get(
        `${HOSTNAME}/s/attendecne/subjectlist/${termId}`
      );
      if (response.status === 200) {
        setSubjectList(response.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const arrayState = sessionStorage.getItem("savedIsTapOpenArray");
    if (arrayState != null) {
      const newArray = arrayState
        .split(",")
        .map((string_boolean) => (string_boolean === "true" ? true : false));
      setIsTabOpen(newArray);
    } else {
      setIsTabOpen(new Array(3).fill(false));
    }
  }, []);

  useEffect(() => {
    callStudentTermList();
  }, []);

  useEffect(() => {
    if (selectTerm != null) {
      callSubjectList(selectTerm);
    }
  }, [selectTerm]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:max-w-md md:max-w-lg mx-auto p-2">
      <div>
        <h2 className="text-2xl font-semibold text-left text-primary font-heading">
          ประวัติการเข้าเรียน
        </h2>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
      </div>
      <div>
        <p className="text-sm text-text-color-alt ml-1 mb-0.5">
          ปีและเทอมการศึกษา
        </p>
        <select
          className="border border-gray-300 rounded-md px-1.5 bg-white text-base"
          onChange={(e) => handleSelectTerm(e.target.value)}
        >
          {termList.map((term, index) => (
            <option key={index} value={term.termId}>
              ปีการศึกษา {term.academicYear + 543} เทอม {term.semester}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        <TapAttendenceSummaryOpen
          isTabOpen={isTabOpen}
          title="การเข้าเรียนตามวัน"
          handleIsTabOpen={handleIsTabOpen}
          index={0}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        >
          {selectTerm && <AttedenceByDaySummarize term={selectTerm} />}
        </TapAttendenceSummaryOpen>
        <TapAttendenceSummaryOpen
          isTabOpen={isTabOpen}
          title="การเข้าเรียนตามรายวิชา"
          handleIsTabOpen={handleIsTabOpen}
          index={1}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
        >
          <AttendenceBySubjectSumarize
            subjectList={subjectlist}
            term={selectTerm}
          />
        </TapAttendenceSummaryOpen>
        <TapAttendenceSummaryOpen
          isTabOpen={isTabOpen}
          title="ประวัติคะแนนความประพฤติ"
          handleIsTabOpen={handleIsTabOpen}
          index={2}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        >
          {selectTerm && <BehaviorTransaction term={selectTerm} />}
        </TapAttendenceSummaryOpen>
      </div>
    </div>
  );
}

export default AttendenceHistory;
