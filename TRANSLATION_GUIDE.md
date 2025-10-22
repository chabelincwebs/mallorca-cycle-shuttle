# Translation Guide for Italian, French, and Catalan

## Overview

Your Hugo website now supports six languages:
- 🇬🇧 **English** (EN) - Complete ✅
- 🇩🇪 **German** (DE) - Complete ✅
- 🇪🇸 **Spanish** (ES) - Complete ✅
- 🇮🇹 **Italian** (IT) - **Needs Translation** 🔴
- 🇫🇷 **French** (FR) - **Needs Translation** 🔴
- **Catalan** (CA) - **Needs Translation** 🔴

## What's Already Done

✅ **Complete - No Translation Needed:**
1. Hugo configuration (hugo.yaml)
2. i18n UI translations for navigation, buttons, forms
3. All placeholder content files created
4. Directory structure set up
5. Site builds successfully

## Files Requiring YOUR Professional Translation

All files marked with `[TRANSLATE]` need your professional translation. The UI elements (buttons, navigation, forms) have already been translated.

### PRIORITY 1: Homepage Content

**Files to translate:**
- `content/it/_index.md`
- `content/fr/_index.md`
- `content/ca/_index.md`

**What to translate:**
Search for `[TRANSLATE]` markers and replace with your professional translation. Example:

```yaml
title: "[TRANSLATE] Mallorca Bicycle Rescue"
# Replace with:
title: "Mallorca Bicycle Rescue"  # (Italian version)
```

**Sections needing translation:**
- `title` - Site title
- `description` - META description
- `hero_title` - Main headline
- `hero_subtitle` - Tagline
- `cta.label` - Call-to-action button text
- `note` - Short marketing note
- `features` - Three feature boxes (title + text)
- `pricing` - Already translated (basic text) ✅
- `good_to_know_title` - Section heading
- `good_to_know` - 4 bullet points
- `faq_title` - Section heading
- `faq` - 17 Q&A pairs

### PRIORITY 2: Legal Pages

**Files to translate (12 files total):**

**Italian:**
- `content/it/privacy-policy/_index.md`
- `content/it/cookie-policy/_index.md`
- `content/it/legal-notice/_index.md`
- `content/it/sale-terms/_index.md`

**French:**
- `content/fr/privacy-policy/_index.md`
- `content/fr/cookie-policy/_index.md`
- `content/fr/legal-notice/_index.md`
- `content/fr/sale-terms/_index.md`

**Catalan:**
- `content/ca/privacy-policy/_index.md`
- `content/ca/cookie-policy/_index.md`
- `content/ca/legal-notice/_index.md`
- `content/ca/sale-terms/_index.md`

**How to translate:**
1. Open the corresponding English file (e.g., `content/en/privacy-policy/_index.md`)
2. Copy the FULL content
3. Paste into the IT/FR/CA version
4. Translate all text while keeping:
   - Front matter structure (`---` blocks)
   - Markdown formatting
   - Email addresses and URLs unchanged

### PRIORITY 3: Rescue App Pages

**Files to translate:**
- `content/it/rescue-app/_index.md`
- `content/fr/rescue-app/_index.md`
- `content/ca/rescue-app/_index.md`

**What to translate:**
Only the `title` field. The rescue app interface is already translated via the i18n files (✅ already done).

```yaml
---
title: "[TRANSLATE] Emergency Rescue Request"
# Replace with appropriate translation
```

## Already Translated (No Action Needed)

### i18n UI Translations ✅

These files are **COMPLETE** and contain all button labels, form fields, and UI elements:

- `i18n/it.yaml` - Italian UI (contact, legal, buy_rescue, cookies, rescue app)
- `i18n/fr.yaml` - French UI (contact, legal, buy_rescue, cookies, rescue app)
- `i18n/ca.yaml` - Catalan UI (contact, legal, buy_rescue, cookies, rescue app)

**Examples of what's already translated:**
- Navigation: "Contact", "Legal", "Buy Rescue"
- Cookie consent: all buttons and messages
- Rescue app: ALL form labels, buttons, error messages, GPS messages
- Install prompts: iOS and Android instructions

### Pricing Text ✅

Basic pricing text is already translated in the homepage files:

**Italian:**
- "4 giorni" / "Da €16"
- "Pacchetti convenienti"
- "Ideale per soggiorni lunghi"

**French:**
- "4 jours" / "À partir de 16 €"
- "Forfaits avantageux"
- "Idéal pour les longs séjours"

**Catalan:**
- "4 dies" / "Des de 16 €"
- "Paquets amb bon preu"
- "Ideal per estades llargues"

## Translation Workflow

### Step 1: Homepage (HIGHEST PRIORITY)

1. Open `content/en/_index.md` (English reference)
2. Open `content/it/_index.md` (Italian to translate)
3. Search for `[TRANSLATE]` markers
4. Replace each `[TRANSLATE]` tag with your professional translation
5. Keep all YAML structure intact
6. Repeat for FR and CA

**Estimated time:** 2-3 hours per language

### Step 2: Legal Pages

1. Copy FULL content from `content/en/privacy-policy/_index.md`
2. Paste into `content/it/privacy-policy/_index.md` (replacing placeholder)
3. Translate all text
4. Repeat for cookie-policy, legal-notice, sale-terms
5. Repeat entire process for FR and CA

**Estimated time:** 4-6 hours per language

### Step 3: Rescue App Title

1. Open each `content/{lang}/rescue-app/_index.md`
2. Replace `[TRANSLATE] Emergency Rescue Request` with translation
3. Keep all other fields unchanged

**Estimated time:** 5 minutes per language

## Quality Checklist

Before marking a language as complete:

- [ ] All `[TRANSLATE]` markers removed
- [ ] YAML front matter structure preserved (no syntax errors)
- [ ] Markdown formatting intact (##, -, *, links)
- [ ] URLs and email addresses unchanged
- [ ] Company name "Mallorca Bicycle Rescue" kept as-is (brand name)
- [ ] Test build: `hugo --quiet` runs without errors
- [ ] Review on localhost to check layout

## Testing Your Translations

1. Build the site:
   ```bash
   hugo --quiet
   ```

2. Start local server:
   ```bash
   hugo server -D
   ```

3. Check each language:
   - Italian: `http://localhost:1313/it/`
   - French: `http://localhost:1313/fr/`
   - Catalan: `http://localhost:1313/ca/`

4. Verify:
   - Homepage displays correctly
   - Language switcher works
   - Navigation menus show translated UI
   - Legal pages display
   - Rescue app opens (buttons/forms already translated)

## File Locations Quick Reference

```
mallorca-bicycle-rescue/
├── hugo.yaml (✅ configured)
├── i18n/
│   ├── it.yaml (✅ UI translated)
│   ├── fr.yaml (✅ UI translated)
│   └── ca.yaml (✅ UI translated)
└── content/
    ├── it/ (🔴 needs content translation)
    │   ├── _index.md
    │   ├── privacy-policy/_index.md
    │   ├── cookie-policy/_index.md
    │   ├── legal-notice/_index.md
    │   ├── sale-terms/_index.md
    │   └── rescue-app/_index.md
    ├── fr/ (🔴 needs content translation)
    │   ├── _index.md
    │   ├── privacy-policy/_index.md
    │   ├── cookie-policy/_index.md
    │   ├── legal-notice/_index.md
    │   ├── sale-terms/_index.md
    │   └── rescue-app/_index.md
    └── ca/ (🔴 needs content translation)
        ├── _index.md
        ├── privacy-policy/_index.md
        ├── cookie-policy/_index.md
        ├── legal-notice/_index.md
        ├── sale-terms/_index.md
        └── rescue-app/_index.md
```

## Support

If you encounter issues:
1. Check Hugo build output for errors
2. Verify YAML syntax (proper indentation, quotes)
3. Compare with working English files
4. Test incrementally (translate one file, build, test, repeat)

## URLs After Translation

Once complete, your site will be available at:
- `https://mallorcabicyclerescue.com/it/` - Italian
- `https://mallorcabicyclerescue.com/fr/` - French
- `https://mallorcabicyclerescue.com/ca/` - Catalan

Language switcher will automatically appear in the header for all six languages.

---

**Total Translation Workload Estimate:**
- Homepage: 2-3 hours per language (9 hours total)
- Legal pages: 4-6 hours per language (18 hours total)
- Rescue app titles: 15 minutes total
- **GRAND TOTAL: ~27-30 hours for all three languages**

Good luck with your translations! 🚀
