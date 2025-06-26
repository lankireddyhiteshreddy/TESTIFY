import { useState ,useEffect} from "react";
import axiosInstance from "../api/axiosInstance";
import ResultCard from "./ResultCard";
import { useParams } from "react-router-dom";

export default function TestResults() {
    const [results, setResults] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const { test_id } = useParams();

    useEffect(() => {
        const handleViewResults = async () => {
            try {
                const response = await axiosInstance.get(`/tests/${test_id}/results`);
                console.log("Results fetched: ", response.data.results);
                setResults(response.data.results);
            } catch (err) {
                console.error("Unable to fetch results: ", err);
                alert("Failed to fetch results, please try again");
            }
        };
        handleViewResults();
    }, [test_id]);

    return (
        <div>

            {results.length > 0 ? (
                results.map((res, index) => (
                    <ResultCard
                        key={res.attempt_id}
                        result={res}
                        index={index}
                        expandedIndex={expandedIndex}
                        setExpandedIndex={setExpandedIndex}
                    />
                ))
            ) : (
                <p>No results to display</p>
            )}
        </div>
    );
}
