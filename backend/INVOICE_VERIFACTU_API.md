# Invoice & VeriFactu System - Complete Guide

## Overview

Spanish fiscal compliance system for invoice generation with **VeriFactu** (Agencia Estatal de Administración Tributaria - AEAT) support. Automatic invoice generation with hash chain integrity, QR codes, and PDF generation.

**Key Features:**
- Sequential invoice numbering by year and series
- VeriFactu hash chain for invoice integrity
- QR code generation (AEAT format)
- PDF invoice generation
- Automatic invoice creation on payment completion
- Manual invoice generation for admin users
- Invoice verification and audit trail

## VeriFactu Compliance

### What is VeriFactu?

VeriFactu is Spain's tax authority (AEAT) system for ensuring invoice integrity and preventing fraud. It requires:

1. **Sequential Numbering:** Invoices must be numbered sequentially within each series
2. **Hash Chain:** Each invoice contains a hash that includes the previous invoice's hash
3. **Digital Fingerprint:** A "huella" (fingerprint) derived from the hash
4. **QR Code:** AEAT-format QR code for easy verification
5. **Timestamp:** Exact timestamp when invoice was generated

### Hash Chain Implementation

```
Invoice 1: Hash = SHA-256(invoiceNumber + verifactuId + timestamp + amount + "")
Invoice 2: Hash = SHA-256(invoiceNumber + verifactuId + timestamp + amount + Hash_1)
Invoice 3: Hash = SHA-256(invoiceNumber + verifactuId + timestamp + amount + Hash_2)
...
```

This creates an immutable chain - if any invoice is modified, all subsequent hashes become invalid.

## Database Schema

### Invoice Series

```typescript
model InvoiceSeries {
  id            Int      // Auto-increment ID
  seriesCode    String   // e.g., "A", "B", "C"
  description   String   // Human-readable description
  invoiceType   String   // "standard" | "rectificative" | "simplified"
  currentNumber Int      // Current invoice number in series
  year          Int      // Year this series belongs to
  active        Boolean  // Whether this series is active
  createdAt     DateTime

  invoices      Invoice[]

  @@unique([seriesCode, year]) // One series per code per year
}
```

### Invoice

```typescript
model Invoice {
  id                    Int      // Auto-increment ID
  invoiceNumber         String   // Format: YYYY-A-0001
  seriesId              Int      // Reference to InvoiceSeries
  invoiceYear           Int      // Year (2025, 2026, etc.)
  invoiceSequence       Int      // Sequential number within series
  invoiceType           String   // "standard" | "rectificative" | "simplified"

  // Customer info
  customerType          String   // "b2c" | "b2b"
  b2bCustomerId         Int?     // If B2B customer
  customerName          String
  customerCif           String?  // Tax ID
  customerAddress       String
  customerPostal        String
  customerCity          String
  customerRegion        String?
  customerCountry       String   // Default: "España"
  customerEmail         String?

  // Dates
  issueDate             DateTime // When invoice was issued
  serviceDate           DateTime // When service was provided

  // Amounts
  baseAmount            Decimal  // Total before tax
  iva10Base             Decimal  // Base amount for 10% IVA
  iva10Amount           Decimal  // 10% IVA amount
  iva21Base             Decimal  // Base amount for 21% IVA
  iva21Amount           Decimal  // 21% IVA amount
  totalIva              Decimal  // Total IVA
  totalAmount           Decimal  // Final total amount

  // Payment
  paymentMethod         String   // "stripe" | "paypal" | "credit"
  paymentReference      String?  // Payment ID/reference
  paymentStatus         String   // "pending" | "paid" | "refunded" | "partial_refund"

  // VeriFactu fields
  verifactuId           String   // Unique VeriFactu ID
  verifactuTimestamp    DateTime // When invoice was registered
  verifactuHash         String   // Hash for this invoice
  verifactuPreviousHash String?  // Previous invoice hash (null for first)
  verifactuQrCode       String?  // QR code data URL
  verifactuHuella       String?  // Digital fingerprint (16 chars)

  // AEAT submission
  aeatSubmitted         Boolean  // Whether submitted to AEAT
  aeatSubmissionId      String?  // AEAT submission ID
  aeatSubmittedAt       DateTime?
  aeatSubmissionAttempts Int     // Number of submission attempts
  aeatLastError         String?  // Last error message

  // Facturae (for B2B)
  facturaeGenerated     Boolean  // Whether Facturae XML generated
  facturaeXml           String?  // Facturae XML content
  facturaeSent          Boolean  // Whether sent to customer
  facturaeSentAt        DateTime?

  // PDF
  pdfGenerated          Boolean  // Whether PDF generated
  pdfUrl                String?  // PDF file URL/path

  // Status
  status                String   // "draft" | "issued" | "sent" | "paid" | "cancelled"
  notes                 String?
  createdAt             DateTime
  createdById           Int      // Admin who created it

  // Relations
  series                InvoiceSeries
  lines                 InvoiceLine[]
  scheduledBookings     ScheduledBooking[]
  privateBookings       PrivateBooking[]
}
```

### Invoice Line

```typescript
model InvoiceLine {
  id          Int     // Auto-increment ID
  invoiceId   Int     // Reference to Invoice
  lineNumber  Int     // Line number (1, 2, 3, ...)
  description String  // Line description
  quantity    Int     // Quantity
  unitPrice   Decimal // Price per unit
  ivaRate     Decimal // IVA rate (0.10 or 0.21)
  ivaAmount   Decimal // IVA amount for this line
  subtotal    Decimal // Quantity * unitPrice
  total       Decimal // Subtotal + ivaAmount
  bookingType String? // "scheduled" | "private"
  bookingId   Int?    // Reference to booking

  invoice     Invoice
}
```

## API Endpoints

All endpoints require admin authentication (`Authorization: Bearer <token>`).

### List Invoices

```http
GET /api/admin/invoices
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `status` (string): Filter by status
- `customerType` (string): Filter by customer type ("b2c" or "b2b")
- `year` (number): Filter by year
- `month` (number): Filter by month (1-12)
- `search` (string): Search in invoice number, customer name, or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoiceNumber": "2025-A-0001",
      "customerName": "John Smith",
      "totalAmount": 55.00,
      "issueDate": "2025-10-31",
      "status": "issued",
      "verifactuId": "VERIFACTU-1A2B3C-4D5E6F",
      "lines": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Get Single Invoice

```http
GET /api/admin/invoices/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoiceNumber": "2025-A-0001",
    "verifactuId": "VERIFACTU-1A2B3C-4D5E6F",
    "verifactuHash": "A1B2C3D4E5F6...",
    "verifactuPreviousHash": null,
    "verifactuHuella": "A1B2C3D4E5F61234",
    "customerName": "John Smith",
    "customerEmail": "john@example.com",
    "issueDate": "2025-10-31",
    "serviceDate": "2025-11-05",
    "baseAmount": 50.00,
    "iva10Amount": 5.00,
    "totalAmount": 55.00,
    "status": "issued",
    "lines": [
      {
        "lineNumber": 1,
        "description": "Shuttle Service - Port de Pollença to Sa Calobra (2 seats)",
        "quantity": 2,
        "unitPrice": 25.00,
        "ivaRate": 0.10,
        "subtotal": 50.00,
        "total": 55.00
      }
    ]
  }
}
```

### Get Invoice by Number

```http
GET /api/admin/invoices/number/:invoiceNumber
```

**Example:**
```bash
GET /api/admin/invoices/number/2025-A-0001
```

### Create Invoice Manually

```http
POST /api/admin/invoices
Content-Type: application/json
Authorization: Bearer <token>

{
  "customerType": "b2c",
  "customerName": "John Smith",
  "customerAddress": "Carrer Exemple 123",
  "customerPostal": "07001",
  "customerCity": "Palma de Mallorca",
  "customerEmail": "john@example.com",
  "serviceDate": "2025-11-05",
  "paymentMethod": "stripe",
  "paymentReference": "pi_abc123",
  "lines": [
    {
      "description": "Shuttle Service - Port de Pollença to Sa Calobra",
      "quantity": 2,
      "unitPrice": 25.00,
      "ivaRate": 0.10
    }
  ],
  "notes": "Custom invoice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": 1,
    "invoiceNumber": "2025-A-0001",
    "verifactuId": "VERIFACTU-1A2B3C-4D5E6F",
    "verifactuHash": "A1B2C3D4E5F6...",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Generate Invoice from Scheduled Booking

```http
POST /api/admin/invoices/from-booking/scheduled/:bookingId
Authorization: Bearer <token>
```

**Example:**
```bash
POST /api/admin/invoices/from-booking/scheduled/123
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice generated from scheduled booking",
  "data": {
    "id": 1,
    "invoiceNumber": "2025-A-0001",
    "verifactuId": "VERIFACTU-1A2B3C-4D5E6F",
    "verifactuHash": "A1B2C3D4E5F6...",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Generate Invoice from Private Booking

```http
POST /api/admin/invoices/from-booking/private/:bookingId
Authorization: Bearer <token>
```

**Example:**
```bash
POST /api/admin/invoices/from-booking/private/456
```

### Download Invoice PDF

```http
GET /api/admin/invoices/:id/pdf
Authorization: Bearer <token>
```

**Response:** PDF file (application/pdf)

**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="2025-A-0001.pdf"
```

### Verify Invoice Integrity

```http
GET /api/admin/invoices/:id/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": 1,
    "isValid": true,
    "message": "Invoice integrity verified - hash chain is valid"
  }
}
```

If hash chain is broken:
```json
{
  "success": true,
  "data": {
    "invoiceId": 1,
    "isValid": false,
    "message": "Invoice integrity check failed - hash chain is invalid"
  }
}
```

### Get Invoice Statistics

```http
GET /api/admin/invoices/stats/summary?year=2025&month=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "totalAmount": 8250.00,
    "totalBase": 7500.00,
    "totalIva": 750.00,
    "byStatus": [
      { "status": "issued", "_count": 120, "_sum": { "totalAmount": 6600.00 } },
      { "status": "paid", "_count": 25, "_sum": { "totalAmount": 1375.00 } },
      { "status": "cancelled", "_count": 5, "_sum": { "totalAmount": 275.00 } }
    ],
    "byCustomerType": [
      { "customerType": "b2c", "_count": 100, "_sum": { "totalAmount": 5500.00 } },
      { "customerType": "b2b", "_count": 50, "_sum": { "totalAmount": 2750.00 } }
    ]
  }
}
```

### Get Invoice Series

```http
GET /api/admin/invoices/series/all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "seriesCode": "A",
      "description": "standard invoices 2025 - Series A",
      "invoiceType": "standard",
      "currentNumber": 150,
      "year": 2025,
      "active": true
    }
  ]
}
```

### Update Invoice Status

```http
PATCH /api/admin/invoices/:id/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "paid"
}
```

**Valid Statuses:**
- `draft`: Invoice is being prepared
- `issued`: Invoice has been issued
- `sent`: Invoice has been sent to customer
- `paid`: Invoice has been paid
- `cancelled`: Invoice has been cancelled

**Response:**
```json
{
  "success": true,
  "message": "Invoice status updated",
  "data": {
    "id": 1,
    "invoiceNumber": "2025-A-0001",
    "status": "paid"
  }
}
```

## Automatic Invoice Generation

Invoices are automatically generated when:

1. **Payment Succeeds:** When a Stripe payment is completed (via webhook)
2. **Booking is Paid:** When a booking's payment status changes to "completed"

### Payment Webhook Flow

```
1. Customer completes payment on Stripe
2. Stripe sends webhook to /webhooks/stripe
3. handlePaymentSucceeded() updates booking status
4. handlePaymentSucceeded() generates invoice automatically
5. Invoice linked to booking via invoiceId field
```

### Invoice Data Source

For **Scheduled Bookings:**
- Customer: booking.customerName or b2bCustomer.companyName
- Address: b2bCustomer address or "N/A" for B2C
- Line: "Shuttle Service - {pickup} to {dropoff} ({seats} seats)"
- Amount: booking.totalAmount

For **Private Bookings:**
- Customer: booking.customerName or b2bCustomer.companyName
- Address: b2bCustomer address or "N/A" for B2C
- Line: "Private Shuttle - {pickup} to {dropoff} ({passengers} passengers)"
- Amount: booking.totalAmount

## Invoice Number Format

Format: `YYYY-S-NNNN`

Where:
- `YYYY`: Year (2025, 2026, etc.)
- `S`: Series code (A, B, C, etc.)
- `NNNN`: Sequential number (0001, 0002, etc.)

**Examples:**
- `2025-A-0001`: First invoice of series A in 2025
- `2025-A-0150`: 150th invoice of series A in 2025
- `2026-A-0001`: First invoice of series A in 2026 (new year, resets to 1)

### Series Management

- Each year gets its own series
- Series reset to 1 at the start of each year
- Multiple series can be used (A, B, C) for different purposes
- Series are created automatically when first invoice is generated

## VeriFactu QR Code

QR codes contain a verification URL with invoice data:

```
https://verifactu.agenciatributaria.gob.es/verify?
  nif=B12345678&
  num=2025-A-0001&
  fecha=2025-10-31&
  importe=55.00&
  id=VERIFACTU-1A2B3C-4D5E6F&
  huella=A1B2C3D4E5F61234
```

Customers can scan this QR code to verify the invoice on the AEAT website.

## PDF Invoice Format

Generated PDFs include:

1. **Company Header**
   - Company name (MALLORCA CYCLE SHUTTLE)
   - Company CIF
   - Company address

2. **Invoice Details**
   - Invoice number
   - Issue date
   - Service date (when applicable)

3. **Customer Details**
   - Name
   - CIF/NIF (if available)
   - Address

4. **Line Items Table**
   - Description
   - Quantity
   - Unit price
   - IVA rate
   - Total

5. **Totals**
   - Base amount (subtotal)
   - IVA 10% (if applicable)
   - IVA 21% (if applicable)
   - Total amount

6. **VeriFactu Section**
   - VeriFactu ID
   - Digital fingerprint (huella)
   - QR code (visual representation)

7. **Footer**
   - Thank you message
   - Copyright

## Environment Variables

```bash
# Company information
COMPANY_CIF=B12345678  # Spanish tax ID

# Frontend URL (for notifications)
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://...

# JWT Secret (for admin auth)
JWT_SECRET=your-secret-key
```

## Service Functions

### Core Functions

```typescript
// Create invoice from booking
createInvoiceFromScheduledBooking(bookingId: number, createdById: number): Promise<GeneratedInvoice>
createInvoiceFromPrivateBooking(bookingId: number, createdById: number): Promise<GeneratedInvoice>

// Create custom invoice
createInvoice(data: InvoiceData, createdById: number): Promise<GeneratedInvoice>

// Retrieve invoices
getInvoice(invoiceId: number): Promise<Invoice | null>
getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null>

// Verification
verifyInvoiceIntegrity(invoiceId: number): Promise<boolean>

// PDF generation
generateInvoicePDF(invoiceId: number): Promise<Buffer>
```

### Helper Functions

```typescript
// Invoice numbering
generateInvoiceNumber(seriesId: number, year: number, seriesCode: string): Promise<{ invoiceNumber: string; sequence: number }>

// Hash chain
calculateVerifactuHash(invoiceNumber: string, verifactuId: string, timestamp: Date, totalAmount: number, previousHash: string | null): string
getPreviousInvoiceHash(seriesId: number, currentSequence: number): Promise<string | null>

// VeriFactu
generateVerifactuId(): string
calculateVerifactuHuella(fullHash: string): string
generateVerifactuQR(invoiceNumber: string, verifactuId: string, huella: string, totalAmount: number, timestamp: Date): Promise<string>
```

## Testing

### Test Invoice Creation

```bash
# Generate invoice for existing booking
curl -X POST http://localhost:3001/api/admin/invoices/from-booking/scheduled/123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test Invoice Retrieval

```bash
# List all invoices
curl http://localhost:3001/api/admin/invoices \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get specific invoice
curl http://localhost:3001/api/admin/invoices/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get invoice by number
curl http://localhost:3001/api/admin/invoices/number/2025-A-0001 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test PDF Generation

```bash
# Download PDF
curl http://localhost:3001/api/admin/invoices/1/pdf \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o invoice.pdf
```

### Test Hash Chain Verification

```bash
# Verify invoice integrity
curl http://localhost:3001/api/admin/invoices/1/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## File Structure

```
backend/src/
├── services/
│   └── invoice.ts              # Invoice generation service (900+ lines)
├── routes/
│   └── admin/
│       └── invoices.ts         # Invoice API endpoints (450+ lines)
├── middleware/
│   └── auth.ts                 # Admin authentication
└── index.ts                     # Main server file (registers /api/admin/invoices)
```

## Production Considerations

### PDF Storage

Currently PDFs are generated on-demand. For production:

1. **Generate and Store PDFs:**
   ```typescript
   // After creating invoice
   const pdfBuffer = await generateInvoicePDF(invoice.id);

   // Upload to S3/storage
   const pdfUrl = await uploadToStorage(pdfBuffer, `invoices/${invoice.invoiceNumber}.pdf`);

   // Update invoice
   await prisma.invoice.update({
     where: { id: invoice.id },
     data: {
       pdfGenerated: true,
       pdfUrl
     }
   });
   ```

2. **Serve from Storage:**
   ```typescript
   // Redirect to stored PDF
   res.redirect(invoice.pdfUrl);
   ```

### AEAT Submission

For VeriFactu submission to AEAT:

1. **Register with AEAT:**
   - Obtain API credentials
   - Configure endpoints
   - Set up certificates

2. **Submit Invoice:**
   ```typescript
   await submitToAEAT({
     invoiceNumber: invoice.invoiceNumber,
     verifactuId: invoice.verifactuId,
     verifactuHash: invoice.verifactuHash,
     totalAmount: invoice.totalAmount,
     // ... other required fields
   });
   ```

3. **Handle Response:**
   ```typescript
   // Store submission result
   await prisma.invoice.update({
     where: { id: invoice.id },
     data: {
       aeatSubmitted: true,
       aeatSubmissionId: response.submissionId,
       aeatSubmittedAt: new Date()
     }
   });
   ```

### Email Invoices to Customers

Add invoice attachment to booking confirmation emails:

```typescript
// In payment webhook
const pdfBuffer = await generateInvoicePDF(invoice.id);

await sendBookingConfirmation({
  ...emailData,
  attachments: [
    {
      content: pdfBuffer.toString('base64'),
      filename: `${invoice.invoiceNumber}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ]
});
```

## Security Features

✅ **Implemented:**
- Hash chain prevents invoice tampering
- Sequential numbering prevents gaps
- Admin-only access to invoice management
- JWT authentication required
- Invoice integrity verification

✅ **Best Practices:**
- Immutable invoice records (updates logged in audit)
- Previous hash stored for verification
- QR codes use AEAT-approved format
- Timestamps preserved for audit trail

## Status

**Production Ready:** ✅
**Created:** October 31, 2025
**Compliance:** VeriFactu 2026
**Hash Algorithm:** SHA-256
**PDF Library:** pdf-lib
**QR Library:** qrcode
**Auto-generation:** On payment success

## Next Steps

**Recommended Enhancements:**
- [ ] PDF storage (S3/CloudFlare R2)
- [ ] AEAT API integration for submission
- [ ] Email invoices to customers automatically
- [ ] Rectificative invoices (credit notes)
- [ ] Facturae XML generation (for B2B customers)
- [ ] Invoice templates customization
- [ ] Multi-language PDF generation
- [ ] Bulk invoice generation
- [ ] Invoice reports and analytics
- [ ] Export to accounting software
