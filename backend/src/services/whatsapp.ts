import twilio from 'twilio';
import { ScheduledBooking, PrivateBooking } from '@prisma/client';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio sandbox number

let twilioClient: twilio.Twilio | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
} else {
  console.warn('⚠️  Twilio credentials not configured. WhatsApp notifications will not be sent.');
}

// Multi-language WhatsApp message templates
// Note: For production, these templates must be registered and approved by WhatsApp/Meta
const messages = {
  en: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Booking Confirmed!*\n\nRef: ${ref}\nDate: ${date}\nTime: ${time}\nPickup: ${pickup}\nPassengers: ${passengers}\nBikes: ${bikes}\n\nThank you for choosing Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Private Shuttle Request Received*\n\nRef: ${ref}\nDate: ${date}\nFrom: ${from}\nTo: ${to}\nPassengers: ${passengers}\n\n✨ Payment received! We'll confirm availability within 24 hours.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Payment Confirmed*\n\nRef: ${ref}\nAmount: ${amount}\n\nYour payment has been successfully processed.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Reminder: Service Tomorrow*\n\nRef: ${ref}\nDate: ${date}\nTime: ${time}\nPickup: ${pickup}\n\n📍 Please arrive 10 minutes early.\n🎫 Bring your booking reference.\n\nSee you tomorrow!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Booking Cancelled*\n\nRef: ${ref}\n\n${refundInfo}\n\nIf you have questions, please contact us.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Refund Processed*\n\nRef: ${ref}\nAmount: ${amount}\n\nYour refund will appear in your account within 5-10 business days.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Private Shuttle Confirmed!*\n\nRef: ${ref}\nDate: ${date}\nTime: ${time}\nFrom: ${from}\nTo: ${to}\n\nYour private shuttle has been approved. See you soon!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Private Shuttle Request Declined*\n\nRef: ${ref}\n\nReason: ${reason}\n\nA full refund has been processed. Contact us for alternatives.`,
  },

  de: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Buchung Bestätigt!*\n\nRef: ${ref}\nDatum: ${date}\nZeit: ${time}\nAbholung: ${pickup}\nFahrgäste: ${passengers}\nFahrräder: ${bikes}\n\nVielen Dank für die Wahl von Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Private Shuttle Anfrage Erhalten*\n\nRef: ${ref}\nDatum: ${date}\nVon: ${from}\nNach: ${to}\nFahrgäste: ${passengers}\n\n✨ Zahlung erhalten! Wir bestätigen die Verfügbarkeit innerhalb von 24 Stunden.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Zahlung Bestätigt*\n\nRef: ${ref}\nBetrag: ${amount}\n\nIhre Zahlung wurde erfolgreich verarbeitet.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Erinnerung: Service Morgen*\n\nRef: ${ref}\nDatum: ${date}\nZeit: ${time}\nAbholung: ${pickup}\n\n📍 Bitte 10 Minuten früher da sein.\n🎫 Buchungsreferenz mitbringen.\n\nBis morgen!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Buchung Storniert*\n\nRef: ${ref}\n\n${refundInfo}\n\nBei Fragen kontaktieren Sie uns bitte.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Rückerstattung Bearbeitet*\n\nRef: ${ref}\nBetrag: ${amount}\n\nIhre Rückerstattung erscheint in 5-10 Werktagen auf Ihrem Konto.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Private Shuttle Bestätigt!*\n\nRef: ${ref}\nDatum: ${date}\nZeit: ${time}\nVon: ${from}\nNach: ${to}\n\nIhr privater Shuttle wurde genehmigt. Bis bald!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Private Shuttle Anfrage Abgelehnt*\n\nRef: ${ref}\n\nGrund: ${reason}\n\nVollständige Rückerstattung wurde bearbeitet. Kontaktieren Sie uns für Alternativen.`,
  },

  es: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *¡Reserva Confirmada!*\n\nRef: ${ref}\nFecha: ${date}\nHora: ${time}\nRecogida: ${pickup}\nPasajeros: ${passengers}\nBicicletas: ${bikes}\n\n¡Gracias por elegir Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Solicitud de Shuttle Privado Recibida*\n\nRef: ${ref}\nFecha: ${date}\nDesde: ${from}\nHasta: ${to}\nPasajeros: ${passengers}\n\n✨ ¡Pago recibido! Confirmaremos disponibilidad en 24 horas.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Pago Confirmado*\n\nRef: ${ref}\nImporte: ${amount}\n\nSu pago se ha procesado correctamente.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Recordatorio: Servicio Mañana*\n\nRef: ${ref}\nFecha: ${date}\nHora: ${time}\nRecogida: ${pickup}\n\n📍 Por favor llegue 10 minutos antes.\n🎫 Traiga su referencia de reserva.\n\n¡Hasta mañana!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Reserva Cancelada*\n\nRef: ${ref}\n\n${refundInfo}\n\nSi tiene preguntas, contáctenos.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Reembolso Procesado*\n\nRef: ${ref}\nImporte: ${amount}\n\nSu reembolso aparecerá en su cuenta en 5-10 días hábiles.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *¡Shuttle Privado Confirmado!*\n\nRef: ${ref}\nFecha: ${date}\nHora: ${time}\nDesde: ${from}\nHasta: ${to}\n\n¡Su shuttle privado ha sido aprobado! ¡Hasta pronto!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Solicitud de Shuttle Privado Rechazada*\n\nRef: ${ref}\n\nMotivo: ${reason}\n\nSe ha procesado un reembolso completo. Contáctenos para alternativas.`,
  },

  fr: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Réservation Confirmée!*\n\nRéf: ${ref}\nDate: ${date}\nHeure: ${time}\nRamassage: ${pickup}\nPassagers: ${passengers}\nVélos: ${bikes}\n\nMerci d'avoir choisi Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Demande de Navette Privée Reçue*\n\nRéf: ${ref}\nDate: ${date}\nDe: ${from}\nÀ: ${to}\nPassagers: ${passengers}\n\n✨ Paiement reçu! Nous confirmerons la disponibilité dans 24 heures.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Paiement Confirmé*\n\nRéf: ${ref}\nMontant: ${amount}\n\nVotre paiement a été traité avec succès.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Rappel: Service Demain*\n\nRéf: ${ref}\nDate: ${date}\nHeure: ${time}\nRamassage: ${pickup}\n\n📍 Veuillez arriver 10 minutes à l'avance.\n🎫 Apportez votre référence de réservation.\n\nÀ demain!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Réservation Annulée*\n\nRéf: ${ref}\n\n${refundInfo}\n\nSi vous avez des questions, contactez-nous.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Remboursement Traité*\n\nRéf: ${ref}\nMontant: ${amount}\n\nVotre remboursement apparaîtra sur votre compte dans 5-10 jours ouvrables.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Navette Privée Confirmée!*\n\nRéf: ${ref}\nDate: ${date}\nHeure: ${time}\nDe: ${from}\nÀ: ${to}\n\nVotre navette privée a été approuvée. À bientôt!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Demande de Navette Privée Refusée*\n\nRéf: ${ref}\n\nRaison: ${reason}\n\nUn remboursement complet a été traité. Contactez-nous pour des alternatives.`,
  },

  ca: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Reserva Confirmada!*\n\nRef: ${ref}\nData: ${date}\nHora: ${time}\nRecollida: ${pickup}\nPassatgers: ${passengers}\nBicicletes: ${bikes}\n\nGràcies per triar Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Sol·licitud de Shuttle Privat Rebuda*\n\nRef: ${ref}\nData: ${date}\nDes de: ${from}\nFins a: ${to}\nPassatgers: ${passengers}\n\n✨ Pagament rebut! Confirmarem disponibilitat en 24 hores.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Pagament Confirmat*\n\nRef: ${ref}\nImport: ${amount}\n\nEl seu pagament s'ha processat correctament.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Recordatori: Servei Demà*\n\nRef: ${ref}\nData: ${date}\nHora: ${time}\nRecollida: ${pickup}\n\n📍 Si us plau arriba 10 minuts abans.\n🎫 Porta la teva referència de reserva.\n\nFins demà!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Reserva Cancel·lada*\n\nRef: ${ref}\n\n${refundInfo}\n\nSi tens preguntes, contacta'ns.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Reemborsament Processat*\n\nRef: ${ref}\nImport: ${amount}\n\nEl teu reemborsament apareixerà al teu compte en 5-10 dies laborables.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Shuttle Privat Confirmat!*\n\nRef: ${ref}\nData: ${date}\nHora: ${time}\nDes de: ${from}\nFins a: ${to}\n\nEl teu shuttle privat ha estat aprovat. Fins aviat!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Sol·licitud de Shuttle Privat Rebutjada*\n\nRef: ${ref}\n\nMotiu: ${reason}\n\nS'ha processat un reemborsament complet. Contacta'ns per alternatives.`,
  },

  it: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Prenotazione Confermata!*\n\nRif: ${ref}\nData: ${date}\nOra: ${time}\nPrelievo: ${pickup}\nPasseggeri: ${passengers}\nBiciclette: ${bikes}\n\nGrazie per aver scelto Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Richiesta Shuttle Privato Ricevuta*\n\nRif: ${ref}\nData: ${date}\nDa: ${from}\nA: ${to}\nPasseggeri: ${passengers}\n\n✨ Pagamento ricevuto! Confermeremo la disponibilità entro 24 ore.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Pagamento Confermato*\n\nRif: ${ref}\nImporto: ${amount}\n\nIl pagamento è stato elaborato con successo.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Promemoria: Servizio Domani*\n\nRif: ${ref}\nData: ${date}\nOra: ${time}\nPrelievo: ${pickup}\n\n📍 Si prega di arrivare 10 minuti prima.\n🎫 Porta il tuo riferimento di prenotazione.\n\nA domani!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Prenotazione Cancellata*\n\nRif: ${ref}\n\n${refundInfo}\n\nSe hai domande, contattaci.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Rimborso Elaborato*\n\nRif: ${ref}\nImporto: ${amount}\n\nIl rimborso apparirà sul tuo conto entro 5-10 giorni lavorativi.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Shuttle Privato Confermato!*\n\nRif: ${ref}\nData: ${date}\nOra: ${time}\nDa: ${from}\nA: ${to}\n\nIl tuo shuttle privato è stato approvato. A presto!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Richiesta Shuttle Privato Rifiutata*\n\nRif: ${ref}\n\nMotivo: ${reason}\n\nÈ stato elaborato un rimborso completo. Contattaci per alternative.`,
  },

  nl: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Boeking Bevestigd!*\n\nRef: ${ref}\nDatum: ${date}\nTijd: ${time}\nOphalen: ${pickup}\nPassagiers: ${passengers}\nFietsen: ${bikes}\n\nBedankt voor het kiezen van Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privé Shuttle Aanvraag Ontvangen*\n\nRef: ${ref}\nDatum: ${date}\nVan: ${from}\nNaar: ${to}\nPassagiers: ${passengers}\n\n✨ Betaling ontvangen! We bevestigen beschikbaarheid binnen 24 uur.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betaling Bevestigd*\n\nRef: ${ref}\nBedrag: ${amount}\n\nUw betaling is succesvol verwerkt.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Herinnering: Service Morgen*\n\nRef: ${ref}\nDatum: ${date}\nTijd: ${time}\nOphalen: ${pickup}\n\n📍 Kom alstublieft 10 minuten van tevoren.\n🎫 Neem uw boekingsreferentie mee.\n\nTot morgen!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Boeking Geannuleerd*\n\nRef: ${ref}\n\n${refundInfo}\n\nAls u vragen heeft, neem dan contact met ons op.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Terugbetaling Verwerkt*\n\nRef: ${ref}\nBedrag: ${amount}\n\nUw terugbetaling verschijnt binnen 5-10 werkdagen op uw rekening.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privé Shuttle Bevestigd!*\n\nRef: ${ref}\nDatum: ${date}\nTijd: ${time}\nVan: ${from}\nNaar: ${to}\n\nUw privé shuttle is goedgekeurd. Tot snel!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privé Shuttle Aanvraag Afgewezen*\n\nRef: ${ref}\n\nReden: ${reason}\n\nEen volledige terugbetaling is verwerkt. Neem contact met ons op voor alternatieven.`,
  },

  da: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Booking Bekræftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nAfhentning: ${pickup}\nPassagerer: ${passengers}\nCykler: ${bikes}\n\nTak for at vælge Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privat Shuttle Anmodning Modtaget*\n\nRef: ${ref}\nDato: ${date}\nFra: ${from}\nTil: ${to}\nPassagerer: ${passengers}\n\n✨ Betaling modtaget! Vi bekræfter tilgængelighed inden for 24 timer.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betaling Bekræftet*\n\nRef: ${ref}\nBeløb: ${amount}\n\nDin betaling er blevet behandlet.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Påmindelse: Service I Morgen*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nAfhentning: ${pickup}\n\n📍 Vær venligst 10 minutter tidligt.\n🎫 Medbring din bookingreference.\n\nVi ses i morgen!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Booking Annulleret*\n\nRef: ${ref}\n\n${refundInfo}\n\nHvis du har spørgsmål, kontakt os.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Refusion Behandlet*\n\nRef: ${ref}\nBeløb: ${amount}\n\nDin refusion vil vises på din konto inden for 5-10 hverdage.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privat Shuttle Bekræftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nFra: ${from}\nTil: ${to}\n\nDin private shuttle er godkendt. Vi ses snart!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privat Shuttle Anmodning Afvist*\n\nRef: ${ref}\n\nÅrsag: ${reason}\n\nEn fuld refusion er blevet behandlet. Kontakt os for alternativer.`,
  },

  nb: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Booking Bekreftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nHenting: ${pickup}\nPassasjerer: ${passengers}\nSykler: ${bikes}\n\nTakk for at du valgte Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privat Shuttle Forespørsel Mottatt*\n\nRef: ${ref}\nDato: ${date}\nFra: ${from}\nTil: ${to}\nPassasjerer: ${passengers}\n\n✨ Betaling mottatt! Vi bekrefter tilgjengelighet innen 24 timer.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betaling Bekreftet*\n\nRef: ${ref}\nBeløp: ${amount}\n\nDin betaling har blitt behandlet.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Påminnelse: Service I Morgen*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nHenting: ${pickup}\n\n📍 Vær 10 minutter tidlig.\n🎫 Ta med bookingreferansen.\n\nVi sees i morgen!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Booking Kansellert*\n\nRef: ${ref}\n\n${refundInfo}\n\nHvis du har spørsmål, kontakt oss.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Refusjon Behandlet*\n\nRef: ${ref}\nBeløp: ${amount}\n\nDin refusjon vil vises på kontoen din innen 5-10 virkedager.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privat Shuttle Bekreftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nFra: ${from}\nTil: ${to}\n\nDin private shuttle er godkjent. Vi sees snart!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privat Shuttle Forespørsel Avvist*\n\nRef: ${ref}\n\nÅrsak: ${reason}\n\nEn full refusjon har blitt behandlet. Kontakt oss for alternativer.`,
  },

  sv: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Bokning Bekräftad!*\n\nRef: ${ref}\nDatum: ${date}\nTid: ${time}\nUpphämtning: ${pickup}\nPassagerare: ${passengers}\nCyklar: ${bikes}\n\nTack för att du valde Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privat Shuttle Förfrågan Mottagen*\n\nRef: ${ref}\nDatum: ${date}\nFrån: ${from}\nTill: ${to}\nPassagerare: ${passengers}\n\n✨ Betalning mottagen! Vi bekräftar tillgänglighet inom 24 timmar.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betalning Bekräftad*\n\nRef: ${ref}\nBelopp: ${amount}\n\nDin betalning har behandlats.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Påminnelse: Service Imorgon*\n\nRef: ${ref}\nDatum: ${date}\nTid: ${time}\nUpphämtning: ${pickup}\n\n📍 Var 10 minuter tidig.\n🎫 Ta med din bokningsreferens.\n\nVi ses imorgon!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Bokning Avbokad*\n\nRef: ${ref}\n\n${refundInfo}\n\nOm du har frågor, kontakta oss.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Återbetalning Behandlad*\n\nRef: ${ref}\nBelopp: ${amount}\n\nDin återbetalning kommer att visas på ditt konto inom 5-10 arbetsdagar.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privat Shuttle Bekräftad!*\n\nRef: ${ref}\nDatum: ${date}\nTid: ${time}\nFrån: ${from}\nTill: ${to}\n\nDin privata shuttle har godkänts. Vi ses snart!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privat Shuttle Förfrågan Avslagen*\n\nRef: ${ref}\n\nAnledning: ${reason}\n\nEn full återbetalning har behandlats. Kontakta oss för alternativ.`,
  },
};

// Helper function to format phone number to E.164 format (required by Twilio)
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If doesn't start with +, assume it's a Spanish number (+34)
  if (!cleaned.startsWith('+')) {
    cleaned = '+34' + cleaned;
  }

  return `whatsapp:${cleaned}`;
}

// Generic send WhatsApp function
async function sendWhatsApp(
  to: string,
  message: string
): Promise<boolean> {
  if (!twilioClient) {
    console.log('📱 WhatsApp notification skipped (Twilio not configured):', message.split('\n')[0]);
    return false;
  }

  try {
    const formattedTo = formatPhoneNumber(to);

    const result = await twilioClient.messages.create({
      body: message,
      from: whatsappFrom,
      to: formattedTo,
    });

    console.log(`✅ WhatsApp sent to ${to}: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp:', error);
    return false;
  }
}

// Scheduled Booking Confirmation
export async function sendScheduledBookingConfirmation(
  booking: ScheduledBooking & {
    scheduledService: {
      date: Date;
      departureTime: string;
      route: { fromLocation: { name: string } };
    };
  },
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  const message = lang.bookingConfirmed(
    booking.bookingReference,
    new Date(booking.scheduledService.date).toLocaleDateString(customerLanguage),
    booking.scheduledService.departureTime,
    booking.scheduledService.route.fromLocation.name,
    booking.seatsBooked,
    booking.bikesCount
  );

  return sendWhatsApp(customerPhone, message);
}

// Private Booking Pending Notification
export async function sendPrivateBookingPending(
  booking: PrivateBooking,
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  const message = lang.privateBookingPending(
    booking.bookingReference,
    new Date(booking.date).toLocaleDateString(customerLanguage),
    booking.pickupLocation,
    booking.dropoffLocation,
    booking.passengers
  );

  return sendWhatsApp(customerPhone, message);
}

// Payment Received Notification
export async function sendPaymentReceived(
  bookingReference: string,
  amount: number,
  currency: string,
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  const formattedAmount = new Intl.NumberFormat(customerLanguage, {
    style: 'currency',
    currency: currency,
  }).format(amount);

  const message = lang.paymentReceived(bookingReference, formattedAmount);

  return sendWhatsApp(customerPhone, message);
}

// Service Reminder (24h before)
export async function sendServiceReminder(
  booking: ScheduledBooking & {
    scheduledService: {
      date: Date;
      departureTime: string;
      route: { fromLocation: { name: string } };
    };
  },
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  const message = lang.serviceReminder(
    booking.bookingReference,
    new Date(booking.scheduledService.date).toLocaleDateString(customerLanguage),
    booking.scheduledService.departureTime,
    booking.scheduledService.route.fromLocation.name
  );

  return sendWhatsApp(customerPhone, message);
}

// Booking Cancellation Notification
export async function sendBookingCancelled(
  bookingReference: string,
  hasRefund: boolean,
  refundAmount: number | null,
  currency: string,
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  let refundInfo = '';
  if (hasRefund && refundAmount) {
    const formattedAmount = new Intl.NumberFormat(customerLanguage, {
      style: 'currency',
      currency: currency,
    }).format(refundAmount);
    refundInfo = `Refund: ${formattedAmount} (5-10 business days)`;
  } else {
    refundInfo = 'No refund (non-refundable ticket)';
  }

  const message = lang.bookingCancelled(bookingReference, refundInfo);

  return sendWhatsApp(customerPhone, message);
}

// Refund Processed Notification
export async function sendRefundProcessed(
  bookingReference: string,
  refundAmount: number,
  currency: string,
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  const formattedAmount = new Intl.NumberFormat(customerLanguage, {
    style: 'currency',
    currency: currency,
  }).format(refundAmount);

  const message = lang.refundProcessed(bookingReference, formattedAmount);

  return sendWhatsApp(customerPhone, message);
}

// Private Booking Approved
export async function sendPrivateBookingApproved(
  booking: PrivateBooking,
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  const message = lang.privateBookingApproved(
    booking.bookingReference,
    new Date(booking.date).toLocaleDateString(customerLanguage),
    booking.time,
    booking.pickupLocation,
    booking.dropoffLocation
  );

  return sendWhatsApp(customerPhone, message);
}

// Private Booking Rejected
export async function sendPrivateBookingRejected(
  booking: PrivateBooking,
  reason: string,
  customerPhone: string,
  customerLanguage: string = 'en'
): Promise<boolean> {
  const lang = messages[customerLanguage as keyof typeof messages] || messages.en;

  const message = lang.privateBookingRejected(booking.bookingReference, reason);

  return sendWhatsApp(customerPhone, message);
}

export default {
  sendScheduledBookingConfirmation,
  sendPrivateBookingPending,
  sendPaymentReceived,
  sendServiceReminder,
  sendBookingCancelled,
  sendRefundProcessed,
  sendPrivateBookingApproved,
  sendPrivateBookingRejected,
};
