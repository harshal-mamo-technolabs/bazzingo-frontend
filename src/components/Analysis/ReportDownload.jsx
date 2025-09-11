import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_CONNECTION_HOST_URL } from "../utils/constant";
import { useReactToPrint } from "react-to-print";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const DOMAINS = [
    { key: "logical-reasoning", label: "Logical Reasoning" },
    { key: "numerical-ability", label: "Numerical Ability" },
    { key: "spatial-reasoning", label: "Spatial Reasoning" },
    { key: "verbal-ability", label: "Verbal Ability" },
    { key: "memory", label: "Memory" },
];

function getLevel(score){
    if(score >= 25) return "High";
    if(score >= 21) return "Above Average";
    if(score >= 15) return "Average";
    if(score >= 10) return "Below Average";
    return "Needs Improvement";
}

function bandFromTotal(total){
    if(total >= 135) return "Exceptional";
    if(total >= 115) return "High";
    if(total >= 95) return "Average";
    if(total >= 75) return "Below Average";
    return "Developing";
}

function generateInsightsAndTips(domain, score){
    const level = getLevel(score);
    const insights = [];
    const tips = [];

    if(score >= 25){
        insights.push("Consistently accurate on advanced items.");
        tips.push("Maintain skills with weekly advanced challenges.");
    } else if(score >= 21){
        insights.push("Strong performance with minor slips on complex items.");
        tips.push("Add timed practice to boost speed under pressure.");
    } else if(score >= 15){
        insights.push("Solid fundamentals; opportunities on multi-step questions.");
        tips.push("Practice mixed-difficulty sets; review error patterns.");
    } else if(score >= 10){
        insights.push("Struggles appeared on layered logic or extended working memory.");
        tips.push("Daily 10–15 min drills; scaffolded difficulty.");
    } else {
        insights.push("Foundational gaps limit consistency.");
        tips.push("Start with basics modules; increase difficulty gradually.");
    }

    switch(domain){
        case "logical-reasoning": tips.push("Try conditional logic puzzles & truth tables."); break;
        case "numerical-ability": tips.push("Focus on fractions/ratios & sequence rules."); break;
        case "spatial-reasoning": tips.push("Practice mental rotation with tangrams/jigsaws."); break;
        case "verbal-ability": tips.push("Do synonym/analogy drills; read short editorials."); break;
        case "memory": tips.push("Use n-back and chunking exercises."); break;
        default: break;
    }

    return { level, insights, tips };
}

function domainDescription(key){
    switch(key){
        case "logical-reasoning": return "Deductive and inductive reasoning, syllogisms, conditional logic.";
        case "numerical-ability": return "Arithmetic, sequences, word problems, quantitative comparisons.";
        case "spatial-reasoning": return "Mental rotation, 2D/3D relationships, pattern assembly.";
        case "verbal-ability": return "Vocabulary, analogies, comprehension, relationships between words.";
        case "memory": return "Short-term and working memory, recall under time constraints.";
        default: return "";
    }
}

export default function ReportDownload(){
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [score, setScore] = useState(null);
    const [downloading, setDownloading] = useState("");
    
    const reportRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchScore(){
            try{
                setLoading(true);
                setError("");
                const res = await axios.get(`${API_CONNECTION_HOST_URL}/assessment/score/${id}`);
                if(!cancelled){
                    setScore(res.data?.data?.score || null);
                }
            }catch(err){
                if(!cancelled) setError("Failed to load score.");
            }finally{
                if(!cancelled) setLoading(false);
            }
        }
        if(id) fetchScore();
        return () => { cancelled = true; };
    }, [id]);

    const handleDownloadReport = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `IQ-Report-${id}`,
        onBeforeGetContent: () => Promise.resolve(),
    });

    const handleReportClick = () => {
        setDownloading("report");
        setTimeout(() => {
            handleDownloadReport();
            setDownloading("");
        }, 500);
    };

    const name = score?.userName || "User";
    const total = score?.totalScore || 0;
    const dateStr = score?.date ? dayjs(score.date).format("DD MMM, YYYY") : "";
    
    const radarData = useMemo(() => {
        if(!score?.byCategory) return [];
        return DOMAINS.map(d => ({ subject: d.label, value: score.byCategory[d.key] || 0 }));
    }, [score]);

    const accuracy = total ? Math.round((total / 150) * 100) : 0;
    const correctAnswers = total ? Math.round(total / 5) : 0;

    const domainScores = DOMAINS.map(d => ({ key: d.key, label: d.label, score: score?.byCategory?.[d.key] || 0 }));
    const sorted = [...domainScores].sort((a,b)=>a.score-b.score);
    const weakest = sorted.slice(0,2);
    const mid = sorted.slice(2,4);

    if(loading) return <div className="p-6 text-center">Loading...</div>;
    if(error) return <div className="p-6 text-red-600">{error}</div>;
    if(!score) return <div className="p-6">No score found.</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Download Your Detailed Report</h1>
                    <p className="text-gray-600">Download your comprehensive report with insights, recommendations, and analysis</p>
                </div>

                <div className="border rounded-lg p-6 text-center mb-8">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Detailed Report</h3>
                        <p className="text-gray-600 text-sm">Comprehensive report with insights, recommendations, and analysis</p>
                    </div>
                    <button 
                        onClick={handleReportClick}
                        disabled={downloading === "report"}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading === "report" ? "Downloading..." : "Download Report (PDF)"}
                    </button>
                </div>

                {/* Off-screen report for download */}
                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '1000px', zIndex: -1 }}>
                    <div ref={reportRef} className="bg-white text-black max-w-[850px] mx-auto shadow print:shadow-none print:w-[210mm] print:min-h-[297mm]">
                        <div className="flex items-center justify-between border-b p-6">
                            <div>
                                <div className="text-xl font-semibold">Cognitive & IQ Assessment Report</div>
                                <div className="text-sm text-gray-600">Assessment Type: IQ Test (Full)</div>
                            </div>
                            <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-10" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 text-sm">
                            <div><div className="text-gray-500">Name</div><div className="font-medium">{name}</div></div>
                            <div><div className="text-gray-500">Assessment Date</div><div className="font-medium">{dateStr}</div></div>
                            <div><div className="text-gray-500">Score ID</div><div className="font-medium break-all">{score?._id}</div></div>
                            <div><div className="text-gray-500">Assessment Type</div><div className="font-medium">IQ Test (Full)</div></div>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="mb-2 font-semibold">Summary Dashboard</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 border rounded p-4">
                                    <RadarChart width={720} height={260} data={radarData} outerRadius="80%">
                                        <defs>
                                            <linearGradient id="reportRadar" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#FF5727" stopOpacity={0.6} />
                                                <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 30]} tick={{ fontSize: 10 }} />
                                        <Radar dataKey="value" stroke="#f97316" strokeWidth={2} fill="url(#reportRadar)" fillOpacity={1} />
                                    </RadarChart>
                                </div>
                                <div className="border rounded p-4 flex flex-col gap-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Total Score</span>
                                        <span className="font-semibold">{total} / 150</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Estimated Band</span>
                                        <span className="font-semibold">{bandFromTotal(total)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Accuracy</span>
                                        <span className="font-semibold">{accuracy}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Correct Answers</span>
                                        <span className="font-semibold">{correctAnswers} / 30</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                                {DOMAINS.map(d => {
                                    const sc = score?.byCategory?.[d.key] || 0;
                                    return (
                                        <div key={d.key} className="border rounded p-3">
                                            <div className="font-medium">{d.label}</div>
                                            <div className="text-gray-600">{sc} / 30</div>
                                            <div className="text-[11px] mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">{getLevel(sc)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="font-semibold mb-3">Cognitive Area Breakdown</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DOMAINS.map(d => {
                                    const sc = score?.byCategory?.[d.key] || 0;
                                    const { level, insights, tips } = generateInsightsAndTips(d.key, sc);
                                    return (
                                        <div key={d.key} className="border rounded p-4 break-inside-avoid">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-medium">{d.label}</div>
                                                <div className="text-sm">{sc} / 30</div>
                                            </div>
                                            <div className="text-xs text-gray-600 mb-2">{domainDescription(d.key)}</div>
                                            <div className="text-[11px] mb-2 inline-block px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">{level}</div>
                                            <div className="text-sm font-medium mt-2">Insights</div>
                                            <ul className="list-disc list-inside text-sm text-gray-700">
                                                {insights.slice(0,2).map((t,i)=>(<li key={i}>{t}</li>))}
                                            </ul>
                                            <div className="text-sm font-medium mt-2">Recommendations</div>
                                            <ul className="list-disc list-inside text-sm text-gray-700">
                                                {tips.slice(0,3).map((t,i)=>(<li key={i}>{t}</li>))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="font-semibold mb-2">Final Score Summary</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="border rounded p-4"><div className="text-gray-500">Total Score</div><div className="text-lg font-semibold">{total} / 150</div></div>
                                <div className="border rounded p-4"><div className="text-gray-500">Estimated Band</div><div className="text-lg font-semibold">{bandFromTotal(total)}</div></div>
                                <div className="border rounded p-4"><div className="text-gray-500">Accuracy</div><div className="text-lg font-semibold">{accuracy}%</div></div>
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="font-semibold mb-2">Recommended Activities</div>
                            <div className="text-sm text-gray-700">
                                <ul className="list-disc list-inside">
                                    {weakest.map(w => <li key={w.key}>Strengthen {w.label.toLowerCase()} with targeted practice sessions.</li>)}
                                    {mid.map(w => <li key={w.key}>Stretch {w.label.toLowerCase()} using mixed-difficulty sets and light timing.</li>)}
                                </ul>
                            </div>
                        </div>
                        <div className="p-6 text-xs text-gray-500 border-t">
                            <div>"This assessment reflects performance at the time of testing and may vary over time."</div>
                            <div className="mt-1">Generated on {dayjs().format("DD MMM, YYYY HH:mm")} • Bazzingo</div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @page { size: A4; margin: 12mm; }
                    @media print {
                        html, body { background: #fff; }
                        .print\\:hidden { display: none !important; }
                        .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    }
                `}</style>
            </div>
        </div>
    );
}