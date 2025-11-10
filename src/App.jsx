import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import WeatherCard from "./components/WeatherCard";
import Forecast from "./components/Forecast";

export default function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search by city name
  const dataApi = async (city) => {
    if (!city || city.trim().length < 2) return;
    try {
      setLoading(true);
      const cityRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}`
      );
      const cityJson = await cityRes.json();

      if (!cityJson.results || cityJson.results.length === 0) {
        alert("City not found");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = cityJson.results[0];
      setLocation({ name, country });
      await fetchWeatherByCoords(latitude, longitude);
    } catch (err) {
      console.error("City search error:", err);
      setLoading(false);
    }
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (latitude, longitude, label = null) => {
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_speed_10m_min&timezone=auto`
      );
      const weatherJson = await weatherRes.json();
      setWeatherData(weatherJson);

      if (label) {
        setLocation({ name: label });
      } else {
        const revRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`
        );
        const revJson = await revRes.json();
        if (revJson?.results?.length > 0) {
          const { name, country } = revJson.results[0];
          setLocation({ name, country });
        }
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get current location on load
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLoading(true);
        await fetchWeatherByCoords(latitude, longitude);
      },
      (err) => {
        console.warn("Geolocation denied:", err);
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 p-6 font-sans">
      <Header dataApi={dataApi} fetchByCoords={fetchWeatherByCoords} />

      {loading && <p className="text-center mt-6 text-lg">Loading...</p>}

      {!loading && weatherData && (
        <>
          <WeatherCard current={weatherData.current} location={location} />
          <Forecast hourly={weatherData.hourly} daily={weatherData.daily} />
        </>
      )}

      {!loading && !weatherData && (
        <p className="text-center mt-10 text-lg text-gray-700">
          Search a city or allow location to load weather
        </p>
      )}
    </div>
  );
}
