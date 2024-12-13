import React, { useEffect, useState } from "react";

export const SearchResultsList = ({result}) => {
     //if result.lenght != 0 px-2 py-2
    const [border, setBorder] = useState("");
    const [borderColor , setBorderColor] = useState("");
    useEffect(() => {
        if(!result.length <= 0){
            setBorder("border");
            setBorderColor("border-gray-500");
        }else{
            setBorder("");
            setBorderColor("border-white");
        }
    });
    
    return (
        <div className={`results-list mt-2 rounded-md w-full ${border} border-2 ${borderColor}` }>
            {   
                result.map((result, id) => {
                    return (
                        <div key={id} className="px-2 py-2 flex justify-between">
                            <p className="text-sm font-medium">{result.name}</p>
                            <p className="text-sm font-medium text-gray-400">{result.role}</p>
                        </div>
                    )
                }) 
            }
        </div>
    );
};