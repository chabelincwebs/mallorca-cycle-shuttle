#!/bin/bash

declare -A posts
posts["3-unglaubliche-passe-und-eine-saftbar"]="3 Unglaubliche Pässe Und Eine Saftbar"
posts["radfahrer-wenn-fahrrad-oder-koerper-ausfallen-auf-mallorca"]="Radfahrer Wenn Fahrrad Oder Körper Ausfallen Auf Mallorca"
posts["mallorca-top-10-dinge-zu-tun"]="Mallorca Top 10 Dinge Zu Tun"
posts["radfahren-cala-tuent-sa-calobra-mit-einem-dreh"]="Radfahren Cala Tuent Sa Calobra Mit Einem Dreh"
posts["die-5-besten-radtage-auf-mallorca"]="Die 5 Besten Radtage Auf Mallorca"
posts["big-daddy-cycle-challenge-empfohlene-cafestopps"]="Big Daddy Cycle Challenge Empfohlene Cafestopps"
posts["empfohlene-cafestopps-andratx-zurueck-nach-pollenca-alcudia-can-picafort"]="Empfohlene Cafestopps Andratx Zurück Nach Pollenca Alcudia Can Picafort"
posts["mache-sa-calobra-noch-besser-nimm-cala-tuent-auf"]="Mache Sa Calobra Noch Besser Nimm Cala Tuent Auf"
posts["mallorca-radreise-dieses-jahr-anfaengerfehler-zu-vermeiden"]="Mallorca Radreise Dieses Jahr Anfängerfehler Zu Vermeiden"
posts["bus-hin-bike-zurueck-auf-mallorca"]="Bus Hin Bike Zurück Auf Mallorca"
posts["wann-ist-die-beste-zeit-zum-radfahren-auf-mallorca"]="Wann Ist Die Beste Zeit Zum Radfahren Auf Mallorca"
posts["verkehrsregeln-fuer-radfahrer-in-spanien"]="Verkehrsregeln Für Radfahrer In Spanien"
posts["unser-frecher-3-tage-besuch"]="Unser Frecher 3 Tage Besuch"
posts["radfahren-auf-mallorca-unser-bester-tag-auf-dem-fahrrad"]="Radfahren Auf Mallorca Unser Bester Tag Auf Dem Fahrrad"
posts["episches-radwochenende-mallorca-diy"]="Episches Radwochenende Mallorca Diy"
posts["die-beste-radroute-auf-mallorca"]="Die Beste Radroute Auf Mallorca"
posts["wetter-auf-mallorca-im-februar-was-radfahrer-erwarten-koennen"]="Wetter Auf Mallorca Im Februar Was Radfahrer Erwarten Können"
posts["2025-verkehrsregeln-fuer-radfahrer-in-mallorca"]="2025 Verkehrsregeln Für Radfahrer In Mallorca"
posts["sobremunt-der-haerteste-radaufstieg-auf-mallorca"]="Sobremunt Der Härteste Radaufstieg Auf Mallorca"
posts["neuer-shuttle-service-abfahrten-von-port-alcudia-hinzugefuegt"]="Neuer Shuttle Service Abfahrten Von Port Alcudia Hinzugefügt"
posts["warum-mallorca-ein-paradies-fuer-radfahrer-ist"]="Warum Mallorca Ein Paradies Für Radfahrer Ist"
posts["radfahren-auf-der-ma-10-mallorca-andratx-nach-puerto-pollensa-durch-das-tramuntana-gebirge-von-john-mccracken"]="Radfahren Auf Der Ma 10 Mallorca Andratx Nach Puerto Pollensa Durch Das Tramuntana Gebirge Von John Mccracken"
posts["11-jahre-hilfe-fuer-radfahrer"]="11 Jahre Hilfe Für Radfahrer"
posts["sa-calobra-das-juwel-in-mallorcas-radkrone"]="Sa Calobra Das Juwel In Mallorcas Radkrone"

for dir in "${!posts[@]}"; do
  mkdir -p "$dir"
  cat > "$dir/_index.md" <<EOF
---
title: "${posts[$dir]}"
description: "Blogbeitrag über ${posts[$dir]}"
date: 2024-01-01
---

# ${posts[$dir]}

Inhalt folgt in Kürze...
EOF
done

echo "Created $(find . -mindepth 2 -name '_index.md' | wc -l) blog posts"
