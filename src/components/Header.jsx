import React, { useState, useRef, useEffect } from "react";

export default function Header({ dataApi, fetchByCoords }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // fetch suggestions from Open-Meteo geocoding
  const fetchSuggestions = async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=10&language=en`
      );
      const json = await res.json();
      setSuggestions(json.results || []);
    } catch (err) {
      console.error("Suggestions error", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // debounce input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
      setOpen(true);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // close dropdown on outside click or Esc
  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // When user selects a suggestion, call fetchByCoords with coords and send only the name as label
  const handleSelect = (item) => {
    const nameOnly = item.name; // send only the name
    if (fetchByCoords) {
      fetchByCoords(item.latitude, item.longitude, nameOnly);
    } else {
      // fallback: call dataApi with the raw name (keeps compatibility)
      dataApi(nameOnly);
    }
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query || query.trim().length < 2) return;
    // if user submitted free text, use dataApi (geocode -> weather)
    dataApi(query);
    setQuery("");
    setOpen(false);
  };

  return (
    <header
      className="bg-white shadow-md p-6 rounded-lg max-w-xl mx-auto"
      ref={containerRef}
    >
      <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
        🌤️ Weather App
      </h1>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setOpen(true)}
            placeholder="Search city..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="suggestions-list"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Search
          </button>
        </div>

        {open && (suggestions.length > 0 || loading) && (
          <ul
            id="suggestions-list"
            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-20"
            role="listbox"
          >
            {loading && (
              <li className="px-4 py-2 text-sm text-gray-500">Loading…</li>
            )}

            {!loading &&
              suggestions.map((s, i) => (
                <li
                  key={`${s.latitude}-${s.longitude}-${i}`}
                  onClick={() => handleSelect(s)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  role="option"
                >
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-500">
                      {s.admin1 ? `${s.admin1}, ` : ""}
                      {s.country ? s.country : ""}
                    </div>
                  </div>
                </li>
              ))}

            {!loading && suggestions.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500">No matches</li>
            )}
          </ul>
        )}
      </form>
    </header>
  );
}
