import React,{useState, useRef, useEffect} from "react";
import { Info } from "lucide-react";
import { getRecentAssessmentActivity } from "../../services/dashbaordService";
import BazzingoLoader from "../Loading/BazzingoLoader";

const RecentTest = () =>{
  const [showTooltip, setShowTooltip] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const iconRef = useRef(null);
  
  const handleTooltipClick = (setTooltipFn) => {
  setTooltipFn(true);
  setTimeout(() => {
    setTooltipFn(false);
  }, 3000); // auto close in 3 seconds
};

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        const res = await getRecentAssessmentActivity();
        const scores = (res?.data?.scores || [])
          .slice()
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        const mapped = scores.slice(0, 2).map((s) => ({
          title: s.assessmentName || "Assessment",
          score: s.totalScore ?? 0,
          outOfScore: s.outOfScore ?? 0,
          icon: "/Brain_game.png",
          date: (() => {
            const d = new Date(s.submittedAt);
            return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
          })(),
        }));
        setItems(mapped);
      } catch (err) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);
  
  if (loading) {
    return (
      <div className="lg:w-[420px] min-h-[220px] bg-[#EEEEEE] rounded-xl p-4 flex items-center justify-center">
        <BazzingoLoader message="Loading recent tests..." compact />
      </div>
    );
  }

    return (
        <>
         {/* Middle Card - Recent Tests */}
<div className="lg:w-[420px] min-h-[220px] bg-[#EEEEEE] rounded-xl p-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-gray-800">Recent Test</h3>
     {/* Tooltip Trigger */}
                    <div
                      ref={iconRef}
                      className="relative cursor-pointer"
                      onClick={() => handleTooltipClick(setShowTooltip)}
                    >
                      <Info className="w-4 h-4 text-black" />
    
                      {/* Tooltip Popup */}
                      {showTooltip && (
                        <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                           View your most recent tests and scores at a glance.
                        </div>
                      )}
                    </div>
  </div>
  <div className="space-y-3">
    {loading && (
      <div className="text-sm text-gray-600">Loading...</div>
    )}
    {!loading && items.length === 0 && (
      <div className="text-sm text-gray-600">No recent tests found.</div>
    )}
    {!loading && items.map((item, i) => (
      <div key={i} className="flex justify-between items-center bg-white rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={item.icon} alt="test" className="w-10 h-10 rounded" />
          <div>
            <p className="text-sm font-medium text-gray-800 leading-none">{item.title}</p>
            <p className="text-xs text-gray-500">{item.date}</p>
          </div>
        </div>
        <div className="text-lg font-bold text-black">{item.score}/{item.outOfScore}</div>
      </div>
    ))}
  </div>
</div>
        </>
    );
};
export default RecentTest;