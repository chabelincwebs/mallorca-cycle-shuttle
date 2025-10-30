#!/usr/bin/env python3
"""
Add meta descriptions to content files missing them.
"""
import os
import re

# Meta descriptions for each page type and language
DESCRIPTIONS = {
    # Service section pages
    "en/bike-rescue/_index.md": ("Bicycle Rescue Service", "24/7 emergency bicycle rescue service in Mallorca. Professional support for mechanical breakdowns, accidents, and emergencies across the island."),
    "en/bike-shuttle/_index.md": ("Bicycle Shuttle Service", "Premium cycling shuttle service in Mallorca. Transport to iconic climbs like Sa Calobra, Cap Formentor, and Andratx-Pollença route. Book your ride today."),

    "de/fahrrad-rettung/_index.md": ("Fahrrad-Rettungsdienst", "24/7 Notfall-Rettungsdienst für Fahrräder auf Mallorca. Professionelle Hilfe bei Pannen, Unfällen und Notfällen auf der ganzen Insel."),
    "de/fahrrad-shuttle/_index.md": ("Fahrrad-Shuttle-Service", "Premium Fahrrad-Shuttle-Service auf Mallorca. Transport zu ikonischen Anstiegen wie Sa Calobra, Cap Formentor und Andratx-Pollença. Jetzt buchen."),

    "es/rescate-bici/_index.md": ("Servicio de Rescate de Bicicletas", "Servicio de rescate de emergencia 24/7 para bicicletas en Mallorca. Asistencia profesional para averías mecánicas, accidentes y emergencias en toda la isla."),
    "es/shuttle-bici/_index.md": ("Servicio de Shuttle para Ciclistas", "Servicio premium de shuttle para ciclistas en Mallorca. Transporte a subidas icónicas como Sa Calobra, Cap Formentor y la ruta Andratx-Pollença. Reserve hoy."),

    "it/soccorso-bici/_index.md": ("Servizio di Soccorso Biciclette", "Servizio di soccorso biciclette 24/7 a Maiorca. Assistenza professionale per guasti meccanici, incidenti ed emergenze in tutta l'isola."),
    "it/shuttle-bici/_index.md": ("Servizio Navetta per Ciclisti", "Servizio navetta premium per ciclisti a Maiorca. Trasporto verso salite iconiche come Sa Calobra, Cap Formentor e il percorso Andratx-Pollença. Prenota oggi."),

    "fr/secours-velo/_index.md": ("Service de Secours Vélo", "Service de secours vélo d'urgence 24/7 à Majorque. Assistance professionnelle pour pannes mécaniques, accidents et urgences sur toute l'île."),
    "fr/navette-velo/_index.md": ("Service de Navette Vélo", "Service de navette vélo premium à Majorque. Transport vers les montées emblématiques comme Sa Calobra, Cap Formentor et Andratx-Pollença. Réservez aujourd'hui."),

    "ca/rescat-bici/_index.md": ("Servei de Rescat de Bicicletes", "Servei de rescat d'emergència 24/7 per a bicicletes a Mallorca. Assistència professional per avaries mecàniques, accidents i emergències a tota l'illa."),
    "ca/shuttle-bici/_index.md": ("Servei de Shuttle per a Ciclistes", "Servei premium de shuttle per a ciclistes a Mallorca. Transport a pujades emblemàtiques com Sa Calobra, Cap Formentor i la ruta Andratx-Pollença. Reservi avui."),

    "nl/fiets-redding/_index.md": ("Fietsreddingsdienst", "24/7 noodfietsreddingsdienst op Mallorca. Professionele ondersteuning bij mechanische storingen, ongevallen en noodsituaties over het hele eiland."),
    "nl/fiets-shuttle/_index.md": ("Fietsshuttleservice", "Premium fietsshuttleservice op Mallorca. Vervoer naar iconische beklimmingen zoals Sa Calobra, Cap Formentor en de Andratx-Pollença route. Boek vandaag."),

    "sv/cykel-raddning/_index.md": ("Cykelräddningstjänst", "24/7 akut cykelräddningstjänst på Mallorca. Professionellt stöd för mekaniska haverier, olyckor och nödsituationer över hela ön."),
    "sv/cykel-shuttle/_index.md": ("Cykelshuttletjänst", "Premium cykelshuttletjänst på Mallorca. Transport till ikoniska klättringar som Sa Calobra, Cap Formentor och Andratx-Pollença-rutten. Boka idag."),

    "nb/sykkel-redning/_index.md": ("Sykkelredningstjeneste", "24/7 nødsykkelredningstjeneste på Mallorca. Profesjonell støtte for mekaniske sammenbrudd, ulykker og nødsituasjoner over hele øya."),
    "nb/sykkel-shuttle/_index.md": ("Sykkelshuttletjeneste", "Premium sykkelshuttletjeneste på Mallorca. Transport til ikoniske klatringer som Sa Calobra, Cap Formentor og Andratx-Pollença-ruten. Bestill i dag."),

    "da/cykel-redning/_index.md": ("Cykelredningstjeneste", "24/7 nødcykelredningstjeneste på Mallorca. Professionel support til mekaniske nedbrud, ulykker og nødsituationer over hele øen."),
    "da/cykel-shuttle/_index.md": ("Cykelshuttletjeneste", "Premium cykelshuttletjeneste på Mallorca. Transport til ikoniske stigninger som Sa Calobra, Cap Formentor og Andratx-Pollença-ruten. Book i dag."),

    # Rescue App pages
    "en/bike-rescue/rescue-app/_index.md": ("Emergency Rescue Request", "Request emergency bicycle rescue service in Mallorca. Quick response for breakdowns, accidents, and cycling emergencies anywhere on the island."),
    "de/fahrrad-rettung/rettungs-app/_index.md": ("Notfall-Rettungsanfrage", "Notfall-Fahrradrettungsdienst auf Mallorca anfordern. Schnelle Reaktion bei Pannen, Unfällen und Fahrrad-Notfällen überall auf der Insel."),
    "es/rescate-bici/app-rescate/_index.md": ("Solicitud de Rescate de Emergencia", "Solicite servicio de rescate de bicicletas de emergencia en Mallorca. Respuesta rápida para averías, accidentes y emergencias ciclistas en cualquier lugar de la isla."),
    "it/soccorso-bici/app-soccorso/_index.md": ("Richiesta di Soccorso di Emergenza", "Richiedi servizio di soccorso biciclette di emergenza a Maiorca. Risposta rapida per guasti, incidenti ed emergenze ciclistiche ovunque sull'isola."),
    "fr/secours-velo/app-secours/_index.md": ("Demande de Secours d'Urgence", "Demandez un service de secours vélo d'urgence à Majorque. Réponse rapide pour pannes, accidents et urgences cyclistes partout sur l'île."),
    "ca/rescat-bici/app-rescat/_index.md": ("Sol·licitud de Rescat d'Emergència", "Sol·liciti servei de rescat de bicicletes d'emergència a Mallorca. Resposta ràpida per avaries, accidents i emergències ciclistes a qualsevol lloc de l'illa."),
    "nl/fiets-redding/redding-app/_index.md": ("Noodverzoek Fietsredding", "Vraag een noodfietsreddingsdienst op Mallorca aan. Snelle respons voor storingen, ongevallen en fietsnoodgevallen overal op het eiland."),
    "sv/cykel-raddning/raddnings-app/_index.md": ("Nödräddningsförfrågan", "Begär akut cykelräddningstjänst på Mallorca. Snabb respons för haverier, olyckor och cykelnödsituationer var som helst på ön."),
    "nb/sykkel-redning/rednings-app/_index.md": ("Nødredningsforespørsel", "Be om akutt sykkelredningstjeneste på Mallorca. Rask respons for sammenbrudd, ulykker og sykkelnødsituasjoner hvor som helst på øya."),
    "da/cykel-redning/rednings-app/_index.md": ("Nødredningsanmodning", "Anmod om akut cykelredningstjeneste på Mallorca. Hurtig respons til nedbrud, ulykker og cykelnødsituationer hvor som helst på øen."),

    # About pages
    "en/about/_index.md": ("About Us", "Learn about Mallorca Cycle Shuttle - your trusted partner since 2015 for cycling adventures, bicycle rescue, and shuttle services across Mallorca."),
    "de/about/_index.md": ("Über uns", "Erfahren Sie mehr über Mallorca Cycle Shuttle - Ihr vertrauenswürdiger Partner seit 2015 für Radabenteuer, Fahrradrettung und Shuttle-Services auf Mallorca."),
    "es/about/_index.md": ("Sobre Nosotros", "Conozca Mallorca Cycle Shuttle - su socio de confianza desde 2015 para aventuras ciclistas, rescate de bicicletas y servicios de shuttle en Mallorca."),
    "it/chi-siamo/_index.md": ("Chi Siamo", "Scopri Mallorca Cycle Shuttle - il tuo partner di fiducia dal 2015 per avventure ciclistiche, soccorso biciclette e servizi navetta a Maiorca."),
    "fr/about/_index.md": ("À Propos de Nous", "Découvrez Mallorca Cycle Shuttle - votre partenaire de confiance depuis 2015 pour les aventures cyclistes, le secours vélo et les services de navette à Majorque."),
    "ca/sobre/_index.md": ("Sobre Nosaltres", "Conegueu Mallorca Cycle Shuttle - el vostre soci de confiança des de 2015 per a aventures ciclistes, rescat de bicicletes i serveis de shuttle a Mallorca."),
    "nl/about/_index.md": ("Over Ons", "Leer meer over Mallorca Cycle Shuttle - uw vertrouwde partner sinds 2015 voor fietsavonturen, fietsredding en shuttlediensten op Mallorca."),
    "sv/om/_index.md": ("Om Oss", "Lär dig om Mallorca Cycle Shuttle - din pålitliga partner sedan 2015 för cykeläventyr, cykelräddning och shuttletjänster på Mallorca."),
    "nb/om/_index.md": ("Om Oss", "Lær om Mallorca Cycle Shuttle - din pålitelige partner siden 2015 for sykkeleventyr, sykkelredning og shuttletjenester på Mallorca."),
    "da/om/_index.md": ("Om Os", "Lær om Mallorca Cycle Shuttle - din pålidelige partner siden 2015 for cykeloplevelser, cykelredning og shuttletjenester på Mallorca."),

    # Airport Transfer pages
    "sv/mallorca-airport-transfers/_index.md": ("Mallorca Flygplatstransfers", "Premium flygplatstransfertjänster på Mallorca. Bekväm transport från Palma flygplats till ditt hotell med plats för cyklar. Boka din transfer."),
    "nb/mallorca-airport-transfers/_index.md": ("Mallorca Flyplasstransfer", "Premium flyplasstransfertjenester på Mallorca. Komfortabel transport fra Palma flyplass til hotellet ditt med plass for sykler. Bestill din transfer."),
    "da/mallorca-airport-transfers/_index.md": ("Mallorca Lufthavnstransfer", "Premium lufthavnstransfertjenester på Mallorca. Bekvem transport fra Palma lufthavn til dit hotel med plads til cykler. Book din transfer."),
}

# Legal page descriptions (generic, lower priority)
LEGAL_DESCRIPTIONS = {
    "cookie-policy": {
        "en": ("Cookie Policy", "Learn about how Mallorca Cycle Shuttle uses cookies to enhance your browsing experience and analyze website traffic."),
        "de": ("Cookie-Richtlinie", "Erfahren Sie, wie Mallorca Cycle Shuttle Cookies verwendet, um Ihr Browsing-Erlebnis zu verbessern und den Website-Traffic zu analysieren."),
        "es": ("Política de Cookies", "Conozca cómo Mallorca Cycle Shuttle utiliza cookies para mejorar su experiencia de navegación y analizar el tráfico del sitio web."),
        "it": ("Politica sui Cookie", "Scopri come Mallorca Cycle Shuttle utilizza i cookie per migliorare la tua esperienza di navigazione e analizzare il traffico del sito web."),
        "fr": ("Politique de Cookies", "Découvrez comment Mallorca Cycle Shuttle utilise les cookies pour améliorer votre expérience de navigation et analyser le trafic du site web."),
        "ca": ("Política de Cookies", "Conegueu com Mallorca Cycle Shuttle utilitza cookies per millorar la vostra experiència de navegació i analitzar el trànsit del lloc web."),
        "nl": ("Cookiebeleid", "Ontdek hoe Mallorca Cycle Shuttle cookies gebruikt om uw browse-ervaring te verbeteren en websiteverkeer te analyseren."),
        "sv": ("Cookiepolicy", "Lär dig om hur Mallorca Cycle Shuttle använder cookies för att förbättra din surfupplevelse och analysera webbtrafik."),
        "nb": ("Informasjonskapselpolicy", "Lær om hvordan Mallorca Cycle Shuttle bruker informasjonskapsler for å forbedre din nettleseropplevelse og analysere nettstedstrafikk."),
        "da": ("Cookiepolitik", "Lær om hvordan Mallorca Cycle Shuttle bruger cookies til at forbedre din browseroplevelse og analysere webstedstrafik."),
    },
    "privacy-policy": {
        "en": ("Privacy Policy", "Read our privacy policy to understand how Mallorca Cycle Shuttle collects, uses, and protects your personal information."),
        "de": ("Datenschutzerklärung", "Lesen Sie unsere Datenschutzerklärung, um zu verstehen, wie Mallorca Cycle Shuttle Ihre persönlichen Daten sammelt, verwendet und schützt."),
        "es": ("Política de Privacidad", "Lea nuestra política de privacidad para entender cómo Mallorca Cycle Shuttle recopila, utiliza y protege su información personal."),
        "it": ("Informativa sulla Privacy", "Leggi la nostra informativa sulla privacy per capire come Mallorca Cycle Shuttle raccoglie, utilizza e protegge le tue informazioni personali."),
        "fr": ("Politique de Confidentialité", "Lisez notre politique de confidentialité pour comprendre comment Mallorca Cycle Shuttle collecte, utilise et protège vos informations personnelles."),
        "ca": ("Política de Privadesa", "Llegiu la nostra política de privadesa per entendre com Mallorca Cycle Shuttle recopila, utilitza i protegeix la vostra informació personal."),
        "nl": ("Privacybeleid", "Lees ons privacybeleid om te begrijpen hoe Mallorca Cycle Shuttle uw persoonlijke informatie verzamelt, gebruikt en beschermt."),
        "sv": ("Integritetspolicy", "Läs vår integritetspolicy för att förstå hur Mallorca Cycle Shuttle samlar in, använder och skyddar din personliga information."),
        "nb": ("Personvernpolicy", "Les vår personvernpolicy for å forstå hvordan Mallorca Cycle Shuttle samler inn, bruker og beskytter din personlige informasjon."),
        "da": ("Privatlivspolitik", "Læs vores privatlivspolitik for at forstå hvordan Mallorca Cycle Shuttle indsamler, bruger og beskytter dine personlige oplysninger."),
    },
    "legal-notice": {
        "en": ("Legal Notice", "Legal notice and terms of use for Mallorca Cycle Shuttle website. Information about Autocares Devesa SL and legal compliance."),
        "de": ("Impressum", "Impressum und Nutzungsbedingungen für die Website von Mallorca Cycle Shuttle. Informationen über Autocares Devesa SL und rechtliche Compliance."),
        "es": ("Aviso Legal", "Aviso legal y condiciones de uso del sitio web de Mallorca Cycle Shuttle. Información sobre Autocares Devesa SL y cumplimiento legal."),
        "it": ("Note Legali", "Avviso legale e termini di utilizzo del sito web di Mallorca Cycle Shuttle. Informazioni su Autocares Devesa SL e conformità legale."),
        "fr": ("Mentions Légales", "Mentions légales et conditions d'utilisation du site web de Mallorca Cycle Shuttle. Informations sur Autocares Devesa SL et conformité légale."),
        "ca": ("Avís Legal", "Avís legal i condicions d'ús del lloc web de Mallorca Cycle Shuttle. Informació sobre Autocares Devesa SL i compliment legal."),
        "nl": ("Juridische Kennisgeving", "Juridische kennisgeving en gebruiksvoorwaarden voor de website van Mallorca Cycle Shuttle. Informatie over Autocares Devesa SL en juridische naleving."),
        "sv": ("Rättsligt Meddelande", "Rättsligt meddelande och användarvillkor för Mallorca Cycle Shuttle webbplats. Information om Autocares Devesa SL och juridisk efterlevnad."),
        "nb": ("Juridisk Merknad", "Juridisk merknad og brukervilkår for Mallorca Cycle Shuttle nettsted. Informasjon om Autocares Devesa SL og juridisk overholdelse."),
        "da": ("Juridisk Meddelelse", "Juridisk meddelelse og brugsvilkår for Mallorca Cycle Shuttle hjemmeside. Information om Autocares Devesa SL og juridisk overholdelse."),
    },
}

def add_description_to_file(filepath, title, description):
    """Add description to a file's front matter."""
    try:
        # Read the file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already has description
        if 'description:' in content:
            print(f"  ✓ Skip (already has description): {filepath}")
            return False

        # If file is empty or has minimal content, create proper front matter
        if len(content.strip()) == 0:
            new_content = f'''---
title: "{title}"
description: "{description}"
---
'''
        # If file has front matter, add description to it
        elif content.strip().startswith('---'):
            # Find the end of front matter
            parts = content.split('---', 2)
            if len(parts) >= 3:
                front_matter = parts[1]
                body = parts[2]
                # Add description to front matter
                new_front_matter = front_matter.rstrip() + f'\ndescription: "{description}"\n'
                new_content = f'---{new_front_matter}---{body}'
            else:
                # Malformed front matter, rebuild it
                new_content = f'''---
title: "{title}"
description: "{description}"
---
{content}
'''
        else:
            # No front matter, add it
            new_content = f'''---
title: "{title}"
description: "{description}"
---
{content}
'''

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  ✓ Added description: {filepath}")
        return True

    except Exception as e:
        print(f"  ✗ Error processing {filepath}: {e}")
        return False

def process_legal_pages():
    """Process legal pages (cookie, privacy, legal notice)."""
    processed = 0

    for page_type, translations in LEGAL_DESCRIPTIONS.items():
        for lang, (title, desc) in translations.items():
            # Find the file path for this legal page
            if lang == "it":
                if "cookie" in page_type:
                    path = f"content/{lang}/chi-siamo/informativa-cookies/_index.md"
                elif "privacy" in page_type:
                    path = f"content/{lang}/chi-siamo/informativa-sulla-privacy/_index.md"
                elif "legal" in page_type:
                    path = f"content/{lang}/chi-siamo/note-legali/_index.md"
            elif lang == "ca":
                if "cookie" in page_type:
                    path = f"content/{lang}/sobre/politica-de-cookies/_index.md"
                elif "privacy" in page_type:
                    path = f"content/{lang}/sobre/politica-de-privadesa/_index.md"
                elif "legal" in page_type:
                    path = f"content/{lang}/sobre/avis-legal/_index.md"
            elif lang == "sv":
                if "cookie" in page_type:
                    path = f"content/{lang}/om/cookiepolicy/_index.md"
                elif "privacy" in page_type:
                    path = f"content/{lang}/om/integritetspolicy/_index.md"
                elif "legal" in page_type:
                    path = f"content/{lang}/om/rattsligt-meddelande/_index.md"
            elif lang == "nb":
                if "cookie" in page_type:
                    path = f"content/{lang}/om/informasjonskapselpolicy/_index.md"
                elif "privacy" in page_type:
                    path = f"content/{lang}/om/personvernpolicy/_index.md"
                elif "legal" in page_type:
                    path = f"content/{lang}/om/juridisk-merknad/_index.md"
            elif lang == "da":
                if "cookie" in page_type:
                    path = f"content/{lang}/om/cookiepolitik/_index.md"
                elif "privacy" in page_type:
                    path = f"content/{lang}/om/privatlivspolitik/_index.md"
                elif "legal" in page_type:
                    path = f"content/{lang}/om/juridisk-meddelelse/_index.md"
            else:  # en, de, es, fr, nl
                if "cookie" in page_type:
                    if lang == "de":
                        path = f"content/{lang}/about/cookie-richtlinie/_index.md"
                    elif lang == "es":
                        path = f"content/{lang}/about/politica-de-cookies/_index.md"
                    elif lang == "fr":
                        path = f"content/{lang}/about/politique-de-cookies/_index.md"
                    elif lang == "nl":
                        path = f"content/{lang}/about/cookiebeleid/_index.md"
                    else:  # en
                        path = f"content/{lang}/about/cookie-policy/_index.md"
                elif "privacy" in page_type:
                    if lang == "de":
                        path = f"content/{lang}/about/datenschutzerklarung/_index.md"
                    elif lang == "es":
                        path = f"content/{lang}/about/politica-de-privacidad/_index.md"
                    elif lang == "fr":
                        path = f"content/{lang}/about/politique-de-confidentialite/_index.md"
                    elif lang == "nl":
                        path = f"content/{lang}/about/privacybeleid/_index.md"
                    else:  # en
                        path = f"content/{lang}/about/privacy-policy/_index.md"
                elif "legal" in page_type:
                    if lang == "de":
                        path = f"content/{lang}/about/rechtlicher-hinweis/_index.md"
                    elif lang == "es":
                        path = f"content/{lang}/about/aviso-legal/_index.md"
                    elif lang == "fr":
                        path = f"content/{lang}/about/mentions-legales/_index.md"
                    elif lang == "nl":
                        path = f"content/{lang}/about/juridische-kennisgeving/_index.md"
                    else:  # en
                        path = f"content/{lang}/about/legal-notice/_index.md"

            if os.path.exists(path):
                if add_description_to_file(path, title, desc):
                    processed += 1

    return processed

def main():
    os.chdir('/mnt/c/Users/photo/Documents/mallorca-cycle-shuttle')

    print("Adding meta descriptions to content files...")
    print("=" * 60)

    processed_count = 0

    # Process specific pages from DESCRIPTIONS dict
    print("\n1. Processing service and about pages...")
    for relative_path, (title, desc) in DESCRIPTIONS.items():
        filepath = f"content/{relative_path}"
        if os.path.exists(filepath):
            if add_description_to_file(filepath, title, desc):
                processed_count += 1
        else:
            print(f"  ⚠ File not found: {filepath}")

    # Process legal pages
    print("\n2. Processing legal pages...")
    processed_count += process_legal_pages()

    print("\n" + "=" * 60)
    print(f"✓ Complete! Added descriptions to {processed_count} files.")
    print("=" * 60)

if __name__ == "__main__":
    main()
