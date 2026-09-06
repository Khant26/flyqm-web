import { useEffect, useState } from "react";

const asiaDestinations = [
  { city: "Bangkok", code: "BKK" },
  { city: "Yangon", code: "RGN" },
  { city: "Mandalay", code: "MDL" },
  { city: "Singapore", code: "SIN" },
  { city: "Tokyo", code: "NRT" },
  { city: "Seoul", code: "ICN" },
  { city: "Kuala Lumpur", code: "KUL" },
  { city: "Phuket", code: "HKT" },
  { city: "Chiang Mai", code: "CNX" },
  { city: "Hong Kong", code: "HKG" },
  { city: "Taipei", code: "TPE" },
  { city: "Osaka", code: "KIX" },
];

const airportMap = {
  bangkok: "BKK",
  bkk: "BKK",
  yangon: "RGN",
  rgn: "RGN",
  mandalay: "MDL",
  mdl: "MDL",
  singapore: "SIN",
  sin: "SIN",
  tokyo: "NRT",
  nrt: "NRT",
  seoul: "ICN",
  icn: "ICN",
  "kuala lumpur": "KUL",
  kul: "KUL",
  phuket: "HKT",
  hkt: "HKT",
  "chiang mai": "CNX",
  cnx: "CNX",
  "hong kong": "HKG",
  hkg: "HKG",
  taipei: "TPE",
  tpe: "TPE",
  osaka: "KIX",
  kix: "KIX",
};

const getAirportCode = (input) => {
  if (!input) return "";

  const value = input.trim().toLowerCase();

  if (airportMap[value]) return airportMap[value];

  const matchedCity = Object.keys(airportMap).find((city) =>
    value.includes(city)
  );

  if (matchedCity) return airportMap[matchedCity];

  return input.trim().toUpperCase();
};

const makeInitialSearchData = (initialValues) => ({
  from: initialValues?.origin || initialValues?.from || "",
  to: initialValues?.destination || initialValues?.to || "",
  departureDate:
    initialValues?.departure_date || initialValues?.departureDate || "",
  returnDate: initialValues?.return_date || initialValues?.returnDate || "",
  passengers: Math.max(
    1,
    Number(initialValues?.adults || initialValues?.passengers || 1)
  ),
});

const formatDisplayDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const LocationIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 21s-6-5.33-6-10a6 6 0 1112 0c0 4.67-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </svg>
);

const CalendarIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SearchIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const SearchForm = ({
  tripType,
  onTripTypeChange,
  onSearch,
  initialValues,
}) => {
  const [searchData, setSearchData] = useState(() =>
    makeInitialSearchData(initialValues)
  );

  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    if (!initialValues) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- controlled defaults may change between booking legs
    setSearchData(makeInitialSearchData(initialValues));
  }, [initialValues]);

  const handleSearch = (e) => {
    e.preventDefault();

    const originCode = getAirportCode(searchData.from);
    const destinationCode = getAirportCode(searchData.to);

    const payload = {
      origin: originCode,
      destination: destinationCode,
      departure_date: searchData.departureDate,
      adults: Number(searchData.passengers),
      trip_type: tripType,
    };

    if (tripType === "round-trip" && searchData.returnDate) {
      payload.return_date = searchData.returnDate;
    }

    console.log("SEARCH PAYLOAD:", payload);
    onSearch(payload);
  };

  const handleDestinationSelect = (item) => {
    setSearchData((prev) => ({
      ...prev,
      [activeField]: item.city,
    }));
    setActiveField(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 relative z-20">
      <div className="bg-white rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.14)] p-8 relative">
        <div className="flex items-center gap-8 mb-8">
          {["round-trip", "one-way"].map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer text-[15px] text-gray-700"
            >
              <input
                type="radio"
                name="tripType"
                value={type}
                checked={tripType === type}
                onChange={(e) => onTripTypeChange(e.target.value)}
                className="accent-blue-600 w-4 h-4"
              />
              <span>{type === "round-trip" ? "Round-trip" : "One-way"}</span>
            </label>
          ))}
        </div>

        <form onSubmit={handleSearch}>
          <div
            className={`grid grid-cols-1 gap-4 ${
              tripType === "round-trip" ? "md:grid-cols-5" : "md:grid-cols-4"
            }`}
          >
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3">
                Leaving from
              </label>
              <div className="h-14 rounded-2xl border border-gray-200 bg-white flex items-center px-4">
                <span className="mr-3 text-gray-400">{LocationIcon}</span>
                <input
                  type="text"
                  placeholder="City or Airport"
                  value={searchData.from}
                  onFocus={() => setActiveField("from")}
                  onChange={(e) =>
                    setSearchData({ ...searchData, from: e.target.value })
                  }
                  className="w-full bg-transparent outline-none text-base text-slate-700 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3">
                Going to
              </label>
              <div className="h-14 rounded-2xl border border-gray-200 bg-white flex items-center px-4">
                <span className="mr-3 text-gray-400">{LocationIcon}</span>
                <input
                  type="text"
                  placeholder="City or Airport"
                  value={searchData.to}
                  onFocus={() => setActiveField("to")}
                  onChange={(e) =>
                    setSearchData({ ...searchData, to: e.target.value })
                  }
                  className="w-full bg-transparent outline-none text-base text-slate-700 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3">
                Departure date
              </label>
              <div className="relative">
                <div className="h-14 rounded-2xl border border-gray-200 bg-white flex items-center px-4">
                  <span className="mr-3 text-gray-400">{CalendarIcon}</span>
                  <input
                    type="text"
                    readOnly
                    value={formatDisplayDate(searchData.departureDate)}
                    placeholder="Jan 15"
                    onClick={() => {
                      const el = document.getElementById("departure-date");
                      if (el?.showPicker) el.showPicker();
                      else if (el) el.click();
                    }}
                    className="w-full bg-transparent outline-none text-base text-slate-700 placeholder:text-gray-400 cursor-pointer"
                  />
                </div>

                <input
                  id="departure-date"
                  type="date"
                  value={searchData.departureDate}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      departureDate: e.target.value,
                    })
                  }
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  tabIndex={-1}
                />
              </div>
            </div>

            {tripType === "round-trip" && (
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Return date
                </label>
                <div className="relative">
                  <div className="h-14 rounded-2xl border border-gray-200 bg-white flex items-center px-4">
                    <span className="mr-3 text-gray-400">{CalendarIcon}</span>
                    <input
                      type="text"
                      readOnly
                      value={formatDisplayDate(searchData.returnDate)}
                      placeholder="Jan 22"
                      onClick={() => {
                        const el = document.getElementById("return-date");
                        if (el?.showPicker) el.showPicker();
                        else if (el) el.click();
                      }}
                      className="w-full bg-transparent outline-none text-base text-slate-700 placeholder:text-gray-400 cursor-pointer"
                    />
                  </div>

                  <input
                    id="return-date"
                    type="date"
                    value={searchData.returnDate}
                    onChange={(e) =>
                      setSearchData({
                        ...searchData,
                        returnDate: e.target.value,
                      })
                    }
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3">
                Passengers
              </label>
              <div className="h-14 rounded-2xl border border-gray-200 bg-white px-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setSearchData((prev) => ({
                      ...prev,
                      passengers: Math.max(1, Number(prev.passengers) - 1),
                    }))
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                >
                  -
                </button>

                <span className="text-lg font-medium text-slate-700">
                  {searchData.passengers}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSearchData((prev) => ({
                      ...prev,
                      passengers: Number(prev.passengers) + 1,
                    }))
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {activeField && (
            <div className="absolute left-8 right-8 top-[145px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-slate-700">
                  Popular Destination
                </h3>

                <button
                  type="button"
                  onClick={() => setActiveField(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500">Asia</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
                {asiaDestinations.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleDestinationSelect(item)}
                    className="border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
                  >
                    {item.city}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <button
              type="submit"
              className="h-12 px-10 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-3"
            >
              {SearchIcon}
              Search Flights
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;