import PropTypes from "prop-types";
import { formatStatus } from "../../helper/attStatus.js";

export const TableRowInfomation = ( { attendance }) => {
   
    return (
        <tbody className="divide-y divide-gray-200">
            {/* <tr className="odd:bg-gray-50">
                {attendance.map((element, index) => (
                
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700  text-center" 
                    key={element.attendance[0].attId || index}>
                        {formatStatus(element.attendance[0].attStatus)}
                    </td>
                ))}
                
               
            </tr>
                         */}
        </tbody>
    );
};


TableRowInfomation.propTypes = {
    attendance: PropTypes.array.isRequired
}