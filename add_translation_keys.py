#!/usr/bin/env python3
"""
Add translationKey to content files that are missing them.
"""
import os
import re
from pathlib import Path

# Translation key mappings for different page types
TRANSLATION_KEYS = {
    # Section indexes
    "bike-rescue/_index.md": "section-bike-rescue",
    "bike-shuttle/_index.md": "section-bike-shuttle",
    "fahrrad-rettung/_index.md": "section-bike-rescue",
    "fahrrad-shuttle/_index.md": "section-bike-shuttle",
    "rescate-bici/_index.md": "section-bike-rescue",
    "shuttle-bici/_index.md": "section-bike-shuttle",
    "soccorso-bici/_index.md": "section-bike-rescue",
    "secours-velo/_index.md": "section-bike-rescue",
    "navette-velo/_index.md": "section-bike-shuttle",
    "rescat-bici/_index.md": "section-bike-rescue",
    "rescat-ciclistes/_index.md": "section-bike-rescue",
    "fiets-redding/_index.md": "section-bike-rescue",
    "fiets-shuttle/_index.md": "section-bike-shuttle",
    "cykel-raddning/_index.md": "section-bike-rescue",
    "cykel-shuttle/_index.md": "section-bike-shuttle",
    "sykkel-redning/_index.md": "section-bike-rescue",
    "sykkel-shuttle/_index.md": "section-bike-shuttle",
    "cykel-redning/_index.md": "section-bike-rescue",

    # About/Sobre/Chi-siamo/Om sections
    "about/_index.md": "section-about",
    "sobre/_index.md": "section-about",
    "chi-siamo/_index.md": "section-about",
    "om/_index.md": "section-about",

    # Landing pages
    "mallorca-bike-rescue-landing.md": "landing-bike-rescue",
    "mallorca-rescat-bici-landing.md": "landing-bike-rescue",
    "mallorca-cykelredning-landing.md": "landing-bike-rescue",
    "mallorca-fahrrad-rettung-landing.md": "landing-bike-rescue",
    "mallorca-rescate-bici-landing.md": "landing-bike-rescue",
    "mallorca-secours-velo-landing.md": "landing-bike-rescue",
    "mallorca-soccorso-bici-landing.md": "landing-bike-rescue",
    "mallorca-fietsredding-landing.md": "landing-bike-rescue",
    "mallorca-cykel-raddning-landing.md": "landing-bike-rescue",
    "mallorca-sykkelredning-landing.md": "landing-bike-rescue",

    "mallorca-airport-transfers-landing.md": "landing-airport-transfers",
    "mallorca-trasllats-aeroport-landing.md": "landing-airport-transfers",
    "mallorca-lufthavnstransfer-landing.md": "landing-airport-transfers",
    "mallorca-flughafentransfers-landing.md": "landing-airport-transfers",
    "mallorca-traslados-aeropuerto-landing.md": "landing-airport-transfers",
    "mallorca-navettes-aeroport-landing.md": "landing-airport-transfers",
    "mallorca-trasferimenti-aeroporto-landing.md": "landing-airport-transfers",
    "mallorca-luchthavenoverdrachten-landing.md": "landing-airport-transfers",
    "mallorca-flygplatstransferer-landing.md": "landing-airport-transfers",
    "mallorca-flyplasstransfer-landing.md": "landing-airport-transfers",

    # Route-specific shuttle pages
    "mallorca-shuttle-bici-port-andratx-des-del-nord.md": "shuttle-andratx-from-north",
    "mallorca-shuttle-bici-port-pollenca-des-del-sud.md": "shuttle-pollenca-from-south",
    "mallorca-shuttle-bici-sa-calobra-des-del-nord.md": "shuttle-sa-calobra-from-north",
    "mallorca-shuttle-bici-sa-calobra-des-del-sud.md": "shuttle-sa-calobra-from-south",

    "mallorca-cykel-shuttle-andratx-havn-fra-nord.md": "shuttle-andratx-from-north",
    "mallorca-cykel-shuttle-pollenca-havn-fra-syd.md": "shuttle-pollenca-from-south",
    "mallorca-cykel-shuttle-sa-calobra-fra-nord.md": "shuttle-sa-calobra-from-north",
    "mallorca-cykel-shuttle-sa-calobra-fra-syd.md": "shuttle-sa-calobra-from-south",

    "mallorca-fahrrad-shuttle-hafen-andratx-vom-norden.md": "shuttle-andratx-from-north",
    "mallorca-fahrrad-shuttle-hafen-pollenca-vom-suden.md": "shuttle-pollenca-from-south",
    "mallorca-fahrrad-shuttle-sa-calobra-vom-norden.md": "shuttle-sa-calobra-from-north",
    "mallorca-fahrrad-shuttle-sa-calobra-vom-suden.md": "shuttle-sa-calobra-from-south",

    "mallorca-bike-shuttle-port-andratx-from-north.md": "shuttle-andratx-from-north",
    "mallorca-bike-shuttle-port-pollenca-from-south.md": "shuttle-pollenca-from-south",
    "mallorca-bike-shuttle-sa-calobra-from-north.md": "shuttle-sa-calobra-from-north",
    "mallorca-bike-shuttle-sa-calobra-from-south.md": "shuttle-sa-calobra-from-south",

    "mallorca-shuttle-bici-puerto-andratx-desde-norte.md": "shuttle-andratx-from-north",
    "mallorca-shuttle-bici-puerto-pollenca-desde-sur.md": "shuttle-pollenca-from-south",
    "mallorca-shuttle-bici-sa-calobra-desde-norte.md": "shuttle-sa-calobra-from-north",
    "mallorca-shuttle-bici-sa-calobra-desde-sur.md": "shuttle-sa-calobra-from-south",

    "mallorca-navette-velo-port-andratx-depuis-nord.md": "shuttle-andratx-from-north",
    "mallorca-navette-velo-port-pollenca-depuis-sud.md": "shuttle-pollenca-from-south",
    "mallorca-navette-velo-sa-calobra-depuis-nord.md": "shuttle-sa-calobra-from-north",
    "mallorca-navette-velo-sa-calobra-depuis-sud.md": "shuttle-sa-calobra-from-south",

    "mallorca-navetta-bici-porto-andratx-da-nord.md": "shuttle-andratx-from-north",
    "mallorca-navetta-bici-porto-pollenca-da-sud.md": "shuttle-pollenca-from-south",
    "mallorca-navetta-bici-sa-calobra-da-nord.md": "shuttle-sa-calobra-from-north",
    "mallorca-navetta-bici-sa-calobra-da-sud.md": "shuttle-sa-calobra-from-south",

    "mallorca-fiets-shuttle-haven-andratx-vanuit-noorden.md": "shuttle-andratx-from-north",
    "mallorca-fiets-shuttle-haven-pollenca-vanuit-zuiden.md": "shuttle-pollenca-from-south",
    "mallorca-fiets-shuttle-sa-calobra-vanuit-noorden.md": "shuttle-sa-calobra-from-north",
    "mallorca-fiets-shuttle-sa-calobra-vanuit-zuiden.md": "shuttle-sa-calobra-from-south",

    "mallorca-cykel-shuttle-andratx-hamn-fran-norr.md": "shuttle-andratx-from-north",
    "mallorca-cykel-shuttle-pollenca-hamn-fran-soder.md": "shuttle-pollenca-from-south",
    "mallorca-cykel-shuttle-sa-calobra-fran-norr.md": "shuttle-sa-calobra-from-north",
    "mallorca-cykel-shuttle-sa-calobra-fran-soder.md": "shuttle-sa-calobra-from-south",

    "mallorca-sykkel-shuttle-andratx-havn-fra-nord.md": "shuttle-andratx-from-north",
    "mallorca-sykkel-shuttle-pollenca-havn-fra-sor.md": "shuttle-pollenca-from-south",
    "mallorca-sykkel-shuttle-sa-calobra-fra-nord.md": "shuttle-sa-calobra-from-north",
    "mallorca-sykkel-shuttle-sa-calobra-fra-sor.md": "shuttle-sa-calobra-from-south",
}

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
            print(f"  ✓ Skip (already has translationKey): {filepath}")
            return False

        # Determine the translation key
        filename = os.path.basename(filepath)
        parent_path = str(Path(filepath).parent.relative_to('content'))

        # Try to find matching pattern
        translation_key = None

        # Check direct filename match
        if filename in TRANSLATION_KEYS:
            translation_key = TRANSLATION_KEYS[filename]

        # Check path-based patterns
        for pattern, key in TRANSLATION_KEYS.items():
            if pattern in parent_path or pattern == filename:
                translation_key = key
                break

        if not translation_key:
            print(f"  ⚠ No translation key pattern found for: {filepath}")
            return False

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

                print(f"  ✓ Added translationKey '{translation_key}': {filepath}")
                return True

        print(f"  ⚠ Could not parse front matter: {filepath}")
        return False

    except Exception as e:
        print(f"  ✗ Error processing {filepath}: {e}")
        return False

def main():
    os.chdir('/mnt/c/Users/photo/Documents/mallorca-cycle-shuttle')

    print("Adding translationKeys to content files...")
    print("=" * 60)

    processed_count = 0

    # Find all markdown files in content/
    for root, dirs, files in os.walk('content'):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                if add_translation_key(filepath):
                    processed_count += 1

    print("\n" + "=" * 60)
    print(f"✓ Complete! Added translationKeys to {processed_count} files.")
    print("=" * 60)

if __name__ == "__main__":
    main()
