import React from "react";

function SidebarDetailCard({ label, value }) {
  return (
    <div className="flex items-center justify-between backdrop-blur-sm px-6 pt-2 pb-2.5 rounded-3xl bg-white/20 text-white/80">
      <span className="text-md font-semibold">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default SidebarDetailCard;
