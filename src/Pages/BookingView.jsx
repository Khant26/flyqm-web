import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBookingDetail,
  getSecureTicket,
  getTicketStatus,
} from "../utils/api";
import Notification from "../components/Notification";

export default function BookingView() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [ticketStatusLoading, setTicketStatusLoading] = useState(false);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBookingDetail(bookingId);

        console.log("BOOKING ID:", bookingId);
        console.log("BOOKING DETAIL:", data);
        console.log("FLIGHT SNAPSHOT:", data?.flight_snapshot);

        setBooking(data || null);
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load booking detail"
        );
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchTicketStatus = async () => {
      try {
        setTicketStatusLoading(true);
        const statusData = await getTicketStatus(bookingId);
        setTicketStatus(statusData || null);
      } catch {
        setTicketStatus(null);
      } finally {
        setTicketStatusLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
      fetchTicketStatus();
    }
  }, [bookingId]);

  const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const formatMMK = (value) => "MMK " + toNumber(value).toLocaleString();

  const getEstimatePriceMMK = () => {
    if (!booking) return "-";

    const snap = booking.flight_snapshot || {};
    const priceMinMMK =
      snap?.price_estimate_min_mmk ||
      snap?.outbound?.price_estimate_min_mmk ||
      booking.price_estimate_min_mmk ||
      booking.final_price_mmk;

    const priceMaxMMK =
      snap?.price_estimate_max_mmk ||
      snap?.outbound?.price_estimate_max_mmk ||
      booking.price_estimate_max_mmk ||
      booking.final_price_mmk;

    if (priceMinMMK && priceMaxMMK && priceMinMMK !== priceMaxMMK) {
      return `${formatMMK(priceMinMMK)} - ${formatMMK(priceMaxMMK)}`;
    }

    return formatMMK(priceMaxMMK || priceMinMMK || 0);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const formatDuration = (minutes) => {
    const m = Number(minutes);
    if (!Number.isFinite(m) || m <= 0) return "-";

    const h = Math.floor(m / 60);
    const r = m % 60;

    if (h === 0) return `${r} minutes`;
    if (r === 0) return `${h}h`;
    return `${h}h ${r}m`;
  };

  const getValue = (...values) => {
    return (
      values.find(
        (value) => value !== undefined && value !== null && value !== ""
      ) || "-"
    );
  };

  const statusBadge = (status) => {
    const s = String(status || "").toUpperCase();

    if (s === "CONFIRMED" || s === "COMPLETED") {
      return "bg-green-50 text-green-700 border border-green-200";
    }

    if (s === "PENDING" || s === "PROCESSING") {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }

    if (s === "CANCELLED") {
      return "bg-red-50 text-red-700 border border-red-200";
    }

    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const paymentBadge = (status) => {
    const s = String(status || "").toUpperCase();

    if (s === "PAID") return "bg-green-50 text-green-700 border border-green-200";
    if (s === "FAILED") return "bg-red-50 text-red-700 border border-red-200";

    if (s === "PENDING" || s === "UNPAID") {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }

    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const tripTypeLabel = useMemo(() => {
    if (!booking?.type) return "-";
    if (booking.type === "ROUND_TRIP") return "Round Trip";
    if (booking.type === "ONE_WAY") return "One Way";
    return booking.type;
  }, [booking]);

  const flightData = useMemo(() => {
    const snap = booking?.flight_snapshot || {};

    const outbound =
      snap.outbound ||
      snap.departure ||
      snap.departure_flight ||
      snap.outbound_flight ||
      snap.departureFlight ||
      snap.outboundFlight ||
      null;

    const inbound =
      snap.inbound ||
      snap.return ||
      snap.return_flight ||
      snap.inbound_flight ||
      snap.returnFlight ||
      snap.inboundFlight ||
      null;

    const oneWay =
      !outbound && !inbound && Object.keys(snap).length > 0 ? snap : null;

    return {
      outbound,
      inbound,
      oneWay,
    };
  }, [booking]);

  const passengers = useMemo(() => {
    if (!booking) return [];

    if (Array.isArray(booking.passengers)) return booking.passengers;
    if (Array.isArray(booking.passenger_details)) return booking.passenger_details;
    if (Array.isArray(booking.passenger_list)) return booking.passenger_list;

    return [];
  }, [booking]);

  const handleDownloadTicket = async () => {
    try {
      setDownloading(true);

      const blob = await getSecureTicket(bookingId);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        booking.original_ticket_name ||
        booking.original_name ||
        `ticket-${booking.booking_code || bookingId}.pdf`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotification({
        type: "success",
        message: "Ticket downloaded successfully.",
      });
    } catch {
      setNotification({
        type: "error",
        message: "Failed to download ticket.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const FlightSection = ({ title, data }) => {
    if (!data) return null;

    const airlineCode = getValue(data.airline_code, data.carrier_code);
    const flightNumber = getValue(data.flight_number, data.number);
    const airlineName = getValue(data.airline, data.airline_name, data.carrier_name);
    const origin = getValue(
      data.origin,
      data.from,
      data.departure_airport_code,
      data.departure_iata,
      data.origin_code
    );
    const destination = getValue(
      data.destination,
      data.to,
      data.arrival_airport_code,
      data.arrival_iata,
      data.destination_code
    );
    const departureTime = getValue(
      data.departure_time,
      data.departureTime,
      data.departure_datetime
    );
    const arrivalTime = getValue(
      data.arrival_time,
      data.arrivalTime,
      data.arrival_datetime
    );

    return (
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
        <h3 className="mb-5 text-lg font-bold text-slate-800">{title}</h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Airline & Flight</p>
            <p className="text-sm font-semibold text-slate-800">
              {[airlineCode !== "-" ? airlineCode : "", flightNumber !== "-" ? flightNumber : ""]
                .filter(Boolean)
                .join("-") || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-1">Route</p>
            <p className="text-sm font-semibold text-slate-800">
              {origin} → {destination}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-1">Departure</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatDateTime(departureTime)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-1">Arrival</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatDateTime(arrivalTime)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-1">Duration</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatDuration(data.duration_minutes || data.duration)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-1">Airline Name</p>
            <p className="text-sm font-semibold text-slate-800">{airlineName}</p>
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">
          Loading booking detail...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 px-4 py-10">
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ type: "", message: "" })}
        />

        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-slate-900 px-5 py-2 text-sm text-white hover:bg-slate-800"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ type: "", message: "" })}
        />

        <p className="text-sm text-slate-500">Booking not found.</p>
      </div>
    );
  }

  const { outbound, inbound, oneWay } = flightData;

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-10 text-slate-800">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-2xl text-slate-500 hover:text-slate-800"
          >
            ←
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Booking {booking.booking_code || "-"}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Booked on {formatDate(booking.created_at)}
              </p>
            </div>

            <span
              className={
                "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold " +
                statusBadge(booking.status)
              }
            >
              {booking.status || "-"}
            </span>
          </div>

          <section className="px-6 py-6">
            <h2 className="mb-5 text-lg font-bold text-slate-800">
              Booking Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Booking Code</p>
                <p className="text-sm font-semibold text-slate-800">
                  {booking.booking_code || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Booking ID</p>
                <p className="break-all text-sm font-semibold text-slate-800">
                  {booking.booking_id || booking.id || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Trip Type</p>
                <p className="text-sm font-semibold text-slate-800">
                  {tripTypeLabel}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Number of Adults</p>
                <p className="text-sm font-semibold text-slate-800">
                  {booking.adults ?? 1}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Estimate Price (MMK)</p>
                <p className="text-sm font-semibold text-slate-800">
                  {getEstimatePriceMMK()}
                </p>
              </div>
            </div>
          </section>
        </div>

        {(outbound || oneWay) && (
          <FlightSection
            title={outbound ? "Outbound Flight" : "Flight"}
            data={outbound || oneWay}
          />
        )}

        {inbound && <FlightSection title="Inbound Flight" data={inbound} />}

        {!outbound && !inbound && !oneWay && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              Flight Information
            </h3>
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-700">
              No flight details found in this booking.
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <h3 className="mb-5 text-lg font-bold text-slate-800">
            Passengers
          </h3>

          {passengers.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-slate-500">
              No passengers found.
            </div>
          )}

          <div className="space-y-4">
            {passengers.map((p, idx) => {
              const fullName =
                p.full_name ||
                [p.given_name, p.last_name].filter(Boolean).join(" ") ||
                [p.givenName, p.lastName].filter(Boolean).join(" ") ||
                "-";

              return (
                <div
                  key={p.id || idx}
                  className="rounded-2xl border border-gray-100 bg-slate-50 p-5"
                >
                  <h4 className="mb-4 text-base font-bold text-slate-800">
                    Passenger {idx + 1}
                  </h4>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Full Name</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {fullName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-1">Passport Number</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.passport_number || p.passport || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-1">Gender</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.gender || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-1">Date of Birth</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatDate(p.date_of_birth || p.dob)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-1">Nationality</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.nationality || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-1">Phone Number</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.phone_number || p.phone || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              Payment & Status
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400 mb-2">Payment Status</p>
              <span
                className={
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold " +
                  paymentBadge(booking.payment_status)
                }
              >
                {booking.payment_status || "-"}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Booking Status</p>
              <span
                className={
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold " +
                  statusBadge(booking.status)
                }
              >
                {booking.status || "-"}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Booked Date</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDateTime(booking.created_at)}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <h3 className="mb-5 text-lg font-bold text-slate-800">
            Ticket File
          </h3>

          {ticketStatusLoading ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-slate-500">
              Loading ticket status...
            </div>
          ) : ticketStatus?.has_ticket ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <p className="mb-2 text-sm font-semibold text-green-700">
                  Ticket Uploaded
                </p>

                {ticketStatus?.ticket_uploaded_at && (
                  <p className="text-xs text-green-600">
                    Uploaded on{" "}
                    {formatDateTime(ticketStatus.ticket_uploaded_at)}
                  </p>
                )}
              </div>

              <button
                disabled={downloading}
                onClick={handleDownloadTicket}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? "Downloading..." : "Download Ticket"}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-700">
                No Ticket Uploaded Yet
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                The ticket file will be available once it has been uploaded by
                the airline or administrator.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}