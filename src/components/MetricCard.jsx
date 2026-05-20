import React from "react";

function MetricCard({ title, value, unit, icon, subtitle }) {
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-6 text-white flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white/60 text-md font-medium">{title}</h3>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-white/50 text-sm ml-2">
          {unit}
          {subtitle && ` ${subtitle}`}
        </span>
      </div>
    </div>
  );
}

export default MetricCard;
