# Production-ready booking domain

## Bounded contexts

### Catalog
- `movies`
- `cinema_brands`
- `cities`
- `cinemas`
- `screening_rooms`
- `seats`
- `concession_items`
- `combos`
- `combo_items`

### Inventory
- `showtimes`
- `showtime_seats`

### Ordering
- `bookings`
- `booking_items`
- `booking_status_history`
- `tickets`

### Promotion
- `promotions`
- `promotion_redemptions`

### Payment
- `payments`
- `payment_attempts`

## Core booking flow

1. Client requests available seats from `showtime_seats`.
2. Client creates a booking with:
   - `showtime_id`
   - `showtime_seat_ids`
   - optional `combo_items`
   - optional `promotion_code`
   - required `idempotency_key`
3. Backend calculates prices server-side, creates:
   - one `bookings` row
   - multiple `booking_items`
   - optional `promotion_redemptions`
   - one `booking_status_history` row
4. Selected `showtime_seats` become `held` for a short period.
5. Payment is initiated and stored in `payments` + `payment_attempts`.
6. On successful payment:
   - held seats become `booked`
   - `tickets` are generated
   - booking becomes `confirmed`
   - status history is appended

## Design notes

- `showtime_seats` is the source of truth for seat availability per showtime.
- `booking_items` is the source of truth for commercial line items.
- `tickets` is a fulfillment artifact, created only after confirmation.
- `payment_attempts` stores retries and provider-level payment history.
- `promotion_redemptions` prevents invisible business logic in frontend code.
- `idempotency_key` protects against duplicate booking creation on retries.

## Migration order

1. Apply `001_optimize_booking_schema.sql`
2. Apply `002_production_ready_booking_domain.sql`

## Remaining production hardening

- schedule `yarn expire-holds` to release stale holds automatically
- background reconciliation for payment provider callbacks
- stricter authorization policy for admin-only endpoints
- audit logging for destructive admin actions
- database backup and migration rollout strategy
