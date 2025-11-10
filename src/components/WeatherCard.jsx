import React from "react";

export default function WeatherCard({ current, location }) {
  return (
    <div className="mt-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 text-center">
      <h2 className="text-2xl font-semibold text-blue-600 mb-2">
        Current Weather
      </h2>

      {location?.name && (
        <p className="text-lg text-gray-600 mb-4">
          <strong>{location.name}</strong>
          {location.country ? `, ${location.country}` : ""}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 text-lg">
        <p>🌡️ Temp: {current?.temperature_2m ?? "—"}°C</p>
        <p>💧 Humidity: {current?.relative_humidity_2m ?? "—"}%</p>
        <p>🌬️ Wind: {current?.wind_speed_10m ?? "—"} kph</p>
      </div>
    </div>
  );
}
