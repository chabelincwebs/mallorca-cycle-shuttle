#!/usr/bin/env python3
"""
Add "Related Routes" cross-links to guide pages across all languages.
"""
import os
import re

# Related routes sections for each guide in each language
RELATED_ROUTES = {
    "en": {
        "sa-calobra-guide": """

## Related Cycling Routes

Looking for more challenging climbs in Mallorca? Check out these other iconic routes:

- **[Cap de Formentor Guide](/en/bike-shuttle/cap-formentor-guide/)** - Mallorca's most scenic coastal route with dramatic cliffside cycling and lighthouse views
- **[Andratx to Pollença (MA-10) Guide](/en/bike-shuttle/andratx-pollenca-guide/)** - The complete 60km journey through the Tramuntana mountains
- **[Big Daddy Challenge](/en/bike-shuttle/big-daddy-challenge/)** - Combine all the major climbs including Sa Calobra in one epic day""",

        "cap-formentor-guide": """

## Related Cycling Routes

Want to explore more of Mallorca's legendary climbs? These routes are also essential:

- **[Sa Calobra Guide](/en/bike-shuttle/sa-calobra-guide/)** - Mallorca's most famous climb with 26 hairpins and the iconic spiral bridge
- **[Andratx to Pollença (MA-10) Guide](/en/bike-shuttle/andratx-pollenca-guide/)** - The complete 60km journey through the Tramuntana mountains
- **[Big Daddy Challenge](/en/bike-shuttle/big-daddy-challenge/)** - Take on all major climbs including Cap Formentor in one epic ride""",

        "andratx-pollenca-guide": """

## Related Cycling Routes

Ready to tackle more of Mallorca's iconic climbs? Explore these challenging routes:

- **[Sa Calobra Guide](/en/bike-shuttle/sa-calobra-guide/)** - The legendary 26-hairpin descent and climb, Mallorca's most famous road
- **[Cap de Formentor Guide](/en/bike-shuttle/cap-formentor-guide/)** - Spectacular coastal cycling to the lighthouse at Mallorca's northern tip
- **[Big Daddy Challenge](/en/bike-shuttle/big-daddy-challenge/)** - Combine Andratx-Pollença with Sa Calobra and more for the ultimate challenge""",

        "big-daddy-challenge": """

## Component Routes - Detailed Guides

The Big Daddy Challenge combines Mallorca's most iconic climbs. Get detailed information about each section:

- **[Sa Calobra Guide](/en/bike-shuttle/sa-calobra-guide/)** - Full details on the famous 26-hairpin climb and what to expect
- **[Cap de Formentor Guide](/en/bike-shuttle/cap-formentor-guide/)** - Complete guide to the stunning coastal route
- **[Andratx to Pollença (MA-10) Guide](/en/bike-shuttle/andratx-pollenca-guide/)** - Everything you need to know about the 60km Tramuntana traverse"""
    },
    "de": {
        "sa-calobra-leitfaden": """

## Verwandte Radstrecken

Auf der Suche nach weiteren herausfordernden Anstiegen auf Mallorca? Schauen Sie sich diese anderen ikonischen Routen an:

- **[Cap de Formentor Guide](/de/fahrrad-shuttle/cap-formentor-guide/)** - Mallorcas schönste Küstenroute mit dramatischem Klippencycling und Leuchtturmblick
- **[Andratx nach Pollença (MA-10) Leitfaden](/de/fahrrad-shuttle/andratx-pollenca-leitfaden/)** - Die komplette 60 km lange Reise durch die Tramuntana-Berge
- **[Big Daddy Challenge](/de/fahrrad-shuttle/big-daddy-challenge/)** - Kombinieren Sie alle großen Anstiege einschließlich Sa Calobra an einem epischen Tag""",

        "cap-formentor-guide": """

## Verwandte Radstrecken

Möchten Sie mehr von Mallorcas legendären Anstiegen erkunden? Diese Routen sind ebenfalls unverzichtbar:

- **[Sa Calobra Leitfaden](/de/fahrrad-shuttle/sa-calobra-leitfaden/)** - Mallorcas berühmtester Anstieg mit 26 Haarnadelkurven und der ikonischen Spiralbrücke
- **[Andratx nach Pollença (MA-10) Leitfaden](/de/fahrrad-shuttle/andratx-pollenca-leitfaden/)** - Die komplette 60 km lange Reise durch die Tramuntana-Berge
- **[Big Daddy Challenge](/de/fahrrad-shuttle/big-daddy-challenge/)** - Nehmen Sie alle großen Anstiege einschließlich Cap Formentor an einem epischen Tag in Angriff""",

        "andratx-pollenca-leitfaden": """

## Verwandte Radstrecken

Bereit, mehr von Mallorcas ikonischen Anstiegen zu bewältigen? Erkunden Sie diese herausfordernden Routen:

- **[Sa Calobra Leitfaden](/de/fahrrad-shuttle/sa-calobra-leitfaden/)** - Die legendäre 26-Haarnadelkurven-Abfahrt und -Aufstieg, Mallorcas berühmteste Straße
- **[Cap de Formentor Guide](/de/fahrrad-shuttle/cap-formentor-guide/)** - Spektakuläres Küstencycling zum Leuchtturm an Mallorcas nördlichster Spitze
- **[Big Daddy Challenge](/de/fahrrad-shuttle/big-daddy-challenge/)** - Kombinieren Sie Andratx-Pollença mit Sa Calobra und mehr für die ultimative Herausforderung""",

        "big-daddy-challenge": """

## Teilstrecken - Detaillierte Leitfäden

Die Big Daddy Challenge kombiniert Mallorcas ikonischste Anstiege. Detaillierte Informationen zu jedem Abschnitt:

- **[Sa Calobra Leitfaden](/de/fahrrad-shuttle/sa-calobra-leitfaden/)** - Vollständige Details zum berühmten 26-Haarnadelkurven-Anstieg
- **[Cap de Formentor Guide](/de/fahrrad-shuttle/cap-formentor-guide/)** - Kompletter Leitfaden zur atemberaubenden Küstenroute
- **[Andratx nach Pollença (MA-10) Leitfaden](/de/fahrrad-shuttle/andratx-pollenca-leitfaden/)** - Alles, was Sie über die 60 km lange Tramuntana-Durchquerung wissen müssen"""
    },
    # Add other languages as needed - for now I'll continue with a few more key languages
    # This is a subset - in production we'd add all 10 languages
}

def add_related_routes(filepath, related_content):
    """Add related routes section to a guide file."""
    try:
        # Read file
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(filepath, 'r', encoding='iso-8859-1') as f:
                content = f.read()

        # Check if already has Related Routes/Cycling Routes section
        if 'Related Cycling Routes' in content or 'Related Routes' in content or 'Verwandte Radstrecken' in content or 'Component Routes' in content:
            print(f"  ✓ Skip (already has related routes): {filepath}")
            return False

        # Add related routes at the end before any final closing tags
        new_content = content.rstrip() + related_content + "\n"

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  ✓ Added related routes: {filepath}")
        return True

    except Exception as e:
        print(f"  ✗ Error: {filepath}: {e}")
        return False

def main():
    os.chdir('/mnt/c/Users/photo/Documents/mallorca-cycle-shuttle')

    print("Adding Related Routes sections to guide pages...")
    print("=" * 70)

    # English guides
    guides_en = [
        ("content/en/bike-shuttle/sa-calobra-guide/_index.md", RELATED_ROUTES["en"]["sa-calobra-guide"]),
        ("content/en/bike-shuttle/cap-formentor-guide/_index.md", RELATED_ROUTES["en"]["cap-formentor-guide"]),
        ("content/en/bike-shuttle/andratx-pollenca-guide/_index.md", RELATED_ROUTES["en"]["andratx-pollenca-guide"]),
        ("content/en/bike-shuttle/big-daddy-challenge/_index.md", RELATED_ROUTES["en"]["big-daddy-challenge"]),
    ]

    # German guides
    guides_de = [
        ("content/de/fahrrad-shuttle/sa-calobra-leitfaden/_index.md", RELATED_ROUTES["de"]["sa-calobra-leitfaden"]),
        ("content/de/fahrrad-shuttle/cap-formentor-guide/_index.md", RELATED_ROUTES["de"]["cap-formentor-guide"]),
        ("content/de/fahrrad-shuttle/andratx-pollenca-leitfaden/_index.md", RELATED_ROUTES["de"]["andratx-pollenca-leitfaden"]),
        ("content/de/fahrrad-shuttle/big-daddy-challenge/_index.md", RELATED_ROUTES["de"]["big-daddy-challenge"]),
    ]

    processed = 0
    for filepath, related_content in guides_en + guides_de:
        if os.path.exists(filepath):
            if add_related_routes(filepath, related_content):
                processed += 1
        else:
            print(f"  ⚠ Not found: {filepath}")

    print("\n" + "=" * 70)
    print(f"✓ Complete! Added related routes to {processed} guides.")
    print("=" * 70)

if __name__ == "__main__":
    main()
