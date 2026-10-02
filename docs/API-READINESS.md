# Maldives.org API readiness plan

The current product is deliberately usable before supplier credentials are added. All visible listings are labelled as sample inventory, and the new booking flow is a request preview rather than a live reservation.

## Integration map

| Website surface | Planned source | Adapter output |
| --- | --- | --- |
| Stay search and availability | Hotelbeds Hotel API | `TravelOffer` with dates, room/board data, price and cancellation rules |
| Experiences and activities | Viator Affiliate API | `TravelOffer` with product, schedule, price, photos and partner hand-off |
| Guesthouses, speedboats and local routes | Direct Maldives partners | `TravelOffer` with request status, confirmation notes and local contact |
| User account and saved trips | Supabase | profiles, favourites, enquiries and future booking references |

## What is built now

- A vendor-neutral `TravelOffer` and `BookingDraft` contract in `lib/api-contracts.ts`.
- Source badges and availability notices so sample, hotel, experience and direct inventory can be distinguished.
- A responsive request flow at `/booking` and a confirmation explanation at `/booking/confirmation`.
- A trust page at `/how-it-works` and an affiliate disclosure template at `/affiliate-disclosure`.
- Stay sorting, source labelling and booking-flow entry points from stay and experience detail pages.
- Server-only Hotelbeds signature, status and availability adapters under `lib/hotelbeds.ts` and `/api/hotelbeds/*`.
- Environment placeholders for Hotelbeds and Viator without storing credentials in the repository.
- Server-side booking request, contact enquiry and newsletter endpoints with preview fallback when Supabase is not configured.
- Stripe Checkout and webhook endpoints that remain disabled until secret keys and a confirmed booking amount are available.
- Viator product details adapter at `/api/viator/products/[code]` using the Partner API authentication contract.
- Hotelbeds workflow endpoints at `/api/hotelbeds/checkrate` and `/api/hotelbeds/booking`, with mTLS and booking-mode safety guards.
- Hotelbeds rate cards now carry room, board, cancellation and supplier-currency details into a dedicated booking flow and voucher route.

## Recommended implementation order after credentials

1. Add Hotelbeds Maldives hotel codes from the Content API to `HOTELBEDS_MALDIVES_HOTEL_CODES`.
2. Add server-side signature handling and short-lived caching. Never expose supplier secrets to the browser.
3. Expand the live stay result adapter into the existing directory filters and booking offer contract.
4. Add date-aware availability checks and a final-price review before any payment or affiliate redirect.
5. Run the Hotelbeds CheckRate → Booking certification flow after mTLS credentials and approval are supplied.
6. Add booking webhooks/reconciliation and store only the minimum booking reference needed in Supabase.
7. Update the disclosure, cancellation, tax and support copy with the client's legal entity and signed supplier terms.

For beginner setup instructions, see [BEGINNER-SETUP.md](BEGINNER-SETUP.md).

## Important launch rule

The UI should only use labels such as “available” or “book now” after a supplier response has been checked for the traveller's dates. Until then, use “sample inventory”, “on request” or “availability to be confirmed”.
