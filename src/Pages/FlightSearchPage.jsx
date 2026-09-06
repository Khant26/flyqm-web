import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import HeroSection from "../components/HeroSection";
import SearchForm from "../components/SearchForm";
import ResultsSection from "../components/ResultsSection";
import AboutSection from "../components/AboutSection";
import { searchFlights, searchRoundTripFlights } from "../utils/api";

const transformFlightData = (flights) => {
  return flights.map((f) => {
    if (f?.outbound && f?.inbound) {
      return {
        type: "ROUND_TRIP",
        adults: f.adults,
        bundle_key: f.bundle_key,
        flight_snapshot: {
          bundle_key: f.bundle_key,
          adults: f.adults,
          outbound: {
            airline: f.outbound.airline,
            airline_code: f.outbound.airline_code,
            flight_number: f.outbound.flight_number,
            origin: f.outbound.origin,
            destination: f.outbound.destination,
            route: f.outbound.route,
            departure_time: f.outbound.departure_time,
            arrival_time: f.outbound.arrival_time,
            duration_minutes: f.outbound.duration_minutes,
          },
          inbound: {
            airline: f.inbound.airline,
            airline_code: f.inbound.airline_code,
            flight_number: f.inbound.flight_number,
            origin: f.inbound.origin,
            destination: f.inbound.destination,
            route: f.inbound.route,
            departure_time: f.inbound.departure_time,
            arrival_time: f.inbound.arrival_time,
            duration_minutes: f.inbound.duration_minutes,
          },
          base_price_usd: f.base_price_usd,
          final_price_usd: f.final_price_usd,
          final_price_mmk: f.final_price_mmk,
          price_estimate_min_usd: f.price_estimate_min_usd,
          price_estimate_max_usd: f.price_estimate_max_usd,
          price_estimate_min_mmk: f.price_estimate_min_mmk,
          price_estimate_max_mmk: f.price_estimate_max_mmk,
          requires_admin_confirmation: f.requires_admin_confirmation,
        },
        final_price_usd: f.final_price_usd,
        final_price_mmk: f.final_price_mmk,
      };
    }

    return {
      type: "ONE_WAY",
      adults: f.adults,
      bundle_key: f.external_flight_id,
      flight_snapshot: {
        external_flight_id: f.external_flight_id,
        airline: f.airline,
        airline_code: f.airline_code,
        flight_number: f.flight_number,
        origin: f.origin,
        destination: f.destination,
        route: f.route,
        departure_time: f.departure_time,
        arrival_time: f.arrival_time,
        duration_minutes: f.duration_minutes,
        baggage_carry_on_kg: f.baggage_carry_on_kg,
        baggage_checked_kg: f.baggage_checked_kg,
        baggage_fee: f.baggage_fee,
        baggage_info_url: f.baggage_info_url,
        base_price_usd: f.base_price_usd,
        final_price_usd: f.final_price_usd,
        final_price_mmk: f.final_price_mmk,
        price_estimate_min_usd: f.price_estimate_min_usd,
        price_estimate_max_usd: f.price_estimate_max_usd,
        price_estimate_min_mmk: f.price_estimate_min_mmk,
        price_estimate_max_mmk: f.price_estimate_max_mmk,
        requires_admin_confirmation: f.requires_admin_confirmation,
      },
      final_price_usd: f.final_price_usd,
      final_price_mmk: f.final_price_mmk,
    };
  });
};

const FlightSearchPage = ({
  initialTripType = "round-trip",
  pageTitle = "Available Flights",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isReturnPage = location.pathname === "/return";

  const state = location.state || {};
  const tripTypeFromState = state.tripType;
  const previousFlight = state.outboundFlight || state.flight;

  const [tripType, setTripType] = useState(tripTypeFromState || initialTripType);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildParams = (raw) => {
    const origin = (raw?.origin || raw?.from || "").toUpperCase();
    const destination = (raw?.destination || raw?.to || "").toUpperCase();
    const departure_date = raw?.departure_date || raw?.departureDate || raw?.date || "";
    const return_date = raw?.return_date || raw?.returnDate || "";

    return {
      origin,
      destination,
      departure_date,
      return_date,
      adults: Number(raw?.adults || raw?.passengers || 1),
      page: Number(raw?.page || 1),
    };
  };

  const handleSearch = async (searchData) => {
    const targetPath = isReturnPage ? "/return" : tripType === "one-way" ? "/one-way" : "/departure";

    if (location.pathname !== targetPath) {
      navigate(targetPath, { state: { tripType, searchData } });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = buildParams(searchData);
      const res = tripType === "round-trip"
        ? await searchRoundTripFlights(params)
        : await searchFlights(params);

      setFlights(transformFlightData(res));
    } catch (e) {
      setError(e.message || "Failed to fetch flights");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.searchData) {
      handleSearch(state.searchData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- navigation state triggers the initial search
  }, [location.key]);

  const handleSelectFlight = (flight) => {
    if (tripType === "round-trip") {
      if (!isReturnPage) {
        navigate("/return", {
          state: {
            tripType,
            outboundFlight: flight,
            searchData: state.searchData,
          },
        });
        return;
      }

      navigate("/booking", {
        state: {
          tripType,
          outboundFlight: previousFlight,
          returnFlight: flight,
          searchData: state.searchData,
        },
      });
      return;
    }

    navigate("/booking", {
      state: {
        tripType,
        outboundFlight: flight,
        searchData: state.searchData,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <SearchForm
        tripType={tripType}
        onTripTypeChange={setTripType}
        onSearch={handleSearch}
        initialValues={state.searchData}
      />

      <ResultsSection
        pageTitle={pageTitle}
        previousFlight={previousFlight}
        showSelectedPreviousFlight={isReturnPage}
        onSelectFlight={handleSelectFlight}
        flights={flights}
        loading={loading}
        error={error}
      />

      <AboutSection />
    </div>
  );
};

export default FlightSearchPage;