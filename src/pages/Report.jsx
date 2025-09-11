import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_CONNECTION_HOST_URL } from "../utils/constant";
import { useReactToPrint } from "react-to-print";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar } from "recharts";

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

export default function Report(){
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [score, setScore] = useState(null);
    const printRef = useRef(null);
    const chartRef = useRef(null);

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
                if(!cancelled){
                    setError("Failed to load score.");
                }
            }finally{
                if(!cancelled) setLoading(false);
            }
        }
        if(id) fetchScore();
        return () => { cancelled = true; };
    }, [id]);

    // Auto-download when score is loaded
    useEffect(() => {
        if(score && printRef.current) {
            // Small delay to ensure DOM is fully rendered
            const timer = setTimeout(() => {
                handlePrint();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [score]);

    const radarData = useMemo(() => {
        if(!score?.byCategory) return [];
        return DOMAINS.map(d => ({ subject: d.label, value: score.byCategory[d.key] || 0 }));
    }, [score]);

    const barData = useMemo(() => {
        if(!score?.byCategory) return [];
        return DOMAINS.map(d => ({ domain: d.label, score: score.byCategory[d.key] || 0 }));
    }, [score]);

    const total = score?.totalScore || 0;
    const accuracy = total ? Math.round((total / 150) * 100) : 0;
    const correctAnswers = total ? Math.round(total / 5) : 0;

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `IQ-Report-${id}`,
        onBeforeGetContent: () => Promise.resolve(),
    });

    if(loading) return <div className="p-6 text-center">Loading report...</div>;
    if(error) return <div className="p-6 text-red-600">{error}</div>;
    if(!score) return <div className="p-6">No score found.</div>;

    const name = score?.userName || "User";
    const dateStr = score?.date ? dayjs(score.date).format("DD MMM, YYYY") : "";

    // Domain ordering and slices for narratives and recommendations
    const domainScoresAsc = DOMAINS.map(d => ({ key: d.key, label: d.label, score: score.byCategory[d.key] || 0 }))
        .sort((a,b)=>a.score-b.score);
    const weakest = domainScoresAsc.slice(0,2);
    const mid = domainScoresAsc.slice(2,4);

    const domainScoresDesc = [...domainScoresAsc].reverse();
    const topTwo = domainScoresDesc.slice(0,2);
    const bottomTwo = domainScoresAsc.slice(0,2);

    return (
        <div className="p-4 md:p-8">
            <div className="mb-4 flex gap-2 print:hidden">
                <div className="text-sm text-gray-600">Report downloaded automatically. If download didn't start, click below:</div>
                <button onClick={handlePrint} className="px-4 py-2 bg-orange-500 text-white rounded">Download PDF</button>
            </div>

            <div ref={printRef} className="bg-white text-black max-w-[850px] mx-auto shadow print:shadow-none print:w-[210mm] print:min-h-[297mm]">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <div>
                        <div className="text-xl font-semibold">Cognitive & IQ Assessment Report</div>
                        <div className="text-sm text-gray-600">Assessment Type: IQ Test (Full)</div>
                    </div>
                    <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-10" />
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 text-sm">
                    <div><div className="text-gray-500">Name</div><div className="font-medium">{name}</div></div>
                    <div><div className="text-gray-500">Assessment Date</div><div className="font-medium">{dateStr}</div></div>
                    <div><div className="text-gray-500">Score ID</div><div className="font-medium break-all">{score?._id}</div></div>
                    <div><div className="text-gray-500">Assessment Type</div><div className="font-medium">IQ Test (Full)</div></div>
                </div>

                {/* Executive Summary */}
                <div className="p-6 pt-0">
                    <div className="mb-3 font-semibold">Executive Summary</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="md:col-span-2 border rounded p-4 bg-orange-50/40">
                            <div className="text-gray-800">Overall, {name} performed in the <span className="font-semibold">{bandFromTotal(total)}</span> band with an accuracy of <span className="font-semibold">{accuracy}%</span>. Strengths are most evident in <span className="font-semibold">{topTwo.map(t=>t.label).join(" and ")}</span>, while growth opportunities appear in <span className="font-semibold">{bottomTwo.map(t=>t.label).join(" and ")}</span>. The profile suggests stable problem-solving with headroom in complex, multi-step items.</div>
                        </div>
                        <div className="border rounded p-4 bg-white">
                            <div className="text-xs text-gray-500">Quick Facts</div>
                            <ul className="text-sm mt-1 space-y-1">
                                <li>• Total: <span className="font-medium">{total}/150</span></li>
                                <li>• Band: <span className="font-medium">{bandFromTotal(total)}</span></li>
                                <li>• Correct: <span className="font-medium">{correctAnswers}/30</span></li>
                                <li>• Date: <span className="font-medium">{dateStr}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Summary Dashboard */}
                <div className="p-6 pt-0">
                    <div className="mb-2 font-semibold">Summary Dashboard</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 border rounded p-4">
                            <div ref={chartRef}>
                                <ResponsiveContainer width="100%" height={260}>
                                    <RadarChart data={radarData} outerRadius="80%">
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
                                </ResponsiveContainer>
                            </div>
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
                            <div className="mt-2">
                                <RadialBarChart width={220} height={160} innerRadius="60%" outerRadius="95%" data={[{ name: 'Accuracy', value: accuracy }]} startAngle={90} endAngle={-270}>
                                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={8} fill="#f97316" />
                                </RadialBarChart>
                                <div className="text-center text-xs text-gray-600 -mt-6">Overall Accuracy</div>
                            </div>
                        </div>
                    </div>

                    {/* Per-domain tiles */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                        {DOMAINS.map(d => {
                            const sc = score.byCategory[d.key] || 0;
                            return (
                                <div key={d.key} className="border rounded p-3">
                                    <div className="font-medium">{d.label}</div>
                                    <div className="text-gray-600">{sc} / 30</div>
                                    <div className="text-[11px] mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">{getLevel(sc)}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Domain Scores Bar Chart */}
                    <div className="mt-6 border rounded p-4">
                        <div className="font-medium mb-2">Score Distribution by Domain</div>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0,30]} tick={{ fontSize: 11 }} />
                                <Bar dataKey="score" fill="#f97316" radius={[6,6,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cognitive Area Breakdown */}
                <div className="p-6 pt-0">
                    <div className="font-semibold mb-3">Cognitive Area Breakdown</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DOMAINS.map(d => {
                            const sc = score.byCategory[d.key] || 0;
                            const { level, insights, tips } = generateInsightsAndTips(d.key, sc);
                            return (
                                <div key={d.key} className="border rounded p-4 break-inside-avoid">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-medium">{d.label}</div>
                                        <div className="text-sm">{sc} / 30</div>
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">{domainDescription(d.key)}</div>
                                    <div className="text-[11px] mb-2 inline-block px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">{level}</div>
                                    <div className="text-sm font-medium mt-1">What this means</div>
                                    <div className="text-sm text-gray-700">{level === 'High' ? 'Performance indicates strong mastery and efficient strategy selection.' : level === 'Above Average' ? 'Strong fundamentals with occasional slowdowns on complex items.' : level === 'Average' ? 'Skills are developing; pacing and multi-step problems are key levers.' : level === 'Below Average' ? 'Focus on scaffolded practice to build reliability.' : 'Start from core patterns and gradually increase complexity.'}</div>
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

                {/* Final Summary */}
                <div className="p-6 pt-0">
                    <div className="font-semibold mb-2">Final Score Summary</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="border rounded p-4"><div className="text-gray-500">Total Score</div><div className="text-lg font-semibold">{total} / 150</div></div>
                        <div className="border rounded p-4"><div className="text-gray-500">Estimated Band</div><div className="text-lg font-semibold">{bandFromTotal(total)}</div></div>
                        <div className="border rounded p-4"><div className="text-gray-500">Accuracy</div><div className="text-lg font-semibold">{accuracy}%</div></div>
                    </div>
                </div>

                {/* Recommended Activities */}
                <div className="p-6 pt-0">
                    <div className="font-semibold mb-2">Recommended Activities</div>
                    <div className="text-sm text-gray-700">
                        <ul className="list-disc list-inside">
                            {weakest.map(w => <li key={w.key}>Strengthen {w.label.toLowerCase()} with targeted practice sessions.</li>)}
                            {mid.map(w => <li key={w.key}>Stretch {w.label.toLowerCase()} using mixed-difficulty sets and light timing.</li>)}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 text-xs text-gray-500 border-t">
                    <div>“This assessment reflects performance at the time of testing and may vary over time.”</div>
                    <div className="mt-1">Generated on {dayjs().format("DD MMM, YYYY HH:mm")} • Bazzingo</div>
                </div>
            </div>

            {/* Print styles */}
            <style>{`
                @page { size: A4; margin: 12mm; }
                @media print {
                    html, body { background: #fff; }
                    .print\:hidden { display: none !important; }
                    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}


