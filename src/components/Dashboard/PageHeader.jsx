import {Calendar} from "../../utils/dashboard-image.js";
import {ChevronDown} from "lucide-react";
import React from "react";

export default function PageHeader({ name }) {
    return (
        <div className="hidden md:block">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Good Morning, <span className="text-orange-500">Alex</span>
                </h1>
                <div className="flex items-center space-x-2 bg-transparent rounded-lg px-4 py-2">
                    <img src={Calendar} alt="Calendar" className="w-4 h-4 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Last 7 Days</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        </div>
    );
}