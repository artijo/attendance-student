import PropTypes from "prop-types";

export const Option = ({term}) => {

    return (
        <>
            {
                term.map((term,key) => (
                    <option value={term.classroom.classId} key={key}>
                         ปีการศึกษา {term.classroom.academicYear} - เทอม {term.classroom.semester}
                    </option>
                ))
            }
        </>
        
        
    );
};

Option.propTypes = {
    term: PropTypes.array.isRequired
}

