import sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'bookings@mallorcacycleshuttle.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Autocares Devesa';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface BookingEmailData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerLanguage: string;
  serviceDate: Date;
  departureTime: Date;
  pickupLocation: string;
  dropoffLocation: string;
  seatsBooked: number;
  bikesCount: number;
  totalAmount: number;
  ticketType: string;
  paymentStatus: string;
  changeToken?: string | null;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  const { to, subject, html, text } = params;

  // If SendGrid not configured, log and skip
  if (!SENDGRID_API_KEY) {
    console.log('[Email] SendGrid not configured - would send:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    return false;
  }

  try {
    await sgMail.send({
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  const { customerEmail, customerLanguage } = data;

  const subject = getSubject('booking_confirmation', customerLanguage, data);
  const html = getBookingConfirmationTemplate(data);

  return sendEmail({
    to: customerEmail,
    subject,
    html
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(data: BookingEmailData): Promise<boolean> {
  const { customerEmail, customerLanguage } = data;

  const subject = getSubject('payment_receipt', customerLanguage, data);
  const html = getPaymentReceiptTemplate(data);

  return sendEmail({
    to: customerEmail,
    subject,
    html
  });
}

/**
 * Send service reminder email (24h before)
 */
export async function sendServiceReminder(data: BookingEmailData): Promise<boolean> {
  const { customerEmail, customerLanguage } = data;

  const subject = getSubject('service_reminder', customerLanguage, data);
  const html = getServiceReminderTemplate(data);

  return sendEmail({
    to: customerEmail,
    subject,
    html
  });
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationConfirmation(data: BookingEmailData): Promise<boolean> {
  const { customerEmail, customerLanguage } = data;

  const subject = getSubject('cancellation_confirmation', customerLanguage, data);
  const html = getCancellationTemplate(data);

  return sendEmail({
    to: customerEmail,
    subject,
    html
  });
}

/**
 * Send refund confirmation email
 */
export async function sendRefundConfirmation(data: BookingEmailData & { refundAmount: number }): Promise<boolean> {
  const { customerEmail, customerLanguage } = data;

  const subject = getSubject('refund_confirmation', customerLanguage, data);
  const html = getRefundTemplate(data);

  return sendEmail({
    to: customerEmail,
    subject,
    html
  });
}

/**
 * Get email subject in appropriate language
 */
function getSubject(type: string, language: string, data: BookingEmailData): string {
  const subjects: Record<string, Record<string, string>> = {
    booking_confirmation: {
      en: `Booking Confirmation - ${data.bookingReference}`,
      de: `Buchungsbestätigung - ${data.bookingReference}`,
      es: `Confirmación de Reserva - ${data.bookingReference}`,
      fr: `Confirmation de Réservation - ${data.bookingReference}`,
      ca: `Confirmació de Reserva - ${data.bookingReference}`,
      it: `Conferma Prenotazione - ${data.bookingReference}`,
      nl: `Boekingsbevestiging - ${data.bookingReference}`,
      da: `Bookingbekræftelse - ${data.bookingReference}`,
      nb: `Bestillingsbekreftelse - ${data.bookingReference}`,
      sv: `Bokningsbekräftelse - ${data.bookingReference}`
    },
    payment_receipt: {
      en: `Payment Receipt - ${data.bookingReference}`,
      de: `Zahlungsbeleg - ${data.bookingReference}`,
      es: `Recibo de Pago - ${data.bookingReference}`,
      fr: `Reçu de Paiement - ${data.bookingReference}`,
      ca: `Rebut de Pagament - ${data.bookingReference}`,
      it: `Ricevuta di Pagamento - ${data.bookingReference}`,
      nl: `Betalingsbewijs - ${data.bookingReference}`,
      da: `Betalingskvittering - ${data.bookingReference}`,
      nb: `Betalingskvittering - ${data.bookingReference}`,
      sv: `Betalningskvitto - ${data.bookingReference}`
    },
    service_reminder: {
      en: `Reminder: Your shuttle service tomorrow`,
      de: `Erinnerung: Ihr Shuttle-Service morgen`,
      es: `Recordatorio: Tu servicio shuttle mañana`,
      fr: `Rappel: Votre service navette demain`,
      ca: `Recordatori: El teu servei shuttle demà`,
      it: `Promemoria: Il tuo servizio navetta domani`,
      nl: `Herinnering: Uw shuttle-service morgen`,
      da: `Påmindelse: Din shuttle-service i morgen`,
      nb: `Påminnelse: Din shuttle-service i morgen`,
      sv: `Påminnelse: Din shuttle-service imorgon`
    },
    cancellation_confirmation: {
      en: `Cancellation Confirmed - ${data.bookingReference}`,
      de: `Stornierung Bestätigt - ${data.bookingReference}`,
      es: `Cancelación Confirmada - ${data.bookingReference}`,
      fr: `Annulation Confirmée - ${data.bookingReference}`,
      ca: `Cancel·lació Confirmada - ${data.bookingReference}`,
      it: `Cancellazione Confermata - ${data.bookingReference}`,
      nl: `Annulering Bevestigd - ${data.bookingReference}`,
      da: `Annullering Bekræftet - ${data.bookingReference}`,
      nb: `Kansellering Bekreftet - ${data.bookingReference}`,
      sv: `Avbokning Bekräftad - ${data.bookingReference}`
    },
    refund_confirmation: {
      en: `Refund Processed - ${data.bookingReference}`,
      de: `Rückerstattung Bearbeitet - ${data.bookingReference}`,
      es: `Reembolso Procesado - ${data.bookingReference}`,
      fr: `Remboursement Traité - ${data.bookingReference}`,
      ca: `Reemborsament Processat - ${data.bookingReference}`,
      it: `Rimborso Elaborato - ${data.bookingReference}`,
      nl: `Terugbetaling Verwerkt - ${data.bookingReference}`,
      da: `Refusion Behandlet - ${data.bookingReference}`,
      nb: `Refusjon Behandlet - ${data.bookingReference}`,
      sv: `Återbetalning Behandlad - ${data.bookingReference}`
    }
  };

  return subjects[type]?.[language] || subjects[type]?.['en'] || 'Mallorca Cycle Shuttle';
}

/**
 * Format date for display
 */
function formatDate(date: Date, language: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  try {
    return new Intl.DateTimeFormat(language, options).format(new Date(date));
  } catch {
    return new Intl.DateTimeFormat('en', options).format(new Date(date));
  }
}

/**
 * Format time for display
 */
function formatTime(date: Date, language: string): string {
  try {
    return new Intl.DateTimeFormat(language, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  } catch {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}

/**
 * Get booking confirmation email template
 */
function getBookingConfirmationTemplate(data: BookingEmailData): string {
  const {
    bookingReference,
    customerName,
    customerLanguage,
    serviceDate,
    departureTime,
    pickupLocation,
    dropoffLocation,
    seatsBooked,
    bikesCount,
    totalAmount,
    ticketType,
    changeToken
  } = data;

  const date = formatDate(serviceDate, customerLanguage);
  const time = formatTime(departureTime, customerLanguage);

  // Translations
  const t = getTranslations(customerLanguage);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.bookingConfirmation}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">${t.bookingConfirmation}</h1>
  </div>

  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>${t.hello} ${customerName},</p>
    <p>${t.bookingConfirmed}</p>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #0066cc;">${t.bookingDetails}</h2>
      <p><strong>${t.reference}:</strong> ${bookingReference}</p>
      <p><strong>${t.date}:</strong> ${date}</p>
      <p><strong>${t.departureTime}:</strong> ${time}</p>
      <p><strong>${t.pickup}:</strong> ${pickupLocation}</p>
      <p><strong>${t.destination}:</strong> ${dropoffLocation}</p>
      <p><strong>${t.passengers}:</strong> ${seatsBooked}</p>
      ${bikesCount > 0 ? `<p><strong>${t.bikes}:</strong> ${bikesCount}</p>` : ''}
      <p><strong>${t.ticketType}:</strong> ${ticketType === 'flexi' ? t.flexiTicket : ticketType === 'private' ? t.privateShuttle : t.standardTicket}</p>
      <p><strong>${t.total}:</strong> €${totalAmount.toFixed(2)}</p>
    </div>

    ${ticketType === 'private' ? `
    <div style="background-color: #d1ecf1; padding: 15px; border-left: 4px solid #0c5460; margin: 20px 0;">
      <p><strong>${t.privateBookingNotice}</strong></p>
      <p>${t.privateBookingText}</p>
    </div>
    ` : ''}

    ${changeToken ? `
    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
      <p><strong>${t.flexiTicketInfo}</strong></p>
      <p>${t.changeTokenInfo}</p>
      <p style="font-family: monospace; background-color: white; padding: 10px; border: 1px solid #ddd;">${changeToken}</p>
    </div>
    ` : ''}

    <div style="margin: 20px 0;">
      <h3>${t.importantInfo}</h3>
      <ul>
        <li>${t.arriveEarly}</li>
        <li>${t.bringConfirmation}</li>
        <li>${t.contactUs}</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p>${t.questions}</p>
      <p><strong>Email:</strong> ${FROM_EMAIL}</p>
      <p><strong>${t.phone}:</strong> +34 XXX XXX XXX</p>
    </div>

    <p>${t.thankYou}</p>
    <p>${t.signature}<br><strong>Autocares Devesa</strong></p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>Autocares Devesa SL | CIF: B08359606</p>
    <p>Calle Fuster 36 a, 07460 Pollença, Illes Balears, España</p>
  </div>
</body>
</html>
  `;
}

/**
 * Get payment receipt template
 */
function getPaymentReceiptTemplate(data: BookingEmailData): string {
  const t = getTranslations(data.customerLanguage);
  const date = formatDate(data.serviceDate, data.customerLanguage);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">${t.paymentReceived}</h1>
  </div>

  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>${t.hello} ${data.customerName},</p>
    <p>${t.paymentConfirmed}</p>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #28a745;">${t.paymentDetails}</h2>
      <p><strong>${t.reference}:</strong> ${data.bookingReference}</p>
      <p><strong>${t.amount}:</strong> €${data.totalAmount.toFixed(2)}</p>
      <p><strong>${t.date}:</strong> ${date}</p>
      <p><strong>${t.status}:</strong> ${t.paid}</p>
    </div>

    <p>${t.receiptSaved}</p>
    <p>${t.thankYou}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Get service reminder template
 */
function getServiceReminderTemplate(data: BookingEmailData): string {
  const t = getTranslations(data.customerLanguage);
  const date = formatDate(data.serviceDate, data.customerLanguage);
  const time = formatTime(data.departureTime, data.customerLanguage);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">${t.serviceReminder}</h1>
  </div>

  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>${t.hello} ${data.customerName},</p>
    <p>${t.reminderText}</p>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #ff9800;">${t.tomorrow}</h2>
      <p><strong>${t.reference}:</strong> ${data.bookingReference}</p>
      <p><strong>${t.date}:</strong> ${date}</p>
      <p><strong>${t.departureTime}:</strong> ${time}</p>
      <p><strong>${t.pickup}:</strong> ${data.pickupLocation}</p>
      <p><strong>${t.destination}:</strong> ${data.dropoffLocation}</p>
    </div>

    <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0;">
      <p><strong>${t.rememberTo}:</strong></p>
      <ul>
        <li>${t.arriveEarly}</li>
        <li>${t.bringConfirmation}</li>
        <li>${t.checkWeather}</li>
      </ul>
    </div>

    <p>${t.seeYouTomorrow}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Get cancellation confirmation template
 */
function getCancellationTemplate(data: BookingEmailData): string {
  const t = getTranslations(data.customerLanguage);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">${t.cancellationConfirmed}</h1>
  </div>

  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>${t.hello} ${data.customerName},</p>
    <p>${t.cancellationText}</p>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
      <p><strong>${t.reference}:</strong> ${data.bookingReference}</p>
      <p><strong>${t.status}:</strong> ${t.cancelled}</p>
    </div>

    ${data.ticketType === 'flexi' ? `<p>${t.refundProcessing}</p>` : `<p>${t.noRefund}</p>`}

    <p>${t.contactForQuestions}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Get refund confirmation template
 */
function getRefundTemplate(data: BookingEmailData & { refundAmount: number }): string {
  const t = getTranslations(data.customerLanguage);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #17a2b8; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">${t.refundProcessed}</h1>
  </div>

  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>${t.hello} ${data.customerName},</p>
    <p>${t.refundText}</p>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #17a2b8; margin: 20px 0;">
      <p><strong>${t.reference}:</strong> ${data.bookingReference}</p>
      <p><strong>${t.refundAmount}:</strong> €${data.refundAmount.toFixed(2)}</p>
      <p><strong>${t.status}:</strong> ${t.processed}</p>
    </div>

    <p>${t.refundTiming}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Get translations for a given language
 */
function getTranslations(language: string): Record<string, string> {
  const translations: Record<string, Record<string, string>> = {
    en: {
      bookingConfirmation: 'Booking Confirmation',
      hello: 'Hello',
      bookingConfirmed: 'Your booking has been confirmed! We look forward to serving you.',
      bookingDetails: 'Booking Details',
      reference: 'Reference',
      date: 'Date',
      departureTime: 'Departure Time',
      pickup: 'Pickup Location',
      destination: 'Destination',
      passengers: 'Passengers',
      bikes: 'Bikes',
      ticketType: 'Ticket Type',
      flexiTicket: 'Flexi (Free Changes)',
      standardTicket: 'Standard',
      privateShuttle: 'Private Shuttle',
      total: 'Total',
      flexiTicketInfo: 'Flexi Ticket - Free Change Available',
      changeTokenInfo: 'Use this token to change your booking:',
      importantInfo: 'Important Information',
      arriveEarly: 'Please arrive 10 minutes before departure time',
      bringConfirmation: 'Bring this confirmation email or your booking reference',
      contactUs: 'Contact us if you have any questions',
      questions: 'Questions?',
      phone: 'Phone',
      thankYou: 'Thank you for choosing Mallorca Cycle Shuttle!',
      signature: 'Best regards',
      paymentReceived: 'Payment Received',
      paymentConfirmed: 'Your payment has been successfully processed.',
      paymentDetails: 'Payment Details',
      amount: 'Amount',
      status: 'Status',
      paid: 'Paid',
      receiptSaved: 'Please keep this email as your receipt.',
      serviceReminder: 'Service Reminder',
      reminderText: 'This is a friendly reminder about your shuttle service tomorrow.',
      tomorrow: 'Tomorrow',
      rememberTo: 'Remember to',
      checkWeather: 'Check the weather forecast',
      seeYouTomorrow: 'See you tomorrow!',
      cancellationConfirmed: 'Cancellation Confirmed',
      cancellationText: 'Your booking has been cancelled as requested.',
      cancelled: 'Cancelled',
      refundProcessing: 'Your refund is being processed and will be returned to your original payment method within 5-10 business days.',
      noRefund: 'Standard tickets are non-refundable.',
      contactForQuestions: 'If you have any questions, please contact us.',
      refundProcessed: 'Refund Processed',
      refundText: 'Your refund has been processed successfully.',
      refundAmount: 'Refund Amount',
      processed: 'Processed',
      refundTiming: 'The refund will appear in your account within 5-10 business days.',
      privateBookingNotice: 'Private Shuttle - Pending Confirmation',
      privateBookingText: 'Your payment has been received. Our team will review your private shuttle request and confirm availability within 24 hours. You will receive a confirmation email once approved.'
    },
    de: {
      bookingConfirmation: 'Buchungsbestätigung',
      hello: 'Hallo',
      bookingConfirmed: 'Ihre Buchung wurde bestätigt! Wir freuen uns darauf, Sie zu bedienen.',
      bookingDetails: 'Buchungsdetails',
      reference: 'Referenz',
      date: 'Datum',
      departureTime: 'Abfahrtszeit',
      pickup: 'Abholort',
      destination: 'Ziel',
      passengers: 'Passagiere',
      bikes: 'Fahrräder',
      ticketType: 'Ticketart',
      flexiTicket: 'Flexi (Kostenlose Änderungen)',
      standardTicket: 'Standard',
      privateShuttle: 'Privater Shuttle',
      total: 'Gesamt',
      flexiTicketInfo: 'Flexi-Ticket - Kostenlose Änderung verfügbar',
      changeTokenInfo: 'Verwenden Sie diesen Token, um Ihre Buchung zu ändern:',
      importantInfo: 'Wichtige Informationen',
      arriveEarly: 'Bitte kommen Sie 10 Minuten vor Abfahrt',
      bringConfirmation: 'Bringen Sie diese Bestätigungs-E-Mail oder Ihre Buchungsreferenz mit',
      contactUs: 'Kontaktieren Sie uns bei Fragen',
      questions: 'Fragen?',
      phone: 'Telefon',
      thankYou: 'Vielen Dank, dass Sie sich für Mallorca Cycle Shuttle entschieden haben!',
      signature: 'Mit freundlichen Grüßen',
      paymentReceived: 'Zahlung erhalten',
      paymentConfirmed: 'Ihre Zahlung wurde erfolgreich verarbeitet.',
      paymentDetails: 'Zahlungsdetails',
      amount: 'Betrag',
      status: 'Status',
      paid: 'Bezahlt',
      receiptSaved: 'Bitte bewahren Sie diese E-Mail als Beleg auf.',
      serviceReminder: 'Service-Erinnerung',
      reminderText: 'Dies ist eine freundliche Erinnerung an Ihren Shuttle-Service morgen.',
      tomorrow: 'Morgen',
      rememberTo: 'Denken Sie daran',
      checkWeather: 'Wettervorhersage prüfen',
      seeYouTomorrow: 'Bis morgen!',
      cancellationConfirmed: 'Stornierung bestätigt',
      cancellationText: 'Ihre Buchung wurde wie gewünscht storniert.',
      cancelled: 'Storniert',
      refundProcessing: 'Ihre Rückerstattung wird bearbeitet und innerhalb von 5-10 Werktagen auf Ihre ursprüngliche Zahlungsmethode zurückerstattet.',
      noRefund: 'Standard-Tickets sind nicht erstattungsfähig.',
      contactForQuestions: 'Bei Fragen kontaktieren Sie uns bitte.',
      refundProcessed: 'Rückerstattung bearbeitet',
      refundText: 'Ihre Rückerstattung wurde erfolgreich bearbeitet.',
      refundAmount: 'Rückerstattungsbetrag',
      processed: 'Bearbeitet',
      refundTiming: 'Die Rückerstattung wird innerhalb von 5-10 Werktagen auf Ihrem Konto erscheinen.',
      privateBookingNotice: 'Privater Shuttle - Bestätigung ausstehend',
      privateBookingText: 'Ihre Zahlung wurde erhalten. Unser Team wird Ihre Anfrage für einen privaten Shuttle prüfen und die Verfügbarkeit innerhalb von 24 Stunden bestätigen. Sie erhalten eine Bestätigungs-E-Mail, sobald die Buchung genehmigt wurde.'
    },
    es: {
      bookingConfirmation: 'Confirmación de Reserva',
      hello: 'Hola',
      bookingConfirmed: '¡Tu reserva ha sido confirmada! Esperamos poder servirte.',
      bookingDetails: 'Detalles de la Reserva',
      reference: 'Referencia',
      date: 'Fecha',
      departureTime: 'Hora de Salida',
      pickup: 'Punto de Recogida',
      destination: 'Destino',
      passengers: 'Pasajeros',
      bikes: 'Bicicletas',
      ticketType: 'Tipo de Billete',
      flexiTicket: 'Flexi (Cambios Gratuitos)',
      standardTicket: 'Estándar',
      privateShuttle: 'Shuttle Privado',
      total: 'Total',
      flexiTicketInfo: 'Billete Flexi - Cambio Gratuito Disponible',
      changeTokenInfo: 'Usa este token para cambiar tu reserva:',
      importantInfo: 'Información Importante',
      arriveEarly: 'Por favor llega 10 minutos antes de la salida',
      bringConfirmation: 'Trae este correo de confirmación o tu referencia de reserva',
      contactUs: 'Contáctanos si tienes preguntas',
      questions: '¿Preguntas?',
      phone: 'Teléfono',
      thankYou: '¡Gracias por elegir Mallorca Cycle Shuttle!',
      signature: 'Saludos cordiales',
      paymentReceived: 'Pago Recibido',
      paymentConfirmed: 'Tu pago ha sido procesado exitosamente.',
      paymentDetails: 'Detalles del Pago',
      amount: 'Cantidad',
      status: 'Estado',
      paid: 'Pagado',
      receiptSaved: 'Por favor guarda este correo como tu recibo.',
      serviceReminder: 'Recordatorio de Servicio',
      reminderText: 'Este es un recordatorio amistoso sobre tu servicio shuttle mañana.',
      tomorrow: 'Mañana',
      rememberTo: 'Recuerda',
      checkWeather: 'Consultar el pronóstico del tiempo',
      seeYouTomorrow: '¡Nos vemos mañana!',
      cancellationConfirmed: 'Cancelación Confirmada',
      cancellationText: 'Tu reserva ha sido cancelada según solicitaste.',
      cancelled: 'Cancelado',
      refundProcessing: 'Tu reembolso está siendo procesado y será devuelto a tu método de pago original en 5-10 días hábiles.',
      noRefund: 'Los billetes estándar no son reembolsables.',
      contactForQuestions: 'Si tienes preguntas, por favor contáctanos.',
      refundProcessed: 'Reembolso Procesado',
      refundText: 'Tu reembolso ha sido procesado exitosamente.',
      refundAmount: 'Monto del Reembolso',
      processed: 'Procesado',
      refundTiming: 'El reembolso aparecerá en tu cuenta en 5-10 días hábiles.',
      privateBookingNotice: 'Shuttle Privado - Confirmación Pendiente',
      privateBookingText: 'Hemos recibido tu pago. Nuestro equipo revisará tu solicitud de shuttle privado y confirmará la disponibilidad en 24 horas. Recibirás un correo de confirmación una vez aprobado.'
    },
    // Add more languages as needed...
    fr: { ...{} }, // French translations
    ca: { ...{} }, // Catalan translations
    it: { ...{} }, // Italian translations
    nl: { ...{} }, // Dutch translations
    da: { ...{} }, // Danish translations
    nb: { ...{} }, // Norwegian translations
    sv: { ...{} }  // Swedish translations
  };

  // Return requested language or fallback to English
  return translations[language] || translations['en'];
}

/**
 * Send admin notification for new private booking
 */
export async function sendAdminPrivateBookingNotification(data: BookingEmailData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || FROM_EMAIL;

  const subject = `🚐 New Private Shuttle Request - ${data.bookingReference}`;
  const html = getAdminPrivateBookingNotificationTemplate(data);

  return sendEmail({
    to: adminEmail,
    subject,
    html
  });
}

/**
 * Get admin notification template for private booking
 */
function getAdminPrivateBookingNotificationTemplate(data: BookingEmailData): string {
  const {
    bookingReference,
    customerName,
    customerEmail,
    serviceDate,
    departureTime,
    pickupLocation,
    dropoffLocation,
    seatsBooked,
    bikesCount,
    totalAmount
  } = data;

  const date = formatDate(serviceDate, 'en');
  const time = formatTime(departureTime, 'en');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Private Shuttle Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #6c757d; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">🚐 New Private Shuttle Request</h1>
  </div>

  <div style="padding: 20px; background-color: #f9f9f9;">
    <p><strong>A new private shuttle booking has been submitted and paid. Please review and confirm availability.</strong></p>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #6c757d;">Booking Details</h2>
      <p><strong>Reference:</strong> ${bookingReference}</p>
      <p><strong>Status:</strong> ⏳ Pending Approval</p>
      <p><strong>Payment:</strong> ✅ Completed (€${totalAmount.toFixed(2)})</p>
    </div>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #0066cc;">Customer Information</h2>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
    </div>

    <div style="background-color: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #28a745;">Service Details</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Departure Time:</strong> ${time}</p>
      <p><strong>Pickup:</strong> ${pickupLocation}</p>
      <p><strong>Dropoff:</strong> ${dropoffLocation}</p>
      <p><strong>Passengers:</strong> ${seatsBooked}</p>
      ${bikesCount > 0 ? `<p><strong>Bikes:</strong> ${bikesCount}</p>` : ''}
    </div>

    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
      <p><strong>⚠️ Action Required</strong></p>
      <p>Please review this booking in the admin panel and:</p>
      <ul>
        <li>Verify bus availability</li>
        <li>Check route feasibility</li>
        <li>Confirm or reject the booking</li>
      </ul>
      <p>The customer has been notified that their booking is pending approval.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:3000/admin'}/private-shuttles/${bookingReference}"
         style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Review in Admin Panel
      </a>
    </div>

    <p style="color: #666; font-size: 12px; margin-top: 30px;">
      This is an automated notification from the Mallorca Cycle Shuttle booking system.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>Autocares Devesa SL | CIF: B08359606</p>
  </div>
</body>
</html>
  `;
}

export default {
  sendEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendServiceReminder,
  sendCancellationConfirmation,
  sendRefundConfirmation,
  sendAdminPrivateBookingNotification
};
