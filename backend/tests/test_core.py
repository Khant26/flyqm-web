import os
import unittest

from jose import JWTError
from pydantic import ValidationError

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "unit-test-secret-key")
os.environ.setdefault("TICKET_API_KEY", "unit-test-api-key")

from app.auth.security import get_password_hash, verify_password
from app.auth.tokens import create_access_token, decode_access_token
from app.models.exchange_rate import ExchangeRate
from app.models.flight_override import FlightOverride
from app.schemas.auth import CustomerSignupIn, LoginIn
from app.services.pricing_engine import (
    apply_pricing_logic,
    apply_round_trip_pricing_logic,
)


class FakeQuery:
    def __init__(self, result):
        self.result = result

    def filter(self, *_criteria):
        return self

    def first(self):
        return self.result


class FakeDatabase:
    def __init__(self, exchange_rate=None, override=None):
        self.exchange_rate = exchange_rate
        self.override = override

    def query(self, model):
        if model is ExchangeRate:
            return FakeQuery(self.exchange_rate)
        if model is FlightOverride:
            return FakeQuery(self.override)
        raise AssertionError(f"Unexpected model query: {model}")


class AuthenticationTests(unittest.TestCase):
    def test_password_hash_round_trip(self):
        password_hash = get_password_hash("correct horse battery staple")

        self.assertNotEqual(password_hash, "correct horse battery staple")
        self.assertTrue(verify_password("correct horse battery staple", password_hash))
        self.assertFalse(verify_password("wrong password", password_hash))

    def test_access_token_round_trip(self):
        token = create_access_token("customer-123", "CUSTOMER", expires_minutes=5)
        payload = decode_access_token(token)

        self.assertEqual(payload["sub"], "customer-123")
        self.assertEqual(payload["role"], "CUSTOMER")
        self.assertIn("exp", payload)

    def test_tampered_access_token_is_rejected(self):
        token = create_access_token("customer-123", "CUSTOMER")

        with self.assertRaises(JWTError):
            decode_access_token(token + "tampered")


class AuthenticationSchemaTests(unittest.TestCase):
    def test_signup_normalizes_email(self):
        payload = CustomerSignupIn(
            email="  Person@Example.COM ",
            password="safe-password",
            full_name="Test Person",
            phone="0912345678",
        )

        self.assertEqual(payload.email, "person@example.com")

    def test_invalid_login_email_is_rejected(self):
        with self.assertRaises(ValidationError):
            LoginIn(email="not-an-email", password="safe-password")

    def test_passwords_over_72_bytes_are_rejected(self):
        with self.assertRaises(ValidationError):
            LoginIn(email="person@example.com", password="x" * 73)


class PricingEngineTests(unittest.TestCase):
    @staticmethod
    def flight():
        return {
            "base_price_usd": 100.0,
            "airline_code": "FQ",
            "flight_number": "101",
            "departure_time": "2026-10-01T08:30:00",
        }

    def test_one_way_price_applies_markup_passengers_and_exchange_rate(self):
        db = FakeDatabase(exchange_rate=type("Rate", (), {"usd_to_mmk": 3500})())

        result = apply_pricing_logic(db, [self.flight()], adults=2)[0]

        self.assertEqual(result["final_price_usd"], 230.0)
        self.assertEqual(result["final_price_mmk"], 805000.0)
        self.assertEqual(result["price_estimate_min_usd"], 207.0)
        self.assertEqual(result["price_estimate_max_usd"], 253.0)
        self.assertTrue(result["requires_admin_confirmation"])

    def test_override_can_raise_but_not_lower_system_price(self):
        rate = type("Rate", (), {"usd_to_mmk": 3500})()
        high_override = type("Override", (), {"override_price_usd": 140.0})()
        low_override = type("Override", (), {"override_price_usd": 90.0})()

        high = apply_pricing_logic(
            FakeDatabase(exchange_rate=rate, override=high_override),
            [self.flight()],
        )[0]
        low = apply_pricing_logic(
            FakeDatabase(exchange_rate=rate, override=low_override),
            [self.flight()],
        )[0]

        self.assertEqual(high["final_price_usd"], 140.0)
        self.assertEqual(low["final_price_usd"], 115.0)

    def test_round_trip_price_applies_markup_and_exchange_rate(self):
        db = FakeDatabase(exchange_rate=type("Rate", (), {"usd_to_mmk": 3500})())
        bundle = {
            "bundle_key": "outbound-inbound",
            "base_price_usd": 200.0,
            "outbound": {"flight_number": "101"},
            "inbound": {"flight_number": "102"},
        }

        result = apply_round_trip_pricing_logic(db, [bundle], adults=2)[0]

        self.assertEqual(result["final_price_usd"], 460.0)
        self.assertEqual(result["final_price_mmk"], 1610000.0)

    def test_missing_exchange_rate_fails_explicitly(self):
        with self.assertRaisesRegex(Exception, "Exchange rate not configured"):
            apply_pricing_logic(FakeDatabase(), [self.flight()])


if __name__ == "__main__":
    unittest.main()
