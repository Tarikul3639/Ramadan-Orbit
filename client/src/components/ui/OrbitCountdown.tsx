"use client";

import { MapPin } from "lucide-react";
import { DisplayDayType } from "@/hooks/useRamadanData";
import { useState, useEffect } from "react";

const calculateCountdown = (
  startTimeStr: string,
  endTimeStr: string,
  label?: string,
) => {
  const now = new Date();

  const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);

  const [endHour, endMinute] = endTimeStr.split(":").map(Number);
  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  if (end < start) end.setDate(end.getDate() + 1);

  const totalDiffMs = end.getTime() - start.getTime();
  let remainingMs = end.getTime() - now.getTime();
  if (remainingMs < 0) remainingMs = 0;

  const progress = Math.min(
    100,
    ((totalDiffMs - remainingMs) / totalDiffMs) * 100,
  );

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    progress,
    message: label || "Countdown",
  };
};

interface TodayProps {
  today: DisplayDayType | null;
  tomorrow: DisplayDayType | null;
  country_code: string | null;
  state_district: string | null;
}

export const OrbitCountdown = ({
  today,
  tomorrow,
  state_district,
  country_code,
}: TodayProps) => {
  const [countdown, setCountdown] = useState({
    hours: "--",
    minutes: "--",
    seconds: "--",
    progress: 0,
    message: "Wait..",
  });

  const root = document.documentElement;

  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (countdown.progress / 100) * circumference;
  const dotRotation = (countdown.progress / 100) * 360;

  useEffect(() => {
    if (!today) return;

    const update = () => {
      const now = new Date();
      const nowMs = now.getTime();

      const [sehriHour, sehriMinute] = today.sehri.split(":").map(Number);
      const sehriDate = new Date();
      sehriDate.setHours(sehriHour, sehriMinute, 0, 0);
      const sehriTimeMs = sehriDate.getTime();

      const [fajrHour, fajrMinute] = today.fajr.split(":").map(Number);
      const fajrDate = new Date();
      fajrDate.setHours(fajrHour, fajrMinute, 0, 0);
      const fajrTimeMs = fajrDate.getTime();

      const [iftarHour, iftarMinute] = today.iftar.split(":").map(Number);
      const iftarDate = new Date();
      iftarDate.setHours(iftarHour, iftarMinute, 0, 0);
      const iftarTimeMs = iftarDate.getTime();

      // ---------- Theme logic ----------
      if (nowMs < sehriTimeMs) {
        root.dataset.theme = "default";
        setCountdown(
          calculateCountdown("00:00", today.sehri, "Time Until Sehri"),
        );
      } else if (nowMs >= sehriTimeMs && nowMs < fajrTimeMs) {
        root.dataset.theme = "fajr";
        setCountdown(
          calculateCountdown(today.sehri, today.fajr, "Time Until Fajr"),
        );
      } else if (nowMs >= fajrTimeMs && nowMs < iftarTimeMs) {
        root.dataset.theme = "default";
        setCountdown(
          calculateCountdown(today.fajr, today.iftar, "Time Until Iftar"),
        );
      } else if (tomorrow) {
        root.dataset.theme = "default";
        setCountdown(
          calculateCountdown(today.iftar, tomorrow.sehri, "Time Until Sehri"),
        );
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [today, tomorrow]);

  const { hours, minutes, seconds, message, progress } = countdown;

  return (
    <div className="relative h-62.5 w-62.5 sm:h-70 sm:w-70 md:h-80 md:w-[320px] lg:h-80 lg:w-[320px] flex items-center justify-center transition-all duration-500">
      <div className="absolute inset-0 rounded-full border border-primary/10 scale-[1.05]"></div>

      <svg
        className="absolute h-full w-full -rotate-90 transform"
        viewBox="0 0 100 100"
      >
        <circle
          className="text-white/5"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <circle
          className="text-primary transition-all duration-1000 ease-linear animate-pulse-gold z-10"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <g
          transform={`rotate(${dotRotation} 50 50)`}
          className="text-primary transition-transform duration-1000 ease-linear"
        >
          <circle
            cx={50 + radius}
            cy="50"
            r="3"
            fill="currentColor"
            className="text-primary"
            style={{ filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 1))" }}
          />
          <circle cx={50 + radius} cy="50" r="1.5" fill="white" />
        </g>
      </svg>

      <div className="absolute h-[85%] w-[85%] rounded-full flex flex-col items-center justify-center text-center border border-white/10 bg-white/3 backdrop-blur-md sm:backdrop-blur-[15px] p-2">
        <div className="mb-2 sm:mb-3 md:mb-4 flex flex-col items-center">
          <span className="inline-block px-2 py-0.5 sm:px-3 rounded-full bg-primary/10 border border-primary/20 text-[7px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary mb-1 font-bold whitespace-nowrap">
            {message}
          </span>
          <div className="w-10 sm:w-12 h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-30"></div>
        </div>

        <div className="flex items-baseline gap-1 sm:gap-1.5 md:gap-2 text-white">
          <div className="flex flex-col items-center font-serif gap-0.5">
            <span className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              {hours}
            </span>
            <span className="text-[6px] sm:text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-2">
              Hrs
            </span>
          </div>

          <span className="font-serif text-lg sm:text-2xl md:text-3xl font-light text-primary/30">
            :
          </span>

          <div className="flex flex-col items-center font-serif gap-0.5">
            <span className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              {minutes}
            </span>
            <span className="text-[6px] sm:text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-2">
              Min
            </span>
          </div>

          <span className="font-serif text-lg sm:text-2xl md:text-3xl font-light text-primary/30">
            :
          </span>

          <div className="flex flex-col items-center font-serif gap-0.5">
            <span className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-primary">
              {seconds}
            </span>
            <span className="text-[6px] sm:text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-2">
              Sec
            </span>
          </div>
        </div>

        <div className="mt-3 sm:mt-5 md:mt-6 flex flex-col items-center">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
            <MapPin size={8} className="text-primary sm:w-3 sm:h-3" />
            <span className="text-[6px] sm:text-[8px] tracking-widest text-slate-300 uppercase font-semibold whitespace-nowrap">
              {state_district} • {country_code}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
