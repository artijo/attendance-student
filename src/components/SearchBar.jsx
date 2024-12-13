import React from "react";
import { useState } from "react";
import axios from "axios";


export const SearchBar = ({setResults}) => {
    const [input, setInput] = useState("");
    const fetchData = async (value) => {
        try{
            const response = await axios.get("http://localhost:3000/a/search");
            // console.log(response.data);
            const data = response.data;
            const results = data.filter((user) => {
                return user && user.name && user.name.toLowerCase().includes(value.toLowerCase())
            });
            setResults(results);
            // console.log(results);
        }catch(err){
            console.log(err);
        };
    };

    const handleChange = (value) => {
        setInput(value);
        fetchData(value);
    };
    return (
        <div className="input-wrapper w-full">
            <input placeholder="Type to search..." 
            value={input} 
            onChange={(e) => handleChange(e.target.value)}
            className="rounded-md border border-[2px] border-gray-200 w-full"
            />
        </div>
    );
};