import axios from "axios";
import { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";

function BehaviorTransaction({ term }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchBehaviorTransactions = async () => {
    if (!term) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${HOSTNAME}/s/behavior/score/transaction`,
      );
      if (response.status === 200) {
        // Filter transactions by term
        const filteredTransactions = response.data.filter(
          (transaction) =>
            transaction.studingTime?.timetable?.classroom?.termId ===
            term.termId,
        );

        // Sort by creation date (newest first)
        const sortedTransactions = filteredTransactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setTransactions(sortedTransactions);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching behavior transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBehaviorTransactions();
    setCurrentPage(1); // Reset to first page when term changes
  }, [term]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    return status === "INCREMENT" ? "text-green-600" : "text-red-600";
  };

  const getStatusText = (status) => {
    return status === "INCREMENT" ? "เพิ่ม" : "หัก";
  };

  const getDeductionReason = (status, score) => {
    if (status === "DECREMENT") {
      if (score === 0.5) {
        return "มาเรียนสาย";
      } else if (score === 1) {
        return "ขาดเรียน";
      } else {
        return "หักคะแนน";
      }
    }
    return "";
  };

  const getIncrementReason = (status, score) => {
    if (status === "INCREMENT") {
      if (score === 0.5) {
        return "เปลี่ยนจากมาสาย เป็นเข้าเรียน";
      } else if (score === 1) {
        return "เปลี่ยนจากขาดเรียน เป็นเข้าเรียน";
      } else {
        return "เพิ่มคะแนน";
      }
    }
    return "";
  };

  const getStatusIcon = (status) => {
    if (status === "INCREMENT") {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
        <p>ไม่มีประวัติการเปลี่ยนแปลงคะแนนความประพฤติ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transaction List */}
      <div className="space-y-3">
        {currentItems.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`flex items-center space-x-1 font-medium ${getStatusColor(
                      transaction.Status,
                    )}`}
                  >
                    {getStatusIcon(transaction.Status)}
                    <span>
                      {getStatusText(transaction.Status)} {transaction.score}{" "}
                      คะแนน
                      {transaction.Status === "DECREMENT" && (
                        <span className="ml-1 text-xs font-normal text-gray-600">
                          (
                          {getDeductionReason(
                            transaction.Status,
                            transaction.score,
                          )}
                          )
                        </span>
                      )}
                      {transaction.Status === "INCREMENT" && (
                        <span className="ml-1 text-xs font-normal text-gray-600">
                          (
                          {getIncrementReason(
                            transaction.Status,
                            transaction.score,
                          )}
                          )
                        </span>
                      )}
                    </span>
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    {transaction.studingTime?.timetable?.subject?.subCode} -{" "}
                    {transaction.studingTime?.timetable?.subject?.subNameThai}
                  </p>
                  <p>
                    วันที่:{" "}
                    {formatDate(transaction.studingTime?.studingTimeDate)}
                  </p>
                  <p>
                    เวลา: {transaction.studingTime?.timetable?.timeStart} -{" "}
                    {transaction.studingTime?.timetable?.timeEnd}
                  </p>
                  <p className="text-xs text-gray-500">
                    บันทึกเมื่อ: {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              <div
                className={`text-lg font-bold ${getStatusColor(
                  transaction.Status,
                )}`}
              >
                {transaction.Status === "INCREMENT" ? "+" : "-"}
                {transaction.score}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ก่อนหน้า
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => {
                // Show first page, last page, current page, and pages around current page
                if (
                  number === 1 ||
                  number === totalPages ||
                  (number >= currentPage - 1 && number <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === number
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  );
                } else if (
                  number === currentPage - 2 ||
                  number === currentPage + 2
                ) {
                  return (
                    <span key={number} className="px-2 py-1 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              },
            )}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        แสดง {indexOfFirstItem + 1}-
        {Math.min(indexOfLastItem, transactions.length)} จาก{" "}
        {transactions.length} รายการ
      </div>
    </div>
  );
}

export default BehaviorTransaction;
