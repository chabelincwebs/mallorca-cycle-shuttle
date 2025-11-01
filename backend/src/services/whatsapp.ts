import * as brevo from '@getbrevo/brevo';
import { ScheduledBooking, PrivateBooking } from '@prisma/client';

// Initialize Brevo WhatsApp client
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const WHATSAPP_SENDER_NUMBER = process.env.BREVO_WHATSAPP_SENDER || '';

let whatsappClient: brevo.TransactionalWhatsAppApi | null = null;

if (BREVO_API_KEY && WHATSAPP_SENDER_NUMBER) {
  whatsappClient = new brevo.TransactionalWhatsAppApi();
  whatsappClient.authentications.apiKey.apiKey = BREVO_API_KEY;
  console.log('✅ Brevo WhatsApp client initialized');
} else {
  console.warn('⚠️  Brevo WhatsApp not configured. Set BREVO_API_KEY and BREVO_WHATSAPP_SENDER in .env');
}

// Multi-language WhatsApp message templates
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
      `💰 *Remboursement Traité*\n\nRéf: ${ref}\nMontant: ${amount}\n\nVotre remboursement apparaîtra dans votre compte dans 5-10 jours ouvrables.`,

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
      `⏰ *Recordatori: Servei Demà*\n\nRef: ${ref}\nData: ${date}\nHora: ${time}\nRecollida: ${pickup}\n\n📍 Si us plau, arribeu 10 minuts abans.\n🎫 Porteu la vostra referència de reserva.\n\nEns veiem demà!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Reserva Cancel·lada*\n\nRef: ${ref}\n\n${refundInfo}\n\nSi teniu preguntes, contacteu-nos.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Reemborsament Processat*\n\nRef: ${ref}\nImport: ${amount}\n\nEl vostre reemborsament apareixerà al vostre compte en 5-10 dies hàbils.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Shuttle Privat Confirmat!*\n\nRef: ${ref}\nData: ${date}\nHora: ${time}\nDes de: ${from}\nFins a: ${to}\n\nEl vostre shuttle privat ha estat aprovat! Ens veiem aviat!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Sol·licitud de Shuttle Privat Rebutjada*\n\nRef: ${ref}\n\nMotiu: ${reason}\n\nS'ha processat un reemborsament complet. Contacteu-nos per alternatives.`,
  },

  it: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Prenotazione Confermata!*\n\nRif: ${ref}\nData: ${date}\nOra: ${time}\nRitiro: ${pickup}\nPasseggeri: ${passengers}\nBiciclette: ${bikes}\n\nGrazie per aver scelto Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Richiesta Shuttle Privato Ricevuta*\n\nRif: ${ref}\nData: ${date}\nDa: ${from}\nA: ${to}\nPasseggeri: ${passengers}\n\n✨ Pagamento ricevuto! Confermeremo la disponibilità entro 24 ore.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Pagamento Confermato*\n\nRif: ${ref}\nImporto: ${amount}\n\nIl suo pagamento è stato elaborato con successo.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Promemoria: Servizio Domani*\n\nRif: ${ref}\nData: ${date}\nOra: ${time}\nRitiro: ${pickup}\n\n📍 Si prega di arrivare 10 minuti prima.\n🎫 Portare il riferimento di prenotazione.\n\nA domani!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Prenotazione Cancellata*\n\nRif: ${ref}\n\n${refundInfo}\n\nPer domande, contattateci.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Rimborso Elaborato*\n\nRif: ${ref}\nImporto: ${amount}\n\nIl suo rimborso apparirà nel suo conto entro 5-10 giorni lavorativi.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Shuttle Privato Confermato!*\n\nRif: ${ref}\nData: ${date}\nOra: ${time}\nDa: ${from}\nA: ${to}\n\nIl suo shuttle privato è stato approvato! A presto!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Richiesta Shuttle Privato Rifiutata*\n\nRif: ${ref}\n\nMotivo: ${reason}\n\nÈ stato elaborato un rimborso completo. Contattateci per alternative.`,
  },

  nl: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Boeking Bevestigd!*\n\nRef: ${ref}\nDatum: ${date}\nTijd: ${time}\nOphalen: ${pickup}\nPassagiers: ${passengers}\nFietsen: ${bikes}\n\nBedankt voor het kiezen van Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privé Shuttle Aanvraag Ontvangen*\n\nRef: ${ref}\nDatum: ${date}\nVan: ${from}\nNaar: ${to}\nPassagiers: ${passengers}\n\n✨ Betaling ontvangen! We bevestigen beschikbaarheid binnen 24 uur.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betaling Bevestigd*\n\nRef: ${ref}\nBedrag: ${amount}\n\nUw betaling is succesvol verwerkt.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Herinnering: Service Morgen*\n\nRef: ${ref}\nDatum: ${date}\nTijd: ${time}\nOphalen: ${pickup}\n\n📍 Kom alstublieft 10 minuten vroeger.\n🎫 Neem uw boekingsreferentie mee.\n\nTot morgen!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Boeking Geannuleerd*\n\nRef: ${ref}\n\n${refundInfo}\n\nAls u vragen heeft, neem contact met ons op.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Terugbetaling Verwerkt*\n\nRef: ${ref}\nBedrag: ${amount}\n\nUw terugbetaling verschijnt binnen 5-10 werkdagen op uw rekening.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privé Shuttle Bevestigd!*\n\nRef: ${ref}\nDatum: ${date}\nTijd: ${time}\nVan: ${from}\nNaar: ${to}\n\nUw privé shuttle is goedgekeurd! Tot ziens!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privé Shuttle Aanvraag Afgewezen*\n\nRef: ${ref}\n\nReden: ${reason}\n\nEen volledige terugbetaling is verwerkt. Neem contact op voor alternatieven.`,
  },

  da: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Booking Bekræftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nAfhentning: ${pickup}\nPassagerer: ${passengers}\nCykler: ${bikes}\n\nTak for at vælge Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privat Shuttle Anmodning Modtaget*\n\nRef: ${ref}\nDato: ${date}\nFra: ${from}\nTil: ${to}\nPassagerer: ${passengers}\n\n✨ Betaling modtaget! Vi bekræfter tilgængelighed inden for 24 timer.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betaling Bekræftet*\n\nRef: ${ref}\nBeløb: ${amount}\n\nDin betaling er blevet behandlet.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Påmindelse: Service I Morgen*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nAfhentning: ${pickup}\n\n📍 Kom venligst 10 minutter før.\n🎫 Medbring din bookningreference.\n\nVi ses i morgen!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Booking Annulleret*\n\nRef: ${ref}\n\n${refundInfo}\n\nHvis du har spørgsmål, kontakt os.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Refusion Behandlet*\n\nRef: ${ref}\nBeløb: ${amount}\n\nDin refusion vil vises på din konto inden for 5-10 arbejdsdage.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privat Shuttle Bekræftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nFra: ${from}\nTil: ${to}\n\nDin private shuttle er godkendt! Vi ses snart!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privat Shuttle Anmodning Afvist*\n\nRef: ${ref}\n\nÅrsag: ${reason}\n\nEn fuld refusion er behandlet. Kontakt os for alternativer.`,
  },

  nb: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Booking Bekreftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nHenting: ${pickup}\nPassasjerer: ${passengers}\nSykler: ${bikes}\n\nTakk for at du valgte Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privat Shuttle Forespørsel Mottatt*\n\nRef: ${ref}\nDato: ${date}\nFra: ${from}\nTil: ${to}\nPassasjerer: ${passengers}\n\n✨ Betaling mottatt! Vi bekrefter tilgjengelighet innen 24 timer.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betaling Bekreftet*\n\nRef: ${ref}\nBeløp: ${amount}\n\nDin betaling har blitt behandlet.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Påminnelse: Service I Morgen*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nHenting: ${pickup}\n\n📍 Vennligst kom 10 minutter tidlig.\n🎫 Ta med bookingsreferansen.\n\nVi ses i morgen!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Booking Kansellert*\n\nRef: ${ref}\n\n${refundInfo}\n\nHvis du har spørsmål, kontakt oss.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Refusjon Behandlet*\n\nRef: ${ref}\nBeløp: ${amount}\n\nDin refusjon vil vises på kontoen innen 5-10 virkedager.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privat Shuttle Bekreftet!*\n\nRef: ${ref}\nDato: ${date}\nTid: ${time}\nFra: ${from}\nTil: ${to}\n\nDin private shuttle er godkjent! Vi ses snart!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privat Shuttle Forespørsel Avvist*\n\nRef: ${ref}\n\nÅrsak: ${reason}\n\nFull refusjon har blitt behandlet. Kontakt oss for alternativer.`,
  },

  sv: {
    bookingConfirmed: (ref: string, date: string, time: string, pickup: string, passengers: number, bikes: number) =>
      `✅ *Bokning Bekräftad!*\n\nRef: ${ref}\nDatum: ${date}\nTid: ${time}\nUpphämtning: ${pickup}\nPassagerare: ${passengers}\nCyklar: ${bikes}\n\nTack för att du valde Mallorca Cycle Shuttle!`,

    privateBookingPending: (ref: string, date: string, from: string, to: string, passengers: number) =>
      `📝 *Privat Shuttle Förfrågan Mottagen*\n\nRef: ${ref}\nDatum: ${date}\nFrån: ${from}\nTill: ${to}\nPassagerare: ${passengers}\n\n✨ Betalning mottagen! Vi bekräftar tillgänglighet inom 24 timmar.`,

    paymentReceived: (ref: string, amount: string) =>
      `💳 *Betalning Bekräftad*\n\nRef: ${ref}\nBelopp: ${amount}\n\nDin betalning har behandlats.`,

    serviceReminder: (ref: string, date: string, time: string, pickup: string) =>
      `⏰ *Påminnelse: Service Imorgon*\n\nRef: ${ref}\nDatum: ${date}\nTid: ${time}\nUpphämtning: ${pickup}\n\n📍 Kom 10 minuter i förväg.\n🎫 Ta med din bokningsreferens.\n\nVi ses imorgon!`,

    bookingCancelled: (ref: string, refundInfo: string) =>
      `❌ *Bokning Avbruten*\n\nRef: ${ref}\n\n${refundInfo}\n\nOm du har frågor, kontakta oss.`,

    refundProcessed: (ref: string, amount: string) =>
      `💰 *Återbetalning Behandlad*\n\nRef: ${ref}\nBelopp: ${amount}\n\nDin återbetalning kommer att visas på ditt konto inom 5-10 arbetsdagar.`,

    privateBookingApproved: (ref: string, date: string, time: string, from: string, to: string) =>
      `✅ *Privat Shuttle Bekräftad!*\n\nRef: ${ref}\nDatum: ${date}\nTid: ${time}\nFrån: ${from}\nTill: ${to}\n\nDin privata shuttle är godkänd! Vi ses snart!`,

    privateBookingRejected: (ref: string, reason: string) =>
      `❌ *Privat Shuttle Förfrågan Avvisad*\n\nRef: ${ref}\n\nAnledning: ${reason}\n\nFull återbetalning har behandlats. Kontakta oss för alternativ.`,
  },
};

type MessageLanguage = keyof typeof messages;

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If doesn't start with country code, assume Spain (+34)
  if (!cleaned.startsWith('34') && cleaned.length < 12) {
    cleaned = '34' + cleaned;
  }

  return cleaned;
}

/**
 * Send a WhatsApp message using Brevo
 */
async function sendWhatsApp(to: string, message: string, language: string = 'en'): Promise<boolean> {
  if (!whatsappClient || !WHATSAPP_SENDER_NUMBER) {
    console.log('📱 WhatsApp notification skipped (Brevo not configured):');
    console.log(`   To: ${to}`);
    console.log(`   Language: ${language}`);
    console.log(`   Message: ${message.substring(0, 100)}...`);
    return false;
  }

  try {
    const formattedTo = formatPhoneNumber(to);

    const whatsappMessage = new brevo.SendWhatsappMessage();
    whatsappMessage.senderNumber = WHATSAPP_SENDER_NUMBER;
    whatsappMessage.contactNumbers = [formattedTo];
    whatsappMessage.text = message;

    const result = await whatsappClient.sendWhatsappMessage(whatsappMessage);

    console.log(`✅ WhatsApp sent to ${formattedTo} (${language})`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send WhatsApp:', error.response?.body || error.message);
    return false;
  }
}

/**
 * Send scheduled booking confirmation WhatsApp
 */
export async function sendScheduledBookingConfirmation(
  booking: any,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;
  const date = new Date(booking.service.serviceDate).toLocaleDateString(lang === 'en' ? 'en-US' : lang);
  const time = new Date(booking.service.departureTime).toLocaleTimeString(lang === 'en' ? 'en-US' : lang, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const message = messages[lang].bookingConfirmed(
    booking.bookingReference,
    date,
    time,
    booking.pickupLocation?.name || 'Unknown',
    booking.seatsBooked,
    booking.bikesCount
  );

  return sendWhatsApp(phone, message, language);
}

/**
 * Send private booking pending WhatsApp
 */
export async function sendPrivateBookingPending(
  booking: any,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;
  const date = new Date(booking.serviceDate).toLocaleDateString(lang === 'en' ? 'en-US' : lang);

  const message = messages[lang].privateBookingPending(
    booking.bookingReference,
    date,
    booking.pickupLocation || 'Unknown',
    booking.dropoffLocation || 'Unknown',
    booking.passengers
  );

  return sendWhatsApp(phone, message, language);
}

/**
 * Send payment received WhatsApp
 */
export async function sendPaymentReceived(
  bookingRef: string,
  amount: number,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;
  const formattedAmount = `€${amount.toFixed(2)}`;

  const message = messages[lang].paymentReceived(bookingRef, formattedAmount);

  return sendWhatsApp(phone, message, language);
}

/**
 * Send service reminder WhatsApp (24h before service)
 */
export async function sendServiceReminder(
  booking: any,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;
  const date = new Date(booking.service.serviceDate).toLocaleDateString(lang === 'en' ? 'en-US' : lang);
  const time = new Date(booking.service.departureTime).toLocaleTimeString(lang === 'en' ? 'en-US' : lang, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const message = messages[lang].serviceReminder(
    booking.bookingReference,
    date,
    time,
    booking.pickupLocation?.name || 'Unknown'
  );

  return sendWhatsApp(phone, message, language);
}

/**
 * Send booking cancelled WhatsApp
 */
export async function sendBookingCancelled(
  bookingRef: string,
  refundInfo: string,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;

  const message = messages[lang].bookingCancelled(bookingRef, refundInfo);

  return sendWhatsApp(phone, message, language);
}

/**
 * Send refund processed WhatsApp
 */
export async function sendRefundProcessed(
  bookingRef: string,
  amount: number,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;
  const formattedAmount = `€${amount.toFixed(2)}`;

  const message = messages[lang].refundProcessed(bookingRef, formattedAmount);

  return sendWhatsApp(phone, message, language);
}

/**
 * Send private booking approved WhatsApp
 */
export async function sendPrivateBookingApproved(
  booking: any,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;
  const date = new Date(booking.serviceDate).toLocaleDateString(lang === 'en' ? 'en-US' : lang);
  const time = new Date(booking.serviceTime).toLocaleTimeString(lang === 'en' ? 'en-US' : lang, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const message = messages[lang].privateBookingApproved(
    booking.bookingReference,
    date,
    time,
    booking.pickupLocation || 'Unknown',
    booking.dropoffLocation || 'Unknown'
  );

  return sendWhatsApp(phone, message, language);
}

/**
 * Send private booking rejected WhatsApp
 */
export async function sendPrivateBookingRejected(
  bookingRef: string,
  reason: string,
  phone: string,
  language: string = 'en'
): Promise<boolean> {
  const lang = (language in messages ? language : 'en') as MessageLanguage;

  const message = messages[lang].privateBookingRejected(bookingRef, reason);

  return sendWhatsApp(phone, message, language);
}
