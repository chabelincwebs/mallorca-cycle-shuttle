/**
 * Scheduled Shuttle Booking Form
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

  console.log('[Scheduled Booking] Script loaded');
  console.log('[Scheduled Booking] API Base URL:', CONFIG.apiBaseUrl);
  console.log('[Scheduled Booking] Current hostname:', window.location.hostname);

  // Translations for 10 languages
  const TRANSLATIONS = {
    en: {
      // Steps
      step1: 'Select Service',
      step2: 'Passenger Details',
      step3: 'Payment',
      step4: 'Confirmation',

      // Form labels - Step 1
      from: 'From',
      to: 'To',
      serviceDate: 'Travel Date',
      selectRoute: 'Select route',
      selectDate: 'Select date',
      loadingServices: 'Loading available services...',
      noServices: 'No services available for this route and date',
      availableServices: 'Available Services',
      departureTime: 'Departure',
      seatsAvailable: 'seats available',
      standardTicket: 'Standard Ticket',
      flexiTicket: 'Flexi Ticket',
      flexiDescription: 'Free cancellation',
      selectService: 'Select this service',

      // Form labels - Step 2
      numberOfSeats: 'Number of Seats',
      numberOfBikes: 'Number of Bikes',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      language: 'Preferred Language',

      // Form labels - Step 3 (Payment)
      bookingSummary: 'Booking Summary',
      service: 'Service',
      pickup: 'Pickup',
      dropoff: 'Dropoff',
      seats: 'Seats',
      bikes: 'Bikes',
      ticketType: 'Ticket Type',
      standard: 'Standard',
      flexi: 'Flexi',
      total: 'Total',
      cardholderName: 'Name on Card',
      cardholderNamePlaceholder: 'John Doe',
      cardDetails: 'Card Details',

      // Buttons
      next: 'Next',
      back: 'Back',
      payNow: 'Pay Now',
      processing: 'Processing...',
      downloadTicket: 'Download Ticket',

      // Messages
      confirmationTitle: 'Booking Confirmed!',
      confirmationMessage: 'Your scheduled shuttle has been booked successfully.',
      bookingReference: 'Booking Reference',
      emailSent: 'A confirmation email has been sent to',
      thankYou: 'Thank you for choosing Mallorca Cycle Shuttle!',
      changeInfo: 'For flexi tickets, you can cancel or change your booking using the link in your confirmation email.',

      // Errors
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      selectServiceError: 'Please select a service',
      paymentFailed: 'Payment failed. Please try again.',
      bookingFailed: 'Booking failed. Please try again or contact us.',
      loadingError: 'Failed to load data. Please try again.',
    },

    de: {
      step1: 'Service Auswählen',
      step2: 'Passagierdaten',
      step3: 'Zahlung',
      step4: 'Bestätigung',
      from: 'Von',
      to: 'Nach',
      serviceDate: 'Reisedatum',
      selectRoute: 'Route auswählen',
      selectDate: 'Datum auswählen',
      loadingServices: 'Verfügbare Services werden geladen...',
      noServices: 'Keine Services für diese Route und Datum verfügbar',
      availableServices: 'Verfügbare Services',
      departureTime: 'Abfahrt',
      seatsAvailable: 'Plätze verfügbar',
      standardTicket: 'Standard-Ticket',
      flexiTicket: 'Flexi-Ticket',
      flexiDescription: 'Kostenlose Stornierung',
      selectService: 'Diesen Service auswählen',
      numberOfSeats: 'Anzahl der Sitze',
      numberOfBikes: 'Anzahl der Fahrräder',
      fullName: 'Vollständiger Name',
      email: 'E-Mail-Adresse',
      phone: 'Telefonnummer',
      language: 'Bevorzugte Sprache',
      bookingSummary: 'Buchungsübersicht',
      service: 'Service',
      pickup: 'Abholung',
      dropoff: 'Zielort',
      seats: 'Sitze',
      bikes: 'Fahrräder',
      ticketType: 'Tickettyp',
      standard: 'Standard',
      flexi: 'Flexi',
      total: 'Gesamt',
      cardholderName: 'Name auf der Karte',
      cardholderNamePlaceholder: 'Max Mustermann',
      cardDetails: 'Kartendaten',
      next: 'Weiter',
      back: 'Zurück',
      payNow: 'Jetzt bezahlen',
      processing: 'Wird bearbeitet...',
      downloadTicket: 'Ticket herunterladen',
      confirmationTitle: 'Buchung bestätigt!',
      confirmationMessage: 'Ihr Shuttle wurde erfolgreich gebucht.',
      bookingReference: 'Buchungsreferenz',
      emailSent: 'Eine Bestätigungs-E-Mail wurde gesendet an',
      thankYou: 'Vielen Dank, dass Sie Mallorca Cycle Shuttle gewählt haben!',
      changeInfo: 'Bei Flexi-Tickets können Sie Ihre Buchung über den Link in Ihrer Bestätigungs-E-Mail stornieren oder ändern.',
      requiredField: 'Dieses Feld ist erforderlich',
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      invalidPhone: 'Bitte geben Sie eine gültige Telefonnummer ein',
      selectServiceError: 'Bitte wählen Sie einen Service aus',
      paymentFailed: 'Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.',
      bookingFailed: 'Buchung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.',
      loadingError: 'Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
    },

    es: {
      step1: 'Seleccionar Servicio',
      step2: 'Datos del Pasajero',
      step3: 'Pago',
      step4: 'Confirmación',
      from: 'Desde',
      to: 'Hasta',
      serviceDate: 'Fecha de Viaje',
      selectRoute: 'Seleccionar ruta',
      selectDate: 'Seleccionar fecha',
      loadingServices: 'Cargando servicios disponibles...',
      noServices: 'No hay servicios disponibles para esta ruta y fecha',
      availableServices: 'Servicios Disponibles',
      departureTime: 'Salida',
      seatsAvailable: 'asientos disponibles',
      standardTicket: 'Ticket Estándar',
      flexiTicket: 'Ticket Flexi',
      flexiDescription: 'Cancelación gratuita',
      selectService: 'Seleccionar este servicio',
      numberOfSeats: 'Número de Asientos',
      numberOfBikes: 'Número de Bicicletas',
      fullName: 'Nombre Completo',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      language: 'Idioma Preferido',
      bookingSummary: 'Resumen de Reserva',
      service: 'Servicio',
      pickup: 'Recogida',
      dropoff: 'Destino',
      seats: 'Asientos',
      bikes: 'Bicicletas',
      ticketType: 'Tipo de Ticket',
      standard: 'Estándar',
      flexi: 'Flexi',
      total: 'Total',
      cardholderName: 'Nombre en la tarjeta',
      cardholderNamePlaceholder: 'Juan Pérez',
      cardDetails: 'Datos de la tarjeta',
      next: 'Siguiente',
      back: 'Atrás',
      payNow: 'Pagar Ahora',
      processing: 'Procesando...',
      downloadTicket: 'Descargar Ticket',
      confirmationTitle: '¡Reserva Confirmada!',
      confirmationMessage: 'Su shuttle ha sido reservado con éxito.',
      bookingReference: 'Referencia de Reserva',
      emailSent: 'Se ha enviado un correo de confirmación a',
      thankYou: '¡Gracias por elegir Mallorca Cycle Shuttle!',
      changeInfo: 'Para tickets flexi, puede cancelar o cambiar su reserva usando el enlace en su correo de confirmación.',
      requiredField: 'Este campo es obligatorio',
      invalidEmail: 'Por favor ingrese un correo electrónico válido',
      invalidPhone: 'Por favor ingrese un número de teléfono válido',
      selectServiceError: 'Por favor seleccione un servicio',
      paymentFailed: 'Pago fallido. Por favor intente de nuevo.',
      bookingFailed: 'Reserva fallida. Por favor intente de nuevo o contáctenos.',
      loadingError: 'Error al cargar datos. Por favor intente de nuevo.',
    },

    fr: {
      step1: 'Sélectionner le Service',
      step2: 'Détails du Passager',
      step3: 'Paiement',
      step4: 'Confirmation',
      from: 'De',
      to: 'À',
      serviceDate: 'Date de Voyage',
      selectRoute: 'Sélectionner un itinéraire',
      selectDate: 'Sélectionner une date',
      loadingServices: 'Chargement des services disponibles...',
      noServices: 'Aucun service disponible pour cet itinéraire et cette date',
      availableServices: 'Services Disponibles',
      departureTime: 'Départ',
      seatsAvailable: 'places disponibles',
      standardTicket: 'Billet Standard',
      flexiTicket: 'Billet Flexi',
      flexiDescription: 'Annulation gratuite',
      selectService: 'Sélectionner ce service',
      numberOfSeats: 'Nombre de Places',
      numberOfBikes: 'Nombre de Vélos',
      fullName: 'Nom Complet',
      email: 'Adresse E-mail',
      phone: 'Numéro de Téléphone',
      language: 'Langue Préférée',
      bookingSummary: 'Résumé de la Réservation',
      service: 'Service',
      pickup: 'Ramassage',
      dropoff: 'Destination',
      seats: 'Places',
      bikes: 'Vélos',
      ticketType: 'Type de Billet',
      standard: 'Standard',
      flexi: 'Flexi',
      total: 'Total',
      cardholderName: 'Nom sur la carte',
      cardholderNamePlaceholder: 'Jean Dupont',
      cardDetails: 'Détails de la carte',
      next: 'Suivant',
      back: 'Retour',
      payNow: 'Payer Maintenant',
      processing: 'Traitement...',
      downloadTicket: 'Télécharger le Billet',
      confirmationTitle: 'Réservation Confirmée!',
      confirmationMessage: 'Votre navette a été réservée avec succès.',
      bookingReference: 'Référence de Réservation',
      emailSent: 'Un e-mail de confirmation a été envoyé à',
      thankYou: 'Merci d\'avoir choisi Mallorca Cycle Shuttle!',
      changeInfo: 'Pour les billets flexi, vous pouvez annuler ou modifier votre réservation en utilisant le lien dans votre e-mail de confirmation.',
      requiredField: 'Ce champ est obligatoire',
      invalidEmail: 'Veuillez entrer une adresse e-mail valide',
      invalidPhone: 'Veuillez entrer un numéro de téléphone valide',
      selectServiceError: 'Veuillez sélectionner un service',
      paymentFailed: 'Paiement échoué. Veuillez réessayer.',
      bookingFailed: 'Réservation échouée. Veuillez réessayer ou nous contacter.',
      loadingError: 'Échec du chargement des données. Veuillez réessayer.',
    },

    ca: {
      step1: 'Seleccionar Servei',
      step2: 'Dades del Passatger',
      step3: 'Pagament',
      step4: 'Confirmació',
      from: 'Des de',
      to: 'Fins a',
      serviceDate: 'Data del Viatge',
      selectRoute: 'Seleccionar ruta',
      selectDate: 'Seleccionar data',
      loadingServices: 'Carregant serveis disponibles...',
      noServices: 'No hi ha serveis disponibles per aquesta ruta i data',
      availableServices: 'Serveis Disponibles',
      departureTime: 'Sortida',
      seatsAvailable: 'seients disponibles',
      standardTicket: 'Bitllet Estàndard',
      flexiTicket: 'Bitllet Flexi',
      flexiDescription: 'Cancel·lació gratuïta',
      selectService: 'Seleccionar aquest servei',
      numberOfSeats: 'Nombre de Seients',
      numberOfBikes: 'Nombre de Bicicletes',
      fullName: 'Nom Complet',
      email: 'Correu Electrònic',
      phone: 'Telèfon',
      language: 'Idioma Preferit',
      bookingSummary: 'Resum de Reserva',
      service: 'Servei',
      pickup: 'Recollida',
      dropoff: 'Destinació',
      seats: 'Seients',
      bikes: 'Bicicletes',
      ticketType: 'Tipus de Bitllet',
      standard: 'Estàndard',
      flexi: 'Flexi',
      total: 'Total',
      cardholderName: 'Nom a la targeta',
      cardholderNamePlaceholder: 'Joan Garcia',
      cardDetails: 'Dades de la targeta',
      next: 'Següent',
      back: 'Enrere',
      payNow: 'Pagar Ara',
      processing: 'Processant...',
      downloadTicket: 'Descarregar Bitllet',
      confirmationTitle: 'Reserva Confirmada!',
      confirmationMessage: 'El seu shuttle ha estat reservat amb èxit.',
      bookingReference: 'Referència de Reserva',
      emailSent: 'S\'ha enviat un correu de confirmació a',
      thankYou: 'Gràcies per triar Mallorca Cycle Shuttle!',
      changeInfo: 'Per a bitllets flexi, pot cancel·lar o canviar la seva reserva usant l\'enllaç al correu de confirmació.',
      requiredField: 'Aquest camp és obligatori',
      invalidEmail: 'Si us plau introduïu un correu electrònic vàlid',
      invalidPhone: 'Si us plau introduïu un número de telèfon vàlid',
      selectServiceError: 'Si us plau seleccioneu un servei',
      paymentFailed: 'Pagament fallit. Si us plau torneu-ho a provar.',
      bookingFailed: 'Reserva fallida. Si us plau torneu-ho a provar o contacteu-nos.',
      loadingError: 'Error en carregar dades. Si us plau torneu-ho a provar.',
    },

    it: {
      step1: 'Seleziona Servizio',
      step2: 'Dettagli Passeggero',
      step3: 'Pagamento',
      step4: 'Conferma',
      from: 'Da',
      to: 'A',
      serviceDate: 'Data di Viaggio',
      selectRoute: 'Seleziona percorso',
      selectDate: 'Seleziona data',
      loadingServices: 'Caricamento servizi disponibili...',
      noServices: 'Nessun servizio disponibile per questo percorso e data',
      availableServices: 'Servizi Disponibili',
      departureTime: 'Partenza',
      seatsAvailable: 'posti disponibili',
      standardTicket: 'Biglietto Standard',
      flexiTicket: 'Biglietto Flexi',
      flexiDescription: 'Cancellazione gratuita',
      selectService: 'Seleziona questo servizio',
      numberOfSeats: 'Numero di Posti',
      numberOfBikes: 'Numero di Biciclette',
      fullName: 'Nome Completo',
      email: 'Indirizzo Email',
      phone: 'Numero di Telefono',
      language: 'Lingua Preferita',
      bookingSummary: 'Riepilogo Prenotazione',
      service: 'Servizio',
      pickup: 'Ritiro',
      dropoff: 'Destinazione',
      seats: 'Posti',
      bikes: 'Biciclette',
      ticketType: 'Tipo di Biglietto',
      standard: 'Standard',
      flexi: 'Flexi',
      total: 'Totale',
      cardholderName: 'Nome sulla carta',
      cardholderNamePlaceholder: 'Mario Rossi',
      cardDetails: 'Dettagli della carta',
      next: 'Avanti',
      back: 'Indietro',
      payNow: 'Paga Ora',
      processing: 'Elaborazione...',
      downloadTicket: 'Scarica Biglietto',
      confirmationTitle: 'Prenotazione Confermata!',
      confirmationMessage: 'Il tuo shuttle è stato prenotato con successo.',
      bookingReference: 'Riferimento Prenotazione',
      emailSent: 'È stata inviata un\'email di conferma a',
      thankYou: 'Grazie per aver scelto Mallorca Cycle Shuttle!',
      changeInfo: 'Per i biglietti flexi, puoi cancellare o modificare la tua prenotazione usando il link nella email di conferma.',
      requiredField: 'Questo campo è obbligatorio',
      invalidEmail: 'Per favore inserisci un indirizzo email valido',
      invalidPhone: 'Per favore inserisci un numero di telefono valido',
      selectServiceError: 'Per favore seleziona un servizio',
      paymentFailed: 'Pagamento fallito. Per favore riprova.',
      bookingFailed: 'Prenotazione fallita. Per favore riprova o contattaci.',
      loadingError: 'Caricamento dati fallito. Per favore riprova.',
    },

    nl: {
      step1: 'Service Selecteren',
      step2: 'Passagiersgegevens',
      step3: 'Betaling',
      step4: 'Bevestiging',
      from: 'Van',
      to: 'Naar',
      serviceDate: 'Reisdatum',
      selectRoute: 'Selecteer route',
      selectDate: 'Selecteer datum',
      loadingServices: 'Beschikbare services laden...',
      noServices: 'Geen services beschikbaar voor deze route en datum',
      availableServices: 'Beschikbare Services',
      departureTime: 'Vertrek',
      seatsAvailable: 'plaatsen beschikbaar',
      standardTicket: 'Standaard Ticket',
      flexiTicket: 'Flexi Ticket',
      flexiDescription: 'Gratis annulering',
      selectService: 'Selecteer deze service',
      numberOfSeats: 'Aantal Plaatsen',
      numberOfBikes: 'Aantal Fietsen',
      fullName: 'Volledige Naam',
      email: 'E-mailadres',
      phone: 'Telefoonnummer',
      language: 'Voorkeurstaal',
      bookingSummary: 'Boekingsoverzicht',
      service: 'Service',
      pickup: 'Ophalen',
      dropoff: 'Bestemming',
      seats: 'Plaatsen',
      bikes: 'Fietsen',
      ticketType: 'Tickettype',
      standard: 'Standaard',
      flexi: 'Flexi',
      total: 'Totaal',
      cardholderName: 'Naam op kaart',
      cardholderNamePlaceholder: 'Jan de Vries',
      cardDetails: 'Kaartgegevens',
      next: 'Volgende',
      back: 'Terug',
      payNow: 'Nu Betalen',
      processing: 'Verwerken...',
      downloadTicket: 'Download Ticket',
      confirmationTitle: 'Boeking Bevestigd!',
      confirmationMessage: 'Uw shuttle is succesvol geboekt.',
      bookingReference: 'Boekingsreferentie',
      emailSent: 'Een bevestigingsmail is verzonden naar',
      thankYou: 'Bedankt voor het kiezen van Mallorca Cycle Shuttle!',
      changeInfo: 'Voor flexi tickets kunt u uw boeking annuleren of wijzigen via de link in uw bevestigingsmail.',
      requiredField: 'Dit veld is verplicht',
      invalidEmail: 'Voer een geldig e-mailadres in',
      invalidPhone: 'Voer een geldig telefoonnummer in',
      selectServiceError: 'Selecteer een service',
      paymentFailed: 'Betaling mislukt. Probeer het opnieuw.',
      bookingFailed: 'Boeking mislukt. Probeer het opnieuw of neem contact met ons op.',
      loadingError: 'Laden van gegevens mislukt. Probeer het opnieuw.',
    },

    da: {
      step1: 'Vælg Service',
      step2: 'Passagerdetaljer',
      step3: 'Betaling',
      step4: 'Bekræftelse',
      from: 'Fra',
      to: 'Til',
      serviceDate: 'Rejsedato',
      selectRoute: 'Vælg rute',
      selectDate: 'Vælg dato',
      loadingServices: 'Indlæser tilgængelige services...',
      noServices: 'Ingen services tilgængelige for denne rute og dato',
      availableServices: 'Tilgængelige Services',
      departureTime: 'Afgang',
      seatsAvailable: 'pladser tilgængelige',
      standardTicket: 'Standard Billet',
      flexiTicket: 'Flexi Billet',
      flexiDescription: 'Gratis afbestilling',
      selectService: 'Vælg denne service',
      numberOfSeats: 'Antal Pladser',
      numberOfBikes: 'Antal Cykler',
      fullName: 'Fulde Navn',
      email: 'E-mailadresse',
      phone: 'Telefonnummer',
      language: 'Foretrukket Sprog',
      bookingSummary: 'Bookingoversigt',
      service: 'Service',
      pickup: 'Afhentning',
      dropoff: 'Destination',
      seats: 'Pladser',
      bikes: 'Cykler',
      ticketType: 'Billettype',
      standard: 'Standard',
      flexi: 'Flexi',
      total: 'Total',
      cardholderName: 'Navn på kort',
      cardholderNamePlaceholder: 'Lars Jensen',
      cardDetails: 'Kortdetaljer',
      next: 'Næste',
      back: 'Tilbage',
      payNow: 'Betal Nu',
      processing: 'Behandler...',
      downloadTicket: 'Download Billet',
      confirmationTitle: 'Booking Bekræftet!',
      confirmationMessage: 'Din shuttle er blevet booket med succes.',
      bookingReference: 'Bookningreference',
      emailSent: 'En bekræftelsesmail er sendt til',
      thankYou: 'Tak for at vælge Mallorca Cycle Shuttle!',
      changeInfo: 'For flexi billetter kan du annullere eller ændre din booking via linket i din bekræftelsesmail.',
      requiredField: 'Dette felt er påkrævet',
      invalidEmail: 'Indtast venligst en gyldig e-mailadresse',
      invalidPhone: 'Indtast venligst et gyldigt telefonnummer',
      selectServiceError: 'Vælg venligst en service',
      paymentFailed: 'Betaling mislykkedes. Prøv venligst igen.',
      bookingFailed: 'Booking mislykkedes. Prøv venligst igen eller kontakt os.',
      loadingError: 'Kunne ikke indlæse data. Prøv venligst igen.',
    },

    nb: {
      step1: 'Velg Service',
      step2: 'Passasjerdetaljer',
      step3: 'Betaling',
      step4: 'Bekreftelse',
      from: 'Fra',
      to: 'Til',
      serviceDate: 'Reisedato',
      selectRoute: 'Velg rute',
      selectDate: 'Velg dato',
      loadingServices: 'Laster tilgjengelige tjenester...',
      noServices: 'Ingen tjenester tilgjengelige for denne ruten og datoen',
      availableServices: 'Tilgjengelige Tjenester',
      departureTime: 'Avgang',
      seatsAvailable: 'plasser tilgjengelig',
      standardTicket: 'Standard Billett',
      flexiTicket: 'Flexi Billett',
      flexiDescription: 'Gratis avbestilling',
      selectService: 'Velg denne tjenesten',
      numberOfSeats: 'Antall Plasser',
      numberOfBikes: 'Antall Sykler',
      fullName: 'Fullt Navn',
      email: 'E-postadresse',
      phone: 'Telefonnummer',
      language: 'Foretrukket Språk',
      bookingSummary: 'Bookingsammendrag',
      service: 'Tjeneste',
      pickup: 'Henting',
      dropoff: 'Destinasjon',
      seats: 'Plasser',
      bikes: 'Sykler',
      ticketType: 'Billetttype',
      standard: 'Standard',
      flexi: 'Flexi',
      total: 'Total',
      cardholderName: 'Navn på kort',
      cardholderNamePlaceholder: 'Ola Nordmann',
      cardDetails: 'Kortdetaljer',
      next: 'Neste',
      back: 'Tilbake',
      payNow: 'Betal Nå',
      processing: 'Behandler...',
      downloadTicket: 'Last ned Billett',
      confirmationTitle: 'Booking Bekreftet!',
      confirmationMessage: 'Din shuttle har blitt booket.',
      bookingReference: 'Bookingsreferanse',
      emailSent: 'En bekreftelsesmail er sendt til',
      thankYou: 'Takk for at du valgte Mallorca Cycle Shuttle!',
      changeInfo: 'For flexi billetter kan du kansellere eller endre bookingen ved å bruke lenken i bekreftelsesmailen.',
      requiredField: 'Dette feltet er påkrevd',
      invalidEmail: 'Vennligst oppgi en gyldig e-postadresse',
      invalidPhone: 'Vennligst oppgi et gyldig telefonnummer',
      selectServiceError: 'Vennligst velg en tjeneste',
      paymentFailed: 'Betaling mislyktes. Vennligst prøv igjen.',
      bookingFailed: 'Booking mislyktes. Vennligst prøv igjen eller kontakt oss.',
      loadingError: 'Kunne ikke laste data. Vennligst prøv igjen.',
    },

    sv: {
      step1: 'Välj Service',
      step2: 'Passageraruppgifter',
      step3: 'Betalning',
      step4: 'Bekräftelse',
      from: 'Från',
      to: 'Till',
      serviceDate: 'Resedatum',
      selectRoute: 'Välj rutt',
      selectDate: 'Välj datum',
      loadingServices: 'Laddar tillgängliga tjänster...',
      noServices: 'Inga tjänster tillgängliga för denna rutt och datum',
      availableServices: 'Tillgängliga Tjänster',
      departureTime: 'Avgång',
      seatsAvailable: 'platser tillgängliga',
      standardTicket: 'Standard Biljett',
      flexiTicket: 'Flexi Biljett',
      flexiDescription: 'Gratis avbokning',
      selectService: 'Välj denna tjänst',
      numberOfSeats: 'Antal Platser',
      numberOfBikes: 'Antal Cyklar',
      fullName: 'Fullständigt Namn',
      email: 'E-postadress',
      phone: 'Telefonnummer',
      language: 'Önskat Språk',
      bookingSummary: 'Bokningsöversikt',
      service: 'Tjänst',
      pickup: 'Upphämtning',
      dropoff: 'Destination',
      seats: 'Platser',
      bikes: 'Cyklar',
      ticketType: 'Biljetttyp',
      standard: 'Standard',
      flexi: 'Flexi',
      total: 'Totalt',
      cardholderName: 'Namn på kort',
      cardholderNamePlaceholder: 'Anna Andersson',
      cardDetails: 'Kortuppgifter',
      next: 'Nästa',
      back: 'Tillbaka',
      payNow: 'Betala Nu',
      processing: 'Bearbetar...',
      downloadTicket: 'Ladda ner Biljett',
      confirmationTitle: 'Bokning Bekräftad!',
      confirmationMessage: 'Din shuttle har bokats framgångsrikt.',
      bookingReference: 'Bokningsreferens',
      emailSent: 'Ett bekräftelsemail har skickats till',
      thankYou: 'Tack för att du valde Mallorca Cycle Shuttle!',
      changeInfo: 'För flexi biljetter kan du avboka eller ändra din bokning via länken i ditt bekräftelsemail.',
      requiredField: 'Detta fält är obligatoriskt',
      invalidEmail: 'Vänligen ange en giltig e-postadress',
      invalidPhone: 'Vänligen ange ett giltigt telefonnummer',
      selectServiceError: 'Vänligen välj en tjänst',
      paymentFailed: 'Betalning misslyckades. Vänligen försök igen.',
      bookingFailed: 'Bokning misslyckades. Vänligen försök igen eller kontakta oss.',
      loadingError: 'Kunde inte ladda data. Vänligen försök igen.',
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
  let formData = {
    selectedService: null,
    selectedTicketType: null,
    pickupLocationId: null,
  };
  let routes = [];
  let availableServices = [];
  let stripe = null;
  let cardElement = null;

  // Initialize
  function init() {
    console.log('[Scheduled Booking] init() called');
    const container = document.getElementById('scheduled-booking-form-container');
    if (!container) {
      console.error('[Scheduled Booking] Container element not found!');
      return;
    }
    console.log('[Scheduled Booking] Container found, rendering form...');

    // Render the form
    container.innerHTML = renderForm();

    // Initialize Stripe
    console.log('[Scheduled Booking] Initializing Stripe...');
    initStripe();

    // Load routes
    console.log('[Scheduled Booking] Loading routes...');
    loadRoutes();

    // Add event listeners
    console.log('[Scheduled Booking] Attaching event listeners...');
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

    // Card element will be mounted when payment step is shown
  }

  async function loadRoutes() {
    const url = `${CONFIG.apiBaseUrl}/scheduled-bookings/routes`;
    console.log('[Scheduled Booking] Fetching routes from:', url);

    try {
      const response = await fetch(url);
      console.log('[Scheduled Booking] Routes fetch response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Scheduled Booking] Routes fetch failed:', errorText);
        throw new Error(`Failed to fetch routes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Scheduled Booking] Routes data received:', data);
      routes = data.data;
      console.log('[Scheduled Booking] Routes stored:', routes.length, 'routes');

      // Populate route dropdowns
      populateRouteDropdowns();
      console.log('[Scheduled Booking] Route dropdowns populated');
    } catch (error) {
      console.error('[Scheduled Booking] Error loading routes:', error);
      console.error('[Scheduled Booking] Error details:', error.message, error.stack);
      showError(t.loadingError);
    }
  }

  function populateRouteDropdowns() {
    const fromSelect = document.getElementById('fromLocation');
    const toSelect = document.getElementById('toLocation');

    if (!fromSelect || !toSelect) return;

    // Get localized name based on current language
    const getLocalizedName = (route) => {
      const langMap = {
        en: route.name,
        de: route.nameDe || route.name,
        es: route.nameEs || route.name,
        fr: route.nameFr || route.name,
        ca: route.nameCa || route.name,
        it: route.nameIt || route.name,
        nl: route.nameNl || route.name,
        da: route.name,
        nb: route.name,
        sv: route.name,
      };
      return langMap[currentLang] || route.name;
    };

    const routeOptions = routes.map(route =>
      `<option value="${route.id}">${getLocalizedName(route)}</option>`
    ).join('');

    fromSelect.innerHTML = `<option value="">${t.selectRoute}</option>${routeOptions}`;
    toSelect.innerHTML = `<option value="">${t.selectRoute}</option>${routeOptions}`;
  }

  async function loadAvailableServices() {
    const fromId = document.getElementById('fromLocation').value;
    const toId = document.getElementById('toLocation').value;
    const date = document.getElementById('serviceDate').value;

    if (!fromId || !toId || !date) {
      document.getElementById('services-list').innerHTML = '';
      return;
    }

    const servicesContainer = document.getElementById('services-list');
    servicesContainer.innerHTML = `<p class="loading-message">${t.loadingServices}</p>`;

    try {
      const response = await fetch(
        `${CONFIG.apiBaseUrl}/scheduled-bookings/services/available?from=${fromId}&to=${toId}&date=${date}`
      );

      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      availableServices = data.data;

      if (availableServices.length === 0) {
        servicesContainer.innerHTML = `<p class="no-services">${t.noServices}</p>`;
        return;
      }

      renderServices();
    } catch (error) {
      console.error('Error loading services:', error);
      servicesContainer.innerHTML = `<p class="error-message">${t.loadingError}</p>`;
    }
  }

  function renderServices() {
    const servicesContainer = document.getElementById('services-list');
    
    servicesContainer.innerHTML = `
      <h4>${t.availableServices}</h4>
      <div class="services-grid">
        ${availableServices.map(service => renderServiceCard(service)).join('')}
      </div>
    `;
  }

  function renderServiceCard(service) {
    const departureTime = service.departureTime.substring(11, 16); // Extract HH:MM from ISO datetime
    const standardPrice = service.pricing.standardPrice.toFixed(2);
    const flexiPrice = service.pricing.flexiPrice.toFixed(2);

    return `
      <div class="service-card">
        <div class="service-header">
          <div class="service-time">
            <strong>${t.departureTime}:</strong> ${departureTime}
          </div>
          <div class="service-seats ${service.availability.availableSeats < 10 ? 'low-availability' : ''}">
            ${service.availability.availableSeats}/${service.availability.totalSeats} ${t.seatsAvailable}
          </div>
        </div>

        <div class="ticket-options">
          <label class="ticket-option">
            <input type="radio" name="service-${service.id}" value="standard" 
              onchange="window.scheduledBookingForm.selectService(${service.id}, ${service.pickupLocations[0].id}, 'standard', ${standardPrice})">
            <div class="ticket-info">
              <div class="ticket-type">${t.standardTicket}</div>
              <div class="ticket-price">€${standardPrice}</div>
            </div>
          </label>

          <label class="ticket-option">
            <input type="radio" name="service-${service.id}" value="flexi"
              onchange="window.scheduledBookingForm.selectService(${service.id}, ${service.pickupLocations[0].id}, 'flexi', ${flexiPrice})">
            <div class="ticket-info">
              <div class="ticket-type">${t.flexiTicket}</div>
              <div class="ticket-price">€${flexiPrice}</div>
              <div class="ticket-description">${t.flexiDescription}</div>
            </div>
          </label>
        </div>
      </div>
    `;
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
            <label for="fromLocation">${t.from} *</label>
            <select id="fromLocation" name="fromLocation" required>
              <option value="">${t.selectRoute}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="toLocation">${t.to} *</label>
            <select id="toLocation" name="toLocation" required>
              <option value="">${t.selectRoute}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="serviceDate">${t.serviceDate} *</label>
          <input type="date" id="serviceDate" name="serviceDate" required>
        </div>

        <div id="services-list"></div>

        <div class="form-actions">
          <button type="button" class="btn btn-primary" onclick="window.scheduledBookingForm.nextStep()">${t.next}</button>
        </div>
      </div>
    `;
  }

  function renderStep2() {
    return `
      <div class="booking-panel ${currentStep === 2 ? 'active' : ''}" data-step="2">
        <h3>${t.step2}</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="seatsBooked">${t.numberOfSeats} *</label>
            <select id="seatsBooked" name="seatsBooked" required>
              ${Array.from({length: 10}, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="bikesCount">${t.numberOfBikes} *</label>
            <select id="bikesCount" name="bikesCount" required>
              ${Array.from({length: 11}, (_, i) => `<option value="${i}">${i}</option>`).join('')}
            </select>
          </div>
        </div>

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

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.scheduledBookingForm.prevStep()">${t.back}</button>
          <button type="button" class="btn btn-primary" onclick="window.scheduledBookingForm.nextStep()">${t.next}</button>
        </div>
      </div>
    `;
  }

  function renderStep3() {
    return `
      <div class="booking-panel ${currentStep === 3 ? 'active' : ''}" data-step="3">
        <h3>${t.step3}</h3>

        <div class="price-summary">
          <h4>${t.bookingSummary}</h4>
          <div class="price-row">
            <span>${t.service}:</span>
            <span id="summary-service">-</span>
          </div>
          <div class="price-row">
            <span>${t.pickup}:</span>
            <span id="summary-pickup">-</span>
          </div>
          <div class="price-row">
            <span>${t.dropoff}:</span>
            <span id="summary-dropoff">-</span>
          </div>
          <div class="price-row">
            <span>${t.seats}:</span>
            <span id="summary-seats">1</span>
          </div>
          <div class="price-row">
            <span>${t.bikes}:</span>
            <span id="summary-bikes">0</span>
          </div>
          <div class="price-row">
            <span>${t.ticketType}:</span>
            <span id="summary-ticket-type">-</span>
          </div>
          <div class="price-row total">
            <span>${t.total}</span>
            <span>€<span id="payment-total">0.00</span></span>
          </div>
        </div>

        <div class="form-group">
          <label>${t.cardholderName} *</label>
          <input type="text" id="cardholder-name" placeholder="${t.cardholderNamePlaceholder}" required>
        </div>

        <div class="form-group">
          <label>${t.cardDetails}</label>
          <div id="card-element"></div>
          <div id="card-errors" role="alert"></div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.scheduledBookingForm.prevStep()">${t.back}</button>
          <button type="button" id="pay-button" class="btn btn-primary" onclick="window.scheduledBookingForm.processPayment()">
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
              <dt>${t.service}</dt>
              <dd id="final-service">-</dd>
              <dt>${t.pickup}</dt>
              <dd id="final-pickup">-</dd>
              <dt>${t.dropoff}</dt>
              <dd id="final-dropoff">-</dd>
              <dt>${t.seats}</dt>
              <dd id="final-seats">-</dd>
              <dt>${t.bikes}</dt>
              <dd id="final-bikes">-</dd>
              <dt>${t.ticketType}</dt>
              <dd id="final-ticket-type">-</dd>
            </dl>
          </div>

          <div id="flexi-info" style="display: none; margin-top: 1rem; padding: 1rem; background: #f0f8ff; border-radius: 0.5rem;">
            <p>${t.changeInfo}</p>
          </div>

          <p>${t.thankYou}</p>

          <div class="form-actions" style="border-top: none; padding-top: 0;">
            <button type="button" class="btn btn-secondary" disabled>${t.downloadTicket}</button>
          </div>
        </div>
      </div>
    `;
  }

  function attachEventListeners() {
    // Watch for route/date changes
    const fromSelect = document.getElementById('fromLocation');
    const toSelect = document.getElementById('toLocation');
    const dateInput = document.getElementById('serviceDate');

    if (fromSelect) fromSelect.addEventListener('change', loadAvailableServices);
    if (toSelect) toSelect.addEventListener('change', loadAvailableServices);
    if (dateInput) dateInput.addEventListener('change', loadAvailableServices);

    // Card errors
    if (cardElement) {
      cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (displayError) {
          if (event.error) {
            displayError.textContent = event.error.message;
          } else {
            displayError.textContent = '';
          }
        }
      });
    }
  }

  function selectService(serviceId, pickupLocationId, ticketType, price) {
    formData.selectedService = availableServices.find(s => s.id === serviceId);
    formData.selectedTicketType = ticketType;
    formData.pickupLocationId = pickupLocationId;
    formData.pricePerSeat = price;
  }

  function updatePaymentSummary() {
    if (!formData.selectedService) return;

    const seats = parseInt(document.getElementById('seatsBooked')?.value || 1);
    const bikes = parseInt(document.getElementById('bikesCount')?.value || 0);
    const total = formData.pricePerSeat * seats;

    const service = formData.selectedService;
    const serviceTime = service.departureTime.substring(11, 16); // Extract HH:MM from ISO datetime
    const serviceDate = new Date(service.serviceDate).toLocaleDateString(currentLang);

    // Get localized location names
    const getLocalizedName = (location) => {
      const langMap = {
        en: location.name,
        de: location.nameDe || location.name,
        es: location.nameEs || location.name,
        fr: location.name,
        ca: location.name,
        it: location.name,
        nl: location.name,
      };
      return langMap[currentLang] || location.name;
    };

    const pickupLocation = service.pickupLocations.find(p => p.id === formData.pickupLocationId);

    document.getElementById('summary-service').textContent = `${serviceDate} ${serviceTime}`;
    document.getElementById('summary-pickup').textContent = getLocalizedName(pickupLocation);
    document.getElementById('summary-dropoff').textContent = getLocalizedName(service.dropoffLocation);
    document.getElementById('summary-seats').textContent = seats;
    document.getElementById('summary-bikes').textContent = bikes;
    document.getElementById('summary-ticket-type').textContent = formData.selectedTicketType === 'flexi' ? t.flexi : t.standard;
    document.getElementById('payment-total').textContent = total.toFixed(2);
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
      const from = document.getElementById('fromLocation').value;
      const to = document.getElementById('toLocation').value;
      const date = document.getElementById('serviceDate').value;

      if (!from || !to || !date) {
        showError(t.requiredField);
        return false;
      }

      if (!formData.selectedService || !formData.selectedTicketType) {
        showError(t.selectServiceError);
        return false;
      }

      formData.fromLocation = from;
      formData.toLocation = to;
      formData.serviceDate = date;
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
      formData.seatsBooked = parseInt(document.getElementById('seatsBooked').value);
      formData.bikesCount = parseInt(document.getElementById('bikesCount').value);
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
      currentStep++;
      updateUI();

      if (currentStep === 3) {
        updatePaymentSummary();
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

    // Mount card element if moving to payment step
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
      showError(t.requiredField);
      return;
    }

    payButton.disabled = true;
    btnText.innerHTML = `<span class="loading"></span> ${t.processing}`;

    try {
      // Create booking first
      const bookingResponse = await fetch(`${CONFIG.apiBaseUrl}/scheduled-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: formData.selectedService.id,
          pickupLocationId: formData.pickupLocationId,
          seatsBooked: formData.seatsBooked,
          bikesCount: formData.bikesCount,
          ticketType: formData.selectedTicketType,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerLanguage: formData.customerLanguage,
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        throw new Error(errorData.error || t.bookingFailed);
      }

      const booking = await bookingResponse.json();
      formData.bookingReference = booking.data.bookingReference;
      formData.bookingData = booking.data;

      // Create payment intent
      const paymentResponse = await fetch(`${CONFIG.apiBaseUrl}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: booking.data.bookingReference,
          bookingType: 'scheduled',
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
    const service = formData.selectedService;
    const serviceTime = service.departureTime.substring(11, 16); // Extract HH:MM from ISO datetime
    const serviceDate = new Date(service.serviceDate).toLocaleDateString(currentLang);

    const getLocalizedName = (location) => {
      const langMap = {
        en: location.name,
        de: location.nameDe || location.name,
        es: location.nameEs || location.name,
        fr: location.name,
        ca: location.name,
        it: location.name,
        nl: location.name,
      };
      return langMap[currentLang] || location.name;
    };

    const pickupLocation = service.pickupLocations.find(p => p.id === formData.pickupLocationId);

    document.getElementById('final-booking-ref').textContent = formData.bookingReference;
    document.getElementById('final-email').textContent = formData.customerEmail;
    document.getElementById('final-service').textContent = `${serviceDate} ${serviceTime}`;
    document.getElementById('final-pickup').textContent = getLocalizedName(pickupLocation);
    document.getElementById('final-dropoff').textContent = getLocalizedName(service.dropoffLocation);
    document.getElementById('final-seats').textContent = formData.seatsBooked;
    document.getElementById('final-bikes').textContent = formData.bikesCount;
    document.getElementById('final-ticket-type').textContent = formData.selectedTicketType === 'flexi' ? t.flexi : t.standard;

    // Show flexi info if applicable
    if (formData.selectedTicketType === 'flexi') {
      document.getElementById('flexi-info').style.display = 'block';
    }
  }

  // Expose public methods
  window.scheduledBookingForm = {
    nextStep,
    prevStep,
    processPayment,
    selectService,
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
