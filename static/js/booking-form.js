/**
 * Private Shuttle Booking Form
 * Integrates with backend API and Stripe payments
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBaseUrl: window.location.hostname === 'localhost'
      ? 'http://localhost:3001/api/public'
      : '/api/public',
    stripePublishableKey: 'pk_test_51Mvz2MKWtjQiN6KiBScZe69yQDKPc1nmBajlyb950zQF05H4oW9Kjp7SWGhoENNaqiDUxrm9zlVNurYosYTjkYBx00QHqUPVxJ', // TODO: Replace with your actual key
  };

  // Translations for 10 languages
  const TRANSLATIONS = {
    en: {
      // Steps
      step1: 'Service Details',
      step2: 'Your Information',
      step3: 'Payment',
      step4: 'Confirmation',

      // Form labels - Step 1
      serviceDate: 'Service Date',
      serviceTime: 'Preferred Time',
      pickupLocation: 'Pickup Location',
      dropoffLocation: 'Dropoff Location',
      passengers: 'Number of Passengers',
      bikesCount: 'Number of Bikes',
      specialRequests: 'Special Requests (optional)',

      // Form labels - Step 2
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      language: 'Preferred Language',

      // Form labels - Step 3 (Payment)
      cardholderName: 'Name on Card',
      cardholderNamePlaceholder: 'John Doe',
      cardDetails: 'Card Details',

      // Price summary
      priceBreakdown: 'Price Breakdown',
      basePrice: 'Base Price',
      perPassenger: 'Per Passenger',
      perBike: 'Per Bike',
      total: 'Total',

      // Buttons
      next: 'Next',
      back: 'Back',
      payNow: 'Pay Now',
      processing: 'Processing...',

      // Messages
      confirmationTitle: 'Booking Confirmed!',
      confirmationMessage: 'Your private shuttle has been booked successfully.',
      bookingReference: 'Booking Reference',
      emailSent: 'A confirmation email has been sent to',
      thankYou: 'Thank you for choosing Mallorca Cycle Shuttle!',

      // Errors
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      paymentFailed: 'Payment failed. Please try again.',
      bookingFailed: 'Booking failed. Please try again or contact us.',

      // Placeholders
      pickupPlaceholder: 'e.g., Port de Pollença',
      dropoffPlaceholder: 'e.g., Sa Calobra',
      timePlaceholder: 'e.g., 09:00',
      specialRequestsPlaceholder: 'Any special requirements or notes...',
    },

    de: {
      step1: 'Service-Details',
      step2: 'Ihre Informationen',
      step3: 'Zahlung',
      step4: 'Bestätigung',
      serviceDate: 'Service-Datum',
      serviceTime: 'Bevorzugte Zeit',
      pickupLocation: 'Abholort',
      dropoffLocation: 'Zielort',
      passengers: 'Anzahl der Fahrgäste',
      bikesCount: 'Anzahl der Fahrräder',
      specialRequests: 'Besondere Wünsche (optional)',
      fullName: 'Vollständiger Name',
      email: 'E-Mail-Adresse',
      phone: 'Telefonnummer',
      language: 'Bevorzugte Sprache',

      // Form labels - Step 3 (Payment)
      cardholderName: "Name auf der Karte",
      cardholderNamePlaceholder: "Max Mustermann",
      cardDetails: "Kartendaten",
      priceBreakdown: 'Preisaufschlüsselung',
      basePrice: 'Grundpreis',
      perPassenger: 'Pro Fahrgast',
      perBike: 'Pro Fahrrad',
      total: 'Gesamt',
      next: 'Weiter',
      back: 'Zurück',
      payNow: 'Jetzt bezahlen',
      processing: 'Wird bearbeitet...',
      confirmationTitle: 'Buchung bestätigt!',
      confirmationMessage: 'Ihr privater Shuttle wurde erfolgreich gebucht.',
      bookingReference: 'Buchungsreferenz',
      emailSent: 'Eine Bestätigungs-E-Mail wurde gesendet an',
      thankYou: 'Vielen Dank, dass Sie Mallorca Cycle Shuttle gewählt haben!',
      requiredField: 'Dieses Feld ist erforderlich',
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      invalidPhone: 'Bitte geben Sie eine gültige Telefonnummer ein',
      paymentFailed: 'Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.',
      bookingFailed: 'Buchung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.',
      pickupPlaceholder: 'z.B. Port de Pollença',
      dropoffPlaceholder: 'z.B. Sa Calobra',
      timePlaceholder: 'z.B. 09:00',
      specialRequestsPlaceholder: 'Besondere Anforderungen oder Notizen...',
    },

    es: {
      step1: 'Detalles del Servicio',
      step2: 'Su Información',
      step3: 'Pago',
      step4: 'Confirmación',
      serviceDate: 'Fecha del Servicio',
      serviceTime: 'Hora Preferida',
      pickupLocation: 'Lugar de Recogida',
      dropoffLocation: 'Lugar de Destino',
      passengers: 'Número de Pasajeros',
      bikesCount: 'Número de Bicicletas',
      specialRequests: 'Solicitudes Especiales (opcional)',
      fullName: 'Nombre Completo',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      language: 'Idioma Preferido',
      priceBreakdown: 'Desglose de Precios',
      basePrice: 'Precio Base',
      perPassenger: 'Por Pasajero',
      perBike: 'Por Bicicleta',
      total: 'Total',
      next: 'Siguiente',
      back: 'Atrás',
      payNow: 'Pagar Ahora',
      processing: 'Procesando...',
      confirmationTitle: '¡Reserva Confirmada!',
      confirmationMessage: 'Su shuttle privado ha sido reservado con éxito.',
      bookingReference: 'Referencia de Reserva',
      emailSent: 'Se ha enviado un correo de confirmación a',
      thankYou: '¡Gracias por elegir Mallorca Cycle Shuttle!',
      requiredField: 'Este campo es obligatorio',
      invalidEmail: 'Por favor ingrese un correo electrónico válido',
      invalidPhone: 'Por favor ingrese un número de teléfono válido',
      paymentFailed: 'Pago fallido. Por favor intente de nuevo.',
      bookingFailed: 'Reserva fallida. Por favor intente de nuevo o contáctenos.',
      pickupPlaceholder: 'ej. Port de Pollença',
      dropoffPlaceholder: 'ej. Sa Calobra',
      timePlaceholder: 'ej. 09:00',
      specialRequestsPlaceholder: 'Requisitos especiales o notas...',
    },

    fr: {
      step1: 'Détails du Service',
      step2: 'Vos Informations',
      step3: 'Paiement',
      step4: 'Confirmation',
      serviceDate: 'Date du Service',
      serviceTime: 'Heure Préférée',
      pickupLocation: 'Lieu de Ramassage',
      dropoffLocation: 'Lieu de Destination',
      passengers: 'Nombre de Passagers',
      bikesCount: 'Nombre de Vélos',
      specialRequests: 'Demandes Spéciales (optionnel)',
      fullName: 'Nom Complet',
      email: 'Adresse E-mail',
      phone: 'Numéro de Téléphone',
      language: 'Langue Préférée',
      priceBreakdown: 'Détail des Prix',
      basePrice: 'Prix de Base',
      perPassenger: 'Par Passager',
      perBike: 'Par Vélo',
      total: 'Total',
      next: 'Suivant',
      back: 'Retour',
      payNow: 'Payer Maintenant',
      processing: 'Traitement...',
      confirmationTitle: 'Réservation Confirmée!',
      confirmationMessage: 'Votre navette privée a été réservée avec succès.',
      bookingReference: 'Référence de Réservation',
      emailSent: 'Un e-mail de confirmation a été envoyé à',
      thankYou: 'Merci d\'avoir choisi Mallorca Cycle Shuttle!',
      requiredField: 'Ce champ est obligatoire',
      invalidEmail: 'Veuillez entrer une adresse e-mail valide',
      invalidPhone: 'Veuillez entrer un numéro de téléphone valide',
      paymentFailed: 'Paiement échoué. Veuillez réessayer.',
      bookingFailed: 'Réservation échouée. Veuillez réessayer ou nous contacter.',
      pickupPlaceholder: 'par ex. Port de Pollença',
      dropoffPlaceholder: 'par ex. Sa Calobra',
      timePlaceholder: 'par ex. 09:00',
      specialRequestsPlaceholder: 'Exigences spéciales ou notes...',
    },

    ca: {
      step1: 'Detalls del Servei',
      step2: 'La Seva Informació',
      step3: 'Pagament',
      step4: 'Confirmació',
      serviceDate: 'Data del Servei',
      serviceTime: 'Hora Preferida',
      pickupLocation: 'Lloc de Recollida',
      dropoffLocation: 'Lloc de Destinació',
      passengers: 'Nombre de Passatgers',
      bikesCount: 'Nombre de Bicicletes',
      specialRequests: 'Sol·licituds Especials (opcional)',
      fullName: 'Nom Complet',
      email: 'Correu Electrònic',
      phone: 'Telèfon',
      language: 'Idioma Preferit',
      priceBreakdown: 'Desglossament de Preus',
      basePrice: 'Preu Base',
      perPassenger: 'Per Passatger',
      perBike: 'Per Bicicleta',
      total: 'Total',
      next: 'Següent',
      back: 'Enrere',
      payNow: 'Pagar Ara',
      processing: 'Processant...',
      confirmationTitle: 'Reserva Confirmada!',
      confirmationMessage: 'El seu shuttle privat ha estat reservat amb èxit.',
      bookingReference: 'Referència de Reserva',
      emailSent: 'S\'ha enviat un correu de confirmació a',
      thankYou: 'Gràcies per triar Mallorca Cycle Shuttle!',
      requiredField: 'Aquest camp és obligatori',
      invalidEmail: 'Si us plau introduïu un correu electrònic vàlid',
      invalidPhone: 'Si us plau introduïu un número de telèfon vàlid',
      paymentFailed: 'Pagament fallit. Si us plau torneu-ho a provar.',
      bookingFailed: 'Reserva fallida. Si us plau torneu-ho a provar o contacteu-nos.',
      pickupPlaceholder: 'p.ex. Port de Pollença',
      dropoffPlaceholder: 'p.ex. Sa Calobra',
      timePlaceholder: 'p.ex. 09:00',
      specialRequestsPlaceholder: 'Requisits especials o notes...',
    },

    it: {
      step1: 'Dettagli del Servizio',
      step2: 'Le Tue Informazioni',
      step3: 'Pagamento',
      step4: 'Conferma',
      serviceDate: 'Data del Servizio',
      serviceTime: 'Ora Preferita',
      pickupLocation: 'Luogo di Ritiro',
      dropoffLocation: 'Luogo di Destinazione',
      passengers: 'Numero di Passeggeri',
      bikesCount: 'Numero di Biciclette',
      specialRequests: 'Richieste Speciali (opzionale)',
      fullName: 'Nome Completo',
      email: 'Indirizzo Email',
      phone: 'Numero di Telefono',
      language: 'Lingua Preferita',
      priceBreakdown: 'Dettaglio Prezzi',
      basePrice: 'Prezzo Base',
      perPassenger: 'Per Passeggero',
      perBike: 'Per Bicicletta',
      total: 'Totale',
      next: 'Avanti',
      back: 'Indietro',
      payNow: 'Paga Ora',
      processing: 'Elaborazione...',
      confirmationTitle: 'Prenotazione Confermata!',
      confirmationMessage: 'Il tuo shuttle privato è stato prenotato con successo.',
      bookingReference: 'Riferimento Prenotazione',
      emailSent: 'È stata inviata un\'email di conferma a',
      thankYou: 'Grazie per aver scelto Mallorca Cycle Shuttle!',
      requiredField: 'Questo campo è obbligatorio',
      invalidEmail: 'Per favore inserisci un indirizzo email valido',
      invalidPhone: 'Per favore inserisci un numero di telefono valido',
      paymentFailed: 'Pagamento fallito. Per favore riprova.',
      bookingFailed: 'Prenotazione fallita. Per favore riprova o contattaci.',
      pickupPlaceholder: 'es. Port de Pollença',
      dropoffPlaceholder: 'es. Sa Calobra',
      timePlaceholder: 'es. 09:00',
      specialRequestsPlaceholder: 'Requisiti speciali o note...',
    },

    nl: {
      step1: 'Service Details',
      step2: 'Uw Informatie',
      step3: 'Betaling',
      step4: 'Bevestiging',
      serviceDate: 'Service Datum',
      serviceTime: 'Gewenste Tijd',
      pickupLocation: 'Ophaallocatie',
      dropoffLocation: 'Bestemmingslocatie',
      passengers: 'Aantal Passagiers',
      bikesCount: 'Aantal Fietsen',
      specialRequests: 'Speciale Verzoeken (optioneel)',
      fullName: 'Volledige Naam',
      email: 'E-mailadres',
      phone: 'Telefoonnummer',
      language: 'Voorkeurstaal',

      // Form labels - Step 3 (Payment)
      cardholderName: "Naam op kaart",
      cardholderNamePlaceholder: "Jan de Vries",
      cardDetails: "Kaartgegevens",
      priceBreakdown: 'Prijsopbouw',
      basePrice: 'Basisprijs',
      perPassenger: 'Per Passagier',
      perBike: 'Per Fiets',
      total: 'Totaal',
      next: 'Volgende',
      back: 'Terug',
      payNow: 'Nu Betalen',
      processing: 'Verwerken...',
      confirmationTitle: 'Boeking Bevestigd!',
      confirmationMessage: 'Uw privé shuttle is succesvol geboekt.',
      bookingReference: 'Boekingsreferentie',
      emailSent: 'Een bevestigingsmail is verzonden naar',
      thankYou: 'Bedankt voor het kiezen van Mallorca Cycle Shuttle!',
      requiredField: 'Dit veld is verplicht',
      invalidEmail: 'Voer een geldig e-mailadres in',
      invalidPhone: 'Voer een geldig telefoonnummer in',
      paymentFailed: 'Betaling mislukt. Probeer het opnieuw.',
      bookingFailed: 'Boeking mislukt. Probeer het opnieuw of neem contact met ons op.',
      pickupPlaceholder: 'bijv. Port de Pollença',
      dropoffPlaceholder: 'bijv. Sa Calobra',
      timePlaceholder: 'bijv. 09:00',
      specialRequestsPlaceholder: 'Speciale eisen of opmerkingen...',
    },

    da: {
      step1: 'Service Detaljer',
      step2: 'Dine Oplysninger',
      step3: 'Betaling',
      step4: 'Bekræftelse',
      serviceDate: 'Service Dato',
      serviceTime: 'Foretrukket Tid',
      pickupLocation: 'Afhentningssted',
      dropoffLocation: 'Destinationssted',
      passengers: 'Antal Passagerer',
      bikesCount: 'Antal Cykler',
      specialRequests: 'Særlige Ønsker (valgfrit)',
      fullName: 'Fulde Navn',
      email: 'E-mailadresse',
      phone: 'Telefonnummer',
      language: 'Foretrukket Sprog',
      priceBreakdown: 'Prisspecifikation',
      basePrice: 'Basispris',
      perPassenger: 'Per Passager',
      perBike: 'Per Cykel',
      total: 'Total',
      next: 'Næste',
      back: 'Tilbage',
      payNow: 'Betal Nu',
      processing: 'Behandler...',
      confirmationTitle: 'Booking Bekræftet!',
      confirmationMessage: 'Din private shuttle er blevet booket med succes.',
      bookingReference: 'Bookningreference',
      emailSent: 'En bekræftelsesmail er sendt til',
      thankYou: 'Tak for at vælge Mallorca Cycle Shuttle!',
      requiredField: 'Dette felt er påkrævet',
      invalidEmail: 'Indtast venligst en gyldig e-mailadresse',
      invalidPhone: 'Indtast venligst et gyldigt telefonnummer',
      paymentFailed: 'Betaling mislykkedes. Prøv venligst igen.',
      bookingFailed: 'Booking mislykkedes. Prøv venligst igen eller kontakt os.',
      pickupPlaceholder: 'f.eks. Port de Pollença',
      dropoffPlaceholder: 'f.eks. Sa Calobra',
      timePlaceholder: 'f.eks. 09:00',
      specialRequestsPlaceholder: 'Særlige krav eller noter...',
    },

    nb: {
      step1: 'Service Detaljer',
      step2: 'Din Informasjon',
      step3: 'Betaling',
      step4: 'Bekreftelse',
      serviceDate: 'Service Dato',
      serviceTime: 'Foretrukket Tid',
      pickupLocation: 'Hentested',
      dropoffLocation: 'Destinasjon',
      passengers: 'Antall Passasjerer',
      bikesCount: 'Antall Sykler',
      specialRequests: 'Spesielle Ønsker (valgfritt)',
      fullName: 'Fullt Navn',
      email: 'E-postadresse',
      phone: 'Telefonnummer',
      language: 'Foretrukket Språk',
      priceBreakdown: 'Prisoppsplitting',
      basePrice: 'Grunnpris',
      perPassenger: 'Per Passasjer',
      perBike: 'Per Sykkel',
      total: 'Total',
      next: 'Neste',
      back: 'Tilbake',
      payNow: 'Betal Nå',
      processing: 'Behandler...',
      confirmationTitle: 'Booking Bekreftet!',
      confirmationMessage: 'Din private shuttle har blitt booket.',
      bookingReference: 'Bookingsreferanse',
      emailSent: 'En bekreftelsesmail er sendt til',
      thankYou: 'Takk for at du valgte Mallorca Cycle Shuttle!',
      requiredField: 'Dette feltet er påkrevd',
      invalidEmail: 'Vennligst oppgi en gyldig e-postadresse',
      invalidPhone: 'Vennligst oppgi et gyldig telefonnummer',
      paymentFailed: 'Betaling mislyktes. Vennligst prøv igjen.',
      bookingFailed: 'Booking mislyktes. Vennligst prøv igjen eller kontakt oss.',
      pickupPlaceholder: 'f.eks. Port de Pollença',
      dropoffPlaceholder: 'f.eks. Sa Calobra',
      timePlaceholder: 'f.eks. 09:00',
      specialRequestsPlaceholder: 'Spesielle krav eller notater...',
    },

    sv: {
      step1: 'Service Detaljer',
      step2: 'Din Information',
      step3: 'Betalning',
      step4: 'Bekräftelse',
      serviceDate: 'Service Datum',
      serviceTime: 'Önskad Tid',
      pickupLocation: 'Upphämtningsplats',
      dropoffLocation: 'Destination',
      passengers: 'Antal Passagerare',
      bikesCount: 'Antal Cyklar',
      specialRequests: 'Speciella Önskemål (valfritt)',
      fullName: 'Fullständigt Namn',
      email: 'E-postadress',
      phone: 'Telefonnummer',
      language: 'Önskat Språk',
      priceBreakdown: 'Prisuppdelning',
      basePrice: 'Grundpris',
      perPassenger: 'Per Passagerare',
      perBike: 'Per Cykel',
      total: 'Totalt',
      next: 'Nästa',
      back: 'Tillbaka',
      payNow: 'Betala Nu',
      processing: 'Bearbetar...',
      confirmationTitle: 'Bokning Bekräftad!',
      confirmationMessage: 'Din privata shuttle har bokats framgångsrikt.',
      bookingReference: 'Bokningsreferens',
      emailSent: 'Ett bekräftelsemail har skickats till',
      thankYou: 'Tack för att du valde Mallorca Cycle Shuttle!',
      requiredField: 'Detta fält är obligatoriskt',
      invalidEmail: 'Vänligen ange en giltig e-postadress',
      invalidPhone: 'Vänligen ange ett giltigt telefonnummer',
      paymentFailed: 'Betalning misslyckades. Vänligen försök igen.',
      bookingFailed: 'Bokning misslyckades. Vänligen försök igen eller kontakta oss.',
      pickupPlaceholder: 't.ex. Port de Pollença',
      dropoffPlaceholder: 't.ex. Sa Calobra',
      timePlaceholder: 't.ex. 09:00',
      specialRequestsPlaceholder: 'Speciella krav eller anteckningar...',
    },
  };

  // Detect language from URL or default to English
  function detectLanguage() {
    const path = window.location.pathname;
    const langMatch = path.match(/^\/(en|de|es|fr|ca|it|nl|da|nb|sv)\//);
    return langMatch ? langMatch[1] : 'en';
  }

  const currentLang = detectLanguage();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // State
  let currentStep = 1;
  let formData = {};
  let stripe = null;
  let cardElement = null;

  // Initialize
  function init() {
    const container = document.getElementById('booking-form-container');
    if (!container) return;

    // Render the form
    container.innerHTML = renderForm();

    // Initialize Stripe
    initStripe();

    // Add event listeners
    attachEventListeners();

    // Set minimum date to today
    const dateInput = document.getElementById('serviceDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }
  }

  function initStripe() {
    if (typeof Stripe === 'undefined') {
      console.error('Stripe.js not loaded');
      return;
    }

    stripe = Stripe(CONFIG.stripePublishableKey);
    const elements = stripe.elements();

    cardElement = elements.create('card', {
      hidePostalCode: false,
      style: {
        base: {
          fontSize: '16px',
          color: '#111',
          '::placeholder': {
            color: '#aaa',
          },
        },
      },
    });

    // Mount when payment step is shown
    setTimeout(() => {
      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer) {
        cardElement.mount('#card-element');
      }
    }, 100);
  }

  function renderForm() {
    return `
      <div class="booking-form">
        <div class="booking-steps">
          <div class="booking-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}">${t.step1}</div>
          <div class="booking-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}">${t.step2}</div>
          <div class="booking-step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}">${t.step3}</div>
          <div class="booking-step ${currentStep === 4 ? 'active' : ''}">${t.step4}</div>
        </div>

        <div class="booking-content">
          <div id="error-container"></div>

          ${renderStep1()}
          ${renderStep2()}
          ${renderStep3()}
          ${renderStep4()}
        </div>
      </div>
    `;
  }

  function renderStep1() {
    return `
      <div class="booking-panel ${currentStep === 1 ? 'active' : ''}" data-step="1">
        <h3>${t.step1}</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="serviceDate">${t.serviceDate} *</label>
            <input type="date" id="serviceDate" name="serviceDate" required>
          </div>
          <div class="form-group">
            <label for="serviceTime">${t.serviceTime} *</label>
            <input type="time" id="serviceTime" name="serviceTime" placeholder="${t.timePlaceholder}" required>
          </div>
        </div>

        <div class="form-group">
          <label for="pickupLocation">${t.pickupLocation} *</label>
          <input type="text" id="pickupLocation" name="pickupLocation" placeholder="${t.pickupPlaceholder}" required>
        </div>

        <div class="form-group">
          <label for="dropoffLocation">${t.dropoffLocation} *</label>
          <input type="text" id="dropoffLocation" name="dropoffLocation" placeholder="${t.dropoffPlaceholder}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="passengers">${t.passengers} *</label>
            <input type="number" id="passengers" name="passengers" min="1" max="8" value="2" required>
          </div>
          <div class="form-group">
            <label for="bikesCount">${t.bikesCount} *</label>
            <input type="number" id="bikesCount" name="bikesCount" min="0" max="8" value="2" required>
          </div>
        </div>

        <div class="form-group">
          <label for="specialRequests">${t.specialRequests}</label>
          <textarea id="specialRequests" name="specialRequests" rows="3" placeholder="${t.specialRequestsPlaceholder}"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-primary" onclick="window.bookingForm.nextStep()">${t.next}</button>
        </div>
      </div>
    `;
  }

  function renderStep2() {
    return `
      <div class="booking-panel ${currentStep === 2 ? 'active' : ''}" data-step="2">
        <h3>${t.step2}</h3>

        <div class="form-group">
          <label for="customerName">${t.fullName} *</label>
          <input type="text" id="customerName" name="customerName" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="customerEmail">${t.email} *</label>
            <input type="email" id="customerEmail" name="customerEmail" required>
          </div>
          <div class="form-group">
            <label for="customerPhone">${t.phone} *</label>
            <input type="tel" id="customerPhone" name="customerPhone" placeholder="+34 612 34 56 78" required>
          </div>
        </div>

        <div class="form-group">
          <label for="customerLanguage">${t.language}</label>
          <select id="customerLanguage" name="customerLanguage">
            <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
            <option value="de" ${currentLang === 'de' ? 'selected' : ''}>Deutsch</option>
            <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español</option>
            <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>Français</option>
            <option value="ca" ${currentLang === 'ca' ? 'selected' : ''}>Català</option>
            <option value="it" ${currentLang === 'it' ? 'selected' : ''}>Italiano</option>
            <option value="nl" ${currentLang === 'nl' ? 'selected' : ''}>Nederlands</option>
            <option value="da" ${currentLang === 'da' ? 'selected' : ''}>Dansk</option>
            <option value="nb" ${currentLang === 'nb' ? 'selected' : ''}>Norsk</option>
            <option value="sv" ${currentLang === 'sv' ? 'selected' : ''}>Svenska</option>
          </select>
        </div>

        <div class="price-summary">
          <h4>${t.priceBreakdown}</h4>
          <div class="price-row">
            <span>${t.basePrice}</span>
            <span>€50.00</span>
          </div>
          <div class="price-row">
            <span>${t.perPassenger} (<span id="summary-passengers">2</span>)</span>
            <span>€<span id="summary-passenger-price">20.00</span></span>
          </div>
          <div class="price-row">
            <span>${t.perBike} (<span id="summary-bikes">2</span>)</span>
            <span>€<span id="summary-bike-price">10.00</span></span>
          </div>
          <div class="price-row total">
            <span>${t.total}</span>
            <span>€<span id="summary-total">80.00</span></span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.bookingForm.prevStep()">${t.back}</button>
          <button type="button" class="btn btn-primary" onclick="window.bookingForm.nextStep()">${t.next}</button>
        </div>
      </div>
    `;
  }

  function renderStep3() {
    return `
      <div class="booking-panel ${currentStep === 3 ? 'active' : ''}" data-step="3">
        <h3>${t.step3}</h3>

        <div class="price-summary">
          <div class="price-row total">
            <span>${t.total}</span>
            <span>€<span id="payment-total">80.00</span></span>
          </div>
        </div>

        <div class="form-group">
          <label>${t.cardholderName || 'Name on Card'} *</label>
          <input type="text" id="cardholder-name" placeholder="${t.cardholderNamePlaceholder || 'John Doe'}" required>
        </div>

        <div class="form-group">
          <label>${t.cardDetails || 'Card Details'}</label>
          <div id="card-element"></div>
          <div id="card-errors" role="alert"></div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.bookingForm.prevStep()">${t.back}</button>
          <button type="button" id="pay-button" class="btn btn-primary" onclick="window.bookingForm.processPayment()">
            <span class="btn-text">${t.payNow}</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderStep4() {
    return `
      <div class="booking-panel ${currentStep === 4 ? 'active' : ''}" data-step="4">
        <div class="booking-confirmation">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #060;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <h2>${t.confirmationTitle}</h2>
          <p>${t.confirmationMessage}</p>

          <div class="booking-reference">
            <div>${t.bookingReference}</div>
            <div id="final-booking-ref">-</div>
          </div>

          <p class="small">${t.emailSent} <strong id="final-email">-</strong></p>

          <div class="booking-details">
            <dl>
              <dt>${t.serviceDate}</dt>
              <dd id="final-date">-</dd>
              <dt>${t.serviceTime}</dt>
              <dd id="final-time">-</dd>
              <dt>${t.pickupLocation}</dt>
              <dd id="final-pickup">-</dd>
              <dt>${t.dropoffLocation}</dt>
              <dd id="final-dropoff">-</dd>
              <dt>${t.passengers}</dt>
              <dd id="final-passengers">-</dd>
              <dt>${t.bikesCount}</dt>
              <dd id="final-bikes">-</dd>
            </dl>
          </div>

          <p>${t.thankYou}</p>
        </div>
      </div>
    `;
  }

  function attachEventListeners() {
    // Update price when passengers/bikes change
    const passengersInput = document.getElementById('passengers');
    const bikesInput = document.getElementById('bikesCount');

    if (passengersInput) {
      passengersInput.addEventListener('input', updatePrice);
    }
    if (bikesInput) {
      bikesInput.addEventListener('input', updatePrice);
    }

    // Card errors
    if (cardElement) {
      cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      });
    }
  }

  function updatePrice() {
    const passengers = parseInt(document.getElementById('passengers')?.value || 2);
    const bikes = parseInt(document.getElementById('bikesCount')?.value || 2);

    const basePrice = 50;
    const pricePerPassenger = 10;
    const pricePerBike = 5;

    const passengersPrice = passengers * pricePerPassenger;
    const bikesPrice = bikes * pricePerBike;
    const total = basePrice + passengersPrice + bikesPrice;

    // Update summary
    document.getElementById('summary-passengers').textContent = passengers;
    document.getElementById('summary-bikes').textContent = bikes;
    document.getElementById('summary-passenger-price').textContent = passengersPrice.toFixed(2);
    document.getElementById('summary-bike-price').textContent = bikesPrice.toFixed(2);
    document.getElementById('summary-total').textContent = total.toFixed(2);

    const paymentTotal = document.getElementById('payment-total');
    if (paymentTotal) {
      paymentTotal.textContent = total.toFixed(2);
    }

    return total;
  }

  function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearError() {
    document.getElementById('error-container').innerHTML = '';
  }

  function validateStep(step) {
    clearError();

    if (step === 1) {
      const date = document.getElementById('serviceDate').value;
      const time = document.getElementById('serviceTime').value;
      const pickup = document.getElementById('pickupLocation').value;
      const dropoff = document.getElementById('dropoffLocation').value;

      if (!date || !time || !pickup || !dropoff) {
        showError(t.requiredField);
        return false;
      }

      formData.serviceDate = date;
      formData.serviceTime = time;
      formData.pickupLocation = pickup;
      formData.dropoffLocation = dropoff;
      formData.passengers = parseInt(document.getElementById('passengers').value);
      formData.bikesCount = parseInt(document.getElementById('bikesCount').value);
      formData.specialRequests = document.getElementById('specialRequests').value;
    }

    if (step === 2) {
      const name = document.getElementById('customerName').value;
      const email = document.getElementById('customerEmail').value;
      const phone = document.getElementById('customerPhone').value;

      if (!name || !email || !phone) {
        showError(t.requiredField);
        return false;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        showError(t.invalidEmail);
        return false;
      }

      formData.customerName = name;
      formData.customerEmail = email;
      formData.customerPhone = phone;
      formData.customerLanguage = document.getElementById('customerLanguage').value;
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
      currentStep++;
      updateUI();

      if (currentStep === 2) {
        updatePrice();
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      updateUI();
    }
  }

  function updateUI() {
    // Update step indicators
    const steps = document.querySelectorAll('.booking-step');
    steps.forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index + 1 === currentStep) {
        step.classList.add('active');
      } else if (index + 1 < currentStep) {
        step.classList.add('completed');
      }
    });

    // Show/hide panels
    const panels = document.querySelectorAll('.booking-panel');
    panels.forEach((panel, index) => {
      panel.classList.remove('active');
      if (index + 1 === currentStep) {
        panel.classList.add('active');
      }
    });

    // Re-mount card element if moving to payment step
    if (currentStep === 3 && cardElement) {
      setTimeout(() => {
        const container = document.getElementById('card-element');
        if (container && !container.firstChild) {
          cardElement.mount('#card-element');
        }
      }, 100);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function processPayment() {
    const payButton = document.getElementById('pay-button');
    const btnText = payButton.querySelector('.btn-text');

    // Get cardholder name
    const cardholderName = document.getElementById('cardholder-name').value.trim();
    if (!cardholderName) {
      showError(t.requiredField || 'Please enter the cardholder name');
      return;
    }

    payButton.disabled = true;
    btnText.innerHTML = `<span class="loading"></span> ${t.processing}`;

    try {
      // Calculate total
      const total = updatePrice();

      // Create booking first
      const bookingResponse = await fetch(`${CONFIG.apiBaseUrl}/private-shuttles/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceDate: formData.serviceDate,
          departureTime: formData.serviceTime,
          pickupAddress: formData.pickupLocation,
          dropoffAddress: formData.dropoffLocation,
          passengersCount: formData.passengers,
          bikesCount: formData.bikesCount,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerLanguage: formData.customerLanguage,
          specialRequests: formData.specialRequests || '',
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        throw new Error(errorData.error || t.bookingFailed);
      }

      const booking = await bookingResponse.json();
      formData.bookingReference = booking.data.bookingReference;
      formData.bookingId = booking.data.bookingId;

      // Create payment intent
      const paymentResponse = await fetch(`${CONFIG.apiBaseUrl}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: booking.data.bookingReference,
          bookingType: 'private',
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}));
        throw new Error(errorData.error || t.paymentFailed);
      }

      const paymentData = await paymentResponse.json();
      const clientSecret = paymentData.data.clientSecret;

      // Confirm payment with Stripe
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: formData.customerEmail,
          },
        },
      });

      if (error) {
        showError(error.message);
        payButton.disabled = false;
        btnText.textContent = t.payNow;
        return;
      }

      // Success - show confirmation
      currentStep = 4;
      updateUI();
      showConfirmation();

    } catch (error) {
      console.error('Payment error:', error);
      showError(error.message || t.paymentFailed);
      payButton.disabled = false;
      btnText.textContent = t.payNow;
    }
  }

  function showConfirmation() {
    document.getElementById('final-booking-ref').textContent = formData.bookingReference;
    document.getElementById('final-email').textContent = formData.customerEmail;
    document.getElementById('final-date').textContent = formData.serviceDate;
    document.getElementById('final-time').textContent = formData.serviceTime;
    document.getElementById('final-pickup').textContent = formData.pickupLocation;
    document.getElementById('final-dropoff').textContent = formData.dropoffLocation;
    document.getElementById('final-passengers').textContent = formData.passengers;
    document.getElementById('final-bikes').textContent = formData.bikesCount;
  }

  // Expose public methods
  window.bookingForm = {
    nextStep,
    prevStep,
    processPayment,
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
