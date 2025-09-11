import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_CONNECTION_HOST_URL } from "../utils/constant";
import { toPng } from "html-to-image";
import { QRCodeCanvas } from "qrcode.react";

export default function CertificateDownload(){
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [score, setScore] = useState(null);
    const [downloading, setDownloading] = useState("");
    
    const certRef = useRef(null);

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

    const scaleDomain = (s) => Math.round(80 + (Math.max(0, Math.min(30, s)) / 30) * 50);
    const estimateIQ = (total) => Math.round(70 + (Math.max(0, Math.min(150, total)) / 150) * 60);

    const normalCdf = (x) => {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return x > 0 ? 1 - p : p;
    };

    const handleDownloadCertificate = async () => {
        if(!certRef.current) return;
        setDownloading("certificate");
        try {
            await new Promise(r => setTimeout(r, 300));
            const dataUrl = await toPng(certRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: "#f5f2ec" });
            const link = document.createElement('a');
            link.download = `Certificate-${id}.png`;
            link.href = dataUrl;
            link.click();
        } finally {
            setDownloading("");
        }
    };

    const name = score?.userName || "User";
    const total = score?.totalScore || 0;
    const dateStr = score?.date ? dayjs(score.date).format("DD MMM, YYYY") : "";
    const iq = estimateIQ(total);
    const percentile = useMemo(() => {
        const z = (iq - 100) / 15;
        return Math.max(1, Math.min(99, Math.round(normalCdf(z) * 100)));
    }, [iq]);
    const ciLow = Math.max(55, iq - 7);
    const ciHigh = Math.min(145, iq + 7);

    const reasoning = scaleDomain(score?.byCategory?.["logical-reasoning"] || 0);
    const verbal = scaleDomain(score?.byCategory?.["verbal-ability"] || 0);
    const memory = scaleDomain(score?.byCategory?.["memory"] || 0);
    const speed = scaleDomain(((score?.byCategory?.["numerical-ability"] || 0) + (score?.byCategory?.["spatial-reasoning"] || 0)) / 2);
    const reportUrl = `${window.location.origin}/report/${score?._id || id}`;

    if(loading) return <div className="p-6 text-center">Loading...</div>;
    if(error) return <div className="p-6 text-red-600">{error}</div>;
    if(!score) return <div className="p-6">No score found.</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Download Your Certificate</h1>
                    <p className="text-gray-600">Download your professional certificate with IQ score and domain breakdowns</p>
                </div>

                <div className="border rounded-lg p-6 text-center mb-8">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Certificate</h3>
                        <p className="text-gray-600 text-sm">Professional certificate with your IQ score and domain breakdowns</p>
                    </div>
                    <button 
                        onClick={handleDownloadCertificate}
                        disabled={downloading === "certificate"}
                        className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading === "certificate" ? "Downloading..." : "Download Certificate (PNG)"}
                    </button>
                </div>

                {/* Off-screen certificate for download */}
                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '1000px', zIndex: -1 }}>
                    <div ref={certRef} className="relative overflow-hidden rounded-lg" style={{width:'900px', height:'1273px', background:'linear-gradient(135deg,#28457a,#f5f2ec 35%,#e15e2a)'}}>
                        <div className="absolute inset-6 bg-[#fbfaf7] rounded-md" style={{boxShadow:'inset 0 0 0 3px rgba(0,0,0,0.4), inset 0 0 0 12px rgba(0,0,0,0.05)'}} />
                        <div className="relative h-full flex flex-col">
                            <div className="px-14 pt-12 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-12" />
                                    <div className="text-2xl tracking-wider font-semibold">BAZINGO</div>
                                </div>
                                <div className="text-sm text-gray-600">{dateStr}</div>
                            </div>
                            <div className="px-14 text-center mt-6">
                                <div className="text-4xl font-extrabold tracking-wider">CERTIFICATE OF IQ ACHIEVEMENT</div>
                                <div className="mt-8 text-gray-600 text-lg">This certifies that</div>
                                <div className="mt-2 text-5xl font-bold">{name}</div>
                                <div className="mt-5 text-gray-700 text-lg">has achieved a Full Scale IQ score of</div>
                                <div className="mt-3 text-8xl font-extrabold text-orange-600">{iq}</div>
                                <div className="mt-3 text-gray-700 text-base">Confidence Interval {ciLow}—{ciHigh}</div>
                                <div className="text-gray-700 text-base">Percentile Rank {percentile}</div>
                            </div>
                            <div className="mt-12 px-14 grid grid-cols-4 gap-6">
                                {[
                                    {label:'Reasoning', value: reasoning},
                                    {label:'Verbal', value: verbal},
                                    {label:'Memory', value: memory},
                                    {label:'Processing Speed', value: speed},
                                ].map((b,idx)=> (
                                    <div key={idx} className="rounded-xl p-6 text-center text-white" style={{background:'linear-gradient(180deg,#f36d3a,#be4a84 70%, #2f5fb6)'}}>
                                        <div className="text-sm opacity-95">{b.label}</div>
                                        <div className="mt-3 text-5xl font-extrabold leading-none">{b.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto px-14 pb-12 pt-10 flex items-end justify-between">
                                <div className="flex items-center gap-5">
                                    <QRCodeCanvas value={reportUrl} size={110} bgColor="#ffffff" fgColor="#000000" includeMargin level="M" />
                                    <div className="text-sm text-gray-700">
                                        <div className="font-medium">Certificate ID BZG-{dayjs().format('YYYY')}-{id?.slice(-6) || 'XXXXXX'}</div>
                                        <div className="mt-1 text-gray-600 max-w-[360px]">This score is based on a normative sample with a mean of 100 and a standard deviation of 15.</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-signature italic">Bazzingo</div>
                                    <div className="h-0.5 w-56 bg-gray-400 mb-2" />
                                    <div className="text-sm">Chief Psychologist</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}