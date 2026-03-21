# TippyTix - Event Ticketing Platform

## Tech Stack
- **Next.js 16** with App Router (JavaScript, not TypeScript)
- **Tailwind CSS v4** via @tailwindcss/postcss (no tailwind.config file)
- **Shadcn UI** (new-york style, JSX not TSX, CSS variables)
- **MongoDB** via Mongoose (database: tippytix)
- **NextAuth v5** (beta.30) with JWT strategy
- **Stripe** for payments (Connected Accounts for organizer payouts)
- **Brevo SMTP** for transactional emails
- **Lucide React** for icons

## Key Patterns

### Authentication
- Use `auth()` from `@/lib/auth` to get session
- Protected routes check `session?.user`
- Google OAuth + Email magic links via Nodemailer
- Dev magic links stored to `.dev-magic-link.json`

### Database
- Always call `await connectDB()` from `@/lib/mongodb` before any DB operations
- Models: User, Account, VerificationToken, Event, Order, Ticket

### API Routes
- All use `NextResponse` from `next/server`
- Protected routes call `auth()` and check session
- Stripe webhook at `/api/stripe/webhook`

### Fees
- Platform fee: 5% of ticket price + $1/ticket flat fee
- Refund handling fee: $2 per refund
- Fee calculations in `lib/fees.js`

### QR Codes
- Server-side: `generateQRCodeDataUrl()` from `lib/qr.js`
- Client-side with logo: `generateQRCodeWithLogo()` from `lib/qr.js`
- Each ticket has a unique `qrCode` field (UUID)

### Email
- Ticket confirmation with inline QR code images via `lib/email.js`
- All tickets for an order sent in one email
- Refund confirmation emails

### Shadcn Components
- Don't edit files in `components/ui/` directly
- Override styles via `globals.css` with `[data-slot="..."]` selectors

## Path Aliases (jsconfig.json)
```
@/components → components/
@/lib → lib/
@/hooks → hooks/
@/ui → components/ui/
@/utils → lib/utils
```

## Dev Server
- Runs on port 3001 (to avoid conflict with tippy on 3000)
- MongoDB: mongodb://localhost:27017/tippytix

## Key Flows
1. **Ticket Purchase**: Customer selects tickets → enters details → Stripe payment → webhook creates order/tickets → email with QR codes
2. **Check-in**: Organizer scans QR → `/api/tickets/[id]/scan` verifies → marks as used → warns if already scanned
3. **Refund**: Customer requests → checks refund policy tiers → Stripe refund → updates order/tickets → restores sold counts → email confirmation
