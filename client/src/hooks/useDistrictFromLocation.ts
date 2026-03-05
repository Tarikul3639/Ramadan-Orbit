"use client";

import { useEffect, useState, useRef } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";

const DISTRICT_CACHE_KEY = "user_location_district";
const DISTRICT_CACHE_TIME_KEY = "user_location_district_time";
const SIX_HOURS = 1000 * 60 * 60 * 6;

interface LocationInfo {
  state_district: string | null;
  county: string | null;
  state: string | null;
  country_code: string | null;
}

const getCachedDistrict = () => {
  try {
    const data = localStorage.getItem(DISTRICT_CACHE_KEY);
    const time = localStorage.getItem(DISTRICT_CACHE_TIME_KEY);
    if (data && time) {
      return {
        info: JSON.parse(data) as LocationInfo,
        time: Number(time),
      };
    }
  } catch {}
  return null;
};

const setDistrictCache = (info: LocationInfo) => {
  try {
    localStorage.setItem(DISTRICT_CACHE_KEY, JSON.stringify(info));
    localStorage.setItem(DISTRICT_CACHE_TIME_KEY, Date.now().toString());
  } catch {}
};

export function useDistrictFromLocation() {
  const { latitude, longitude, loading: locationLoading } = useUserLocation();
  const [district, setDistrict] = useState<LocationInfo>({
    state_district: null,
    county: null,
    state: null,
    country_code: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const intervalRef = useRef<NodeJS.Timeout|null>(null);

  const fetchDistrict = async (force = false) => {
    // If user location is unknown, don't proceed
    if (locationLoading || latitude == null || longitude == null) {
      setLoading(true);
      return;
    }

    // 1. Use cache if fresh enough and not forced
    const cached = getCachedDistrict();
    const fresh = cached && Date.now() - cached.time < SIX_HOURS;
    if (!force && fresh) {
      setDistrict(cached.info);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await res.json();
      const address = data?.address || {};

      let stateDistrict: string | null = address.state_district ?? null;
      if (stateDistrict && stateDistrict.split(" ").length > 1) {
        stateDistrict = stateDistrict.split(" ").slice(0, -1).join(" ");
      }

      const info: LocationInfo = {
        state_district: stateDistrict || "dhaka",
        county: address.county ?? null,
        state: address.state ?? null,
        country_code: address.country_code ?? "bd",
      };

      setDistrict(info);
      setDistrictCache(info);
    } catch (e) {
      const fallback: LocationInfo = {
        state_district: "dhaka",
        county: null,
        state: null,
        country_code: "bd",
      };
      setDistrict(fallback);
      setDistrictCache(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch or cache load
  useEffect(() => {
    fetchDistrict(false);

    // Set up periodic refresh every 6 hours (so the district stays synced with coordinates)
    intervalRef.current = setInterval(() => fetchDistrict(true), SIX_HOURS);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [latitude, longitude, locationLoading]);

  return { ...district, loading };
}