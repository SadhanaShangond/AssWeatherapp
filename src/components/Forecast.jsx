import React from "react";

export default function Forecast({ hourly, daily }) {
  const currentHour = new Date().getHours();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Hourly Forecast */}
      <h2 className="text-xl font-semibold text-blue-700 mb-2">
        Hourly Forecast
      </h2>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 w-max pr-4">
          {hourly.temperature_2m.slice(0, 24).map((temp, i) => {
            const timeStr = hourly.time[i].split("T")[1];
            const hour = parseInt(timeStr.split(":")[0]);
            const isCurrent = hour === currentHour;

            return (
              <div
                key={i}
                className={`min-w-[100px] p-3 rounded-lg shadow text-center ${
                  isCurrent
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-white"
                }`}
              >
                <p className="font-medium">{timeStr}</p>
                <p>{Math.round(temp)}°C</p>
                {isCurrent && (
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    Now
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Forecast */}
      <h2 className="text-xl font-semibold text-blue-700 mt-6 mb-2">
        Weekly Forecast
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {daily.temperature_2m_max.map((max, i) => (
          <div key={i} className="bg-white p-3 rounded-lg shadow text-center">
            <p className="font-medium">{daily.time[i]}</p>
            <p>🌞 Max: {Math.round(max)}°C</p>
            <p>🌙 Min: {Math.round(daily.temperature_2m_min[i])}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
}
