"use client";

import Lottie from "lottie-react";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { OrbitCountdown } from "@/components/ui/OrbitCountdown";
import { Today } from "@/components/ui/Today";
import { Month } from "@/components/ui/Month";
import { FeaturedCard } from "@/components/ui/FeaturedCard";
import { useRamadanData } from "@/hooks/useRamadanData";
import { useDistrictFromLocation } from "@/hooks/useDistrictFromLocation";
import LocationLoader from "@/components/ui/LocationLoader";
import animationData from "@/Public/animations/Ramadan-Top.json";
import Dialog from "@/components/ui/Dialog";
import ResetLocation from "@/components/ui/ResetLocationButton";

export default function Home() {
  const {
    state_district,
    country_code,
    loading: districtLoading,
  } = useDistrictFromLocation();

  // Handle loading + fallback
  if (districtLoading || !state_district) {
    return <LocationLoader />;
  }

  // Safe: lowercase & trimmed district
  const districtKey = state_district.trim().toLowerCase();

  // get Ramadan data
  const { days, today, tomorrow } = useRamadanData(districtKey);

  return (
    <main className="flex min-h-screen overflow-hidden flex-col items-center">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%27M40%200l20%2020-20%2020-20-20L40%200zm0%2080l20-20-20-20-20%2020%2020%2080zM0%2040l20-20%2020%2020-20%2020L0%2040zm80%2040l-20-15-20%2015%2020%2015%2020-15z%27%20fill%3D%27%23D4AF37%27%20fill-opacity%3D%270.02%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-center bg-cover pointer-events-none" />

      {/* Animation */}
      <div className="absolute top-20 opacity-100 pointer-events-none">
        <Lottie
          loop={false}
          animationData={animationData}
          style={{ width: "100%" }}
          className="w-full h-full"
        />
      </div>

      {/* Dialog */}
      <Dialog />

      <div className="w-full mx-auto max-w-5xl">
        <Navbar />
      </div>

      {/* Countdown + Date */}
      <div className="flex flex-col w-full items-center justify-center mt-12 mb-8 p-4">
        <OrbitCountdown
          today={today}
          tomorrow={tomorrow}
          state_district={state_district}
          country_code={country_code}
        />

        <div className="flex flex-col items-center mt-4 sm:mt-8 md:mt-10 lg:mt-16 text-center space-y-2 sm:space-y-4">
          {/* Reset Location Button */}
          <ResetLocation />
          <h2 className="font-serif text-base sm:text-lg md:text-xl font-light tracking-[0.2em] text-white">
            {today?.day} RAMADAN 1447
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-primary/40" />
            <p className="text-[8px] sm:text-xs uppercase tracking-[0.5em] text-primary font-bold">
              {today?.date_iso
                ? new Date(today.date_iso).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </p>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-primary/40" />
          </div>
        </div>
      </div>

      {/* Today Section */}
      <div className="w-full max-w-5xl">
        <Today today={today} />
      </div>

      {/* Monthly Calendar */}
      <div className="w-full max-w-5xl">
        <Month days={days} />
      </div>

      {/* Featured Card */}
      <FeaturedCard
        duaText="Allahumma laka sumtu wa bika aamantu wa 'ala rizqika aftartu."
        duaTrans="O Allah! I fasted for You and I believe in You and I break my fast with Your sustenance."
        currentPhase="Fasting in Progress"
        nextPrayer="Asr at 03:45 PM"
      />

      <Footer />
    </main>
  );
}
