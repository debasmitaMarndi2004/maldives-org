# Maldives.org API readiness

The app runs without live booking integrations. Property information comes from the editorial catalog, while sample prices and currency conversions are estimates.

## Available contracts

| Surface | Current implementation |
| --- | --- |
| Stays and activities | Editorial search and detail pages. `TravelOffer` and `BookingDraft` in `lib/api-contracts.ts` define common supplier-facing fields for a future adapter. |
| Booking requests | `POST /api/booking-requests` validates test details and returns a preview reference. |
| Contact and newsletter | `POST /api/inquiries` and `POST /api/newsletter` validate test details and return preview status. |
| Display currency | `GET /api/currency/rates` returns locally maintained planning estimates. |

## Adding a booking provider

Confirm the approved products and markets, how payment is collected, who holds the merchant role, and how completed and refunded bookings affect partner payouts. Use sandbox credentials and the provider's certified checkout components. Confirm live availability, total price, transfer fees and cancellation terms before enabling a booking action. Verify confirmation, servicing and reconciliation in sandbox before production.
