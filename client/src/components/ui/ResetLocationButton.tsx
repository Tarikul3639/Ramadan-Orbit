import React from "react";
import { MapPin } from "lucide-react";

const ResetLocation = () => {
  return (
    <button
      className="group flex items-center gap-2 px-3 py-1.5 
                       bg-white/5 hover:bg-white/10 active:scale-95
                       backdrop-blur-md border border-white/10 hover:border-primary
                       rounded-full transition-all duration-200 cursor-pointer z-50"
    >
      {/* Icon color dynamically changes with theme primary color */}
      <MapPin
        className="size-3 md:size-4 text-primary transition-colors duration-200"
      />

      {/* White text with subtle tracking for premium look */}
      <span className="text-white text-[10px] md:text-xs font-medium tracking-wide">
        Reset Location
      </span>
    </button>
  );
};

export default ResetLocation;
