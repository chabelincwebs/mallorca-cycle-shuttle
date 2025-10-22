// Mallorca Bicycle Rescue App
// Emergency rescue request with GPS location

(function() {
  'use strict';

  // App state
  const state = {
    location: null,
    accuracy: null,
    error: null,
    currentLang: window.rescueI18n?.lang || 'en'
  };

  // DOM Elements
  const elements = {
    form: document.getElementById('rescue-form'),
    gpsLoading: document.getElementById('gps-loading'),
    gpsSuccess: document.getElementById('gps-success'),
    gpsError: document.getElementById('gps-error'),
    gpsAccuracy: document.getElementById('gps-accuracy'),
    gpsErrorText: document.getElementById('gps-error-text'),
    whatsappBtn: document.getElementById('whatsapp-btn'),
    smsBtn: document.getElementById('sms-btn'),
    gdprConsent: document.getElementById('gdpr-consent'),
    langButtons: document.querySelectorAll('.language-selector button')
  };

  // Constants
  const RESCUE_PHONE = '+34622691222'; // Mallorca Bicycle Rescue emergency contact
  const GPS_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  // Initialize app
  function init() {
    setupEventListeners();
    requestLocation();
    loadSavedLanguage();
    loadFormData();
  }

  // Event Listeners
  function setupEventListeners() {
    // GDPR consent toggle
    elements.gdprConsent?.addEventListener('change', updateButtonStates);

    // Action buttons
    elements.whatsappBtn?.addEventListener('click', sendWhatsApp);
    elements.smsBtn?.addEventListener('click', sendSMS);

    // Language switcher
    elements.langButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');
        switchLanguage(lang);
      });
    });

    // Form auto-save
    elements.form?.addEventListener('input', saveFormData);
  }

  // GPS Location Functions
  function requestLocation() {
    if (!navigator.geolocation) {
      showError('gps_error_unavailable');
      return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      GPS_OPTIONS
    );

    // Also watch position for updates
    navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      GPS_OPTIONS
    );
  }

  function handleLocationSuccess(position) {
    state.location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    state.accuracy = Math.round(position.coords.accuracy);
    state.error = null;

    showSuccess();
    updateButtonStates();
  }

  function handleLocationError(error) {
    let errorKey = 'gps_error_unknown';

    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorKey = 'gps_error_denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorKey = 'gps_error_unavailable';
        break;
      case error.TIMEOUT:
        errorKey = 'gps_error_timeout';
        break;
    }

    state.error = errorKey;
    showError(errorKey);
    updateButtonStates();
  }

  function showLoading() {
    elements.gpsLoading.style.display = 'flex';
    elements.gpsSuccess.style.display = 'none';
    elements.gpsError.style.display = 'none';
  }

  function showSuccess() {
    elements.gpsLoading.style.display = 'none';
    elements.gpsSuccess.style.display = 'flex';
    elements.gpsError.style.display = 'none';

    const accuracyText = window.rescueI18n?.translations?.gps_accuracy || 'Accuracy: ±{accuracy}m';
    elements.gpsAccuracy.textContent = accuracyText.replace('{accuracy}', state.accuracy);
  }

  function showError(errorKey) {
    elements.gpsLoading.style.display = 'none';
    elements.gpsSuccess.style.display = 'none';
    elements.gpsError.style.display = 'flex';

    const errorText = window.rescueI18n?.translations?.[errorKey] || 'GPS error';
    elements.gpsErrorText.textContent = errorText;
  }

  // Form Functions
  function getFormData() {
    return {
      name: document.getElementById('name')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      groupSize: document.getElementById('group-size')?.value || '1',
      bikeType: document.getElementById('bike-type')?.value || '',
      destination: document.getElementById('destination')?.value || '',
      notes: document.getElementById('notes')?.value || ''
    };
  }

  function validateForm() {
    if (!elements.form?.checkValidity()) {
      elements.form?.reportValidity();
      return false;
    }

    if (!elements.gdprConsent?.checked) {
      alert(window.rescueI18n?.translations?.form_validation || 'Please accept the consent agreement');
      return false;
    }

    if (!state.location) {
      alert(window.rescueI18n?.translations?.gps_error_unavailable || 'GPS location not available');
      return false;
    }

    return true;
  }

  function updateButtonStates() {
    const hasConsent = elements.gdprConsent?.checked || false;
    const hasLocation = !!state.location;
    const canSend = hasConsent && hasLocation;

    if (elements.whatsappBtn) {
      elements.whatsappBtn.disabled = !canSend;
    }
    if (elements.smsBtn) {
      elements.smsBtn.disabled = !canSend;
    }
  }

  // Message Formatting
  function formatMessage() {
    const data = getFormData();
    const i18n = window.rescueI18n?.translations || {};

    const googleMapsUrl = `https://www.google.com/maps?q=${state.location.lat},${state.location.lng}`;

    let message = `${i18n.emergency_heading || '🚨 EMERGENCY RESCUE REQUEST'}\n\n`;
    message += `${i18n.name_label || 'Name'}: ${data.name}\n`;
    message += `${i18n.phone_label || 'Phone'}: ${data.phone}\n`;
    message += `${i18n.group_label || 'Group Size'}: ${data.groupSize}\n`;
    message += `${i18n.bike_label || 'Bike Type'}: ${data.bikeType}\n`;

    if (data.destination) {
      message += `${i18n.destination_label || 'Destination'}: ${data.destination}\n`;
    }

    if (data.notes) {
      message += `${i18n.notes_label || 'Notes'}: ${data.notes}\n`;
    }

    message += `\n${i18n.location_label || '📍 Location'}:\n`;
    message += `${googleMapsUrl}\n`;
    message += `${i18n.gps_accuracy || 'Accuracy'}: ±${state.accuracy}m`;

    return message;
  }

  // Messaging Functions
  function sendWhatsApp() {
    if (!validateForm()) return;

    const message = formatMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${RESCUE_PHONE}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    showSuccessMessage();
  }

  function sendSMS() {
    if (!validateForm()) return;

    const message = formatMessage();
    const encodedMessage = encodeURIComponent(message);

    // iOS uses different separator
    const separator = /iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?';
    const smsUrl = `sms:${RESCUE_PHONE}${separator}body=${encodedMessage}`;

    window.location.href = smsUrl;
    showSuccessMessage();
  }

  function showSuccessMessage() {
    // Simple success feedback
    const successMsg = window.rescueI18n?.translations?.message_sent || 'Message prepared successfully!';

    // Create temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = successMsg;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Language Functions
  function switchLanguage(lang) {
    saveLanguage(lang);

    // Build the new URL based on current path
    const currentPath = window.location.pathname;
    let newPath;

    // Replace language in path or add it
    if (currentPath.includes('/en/')) {
      newPath = currentPath.replace('/en/', `/${lang}/`);
    } else if (currentPath.includes('/de/')) {
      newPath = currentPath.replace('/de/', `/${lang}/`);
    } else if (currentPath.includes('/es/')) {
      newPath = currentPath.replace('/es/', `/${lang}/`);
    } else {
      // If no language in path, prepend it
      newPath = `/${lang}/rescue-app/`;
    }

    window.location.href = newPath;
  }

  function saveLanguage(lang) {
    try {
      localStorage.setItem('rescue_app_lang', lang);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  }

  function loadSavedLanguage() {
    try {
      const saved = localStorage.getItem('rescue_app_lang');
      if (saved && saved !== state.currentLang) {
        // Language preference exists but doesn't match current page
        // Could auto-redirect here if desired
      }
    } catch (e) {
      console.error('Failed to load language:', e);
    }
  }

  // Form Persistence
  function saveFormData() {
    try {
      const data = getFormData();
      localStorage.setItem('rescue_app_form', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save form data:', e);
    }
  }

  function loadFormData() {
    try {
      const saved = localStorage.getItem('rescue_app_form');
      if (saved) {
        const data = JSON.parse(saved);

        if (data.name) document.getElementById('name').value = data.name;
        if (data.phone) document.getElementById('phone').value = data.phone;
        if (data.groupSize) document.getElementById('group-size').value = data.groupSize;
        if (data.bikeType) document.getElementById('bike-type').value = data.bikeType;
        if (data.destination) document.getElementById('destination').value = data.destination;
        if (data.notes) document.getElementById('notes').value = data.notes;
      }
    } catch (e) {
      console.error('Failed to load form data:', e);
    }
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
