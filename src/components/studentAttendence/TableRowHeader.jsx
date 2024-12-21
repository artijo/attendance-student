import PropTypes from "prop-types";

export const TableRowHeader = ({ attendance }) => {
    // console.log(attendance);
    return (
        <thead className="ltr:text-left rtl:text-right">
            {/* <tr>
                {attendance.map((element, index) => (
                    <th
                        className="text-center whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                        key={element.attendance[0].attId || index}// ใช้ `attId` หรือ `index` เป็น fallback
                    >
                        {element.attendance[0].attId}
                        คาบที่ - {index + 1}
                    </th>
                ))}
            </tr> */}
        </thead>
    );
};


TableRowHeader.propTypes = {
    attendance: PropTypes.array.isRequired
}