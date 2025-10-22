# Mallorca Bicycle Rescue - PWA Emergency App

## Overview

A Progressive Web App (PWA) for emergency bicycle rescue requests. This app captures GPS location and allows cyclists to send rescue requests via WhatsApp or SMS.

## Features

✅ **GPS Location Capture** - High-accuracy location with visible accuracy indicator
✅ **Multilingual** - English, German, Spanish (language switcher + i18n)
✅ **Offline Capable** - Works without internet after first load (Service Worker)
✅ **Install Prompt** - Can be installed as standalone app on mobile devices
✅ **GDPR Compliant** - Consent checkbox with privacy information
✅ **Form Persistence** - Auto-saves form data to localStorage
✅ **WhatsApp & SMS Integration** - One-tap messaging with pre-filled rescue details
✅ **SEO Protected** - `noindex, nofollow` to keep page private

## File Structure

```
/content/[lang]/rescue-app/_index.md   # Content pages (EN/DE/ES)
/layouts/rescue-app/rescue-app.html     # Custom layout template
/static/js/rescue-app.js                # App JavaScript
/static/css/rescue-app.css              # App styles
/static/sw.js                           # Service Worker
/static/manifest.json                   # PWA manifest
/i18n/[lang].yaml                       # Translations (rescue_* keys)
```

## URLs

- English: `/en/rescue-app/`
- German: `/de/rescue-app/`
- Spanish: `/es/rescue-app/`

## Configuration

### 1. Update Rescue Phone Number

In `/static/js/rescue-app.js`, update line 29:

```javascript
const RESCUE_PHONE = '+34665757575'; // Change to your actual rescue number
```

### 2. Create PWA Icons

You need to create two PNG icons and place them in `/static/img/`:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

**Icon Requirements:**
- Square format (1:1 aspect ratio)
- PNG format with transparency
- Use your brand colors (recommend red #f00000 background)
- Include bicycle or rescue symbol
- Ensure text is readable at small sizes

**Tools to create icons:**
- Canva (canva.com) - Use "App Icon" template
- Figma (figma.com) - Free design tool
- PWA Asset Generator: `npx pwa-asset-generator logo.svg ./static/img --icon-only`

**Quick placeholder creation (temporary):**
You can use ImageMagick to create simple placeholder icons:

```bash
# Create red background with white text
convert -size 192x192 xc:'#f00000' -gravity center \
  -pointsize 60 -fill white -annotate +0+0 'MBR' \
  static/img/icon-192.png

convert -size 512x512 xc:'#f00000' -gravity center \
  -pointsize 180 -fill white -annotate +0+0 'MBR' \
  static/img/icon-512.png
```

## Testing

### Local Testing

1. Build and serve:
   ```bash
   hugo server -D
   ```

2. Visit: `http://localhost:1313/en/rescue-app/`

3. Test on mobile device:
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Visit: `http://YOUR_IP:1313/en/rescue-app/` on phone

### GPS Testing

**Desktop:** Most desktop browsers will prompt for location permission. Accuracy will be low (WiFi-based).

**Mobile:** Best testing environment. GPS accuracy typically 5-20 meters outdoors.

**GPS Permissions:**
- Chrome: Click lock icon in address bar → Site Settings → Location
- Safari iOS: Settings → Safari → Location → Ask
- Chrome Android: Settings → Site Settings → mallorcabicyclerescue.com → Location

### PWA Installation Testing

**Android Chrome:**
1. Visit the rescue app page
2. Tap menu (⋮) → "Install app" or "Add to Home screen"
3. App will open in standalone mode

**iOS Safari:**
1. Visit the rescue app page
2. Tap Share button → "Add to Home Screen"
3. Enter app name → Add

### Offline Testing

1. Install the app or visit page once
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload page - should still work

## Message Format

When users send a rescue request, the message includes:

```
🚨 EMERGENCY RESCUE REQUEST

Name: John Doe
Phone: +34612345678
Group Size: 2
Bike Type: Road Bike
Notes: Flat tire, unable to continue

📍 Location:
https://www.google.com/maps?q=39.12345,2.67890
Accuracy: ±8m
```

## Distribution

### QR Code Generation

Generate QR codes for each language:

```bash
# Using online tools:
# - qr-code-generator.com
# - qrcode-monkey.com

# Direct URLs to encode:
https://mallorcabicyclerescue.com/en/rescue-app/
https://mallorcabicyclerescue.com/de/rescue-app/
https://mallorcabicyclerescue.com/es/rescue-app/
```

### Policy Card Distribution

Create laminated cards for policyholders with:
- QR code to rescue app
- Backup phone number
- Brief instructions
- Available in all 3 languages

## Security & Privacy

### GDPR Compliance

- ✅ Explicit consent checkbox required
- ✅ Clear privacy statement displayed
- ✅ No data stored on server
- ✅ Location only shared when user sends message
- ✅ Data stays client-side only

### SEO Protection

- ✅ `robots: noindex, nofollow` in front matter
- ✅ `meta name="robots"` in HTML head
- ✅ Not linked from public pages
- ✅ Only accessible via direct URL/QR code

## Troubleshooting

### "Location access denied"
- User needs to grant location permission in browser settings
- On iOS, also check Settings → Privacy → Location Services

### "GPS accuracy is very low"
- Indoor locations have poor GPS
- Wait 30-60 seconds for GPS lock
- Move outdoors for better signal

### Service Worker not updating
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear cache in DevTools → Application → Clear Storage
- Increment version in `/static/sw.js` line 4

### Icons not showing
- Check files exist: `/static/img/icon-192.png` and `/static/img/icon-512.png`
- Clear browser cache
- Rebuild Hugo: `hugo --cleanDestinationDir`

### Form not saving
- Check browser localStorage is enabled
- Check console for JavaScript errors
- Ensure not in private/incognito mode

## Maintenance

### Updating Translations

Edit `/i18n/[lang].yaml` and add/modify keys starting with `rescue_*`

### Updating Styles

Edit `/static/css/rescue-app.css`

### Updating Functionality

Edit `/static/js/rescue-app.js`

### Cache Busting

When you make changes to CSS/JS, increment the version number in:
1. `/static/sw.js` - Update `CACHE_NAME` variable (line 4)

This forces browsers to download new assets.

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 80+ | ✅ Full |
| Safari iOS | 13+ | ✅ Full |
| Safari Mac | 13+ | ✅ Full |
| Edge | 80+ | ✅ Full |
| Firefox | 75+ | ✅ Full |
| Samsung Internet | 12+ | ✅ Full |

## Analytics (Optional)

To track rescue app usage, you can add analytics to the consent.yaml file:

```yaml
analytics:
  scripts:
    - inline: |
        // Only track page view, not form data
        gtag('event', 'rescue_app_view', {
          'language': document.documentElement.lang
        });
```

**Note:** Never track user location or personal information in analytics.

## Future Enhancements

Potential features to add:

- [ ] Background sync for offline rescue requests
- [ ] Photo upload capability
- [ ] Voice notes recording
- [ ] Emergency contact auto-notification
- [ ] Real-time rescue status updates
- [ ] Chat integration with rescue operator

## Support

For technical issues or questions:
- Email: admin@mallorcacycleshuttle.com
- Document issues in this file
