# B2B Customer Management API

This document describes the B2B (Business-to-Business) Customer Management endpoints for the Mallorca Cycle Shuttle booking system.

## Overview

The B2B Customer Management system allows you to:
- Manage business customers (travel agencies, hotels, tour operators)
- Track credit limits and balances
- Apply automatic discounts
- Handle bulk booking uploads via CSV
- Manage payment terms (prepaid, net7, net15, net30)
- Track customer statistics and activity

**Base URL:** `http://localhost:3001/api/admin/b2b-customers`

**Authentication:** All endpoints require admin authentication via JWT token in the `Authorization` header.

---

## Table of Contents

1. [Customer Types](#customer-types)
2. [Payment Terms](#payment-terms)
3. [Endpoints](#endpoints)
   - [List B2B Customers](#1-list-b2b-customers)
   - [Get Single Customer](#2-get-single-customer)
   - [Create Customer](#3-create-customer)
   - [Update Customer](#4-update-customer)
   - [Delete/Deactivate Customer](#5-deletedeleteactivate-customer)
   - [Get Customer Statistics](#6-get-customer-statistics)
   - [Update Customer Balance](#7-update-customer-balance)
   - [Get Customer Types Summary](#8-get-customer-types-summary)
   - [Validate Bulk Booking CSV](#9-validate-bulk-booking-csv)
   - [Create Bulk Bookings](#10-create-bulk-bookings)
4. [CSV Bulk Booking Format](#csv-bulk-booking-format)
5. [Error Handling](#error-handling)

---

## Customer Types

B2B customers can be categorized into different types:

- `travel_agency` - Travel agencies
- `hotel` - Hotels and accommodation providers
- `tour_operator` - Tour operators
- `corporate` - Corporate clients
- `other` - Other business types

---

## Payment Terms

Payment terms define how and when customers pay for bookings:

- `prepaid` - Customer pays upfront before service (no credit)
- `net7` - Payment due within 7 days after service
- `net15` - Payment due within 15 days after service
- `net30` - Payment due within 30 days after service

Credit limits are enforced for non-prepaid payment terms.

---

## Endpoints

### 1. List B2B Customers

Get a paginated list of B2B customers with optional filtering.

**Endpoint:** `GET /api/admin/b2b-customers`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)
- `search` (optional) - Search in company name, CIF, contact name, email
- `customerType` (optional) - Filter by customer type
- `active` (optional) - Filter by active status (`true` or `false`)
- `paymentTerms` (optional) - Filter by payment terms

**Request Example:**
```bash
curl -X GET "http://localhost:3001/api/admin/b2b-customers?page=1&limit=20&customerType=travel_agency&active=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 1,
        "companyName": "Mallorca Travel Solutions",
        "companyCif": "B12345678",
        "companyAddress": "Calle Mayor 123",
        "companyPostal": "07001",
        "companyCity": "Palma de Mallorca",
        "contactName": "Maria Garcia",
        "contactEmail": "maria@mallorcatravel.com",
        "contactPhone": "+34612345678",
        "customerType": "travel_agency",
        "paymentTerms": "net15",
        "creditLimit": "5000.00",
        "currentBalance": "1250.50",
        "facturaeEnabled": true,
        "discountPercentage": "15.00",
        "active": true,
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-20T14:22:00.000Z",
        "_count": {
          "scheduledBookings": 45,
          "privateBookings": 12,
          "invoices": 38
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

---

### 2. Get Single Customer

Retrieve detailed information about a specific B2B customer, including their recent bookings and invoices.

**Endpoint:** `GET /api/admin/b2b-customers/:id`

**Path Parameters:**
- `id` (required) - Customer ID

**Request Example:**
```bash
curl -X GET "http://localhost:3001/api/admin/b2b-customers/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "companyName": "Mallorca Travel Solutions",
    "companyCif": "B12345678",
    "companyAddress": "Calle Mayor 123",
    "companyPostal": "07001",
    "companyCity": "Palma de Mallorca",
    "contactName": "Maria Garcia",
    "contactEmail": "maria@mallorcatravel.com",
    "contactPhone": "+34612345678",
    "customerType": "travel_agency",
    "paymentTerms": "net15",
    "creditLimit": "5000.00",
    "currentBalance": "1250.50",
    "facturaeEnabled": true,
    "discountPercentage": "15.00",
    "active": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T14:22:00.000Z",
    "scheduledBookings": [
      {
        "id": 100,
        "bookingReference": "MCS-20250125-ABC1",
        "serviceDate": "2025-01-25T08:00:00.000Z",
        "seatsBooked": 4,
        "totalAmount": "102.00",
        "paymentStatus": "pending",
        "status": "confirmed"
      }
    ],
    "privateBookings": [],
    "invoices": [
      {
        "id": 50,
        "invoiceNumber": "2025-A-0050",
        "totalAmount": "95.20",
        "status": "paid",
        "createdAt": "2025-01-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Create Customer

Create a new B2B customer.

**Endpoint:** `POST /api/admin/b2b-customers`

**Request Body:**
```json
{
  "companyName": "Bike Tours Mallorca",
  "companyCif": "B98765432",
  "companyAddress": "Paseo Maritimo 45",
  "companyPostal": "07014",
  "companyCity": "Palma de Mallorca",
  "contactName": "John Smith",
  "contactEmail": "john@biketours.com",
  "contactPhone": "+34698765432",
  "customerType": "tour_operator",
  "paymentTerms": "net30",
  "creditLimit": 10000,
  "discountPercentage": 20,
  "facturaeEnabled": true
}
```

**Field Descriptions:**
- `companyName` (required) - Company name
- `companyCif` (required) - Spanish company tax ID (CIF/NIF)
- `companyAddress` (required) - Company address
- `companyPostal` (required) - Postal code
- `companyCity` (required) - City
- `contactName` (required) - Primary contact person name
- `contactEmail` (required) - Contact email
- `contactPhone` (required) - Contact phone
- `customerType` (optional) - Customer type (default: `other`)
- `paymentTerms` (optional) - Payment terms (default: `prepaid`)
- `creditLimit` (optional) - Credit limit in euros (default: 0)
- `discountPercentage` (optional) - Discount percentage 0-100 (default: 0)
- `facturaeEnabled` (optional) - Enable Facturae XML invoices (default: true)

**Response Example:**
```json
{
  "success": true,
  "message": "B2B customer created successfully",
  "data": {
    "id": 2,
    "companyName": "Bike Tours Mallorca",
    "companyCif": "B98765432",
    "active": true,
    "currentBalance": "0.00",
    "createdAt": "2025-01-25T15:30:00.000Z"
  }
}
```

---

### 4. Update Customer

Update an existing B2B customer's information.

**Endpoint:** `PUT /api/admin/b2b-customers/:id`

**Path Parameters:**
- `id` (required) - Customer ID

**Request Body:** (all fields optional)
```json
{
  "contactName": "Jane Smith",
  "contactEmail": "jane@biketours.com",
  "contactPhone": "+34698765433",
  "creditLimit": 15000,
  "discountPercentage": 25,
  "active": true
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "B2B customer updated successfully",
  "data": {
    "id": 2,
    "companyName": "Bike Tours Mallorca",
    "contactName": "Jane Smith",
    "creditLimit": "15000.00",
    "discountPercentage": "25.00",
    "updatedAt": "2025-01-25T16:00:00.000Z"
  }
}
```

---

### 5. Delete/Deactivate Customer

Delete or deactivate a B2B customer. If the customer has existing bookings or invoices, they will be deactivated (soft delete). Otherwise, they will be permanently deleted (hard delete).

**Endpoint:** `DELETE /api/admin/b2b-customers/:id`

**Path Parameters:**
- `id` (required) - Customer ID

**Request Example:**
```bash
curl -X DELETE "http://localhost:3001/api/admin/b2b-customers/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example (Soft Delete - has data):**
```json
{
  "success": true,
  "message": "B2B customer deactivated (has existing bookings/invoices)",
  "data": {
    "id": 2,
    "active": false
  }
}
```

**Response Example (Hard Delete - no data):**
```json
{
  "success": true,
  "message": "B2B customer deleted successfully",
  "data": {
    "id": 2
  }
}
```

---

### 6. Get Customer Statistics

Get detailed statistics for a specific B2B customer.

**Endpoint:** `GET /api/admin/b2b-customers/:id/stats`

**Path Parameters:**
- `id` (required) - Customer ID

**Request Example:**
```bash
curl -X GET "http://localhost:3001/api/admin/b2b-customers/1/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "customerId": 1,
    "companyName": "Mallorca Travel Solutions",
    "bookings": {
      "total": 57,
      "scheduled": 45,
      "private": 12,
      "confirmed": 50,
      "cancelled": 5,
      "completed": 40
    },
    "revenue": {
      "total": "4850.75",
      "paid": "3600.25",
      "pending": "1250.50"
    },
    "invoices": {
      "total": 38,
      "paid": 30,
      "pending": 6,
      "overdue": 2
    },
    "credit": {
      "limit": "5000.00",
      "currentBalance": "1250.50",
      "availableCredit": "3749.50",
      "utilizationPercentage": 25.01
    },
    "activity": {
      "firstBooking": "2024-06-15T10:00:00.000Z",
      "lastBooking": "2025-01-20T14:00:00.000Z",
      "totalSeatsBooked": 215
    }
  }
}
```

---

### 7. Update Customer Balance

Manually adjust a customer's balance (for payments or corrections).

**Endpoint:** `POST /api/admin/b2b-customers/:id/balance`

**Path Parameters:**
- `id` (required) - Customer ID

**Request Body:**
```json
{
  "amount": -500.50,
  "notes": "Payment received via bank transfer"
}
```

**Field Descriptions:**
- `amount` (required) - Amount to add/subtract (negative for payment, positive for charge)
- `notes` (optional) - Notes describing the balance adjustment

**Request Example:**
```bash
curl -X POST "http://localhost:3001/api/admin/b2b-customers/1/balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -500.50,
    "notes": "Payment received via bank transfer"
  }'
```

**Response Example:**
```json
{
  "success": true,
  "message": "Balance updated successfully",
  "data": {
    "customerId": 1,
    "previousBalance": "1250.50",
    "adjustment": "-500.50",
    "newBalance": "750.00",
    "availableCredit": "4250.00"
  }
}
```

---

### 8. Get Customer Types Summary

Get a summary of B2B customers grouped by type.

**Endpoint:** `GET /api/admin/b2b-customers/summary/types`

**Request Example:**
```bash
curl -X GET "http://localhost:3001/api/admin/b2b-customers/summary/types" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "byType": [
      {
        "customerType": "travel_agency",
        "count": 12,
        "totalRevenue": "15450.75"
      },
      {
        "customerType": "hotel",
        "count": 8,
        "totalRevenue": "8920.50"
      },
      {
        "customerType": "tour_operator",
        "count": 5,
        "totalRevenue": "12500.00"
      }
    ],
    "totals": {
      "totalCustomers": 25,
      "activeCustomers": 22,
      "inactiveCustomers": 3,
      "totalRevenue": "36871.25"
    }
  }
}
```

---

### 9. Validate Bulk Booking CSV

Validate a CSV file for bulk booking upload before creating the bookings. This allows you to check for errors and see a summary without committing the bookings.

**Endpoint:** `POST /api/admin/b2b-customers/:id/bulk-bookings/validate`

**Path Parameters:**
- `id` (required) - Customer ID

**Request Body:**
```json
{
  "csvContent": "serviceDate,pickupLocation,seats,bikes,customerName,customerEmail,customerPhone,customerLanguage,ticketType,notes\n2025-02-15,Port de Pollença,2,2,John Smith,john@example.com,+34612345678,en,flexi,VIP client\n2025-02-16,Port d'Alcúdia,4,4,Maria Garcia,maria@example.com,+34698765432,es,standard,Group booking"
}
```

**Alternative Request (with pre-parsed rows):**
```json
{
  "rows": [
    {
      "serviceDate": "2025-02-15",
      "pickupLocation": "Port de Pollença",
      "seats": 2,
      "bikes": 2,
      "customerName": "John Smith",
      "customerEmail": "john@example.com",
      "customerPhone": "+34612345678",
      "customerLanguage": "en",
      "ticketType": "flexi",
      "notes": "VIP client"
    }
  ]
}
```

**Response Example (Valid):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      "Estimated cost (€85.00) may exceed available credit (€50.00)"
    ],
    "summary": {
      "totalBookings": 2,
      "totalSeats": 6,
      "estimatedCost": 85.00,
      "servicesDates": ["2025-02-15", "2025-02-16"]
    }
  }
}
```

**Response Example (Invalid):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      "Row 2: Service date is required",
      "Row 3: Customer email is required"
    ],
    "warnings": [],
    "summary": {
      "totalBookings": 5,
      "totalSeats": 15,
      "estimatedCost": 212.50,
      "servicesDates": ["2025-02-15", "2025-02-16"]
    }
  }
}
```

---

### 10. Create Bulk Bookings

Create multiple bookings from a CSV file.

**Endpoint:** `POST /api/admin/b2b-customers/:id/bulk-bookings`

**Path Parameters:**
- `id` (required) - Customer ID

**Request Body:**
```json
{
  "csvContent": "serviceDate,pickupLocation,seats,bikes,customerName,customerEmail,customerPhone,customerLanguage,ticketType,notes\n2025-02-15,Port de Pollença,2,2,John Smith,john@example.com,+34612345678,en,flexi,VIP client\n2025-02-16,Port d'Alcúdia,4,4,Maria Garcia,maria@example.com,+34698765432,es,standard,Group booking"
}
```

**Response Example (Success):**
```json
{
  "success": true,
  "message": "Created 2 of 2 bookings",
  "data": {
    "success": true,
    "processed": 2,
    "created": 2,
    "failed": 0,
    "errors": [],
    "bookings": [
      {
        "bookingReference": "MCS-20250215-XYZ1",
        "serviceDate": "2025-02-15",
        "seats": 2,
        "totalAmount": 42.50
      },
      {
        "bookingReference": "MCS-20250216-ABC2",
        "serviceDate": "2025-02-16",
        "seats": 4,
        "totalAmount": 85.00
      }
    ]
  }
}
```

**Response Example (Partial Failure):**
```json
{
  "success": false,
  "message": "Created 1 of 2 bookings",
  "data": {
    "success": false,
    "processed": 2,
    "created": 1,
    "failed": 1,
    "errors": [
      {
        "row": 3,
        "data": {
          "serviceDate": "2025-02-20",
          "pickupLocation": "Invalid Location",
          "seats": 2
        },
        "error": "Pickup location \"Invalid Location\" not valid for this service"
      }
    ],
    "bookings": [
      {
        "bookingReference": "MCS-20250215-XYZ1",
        "serviceDate": "2025-02-15",
        "seats": 2,
        "totalAmount": 42.50
      }
    ]
  }
}
```

---

## CSV Bulk Booking Format

### Required Columns

- `serviceDate` - Service date in YYYY-MM-DD format
- `pickupLocation` - Pickup location name (must match existing route)
- `seats` - Number of seats (integer, minimum 1)
- `customerName` - Passenger name
- `customerEmail` - Passenger email
- `customerPhone` - Passenger phone

### Optional Columns

- `bikes` - Number of bikes (default: 0)
- `customerLanguage` - Language code: en, de, es, fr, ca, it, nl (default: en)
- `ticketType` - Ticket type: standard or flexi (default: standard)
- `notes` - Additional notes for the booking

### CSV Example

```csv
serviceDate,pickupLocation,seats,bikes,customerName,customerEmail,customerPhone,customerLanguage,ticketType,notes
2025-02-15,Port de Pollença,2,2,John Smith,john@example.com,+34612345678,en,flexi,VIP client
2025-02-15,Port d'Alcúdia,4,4,Maria Garcia,maria@example.com,+34698765432,es,standard,Group booking
2025-02-16,Cala Ratjada,3,3,Hans Mueller,hans@example.com,+34611223344,de,flexi,
2025-02-17,Port de Pollença,1,1,Sophie Dubois,sophie@example.com,+34655443322,fr,standard,Special dietary needs
```

### Bulk Booking Rules

1. **Discount Applied:** B2B customer discount is automatically applied to all bookings
2. **Credit Check:** For non-prepaid customers, total cost must not exceed available credit
3. **Service Availability:** Service must exist and be active for the specified date
4. **Seat Availability:** Sufficient seats must be available on the service
5. **Payment Status:**
   - Prepaid customers: Marked as "completed" immediately
   - Credit customers: Marked as "pending", balance increases
6. **Atomic Operations:** Each booking is created in a transaction - if it fails, seats/balance are not affected

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error description"
}
```

### Common Error Codes

- `400 Bad Request` - Invalid input data or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Customer not found
- `500 Internal Server Error` - Server error

### Validation Errors

**Missing Required Fields:**
```json
{
  "success": false,
  "error": "Missing required fields: companyName, companyCif"
}
```

**Invalid Customer Type:**
```json
{
  "success": false,
  "error": "Invalid customer type. Must be one of: travel_agency, hotel, tour_operator, corporate, other"
}
```

**Duplicate CIF:**
```json
{
  "success": false,
  "error": "A customer with this CIF already exists"
}
```

**Credit Limit Exceeded:**
```json
{
  "success": false,
  "error": "Exceeds available credit (need €500.00, available €250.00)"
}
```

**CSV Validation Errors:**
```json
{
  "success": false,
  "error": "CSV must have at least a header row and one data row"
}
```

```json
{
  "success": false,
  "error": "Missing required columns: servicedate, pickuplocation"
}
```

---

## Usage Examples

### Complete Workflow: Create Customer and Upload Bookings

#### Step 1: Create B2B Customer

```bash
curl -X POST "http://localhost:3001/api/admin/b2b-customers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Island Bike Adventures",
    "companyCif": "B11223344",
    "companyAddress": "Avenida Joan Miró 200",
    "companyPostal": "07015",
    "companyCity": "Palma",
    "contactName": "Carlos Ruiz",
    "contactEmail": "carlos@islandbike.com",
    "contactPhone": "+34677889900",
    "customerType": "tour_operator",
    "paymentTerms": "net15",
    "creditLimit": 8000,
    "discountPercentage": 18
  }'
```

#### Step 2: Validate CSV Upload

```bash
curl -X POST "http://localhost:3001/api/admin/b2b-customers/3/bulk-bookings/validate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "csvContent": "serviceDate,pickupLocation,seats,bikes,customerName,customerEmail,customerPhone\n2025-03-01,Port de Pollença,6,6,Group A,groupa@example.com,+34600000001\n2025-03-02,Port d'\''Alcúdia,8,8,Group B,groupb@example.com,+34600000002"
  }'
```

#### Step 3: Create Bulk Bookings

```bash
curl -X POST "http://localhost:3001/api/admin/b2b-customers/3/bulk-bookings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "csvContent": "serviceDate,pickupLocation,seats,bikes,customerName,customerEmail,customerPhone\n2025-03-01,Port de Pollença,6,6,Group A,groupa@example.com,+34600000001\n2025-03-02,Port d'\''Alcúdia,8,8,Group B,groupb@example.com,+34600000002"
  }'
```

#### Step 4: Check Customer Statistics

```bash
curl -X GET "http://localhost:3001/api/admin/b2b-customers/3/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 5: Record Payment

```bash
curl -X POST "http://localhost:3001/api/admin/b2b-customers/3/balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -250.00,
    "notes": "Bank transfer received - Ref: 2025030112345"
  }'
```

---

## Integration Notes

### Automatic Discount Application

When creating bookings for B2B customers (either manually or via bulk upload), the system automatically:

1. Applies the customer's discount percentage to the ticket price
2. Calculates IVA on the discounted price
3. Records the discount in the `discountApplied` field of the booking

**Example:**
- Standard ticket price: €25.00
- B2B customer discount: 20%
- Discounted price: €20.00 (€5.00 saved)
- IVA (10%): €2.00
- Final price: €22.00

### Credit Limit Management

For customers with non-prepaid payment terms:

1. **Before Booking:** System checks available credit (creditLimit - currentBalance)
2. **On Booking Creation:** Balance increases by booking total
3. **On Payment:** Use balance update endpoint with negative amount to record payment
4. **Balance Tracking:** All bookings and invoices affect the current balance

**Credit Check Formula:**
```
Available Credit = Credit Limit - Current Balance
```

If booking total > available credit, booking is rejected.

### Facturae Integration

Customers with `facturaeEnabled: true` will receive invoices in XML format compatible with Spanish e-invoicing systems (Facturae 3.2).

---

## Best Practices

1. **Always Validate First:** Use the validate endpoint before bulk uploads to catch errors early
2. **Monitor Credit Limits:** Regularly check customer balances and credit utilization
3. **Use Soft Delete:** Deactivate customers instead of deleting to preserve historical data
4. **Track Payment Notes:** Include reference numbers when recording payments for audit trail
5. **Set Appropriate Discounts:** Consider volume, loyalty, and market rates when setting discounts
6. **Review Statistics:** Use customer stats to identify high-value clients and usage patterns

---

## Related Documentation

- [Bookings API](./BOOKINGS_API.md) - Booking management endpoints
- [Invoice API](./INVOICE_VERIFACTU_API.md) - Invoice generation and VeriFactu compliance
- [Dashboard API](./DASHBOARD_API.md) - Analytics and statistics

---

## Support

For technical support or questions about the B2B API, please contact the development team or refer to the main API documentation.
