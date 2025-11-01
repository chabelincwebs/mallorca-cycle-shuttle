import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const prisma = new PrismaClient();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface InvoiceData {
  customerType: 'b2c' | 'b2b';
  b2bCustomerId?: number;
  customerName: string;
  customerCif?: string;
  customerAddress: string;
  customerPostal: string;
  customerCity: string;
  customerRegion?: string;
  customerCountry?: string;
  customerEmail?: string;
  serviceDate: Date;
  paymentMethod: string;
  paymentReference?: string;
  lines: InvoiceLineData[];
  notes?: string;
}

export interface InvoiceLineData {
  description: string;
  quantity: number;
  unitPrice: number;
  ivaRate: number; // 0.10 or 0.21
  bookingType?: 'scheduled' | 'private';
  bookingId?: number;
}

export interface GeneratedInvoice {
  id: number;
  invoiceNumber: string;
  verifactuId: string;
  verifactuHash: string;
  qrCode: string;
  pdfUrl?: string;
}

// ============================================================================
// INVOICE NUMBER GENERATION
// ============================================================================

/**
 * Get or create invoice series for current year
 */
async function getInvoiceSeries(
  year: number,
  seriesCode: string = 'A',
  invoiceType: string = 'standard'
): Promise<{ id: number; currentNumber: number }> {
  // Try to find existing series
  let series = await prisma.invoiceSeries.findUnique({
    where: {
      seriesCode_year: {
        seriesCode,
        year
      }
    },
    select: {
      id: true,
      currentNumber: true
    }
  });

  // Create if doesn't exist
  if (!series) {
    const newSeries = await prisma.invoiceSeries.create({
      data: {
        seriesCode,
        year,
        invoiceType,
        description: `${invoiceType} invoices ${year} - Series ${seriesCode}`,
        currentNumber: 0,
        active: true
      },
      select: {
        id: true,
        currentNumber: true
      }
    });
    series = newSeries;
  }

  return series;
}

/**
 * Generate next invoice number in series
 * Format: YYYY-A-0001
 */
async function generateInvoiceNumber(
  seriesId: number,
  year: number,
  seriesCode: string
): Promise<{ invoiceNumber: string; sequence: number }> {
  // Increment series counter
  const series = await prisma.invoiceSeries.update({
    where: { id: seriesId },
    data: {
      currentNumber: {
        increment: 1
      }
    },
    select: {
      currentNumber: true
    }
  });

  const sequence = series.currentNumber;
  const invoiceNumber = `${year}-${seriesCode}-${sequence.toString().padStart(4, '0')}`;

  return { invoiceNumber, sequence };
}

// ============================================================================
// HASH CHAIN (VeriFactu Integrity)
// ============================================================================

/**
 * Get previous invoice hash for chain continuity
 */
async function getPreviousInvoiceHash(
  seriesId: number,
  currentSequence: number
): Promise<string | null> {
  if (currentSequence === 1) {
    return null; // First invoice in series
  }

  const previousInvoice = await prisma.invoice.findFirst({
    where: {
      seriesId,
      invoiceSequence: currentSequence - 1
    },
    select: {
      verifactuHash: true
    }
  });

  return previousInvoice?.verifactuHash || null;
}

/**
 * Calculate VeriFactu hash for invoice
 * Hash chain: SHA-256(invoiceData + previousHash)
 */
function calculateVerifactuHash(
  invoiceNumber: string,
  verifactuId: string,
  timestamp: Date,
  totalAmount: number,
  previousHash: string | null
): string {
  const data = [
    invoiceNumber,
    verifactuId,
    timestamp.toISOString(),
    totalAmount.toFixed(2),
    previousHash || ''
  ].join('|');

  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
    .toUpperCase();
}

/**
 * Generate VeriFactu ID (unique identifier)
 * Format: VERIFACTU-{timestamp}-{random}
 */
function generateVerifactuId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `VERIFACTU-${timestamp}-${random}`;
}

/**
 * Calculate VeriFactu "Huella" (fingerprint) for AEAT
 * This is a shortened hash used in the QR code
 */
function calculateVerifactuHuella(fullHash: string): string {
  return fullHash.substring(0, 16).toUpperCase();
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generate QR code data for invoice (AEAT format)
 * Format: URL with invoice verification parameters
 */
async function generateVerifactuQR(
  invoiceNumber: string,
  verifactuId: string,
  huella: string,
  totalAmount: number,
  timestamp: Date
): Promise<string> {
  // AEAT QR code format
  const qrData = {
    nif: process.env.COMPANY_CIF || 'B12345678',
    num: invoiceNumber,
    fecha: timestamp.toISOString().split('T')[0],
    importe: totalAmount.toFixed(2),
    id: verifactuId,
    huella
  };

  // Generate URL-encoded string
  const qrString = Object.entries(qrData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const verificationUrl = `https://verifactu.agenciatributaria.gob.es/verify?${qrString}`;

  // Generate QR code as data URL
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

// ============================================================================
// INVOICE CREATION
// ============================================================================

/**
 * Create invoice from booking data
 */
export async function createInvoice(
  data: InvoiceData,
  createdById: number = 1
): Promise<GeneratedInvoice> {
  const year = new Date().getFullYear();
  const issueDate = new Date();

  // Calculate totals
  let iva10Base = 0;
  let iva10Amount = 0;
  let iva21Base = 0;
  let iva21Amount = 0;

  data.lines.forEach(line => {
    const subtotal = line.quantity * line.unitPrice;
    const ivaAmount = subtotal * line.ivaRate;

    if (line.ivaRate === 0.10) {
      iva10Base += subtotal;
      iva10Amount += ivaAmount;
    } else if (line.ivaRate === 0.21) {
      iva21Base += subtotal;
      iva21Amount += ivaAmount;
    }
  });

  const baseAmount = iva10Base + iva21Base;
  const totalIva = iva10Amount + iva21Amount;
  const totalAmount = baseAmount + totalIva;

  // Get or create invoice series
  const series = await getInvoiceSeries(year, 'A', 'standard');

  // Generate invoice number
  const { invoiceNumber, sequence } = await generateInvoiceNumber(
    series.id,
    year,
    'A'
  );

  // Generate VeriFactu data
  const verifactuId = generateVerifactuId();
  const verifactuTimestamp = new Date();
  const previousHash = await getPreviousInvoiceHash(series.id, sequence);
  const verifactuHash = calculateVerifactuHash(
    invoiceNumber,
    verifactuId,
    verifactuTimestamp,
    totalAmount,
    previousHash
  );
  const verifactuHuella = calculateVerifactuHuella(verifactuHash);

  // Generate QR code
  const qrCode = await generateVerifactuQR(
    invoiceNumber,
    verifactuId,
    verifactuHuella,
    totalAmount,
    verifactuTimestamp
  );

  // Create invoice in database
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      seriesId: series.id,
      invoiceYear: year,
      invoiceSequence: sequence,
      invoiceType: 'standard',
      customerType: data.customerType,
      b2bCustomerId: data.b2bCustomerId,
      customerName: data.customerName,
      customerCif: data.customerCif,
      customerAddress: data.customerAddress,
      customerPostal: data.customerPostal,
      customerCity: data.customerCity,
      customerRegion: data.customerRegion,
      customerCountry: data.customerCountry || 'España',
      customerEmail: data.customerEmail,
      issueDate,
      serviceDate: data.serviceDate,
      baseAmount,
      iva10Base,
      iva10Amount,
      iva21Base,
      iva21Amount,
      totalIva,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
      paymentStatus: 'paid',
      verifactuId,
      verifactuTimestamp,
      verifactuHash,
      verifactuPreviousHash: previousHash,
      verifactuQrCode: qrCode,
      verifactuHuella,
      aeatSubmitted: false,
      facturaeGenerated: false,
      pdfGenerated: false,
      status: 'issued',
      notes: data.notes,
      createdById,
      lines: {
        create: data.lines.map((line, index) => ({
          lineNumber: index + 1,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          ivaRate: line.ivaRate,
          ivaAmount: line.quantity * line.unitPrice * line.ivaRate,
          subtotal: line.quantity * line.unitPrice,
          total: line.quantity * line.unitPrice * (1 + line.ivaRate),
          bookingType: line.bookingType,
          bookingId: line.bookingId
        }))
      }
    },
    select: {
      id: true,
      invoiceNumber: true,
      verifactuId: true,
      verifactuHash: true,
      verifactuQrCode: true
    }
  });

  console.log(`✅ Invoice created: ${invoiceNumber} (VeriFactu ID: ${verifactuId})`);

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    verifactuId: invoice.verifactuId,
    verifactuHash: invoice.verifactuHash,
    qrCode: invoice.verifactuQrCode || ''
  };
}

// ============================================================================
// INVOICE FROM SCHEDULED BOOKING
// ============================================================================

/**
 * Create invoice from scheduled booking
 */
export async function createInvoiceFromScheduledBooking(
  bookingId: number,
  createdById: number = 1
): Promise<GeneratedInvoice> {
  // Fetch booking with all related data
  const booking = await prisma.scheduledBooking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: {
          routePickup1: true,
          routeDropoff: true
        }
      },
      pickupLocation: true,
      b2bCustomer: true
    }
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  // Check if invoice already exists
  if (booking.invoiceId) {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: booking.invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        verifactuId: true,
        verifactuHash: true,
        verifactuQrCode: true
      }
    });

    if (existingInvoice) {
      console.log(`⚠️  Invoice already exists for booking ${booking.bookingReference}: ${existingInvoice.invoiceNumber}`);
      return {
        id: existingInvoice.id,
        invoiceNumber: existingInvoice.invoiceNumber,
        verifactuId: existingInvoice.verifactuId,
        verifactuHash: existingInvoice.verifactuHash,
        qrCode: existingInvoice.verifactuQrCode || ''
      };
    }
  }

  // Prepare invoice data
  const invoiceData: InvoiceData = {
    customerType: booking.customerType as 'b2c' | 'b2b',
    b2bCustomerId: booking.b2bCustomerId || undefined,
    customerName: booking.b2bCustomer
      ? booking.b2bCustomer.companyName
      : booking.customerName,
    customerCif: booking.b2bCustomer?.companyCif,
    customerAddress: booking.b2bCustomer
      ? booking.b2bCustomer.companyAddress
      : 'N/A',
    customerPostal: booking.b2bCustomer
      ? booking.b2bCustomer.companyPostal
      : '00000',
    customerCity: booking.b2bCustomer
      ? booking.b2bCustomer.companyCity
      : 'N/A',
    customerRegion: booking.b2bCustomer?.companyRegion,
    customerCountry: booking.b2bCustomer?.companyCountry || 'España',
    customerEmail: booking.customerEmail,
    serviceDate: booking.service.serviceDate,
    paymentMethod: booking.paymentMethod,
    paymentReference: booking.paymentId || undefined,
    lines: [
      {
        description: `Shuttle Service - ${booking.service.routePickup1.nameEn} to ${booking.service.routeDropoff.nameEn} (${booking.seatsBooked} ${booking.seatsBooked > 1 ? 'seats' : 'seat'})`,
        quantity: booking.seatsBooked,
        unitPrice: parseFloat(booking.pricePerSeat.toString()),
        ivaRate: parseFloat(booking.ivaRate.toString()),
        bookingType: 'scheduled',
        bookingId: booking.id
      }
    ],
    notes: `Booking Reference: ${booking.bookingReference}\nTicket Type: ${booking.ticketType}`
  };

  // Create invoice
  const invoice = await createInvoice(invoiceData, createdById);

  // Link invoice to booking
  await prisma.scheduledBooking.update({
    where: { id: bookingId },
    data: { invoiceId: invoice.id }
  });

  console.log(`✅ Invoice linked to booking ${booking.bookingReference}`);

  return invoice;
}

// ============================================================================
// INVOICE FROM PRIVATE BOOKING
// ============================================================================

/**
 * Create invoice from private booking
 */
export async function createInvoiceFromPrivateBooking(
  bookingId: number,
  createdById: number = 1
): Promise<GeneratedInvoice> {
  // Fetch booking with all related data
  const booking = await prisma.privateBooking.findUnique({
    where: { id: bookingId },
    include: {
      routePickup: true,
      routeDropoff: true,
      b2bCustomer: true
    }
  });

  if (!booking) {
    throw new Error(`Private booking ${bookingId} not found`);
  }

  // Check if invoice already exists
  if (booking.invoiceId) {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: booking.invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        verifactuId: true,
        verifactuHash: true,
        verifactuQrCode: true
      }
    });

    if (existingInvoice) {
      console.log(`⚠️  Invoice already exists for booking ${booking.bookingReference}: ${existingInvoice.invoiceNumber}`);
      return {
        id: existingInvoice.id,
        invoiceNumber: existingInvoice.invoiceNumber,
        verifactuId: existingInvoice.verifactuId,
        verifactuHash: existingInvoice.verifactuHash,
        qrCode: existingInvoice.verifactuQrCode || ''
      };
    }
  }

  // Prepare invoice data
  const invoiceData: InvoiceData = {
    customerType: booking.customerType as 'b2c' | 'b2b',
    b2bCustomerId: booking.b2bCustomerId || undefined,
    customerName: booking.b2bCustomer
      ? booking.b2bCustomer.companyName
      : booking.customerName,
    customerCif: booking.b2bCustomer?.companyCif,
    customerAddress: booking.b2bCustomer
      ? booking.b2bCustomer.companyAddress
      : 'N/A',
    customerPostal: booking.b2bCustomer
      ? booking.b2bCustomer.companyPostal
      : '00000',
    customerCity: booking.b2bCustomer
      ? booking.b2bCustomer.companyCity
      : 'N/A',
    customerRegion: booking.b2bCustomer?.companyRegion,
    customerCountry: booking.b2bCustomer?.companyCountry || 'España',
    customerEmail: booking.customerEmail,
    serviceDate: booking.serviceDate,
    paymentMethod: booking.paymentMethod,
    paymentReference: booking.paymentId || undefined,
    lines: [
      {
        description: `Private Shuttle - ${booking.routePickup.nameEn} to ${booking.routeDropoff.nameEn} (${booking.passengersCount} passengers)`,
        quantity: 1,
        unitPrice: parseFloat(booking.basePrice.toString()),
        ivaRate: parseFloat(booking.ivaRate.toString()),
        bookingType: 'private',
        bookingId: booking.id
      }
    ],
    notes: `Booking Reference: ${booking.bookingReference}\nPassengers: ${booking.passengersCount}\nBikes: ${booking.bikesCount}`
  };

  // Create invoice
  const invoice = await createInvoice(invoiceData, createdById);

  // Link invoice to booking
  await prisma.privateBooking.update({
    where: { id: bookingId },
    data: { invoiceId: invoice.id }
  });

  console.log(`✅ Invoice linked to private booking ${booking.bookingReference}`);

  return invoice;
}

// ============================================================================
// PDF GENERATION
// ============================================================================

/**
 * Generate PDF for invoice
 */
export async function generateInvoicePDF(invoiceId: number): Promise<Buffer> {
  // Fetch complete invoice data
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      lines: true,
      series: true,
      b2bCustomer: true
    }
  });

  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 10;
  const titleSize = 16;
  const headerSize = 12;

  let yPosition = height - 50;

  // Company header
  page.drawText('MALLORCA CYCLE SHUTTLE', {
    x: 50,
    y: yPosition,
    size: titleSize,
    font: fontBold,
    color: rgb(0.15, 0.39, 0.92) // Blue
  });

  yPosition -= 20;
  page.drawText(`CIF: ${process.env.COMPANY_CIF || 'B12345678'}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    font
  });

  yPosition -= 15;
  page.drawText('Carrer Exemple, 123 - 07001 Palma de Mallorca', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font
  });

  // Invoice title
  yPosition -= 40;
  page.drawText(`FACTURA / INVOICE`, {
    x: 50,
    y: yPosition,
    size: headerSize,
    font: fontBold
  });

  yPosition -= 20;
  page.drawText(`Número: ${invoice.invoiceNumber}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: fontBold
  });

  page.drawText(`Fecha: ${invoice.issueDate.toLocaleDateString('es-ES')}`, {
    x: width - 200,
    y: yPosition,
    size: fontSize,
    font
  });

  // Customer details
  yPosition -= 40;
  page.drawText('CLIENTE / CUSTOMER:', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: fontBold
  });

  yPosition -= 15;
  page.drawText(invoice.customerName, {
    x: 50,
    y: yPosition,
    size: fontSize,
    font
  });

  if (invoice.customerCif) {
    yPosition -= 15;
    page.drawText(`CIF/NIF: ${invoice.customerCif}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font
    });
  }

  yPosition -= 15;
  page.drawText(`${invoice.customerAddress}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    font
  });

  yPosition -= 15;
  page.drawText(`${invoice.customerPostal} ${invoice.customerCity}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    font
  });

  // Invoice lines
  yPosition -= 40;
  page.drawText('CONCEPTOS / ITEMS:', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: fontBold
  });

  // Table header
  yPosition -= 20;
  const tableX = 50;
  page.drawText('Descripción', { x: tableX, y: yPosition, size: fontSize, font: fontBold });
  page.drawText('Cant.', { x: tableX + 300, y: yPosition, size: fontSize, font: fontBold });
  page.drawText('Precio', { x: tableX + 350, y: yPosition, size: fontSize, font: fontBold });
  page.drawText('IVA', { x: tableX + 410, y: yPosition, size: fontSize, font: fontBold });
  page.drawText('Total', { x: tableX + 460, y: yPosition, size: fontSize, font: fontBold });

  // Draw line
  yPosition -= 5;
  page.drawLine({
    start: { x: tableX, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 0.5,
    color: rgb(0, 0, 0)
  });

  // Table rows
  yPosition -= 15;
  for (const line of invoice.lines) {
    page.drawText(line.description.substring(0, 50), {
      x: tableX,
      y: yPosition,
      size: fontSize - 1,
      font
    });
    page.drawText(line.quantity.toString(), {
      x: tableX + 300,
      y: yPosition,
      size: fontSize - 1,
      font
    });
    page.drawText(`€${parseFloat(line.unitPrice.toString()).toFixed(2)}`, {
      x: tableX + 350,
      y: yPosition,
      size: fontSize - 1,
      font
    });
    page.drawText(`${(parseFloat(line.ivaRate.toString()) * 100).toFixed(0)}%`, {
      x: tableX + 410,
      y: yPosition,
      size: fontSize - 1,
      font
    });
    page.drawText(`€${parseFloat(line.total.toString()).toFixed(2)}`, {
      x: tableX + 460,
      y: yPosition,
      size: fontSize - 1,
      font
    });

    yPosition -= 15;
  }

  // Totals
  yPosition -= 20;
  const totalsX = width - 200;

  page.drawText(`Base imponible: €${parseFloat(invoice.baseAmount.toString()).toFixed(2)}`, {
    x: totalsX,
    y: yPosition,
    size: fontSize,
    font
  });

  yPosition -= 15;
  if (parseFloat(invoice.iva10Amount.toString()) > 0) {
    page.drawText(`IVA 10%: €${parseFloat(invoice.iva10Amount.toString()).toFixed(2)}`, {
      x: totalsX,
      y: yPosition,
      size: fontSize,
      font
    });
    yPosition -= 15;
  }

  if (parseFloat(invoice.iva21Amount.toString()) > 0) {
    page.drawText(`IVA 21%: €${parseFloat(invoice.iva21Amount.toString()).toFixed(2)}`, {
      x: totalsX,
      y: yPosition,
      size: fontSize,
      font
    });
    yPosition -= 15;
  }

  page.drawText(`TOTAL: €${parseFloat(invoice.totalAmount.toString()).toFixed(2)}`, {
    x: totalsX,
    y: yPosition,
    size: fontSize + 2,
    font: fontBold
  });

  // VeriFactu QR Code
  if (invoice.verifactuQrCode) {
    yPosition -= 80;
    page.drawText('Código VeriFactu (AEAT):', {
      x: 50,
      y: yPosition + 60,
      size: fontSize - 1,
      font
    });

    // Embed QR code (this is a simplified version - in production you'd embed the actual QR image)
    page.drawText(`ID: ${invoice.verifactuId}`, {
      x: 50,
      y: yPosition + 40,
      size: fontSize - 2,
      font
    });

    page.drawText(`Huella: ${invoice.verifactuHuella}`, {
      x: 50,
      y: yPosition + 25,
      size: fontSize - 2,
      font
    });
  }

  // Footer
  page.drawText('Gracias por su confianza / Thank you for your trust', {
    x: width / 2 - 120,
    y: 50,
    size: fontSize - 1,
    font
  });

  // Serialize PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// ============================================================================
// INVOICE RETRIEVAL
// ============================================================================

/**
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: number) {
  return await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      lines: true,
      series: true,
      b2bCustomer: true,
      scheduledBookings: true,
      privateBookings: true
    }
  });
}

/**
 * Get invoice by number
 */
export async function getInvoiceByNumber(invoiceNumber: string) {
  return await prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      lines: true,
      series: true,
      b2bCustomer: true
    }
  });
}

/**
 * Verify invoice hash chain integrity
 */
export async function verifyInvoiceIntegrity(invoiceId: number): Promise<boolean> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { series: true }
  });

  if (!invoice) {
    return false;
  }

  // Recalculate hash
  const calculatedHash = calculateVerifactuHash(
    invoice.invoiceNumber,
    invoice.verifactuId,
    invoice.verifactuTimestamp,
    parseFloat(invoice.totalAmount.toString()),
    invoice.verifactuPreviousHash
  );

  return calculatedHash === invoice.verifactuHash;
}
