import PropTypes from "prop-types";

export const TapAttendenceSummaryOpen = ({ children, isTabOpen, title, handleIsTabOpen, index, icon }) => {
    return (
        <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
            <button 
                className={`w-full px-6 py-4 text-left flex justify-between items-center transition-colors duration-200 ${isTabOpen[index] ? 'border-b border-line bg-gray-50' : ''}`}
                onClick={() => handleIsTabOpen(index)}
            >
                <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${isTabOpen[index] ? 'bg-primary text-white' : 'bg-gray-100 text-primary'}`}>
                        {icon || (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )}
                    </div>
                    <h3 className="font-medium text-text-color text-lg font-heading">{title}</h3>
                </div>
                <div className={`transition-transform duration-300 ${isTabOpen[index] ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            
            {/* {isTabOpen[index] && (
                
            )} */}
            <div className={`p-6 bg-white animate-fadeIn ${isTabOpen[index] ? "block" : "hidden"}`} >
                {children}
            </div>
            
        </div>
    );
};

TapAttendenceSummaryOpen.propTypes = {
    children: PropTypes.node.isRequired,
    isTabOpen: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    handleIsTabOpen: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    icon: PropTypes.node,
};
