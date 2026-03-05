"use client";

import { useEffect, useState } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";

interface LocationInfo {
  state_district: string | null;
  county: string | null;
  state: string | null;
  country_code: string | null;
}

const CACHE_KEY = "user_location_district";
const CACHE_TIME_KEY = "user_location_district_time";
const SIX_HOURS = 1000 * 60 * 60 * 6;

export function useDistrictFromLocation() {
  const { latitude, longitude, loading: mapLoading } = useUserLocation();

  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    state_district: null,
    county: null,
    state: null,
    country_code: null,
  });

  const [loading, setLoading] = useState(true); // Start with true

  useEffect(() => {
    // Waiting for map hook
    if (mapLoading || latitude == null || longitude == null) {
      setLoading(true);
      return;
    }

    const fetchDistrict = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        );
        const data = await res.json();

        const newLocation = {
          state_district: data?.address?.state_district
            ? data.address.state_district.split(" ").slice(0, -1).join(" ")
            : "dhaka",
          county: data?.address?.county ?? null,
          state: data?.address?.state ?? null,
          country_code: data?.address?.country_code ?? "bd",
        };

        setLocationInfo(newLocation);

        // Save in localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify(newLocation));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch (err) {
        console.error("District fetch error:", err);

        const fallback = {
          state_district: "dhaka",
          county: null,
          state: null,
          country_code: "bd",
        };

        setLocationInfo(fallback);
      } finally {
        setLoading(false);
      }
    };

    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedData && cachedTime) {
      const now = Date.now();
      const diff = now - Number(cachedTime);

      // If cache is valid (within 6 hours)
      if (diff < SIX_HOURS) {
        setLocationInfo(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
    }
    
    fetchDistrict();
  }, [latitude, longitude, mapLoading]);

  return { ...locationInfo, loading };
}
