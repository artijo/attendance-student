import React, { useState } from "react";

function AttendenceBySubjectSumarize({ subjectList }) {
    // console.log(subjectList);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(subjectList.length / itemsPerPage);
    const sliceSubjectList = subjectList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div>
            {subjectList.length > 0 && sliceSubjectList.map((subject, index) => (
                <div key={subject.subId} className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl w-fit">{subject.subCode} - {subject.subNameThai}</h3>
                        <span className="text-gray-500">{subject.subNameEng}</span>
                    </div>
                    <div className="text-gray-600">
                        <p>อาจารย์ผู้สอน: {subject.teacher.fName} {subject.teacher.lName}</p>
                        <p>หน่วยกิต: {subject.subCredit}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        รหัสวิชา: {subject.subId}
                    </div>
                </div>
            ))}
            {subjectList.length > 0 && (
                <div className="border-t border-line px-6 py-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-color-alt">
                            แสดง <span className="font-medium text-text-color">{sliceSubjectList.length}</span> จาก <span className="font-medium text-text-color">{subjectList.length}</span> รายการ
                        </p>

                        <div className="flex items-center justify-end gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center justify-center px-3 py-1 rounded border ${currentPage === 1
                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 bg-white text-text-color hover:bg-gray-50 transition-colors'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show current page, first, last, and pages near current
                                    return page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);
                                })
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="px-2 text-text-color-alt">...</span>
                                        )}
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 rounded ${currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-text-color hover:bg-gray-50 border border-gray-200 transition-colors'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))
                            }

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`flex items-center justify-center px-3 py-1 rounded border ${currentPage === totalPages
                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 bg-white text-text-color hover:bg-gray-50 transition-colors'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendenceBySubjectSumarize;