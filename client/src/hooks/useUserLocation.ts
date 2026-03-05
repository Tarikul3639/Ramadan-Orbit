"use client";

import { useState, useEffect, useRef } from "react";

const COORD_CACHE_KEY = "user_location_coords";
const COORD_CACHE_TIME_KEY = "user_location_coords_time";
const SIX_HOURS = 1000 * 60 * 60 * 6;

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

const getCachedCoords = () => {
  try {
    const data = localStorage.getItem(COORD_CACHE_KEY);
    const time = localStorage.getItem(COORD_CACHE_TIME_KEY);
    if (data && time) {
      return {
        coords: JSON.parse(data) as { latitude: number; longitude: number },
        time: Number(time),
      };
    }
  } catch {}
  return null;
};

const setCache = (coords: { latitude: number; longitude: number }) => {
  try {
    localStorage.setItem(COORD_CACHE_KEY, JSON.stringify(coords));
    localStorage.setItem(COORD_CACHE_TIME_KEY, Date.now().toString());
  } catch {}
};

export function useUserLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  const intervalRef = useRef<NodeJS.Timeout|null>(null);

  const getLocation = (forceUpdate = false) => {
    // 1. Use cache if fresh enough and not forcing update
    const cached = getCachedCoords();
    const fresh = cached && Date.now() - cached.time < SIX_HOURS;
    if (!forceUpdate && fresh) {
      setState({
        latitude: cached.coords.latitude,
        longitude: cached.coords.longitude,
        loading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    if (!("geolocation" in navigator)) {
      setState({
        latitude: null,
        longitude: null,
        loading: false,
        error: "Geolocation not supported",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCache({ latitude, longitude });
        setState({
          latitude,
          longitude,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Initial fetch or cache load
  useEffect(() => {
    getLocation(false);

    // Set up periodic refresh every 6 hours
    intervalRef.current = setInterval(() => getLocation(true), SIX_HOURS);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, []);

  return state;
}