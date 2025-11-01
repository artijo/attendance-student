import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AttendenceBySubjectSumarize({ subjectList, term }) {
  const navigate = useNavigate();
  const navigateToDetailPage = (subject, term) => {
    navigate("/history/subjectdetail", {
      state: { subject: subject, term: term },
    });
  };
  return (
    <div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="rel text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="bg-gray-50 px-6 py-3 whitespace-nowrap"
              >
                วิชา
              </th>
              <th
                scope="col"
                className="bg-gray-50 px-6 py-3 whitespace-nowrap"
              >
                คุณครูผู้สอน
              </th>
              <th
                scope="col"
                className="bg-gray-50 px-6 py-3 whitespace-nowrap"
              >
                หน่วยกิต
              </th>
            </tr>
          </thead>
          <tbody>
            {subjectList.length > 0 &&
              subjectList.map((subject, index) => (
                <tr
                  key={index}
                  className=" bg-white border-b border-gray-200 text-xs"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => navigateToDetailPage(subject, term)}
                  >
                    <span className="text-blue-500">
                      {subject.subCode} - {subject.subNameThai} (
                      {subject.subNameEng})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subject.teacher.fName} {subject.teacher.lName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subject.subCredit}
                  </td>
                </tr>
              ))}
            {!subjectList.length > 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  ไม่พบข้อมูลวิชาเรียน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendenceBySubjectSumarize;
