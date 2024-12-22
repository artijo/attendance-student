import { TableRowHeader } from "./TableRowHeader";
import { TableRowInfomation } from "./TableRowInfomation";
import PropTypes from "prop-types";

export const StudentAttendenceHistoryTable =  ({object}) => {
    return (
        <>
            {
                object.lenght <= 0 ?      
                <></>
                : object.map((item, key) => (
                    <div key={key}>
                        <h5 className="text-center">{item.subject.subNameThai} - {item.subject.subNameEng} </h5>
                        <div className="overflow-y-hidden overflow-x-scroll my-5">
                            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                                <TableRowHeader attendance={item.studyTime}/>
                                <TableRowInfomation attendance={item.studyTime} />
                            </table>
                        </div>
                    </div>
                )) 
            }
            
        </>
    );
};

StudentAttendenceHistory.propTypes = {
    object: PropTypes.array.isRequired
}

