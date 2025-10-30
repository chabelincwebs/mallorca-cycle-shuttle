#!/usr/bin/env python3
"""
Add translationKey to content files - comprehensive version.
"""
import os
import re
from pathlib import Path

def get_translation_key(relative_path):
    """Determine translation key based on file path."""

    # Home pages (language root _index.md)
    if re.match(r'^[a-z]{2}/_index\.md$', relative_path):
        return "homepage"

    # home/inici/hjem/hem directories
    if '/home/_index.md' in relative_path or '/inici/_index.md' in relative_path or '/hjem/_index.md' in relative_path or '/hem/_index.md' in relative_path:
        return "homepage"

    # About/Sobre/Chi-siamo/Om section indexes
    if '/about/_index.md' in relative_path or '/sobre/_index.md' in relative_path or '/chi-siamo/_index.md' in relative_path or '/om/_index.md' in relative_path:
        return "section-about"

    # Rescue service section indexes
    if (re.search(r'/(bike-rescue|fahrrad-rettung|rescate-bici|soccorso-bici|secours-velo|rescat-bici|rescat-ciclistes|fiets-redding|cykel-raddning|sykkel-redning|cykel-redning)/_index\.md$', relative_path)):
        return "section-bike-rescue"

    # Shuttle service section indexes
    if (re.search(r'/(bike-shuttle|fahrrad-shuttle|shuttle-bici|navette-velo|fiets-shuttle|cykel-shuttle|sykkel-shuttle)/_index\.md$', relative_path)):
        return "section-bike-shuttle"

    # Rescue app pages
    if '/rescue-app/_index.md' in relative_path or '/rettungs-app/_index.md' in relative_path or '/app-rescate/_index.md' in relative_path or '/app-soccorso/_index.md' in relative_path or '/app-secours/_index.md' in relative_path or '/app-rescat/_index.md' in relative_path or '/redding-app/_index.md' in relative_path or '/raddnings-app/_index.md' in relative_path or '/rednings-app/_index.md' in relative_path:
        return "rescue-app"

    # Rescue/Shuttle start/home pages
    if '/rescue-home/_index.md' in relative_path or '/rettungs-startseite/_index.md' in relative_path or '/inicio-rescate/_index.md' in relative_path or '/home-soccorso/_index.md' in relative_path or '/accueil-secours/_index.md' in relative_path or '/inici-rescat/_index.md' in relative_path or '/redding-startpagina/_index.md' in relative_path or '/raddning-start/_index.md' in relative_path or '/redning-start/_index.md' in relative_path:
        return "rescue-home"

    if '/shuttle-home/_index.md' in relative_path or '/shuttle-startseite/_index.md' in relative_path or '/inicio-shuttle/_index.md' in relative_path or '/home-navetta/_index.md' in relative_path or '/accueil-navette/_index.md' in relative_path or '/inici-shuttle/_index.md' in relative_path or '/shuttle-startpagina/_index.md' in relative_path or '/shuttle-start/_index.md' in relative_path:
        return "shuttle-home"

    # Rescue terms pages
    if '/rescue-sale-terms/_index.md' in relative_path or '/rettungs-verkaufsbedingungen/_index.md' in relative_path or '/terminos-venta-rescate/_index.md' in relative_path or '/termini-vendita-soccorso/_index.md' in relative_path or '/conditions-vente-secours/_index.md' in relative_path or ('/condicions-venda-rescat/_index.md' in relative_path and 'rescat-bici' in relative_path) or ('/terminis-venda-rescat/_index.md' in relative_path) or '/redding-verkoopvoorwaarden/_index.md' in relative_path or '/raddning-forsaljningsvillkor/_index.md' in relative_path or '/redning-salgsvilkar/_index.md' in relative_path:
        return "rescue-terms"

    # Privacy policy pages
    if '/privacy-policy/_index.md' in relative_path or '/datenschutzerklarung/_index.md' in relative_path or '/politica-de-privacidad/_index.md' in relative_path or '/informativa-sulla-privacy/_index.md' in relative_path or '/politique-de-confidentialite/_index.md' in relative_path or '/politica-de-privacitat/_index.md' in relative_path or '/politica-de-privadesa/_index.md' in relative_path or '/privacybeleid/_index.md' in relative_path or '/integritetspolicy/_index.md' in relative_path or '/personvernpolicy/_index.md' in relative_path or '/privatlivspolitik/_index.md' in relative_path:
        return "privacy-policy"

    # Legal notice pages
    if '/legal-notice/_index.md' in relative_path or '/avviso-legale/_index.md' in relative_path or '/note-legali/_index.md' in relative_path or '/rechtlicher-hinweis/_index.md' in relative_path or '/juridische-kennisgeving/_index.md' in relative_path:
        return "legal-notice"

    # Airport transfers section
    if '/mallorca-airport-transfers/_index.md' in relative_path:
        return "section-airport-transfers"

    # Landing pages - bike rescue
    if 'bike-rescue-landing.md' in relative_path or 'rescat-bici-landing.md' in relative_path or 'cykelredning-landing.md' in relative_path or 'fahrrad-rettung-landing.md' in relative_path or 'rescate-bici-landing.md' in relative_path or 'secours-velo-landing.md' in relative_path or 'soccorso-bici-landing.md' in relative_path or 'fietsredding-landing.md' in relative_path or 'cykel-raddning-landing.md' in relative_path or 'sykkelredning-landing.md' in relative_path:
        return "landing-bike-rescue"

    # Landing pages - airport transfers
    if 'airport-transfers-landing.md' in relative_path or 'trasllats-aeroport-landing.md' in relative_path or 'lufthavnstransfer-landing.md' in relative_path or 'flughafentransfers-landing.md' in relative_path or 'traslados-aeropuerto-landing.md' in relative_path or 'navettes-aeroport-landing.md' in relative_path or 'trasferimenti-aeroporto-landing.md' in relative_path or 'luchthavenoverdrachten-landing.md' in relative_path or 'luchthaven-transfers-landing.md' in relative_path or 'flygplatstransferer-landing.md' in relative_path or 'flygplatstransfer-landing.md' in relative_path or 'flyplasstransfer-landing.md' in relative_path:
        return "landing-airport-transfers"

    # Route-specific shuttle pages - Andratx from North
    if ('andratx' in relative_path.lower() and ('nord' in relative_path.lower() or 'north' in relative_path.lower() or 'norr' in relative_path.lower() or 'noorden' in relative_path.lower())):
        return "shuttle-andratx-from-north"

    # Route-specific shuttle pages - Pollença from South
    if ('pollenca' in relative_path.lower() and ('sud' in relative_path.lower() or 'south' in relative_path.lower() or 'syd' in relative_path.lower() or 'soder' in relative_path.lower() or 'sur' in relative_path.lower() or 'sor' in relative_path.lower() or 'zuiden' in relative_path.lower())):
        return "shuttle-pollenca-from-south"

    # Route-specific shuttle pages - Sa Calobra from North
    if ('sa-calobra' in relative_path.lower() and ('nord' in relative_path.lower() or 'north' in relative_path.lower() or 'norr' in relative_path.lower() or 'noorden' in relative_path.lower())):
        return "shuttle-sa-calobra-from-north"

    # Route-specific shuttle pages - Sa Calobra from South
    if ('sa-calobra' in relative_path.lower() and ('sud' in relative_path.lower() or 'south' in relative_path.lower() or 'syd' in relative_path.lower() or 'soder' in relative_path.lower() or 'sur' in relative_path.lower() or 'sor' in relative_path.lower() or 'zuiden' in relative_path.lower())):
        return "shuttle-sa-calobra-from-south"

    return None

def add_translation_key(filepath):
    """Add translationKey to a file's front matter."""
    try:
        # Read the file - try UTF-8 first, fallback to ISO-8859-1
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(filepath, 'r', encoding='iso-8859-1') as f:
                content = f.read()

        # Check if already has translationKey
        if 'translationKey:' in content or 'translationkey:' in content.lower():
            return None

        # Get relative path from content/
        relative_path = str(Path(filepath).relative_to('content'))

        # Determine translation key
        translation_key = get_translation_key(relative_path)

        if not translation_key:
            return None

        # Process the front matter
        if content.strip().startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                front_matter = parts[1]
                body = parts[2]

                # Add translationKey to front matter
                new_front_matter = front_matter.rstrip() + f'\ntranslationKey: "{translation_key}"\n'
                new_content = f'---{new_front_matter}---{body}'

                # Write back as UTF-8
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                print(f"  ✓ Added '{translation_key}': {relative_path}")
                return translation_key

        return None

    except Exception as e:
        print(f"  ✗ Error: {filepath}: {e}")
        return None

def main():
    os.chdir('/mnt/c/Users/photo/Documents/mallorca-cycle-shuttle')

    print("Adding translationKeys to content files (v2 - comprehensive)...")
    print("=" * 70)

    processed_keys = {}

    # Find all markdown files in content/
    for root, dirs, files in os.walk('content'):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                key = add_translation_key(filepath)
                if key:
                    processed_keys[key] = processed_keys.get(key, 0) + 1

    print("\n" + "=" * 70)
    print(f"✓ Complete! Added translationKeys to {sum(processed_keys.values())} files.")
    print("\nBreakdown by key type:")
    for key, count in sorted(processed_keys.items()):
        print(f"  - {key}: {count} files")
    print("=" * 70)

if __name__ == "__main__":
    main()
