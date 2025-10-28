---
title: "Guía Maestra de Ciclismo: El Desafío Big Daddy"
description: "Travesía épica de un día por la Serra de Tramuntana de Mallorca con 8 puertos clasificados y puertos bonus opcionales"
translationKey: "guide-big-daddy"
type: "bike-shuttle"
---

<p class="header-subtitle">
En bici la ida, en autobús la vuelta.
</p>

<div class="hero-intro-banner">
<div class="hero-intro-content">
<p class="hero-intro-centered fade-in-up">
¿Será este tu <strong>mejor día sobre la bici?</strong>
</p>
<p class="hero-intro-main fade-in-up delay-1">
Una travesía épica de todo el día por la <span class="highlight">Serra de Tramuntana de Mallorca</span> con tres puertos "bonus" opcionales para mayor desafío: <strong>Port des Canonge</strong>, <strong>Port de Valldemossa</strong> y <strong>Port de Sa Calobra</strong>
</p>
<p class="hero-intro-features fade-in-up delay-2">
Asfalto suave como la mantequilla • 8 puertos clasificados • Acantilados costeros • Bosque de pinos • Altas montañas • Pueblos con cafés frecuentes
</p>
</div>
</div>

<style>
/* Apple 2025 Design System - CSS Variables */
:root {
  --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --brand-color: #f10000;
  --text-primary: #1d1d1f;
  --text-secondary: #6e6e73;
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f7;
  --border-light: rgba(0, 0, 0, 0.1);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.16);
  --transition-fast: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
}

/* Typography Reset */
h1, h2, h3, p {
  font-family: var(--font-system);
  color: var(--text-primary);
}

/* Page Title */
h1 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 2.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Header Subtitle */
.header-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--text-secondary);
  font-weight: 500;
  font-style: italic;
  text-align: center;
  margin: 0 auto 2.5rem auto;
  max-width: 800px;
  letter-spacing: -0.01em;
}

/* Hero Intro Banner - Clean Card Design */
.hero-intro-banner {
  margin: 0 0 3rem 0;
  padding: 3rem 2.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.hero-intro-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--brand-color), transparent);
  opacity: 0.8;
}

/* Hero Intro Content */
.hero-intro-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Centered Text */
.hero-intro-centered {
  font-size: 2rem;
  line-height: 1.3;
  font-weight: 700;
  text-align: center;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.hero-intro-centered strong {
  background: linear-gradient(135deg, var(--brand-color) 0%, #ff3333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Main Paragraph */
.hero-intro-main {
  font-size: 1.35rem;
  line-height: 1.6;
  color: var(--text-primary);
  font-weight: 400;
  text-align: center;
  margin: 0;
  letter-spacing: -0.01em;
}

.hero-intro-main strong {
  font-weight: 600;
  color: var(--text-primary);
}

/* Highlight Styles */
.highlight {
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.1) 0%, rgba(255, 51, 51, 0.05) 100%);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  color: var(--text-primary);
}

.highlight-red {
  background: linear-gradient(135deg, var(--brand-color) 0%, #ff3333 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(241, 0, 0, 0.25);
}

/* Hero Links */
.hero-link {
  text-decoration: none;
  display: inline-block;
  transition: var(--transition-fast);
  cursor: pointer;
}

.hero-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(241, 0, 0, 0.3);
}

/* Features Line */
.hero-intro-features {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Fade-in Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

.fade-in-up.delay-1 {
  animation-delay: 0.15s;
}

.fade-in-up.delay-2 {
  animation-delay: 0.3s;
}

.fade-in-up.delay-3 {
  animation-delay: 0.45s;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

  .hero-intro-banner {
    padding: 2rem 1.5rem;
    margin: 0 0 2.5rem 0;
  }

  .hero-intro-centered {
    font-size: 1.5rem;
  }

  .hero-intro-main {
    font-size: 1.15rem;
  }

  .hero-intro-features {
    font-size: 1rem;
  }
}
</style>

<!-- INFO CARDS GRID -->
<div class="info-cards-wrapper">
<div class="info-cards-grid">

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">📸</span>
<span class="card-toggle">+</span>
</div>
<h3>Resumen</h3>
</div>
<div class="info-card-content">
<p><strong>Distancia y desnivel:</strong> Aproximadamente 162–167 km con ~4.300 m de ascenso</p>
<p><strong>Puertos:</strong> 8 clasificados</p>
<p><strong>Superficie:</strong> Asfalto suave como la mantequilla</p>
<p><strong>Paisaje:</strong> Acantilados costeros, bosque de pinos, altas montañas</p>
<p><strong>Paradas de avituallamiento:</strong> Pueblos con cafés frecuentes</p>
<p><strong>Dificultad:</strong> No es para todos – implacable en algunos tramos</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🔑</span>
<span class="card-toggle">+</span>
</div>
<h3>Qué es</h3>
</div>
<div class="info-card-content">
<p>Una travesía épica de todo el día por la Serra de Tramuntana de Mallorca con tres puertos "bonus" opcionales para mayor desafío: Port des Canonge, Port de Valldemossa y Port de Sa Calobra.</p>
<p>Tú marcas el ritmo y la estrategia de paradas. Nosotros te llevamos al punto de partida en <a href="https://mallorcacycleshuttle.company.site/products/Scheduled-Bike-Buses-c15728235" target="_blank" rel="noopener noreferrer">shuttle</a>; tú recorres la columna vertebral de la sierra; terminas con un autobús de regreso.</p>
<p>Espera subidas largas y constantes, una tras otra. "Implacable" es la palabra que más usan los ciclistas.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🚴</span>
<span class="card-toggle">+</span>
</div>
<h3>Concepto de la Ruta</h3>
</div>
<div class="info-card-content">
<p><strong>Bus para bicis al inicio</strong> – sal fresco.</p>
<p><strong>Recorre la Tramuntana</strong> – conecta la clásica carretera costera con los puertos de alta montaña.</p>
<p><strong>Opciones adicionales</strong> – desciende al nivel del mar en uno o más puertos y vuelve a subir.</p>
<p><strong>Bus de regreso</strong> – piernas arriba, historias fuera.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">📊</span>
<span class="card-toggle">+</span>
</div>
<h3>Estadísticas Clave</h3>
</div>
<div class="info-card-content">
<p><strong>Big Daddy completo:</strong> ~162–167 km / ~4.300 m dependiendo de los extras</p>
<p><strong>Opciones de ruta de retorno más cortas:</strong> Desde ~115 km / ~2.400 m</p>
<p><strong>Vistas:</strong> Coronarás 8 puertos clasificados envueltos en algunas de las mejores vistas de Mallorca: picos de piedra caliza, laderas en terrazas, calas turquesas. En días claros puedes ver el Mediterráneo hacia Barcelona.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">☕</span>
<span class="card-toggle">+</span>
</div>
<h3>Estrategia de Cafés</h3>
</div>
<div class="info-card-content">
<p>Si tu combustible preferido es un excelente café con pastel o tapas, estás de suerte. Aproximadamente cada hora pasas por un pueblo con buenas opciones: Estellencs, Banyalbufar, Deià, Valldemossa, Sóller y más.</p>
<p><strong>Consejo profesional:</strong> Si desciendes a cualquier Port, estás al nivel del mar: la única salida es subiendo.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">💪</span>
<span class="card-toggle">+</span>
</div>
<h3>Quién Debería Hacerlo</h3>
</div>
<div class="info-card-content">
<p><strong>Esto es duro – muy duro.</strong></p>
<p>Es una marcha personal deportiva con mejor paisaje, mejores superficies y generalmente mejor clima que la mayoría de eventos.</p>
<p>Si aún no estás preparado, prepárate: los recuerdos valen la pena el esfuerzo.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🗺️</span>
<span class="card-toggle">+</span>
</div>
<h3>Variaciones y Archivos</h3>
</div>
<div class="info-card-content">
<p>Puedes escalar el desafío:</p>
<p><strong>Opciones de ruta de retorno más cortas:</strong> Desde ~115 km / ~2.400 m</p>
<p><strong>Big Daddy completo:</strong> ~162–167 km / ~4.300 m dependiendo de los extras</p>
<p><strong>Archivos GPX:</strong> Archivos GPX completos disponibles abajo.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🚌</span>
<span class="card-toggle">+</span>
</div>
<h3>Logística</h3>
</div>
<div class="info-card-content">
<p><strong>En bici la ida, en autobús la vuelta:</strong> Toma el <a href="https://mallorcacycleshuttle.company.site/products/Scheduled-Bike-Buses-c15728235" target="_blank" rel="noopener noreferrer">bus para bicis programado</a> al inicio, pedalea de regreso por la Tramuntana y encuentra el bus de retorno.</p>
<p><strong>Horarios:</strong> Consulta nuestros horarios actuales de buses para bicis para planificar tu día.</p>
<p><strong>Superficies de carretera:</strong> Predominantemente asfalto liso; ojo con parches húmedos en secciones sombreadas o costeras.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🛟</span>
<span class="card-toggle">+</span>
</div>
<h3>Tranquilidad</h3>
</div>
<div class="info-card-content">
<p><strong>Mallorca Bicycle Rescue</strong></p>
<p>La ley de Murphy ocurre. Si la bici o el cuerpo fallan:</p>
<ul>
<li>Te llevamos a una tienda de bicicletas local, de vuelta a tu alojamiento o a tu tienda de alquiler: tú eliges.</li>
<li>Simple, rápido, en toda la isla.</li>
</ul>
<p><a href="https://mallorcacycleshuttle.company.site/products/Rescue-&-Recovery-c15728236" target="_blank" rel="noopener noreferrer">Obtén cobertura</a> antes de salir para que puedas pedalear lejos sin dudas.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">📅</span>
<span class="card-toggle">+</span>
</div>
<h3>Horario</h3>
</div>
<div class="info-card-content">
<p>Usa el bus para bicis a Port d'Andratx desde Port de Pollença/Alcúdia/Playa de Muro y desde Peguera, Playa de Palma y Santa Ponsa a Port de Pollença.</p>
<p><a href="https://mallorcacycleshuttle.company.site/products/Scheduled-Bike-Buses-c15728235" target="_blank" rel="noopener noreferrer" class="cta">Ver Horario y Reservar →</a></p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">💡</span>
<span class="card-toggle">+</span>
</div>
<h3>Resumen</h3>
</div>
<div class="info-card-content">
<p>Grandes kilómetros, gran desnivel, gran costa, grandes montañas.</p>
<p>El Desafío Big Daddy es la obra maestra de todo el día de Mallorca.</p>
<p>Planifica tus cafés, respeta las subidas, lleva lo que necesites y date tiempo.</p>
<p>Luego ve por qué los ciclistas vuelven llamándolo su mejor día sobre la bici.</p>
</div>
</div>

<div class="info-card" onclick="window.open('https://mallorcacycleshuttle.company.site/products/Andratx-Pollenca-Finishers-Unisex-Classic-T-p788401800', '_blank')" style="cursor: pointer;">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">👕</span>
<span class="card-toggle">+</span>
</div>
<h3>Ropa de Finisher</h3>
</div>
<div class="info-card-content">
<p><strong>¡Celebra tu logro!</strong></p>
<p>Consigue tu camiseta exclusiva de finisher Port d'Andratx-Port de Pollença y muestra al mundo que conquistaste esta ruta épica.</p>
<p style="color: var(--brand, #f10000); font-weight: 700; margin-top: 1rem;">Comprar Ahora →</p>
</div>
</div>

<div class="info-card" onclick="window.open('https://mallorcacycleshuttle.company.site/products/Departure-towns-c28971057', '_blank')" style="cursor: pointer;">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🚌</span>
<span class="card-toggle">+</span>
</div>
<h3>Reserva Tu Shuttle</h3>
</div>
<div class="info-card-content">
<p><strong>¿Necesitas transporte para empezar tu aventura?</strong></p>
<p>Explora todos los pueblos de salida y reserva tu shuttle a Port d'Andratx o Port de Pollença. ¡Te tenemos cubierto!</p>
<p style="color: var(--brand, #f10000); font-weight: 700; margin-top: 1rem;">Ver Shuttles →</p>
</div>
</div>

</div>
</div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<style>
/* Info Cards Wrapper */
.info-cards-wrapper {
  margin: 2rem 0 3rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f5 100%);
  border-radius: 24px;
  position: relative;
}

.info-cards-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(241, 0, 0, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 51, 51, 0.02) 0%, transparent 50%);
  border-radius: 24px;
  pointer-events: none;
}

/* Info Cards Grid */
.info-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .info-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.75rem;
  }
}

@media (min-width: 1024px) {
  .info-cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

/* Hide all cards when one is expanded */
.info-cards-grid.has-expanded .info-card {
  display: none;
}

/* Show only the expanded card */
.info-cards-grid.has-expanded .info-card.expanded {
  display: block;
}

/* Routes 2-Column Layout - Premium Wrapper */
.routes-2col-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin: 3rem 0 2rem 0;
  padding: 2.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f5 100%);
  border-radius: 28px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}

.routes-2col-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 30% 40%, rgba(241, 0, 0, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(255, 51, 51, 0.03) 0%, transparent 50%);
  border-radius: 28px;
  pointer-events: none;
}

@media (min-width: 768px) {
  .routes-2col-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }
}

.routes-column {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  z-index: 1;
}

/* Hide all routes when one is expanded */
.routes-2col-wrapper.has-expanded .route-item {
  display: none;
}

/* Show only the expanded route */
.routes-2col-wrapper.has-expanded .route-item.active {
  display: block;
}

/* Make the column containing the active route span full width */
.routes-2col-wrapper.has-expanded .routes-column:has(.route-item.active) {
  grid-column: 1 / -1;
}

/* Hide empty columns when a route is expanded */
.routes-2col-wrapper.has-expanded .routes-column:not(:has(.route-item.active)) {
  display: none;
}

.info-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--brand-color, #f10000), transparent);
  opacity: 0.6;
  transition: all 0.4s ease;
  z-index: 2;
}

.info-card:hover::before {
  height: 5px;
  opacity: 1;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(241, 0, 0, 0.15);
  border-color: rgba(241, 0, 0, 0.2);
}

.info-card.expanded {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 16px 64px rgba(241, 0, 0, 0.2);
  border-color: rgba(241, 0, 0, 0.3);
  grid-column: 1 / -1;
  transform: scale(1.02);
}

.info-card.expanded::before {
  height: 5px;
  opacity: 1;
}

.info-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.75rem 1.5rem 1rem 1.5rem;
  user-select: none;
  position: relative;
  z-index: 1;
}

.info-card-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}

/* Info Icon - Monochrome Style */
.info-icon {
  font-size: 2.5rem;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

.info-card:hover .info-icon {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}

.info-card.expanded .info-icon {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.15);
}

/* Legacy Icon Support - Top Right */
.info-card-header-top > span:first-child {
  font-size: 2.5rem;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

.info-card:hover .info-card-header-top > span:first-child {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}

.info-card.expanded .info-card-header-top > span:first-child {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.15);
}

.info-card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #222;
  font-weight: 700;
  padding-right: 3rem;
  line-height: 1.3;
}

.card-toggle {
  font-size: 1.8rem;
  font-weight: 300;
  color: rgba(241, 0, 0, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(241, 0, 0, 0.08);
  border-radius: 50%;
  margin-top: -0.25rem;
}

.info-card:hover .card-toggle {
  background: rgba(241, 0, 0, 0.12);
  transform: scale(1.1);
}

.info-card.expanded .card-toggle {
  transform: rotate(45deg) scale(1.15);
  background: rgba(241, 0, 0, 0.15);
  color: rgba(241, 0, 0, 1);
}

.info-card-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), padding 0.5s ease;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
}

.info-card.expanded .info-card-content {
  max-height: 2000px;
  padding: 0 1.5rem 1.75rem 1.5rem;
}

.info-card-content p {
  margin: 0 0 0.85rem 0;
  line-height: 1.7;
  color: #333;
  font-size: 0.95rem;
}

.info-card-content p:last-child {
  margin-bottom: 0;
}

.info-card-content strong {
  color: #111;
  font-weight: 700;
}

.info-card-content a {
  color: rgba(241, 0, 0, 0.9);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(241, 0, 0, 0.3);
}

.info-card-content a:hover {
  color: rgba(241, 0, 0, 1);
  border-bottom-color: rgba(241, 0, 0, 0.6);
}

.info-card-content .cta {
  display: inline-block;
  background: linear-gradient(135deg, rgba(241, 0, 0, 1) 0%, rgba(255, 51, 51, 0.95) 100%);
  color: white;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  margin-top: 1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(241, 0, 0, 0.25);
  border: none;
  border-bottom: none;
}

.info-card-content .cta:hover {
  background: linear-gradient(135deg, rgba(209, 0, 0, 1) 0%, rgba(241, 0, 0, 1) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(241, 0, 0, 0.4);
}

.info-card-content ul {
  margin: 0;
  padding-left: 1.5rem;
}

.info-card-content li {
  margin-bottom: 0.65rem;
  line-height: 1.7;
  color: #333;
  font-size: 0.95rem;
}

/* Finisher's Gear CTA Card - Special Styling */
.info-card-cta {
  background: white;
  border: 2px solid var(--brand, #f10000);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(241, 0, 0, 0.15);
  text-decoration: none;
  display: block;
  position: relative;
  grid-column: 1 / -1;
}

.info-card-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.03) 0%, transparent 100%);
  pointer-events: none;
}

.info-card-cta:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(241, 0, 0, 0.25);
  border-width: 3px;
}

.info-card-cta .info-card-header {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  padding: 1.25rem;
  user-select: none;
}

.info-card-content-cta {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.4s ease;
  padding: 0 1.25rem;
}

.info-card-content-cta p {
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
  color: var(--text);
}

.info-card-content-cta p:last-child {
  margin-bottom: 0;
}

.info-card-content ul {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.8;
}

.info-card-content li {
  margin-bottom: 0.5rem;
}

.info-card-content a {
  color: var(--brand);
  text-decoration: underline;
}

.info-card-content a:hover {
  text-decoration: none;
}

/* Accordion Section Headers */
.route-section {
  margin: 2rem 0 1.5rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f8f8 0%, #fff 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.route-section h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Accordion Container */
.route-accordion {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0 3rem 0;
}

/* Accordion Item - Glassmorphism */
.route-item {
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
}

.route-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.04) 0%, rgba(255, 51, 51, 0.01) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
  border-radius: 20px;
}

.route-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 48px rgba(241, 0, 0, 0.12);
  border-color: rgba(241, 0, 0, 0.2);
}

.route-item:hover::before {
  opacity: 1;
}

.route-item.active {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(241, 0, 0, 0.3);
  box-shadow: 0 16px 64px rgba(241, 0, 0, 0.18);
  transform: scale(1.01);
}

.route-item.active::before {
  opacity: 1;
}

/* Accordion Header - Premium Glass Effect */
.route-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.75rem;
  cursor: pointer;
  user-select: none;
  gap: 1.25rem;
  flex-wrap: wrap;
  background: transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.route-header:hover {
  background: rgba(255, 245, 245, 0.3);
}

.route-item.active .route-header {
  background: rgba(255, 240, 240, 0.4);
  padding-bottom: 1.75rem;
}

/* Close X button - only show when route is active */
.route-item.active .route-header::after {
  content: '✕';
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  color: var(--brand, #f10000);
  font-weight: 700;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.route-item.active .route-header:hover::after {
  opacity: 1;
}

.route-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 200px;
}

.route-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
  color: var(--brand);
}

.route-item.active .route-icon {
  transform: rotate(90deg);
}

.route-title {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--text);
  line-height: 1.3;
}

.route-stats-inline {
  display: flex;
  gap: 0.75rem;
  color: #555;
  font-size: 0.9rem;
  font-weight: 600;
  flex-wrap: wrap;
  align-items: center;
}

.route-stats-inline span {
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.route-stats-inline span:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.difficulty-badge {
  display: inline-block;
  padding: 0.5rem 1.1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.difficulty-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
}

.difficulty-moderate {
  background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
  color: white;
  border: 2px solid #FF9800;
}

.difficulty-hard {
  background: linear-gradient(135deg, #EF5350 0%, #E53935 100%);
  color: white;
  border: 2px solid #E53935;
}

.difficulty-very-hard {
  background: linear-gradient(135deg, #C62828 0%, #B71C1C 100%);
  color: white;
  border: 2px solid #B71C1C;
}

.difficulty-epic {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  border: 2px solid #FFA500;
  font-weight: 900;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.route-actions {
  display: flex;
  gap: 0.5rem;
}

.gpx-download {
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.gpx-download:hover {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(241,0,0,0.3);
}

/* Accordion Content */
.route-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.route-item.active .route-content {
  max-height: 2000px;
}

.route-content-inner {
  padding: 0 1.25rem 1.25rem 1.25rem;
}

.route-description {
  margin: 0 0 1.5rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 3px solid var(--brand);
  border-radius: 4px;
  font-style: italic;
  color: var(--muted);
}

/* Map and Elevation Containers */
.route-map {
  height: 500px;
  width: 100%;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
  overflow: hidden;
  background: #aad3df;
}

.route-map .leaflet-tile-container {
  opacity: 1 !important;
}

.route-map .leaflet-tile,
.route-map .leaflet-tile-pane img,
.route-map img.leaflet-tile {
  opacity: 1 !important;
  visibility: visible !important;
  width: 256px !important;
  height: 256px !important;
  max-width: 256px !important;
  max-height: 256px !important;
  min-width: 256px !important;
  min-height: 256px !important;
}

.route-map .leaflet-layer {
  opacity: 1 !important;
}

.route-map img {
  max-width: none !important;
  width: auto !important;
  height: auto !important;
}

.route-map .leaflet-overlay-pane {
  z-index: 400 !important;
  pointer-events: none !important;
}

.route-map .leaflet-overlay-pane svg,
.route-map svg.leaflet-zoom-animated {
  overflow: visible !important;
  max-width: none !important;
  max-height: none !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: block !important;
  position: absolute !important;
}

/* Critical: Override main.css rule that forces height:auto on all SVGs */
main .container .prose .route-map svg,
.route-map .leaflet-overlay-pane svg,
.route-map svg {
  max-width: none !important;
  max-height: none !important;
  height: initial !important;
  width: initial !important;
}

.route-map .leaflet-overlay-pane path,
.route-map path.leaflet-interactive,
.route-map svg path,
.route-map path.route-polyline {
  visibility: visible !important;
  display: block !important;
  opacity: 0.8 !important;
  stroke: #f10000 !important;
  stroke-width: 3px !important;
  stroke-opacity: 0.8 !important;
  fill: none !important;
  fill-opacity: 0 !important;
  pointer-events: auto !important;
  vector-effect: non-scaling-stroke !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  transform: none !important;
}

path.route-polyline {
  stroke: #f10000 !important;
  stroke-width: 3px !important;
  visibility: visible !important;
  opacity: 0.8 !important;
}

.route-map .leaflet-marker-icon,
.route-map .leaflet-marker-pane img {
  max-width: none !important;
  min-width: 25px !important;
  min-height: 41px !important;
  width: 25px !important;
  height: 41px !important;
}

.route-map .leaflet-marker-shadow {
  max-width: none !important;
  width: 41px !important;
  height: 41px !important;
}

.route-map .custom-marker {
  width: 30px !important;
  height: 30px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.route-map .custom-marker div {
  width: 30px !important;
  height: 30px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.elevation-profile {
  height: 300px;
  width: 100%;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
}

.elevation-profile canvas {
  max-width: 100% !important;
}

/* Coming Soon Placeholder */
.coming-soon {
  padding: 2rem;
  text-align: center;
  background: #f9f9f9;
  border-radius: 8px;
  color: var(--muted);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .route-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .route-stats-inline {
    font-size: 0.85rem;
  }

  .route-map {
    height: 400px;
  }

  .elevation-profile {
    height: 250px;
  }
}
</style>

<!-- ROUTES 2-COLUMN LAYOUT -->
<div class="routes-2col-wrapper">

<!-- LEFT COLUMN: NORTH ROUTES -->
<div class="routes-column">

<div class="route-section">
<h2 id="north-routes" class="route-direction-header">Rutas Norte – Andratx → Pollença</h2>
</div>

<div class="route-accordion">
  <!-- Route 1: Big Daddy Full -->
  <div class="route-item" id="route-north-1">
    <div class="route-header" onclick="toggleRoute('north-1')">
      <div class="route-title-section">
        <span class="route-icon">▶</span>
        <div>
          <div class="route-title">Desafío Big Daddy (8 puertos clasificados)</div>
          <div class="route-stats-inline">
            <span>📏 162 km</span>
            <span>⛰️ 4.267 m</span>
            <span class="difficulty-badge difficulty-very-hard">Muy Difícil</span>
          </div>
        </div>
      </div>
      <div class="route-actions">
        <a href="/routes/portandratx-pollenca-big-daddy.gpx" download class="gpx-download" onclick="event.stopPropagation()">⬇ GPX</a>
      </div>
    </div>
    <div class="route-content">
      <div class="route-content-inner">
        <p class="route-description">Tramo costero + Port des Canonge + Port Valldemossa → lado largo Puig Major → acueducto → Coll dels Reis → Sa Calobra (bajada y subida) → Lluc → Pollença/Port. Muy difícil.</p>
        <div id="map-north-1" class="route-map"></div>
        <div class="elevation-profile">
          <canvas id="chart-north-1"></canvas>
        </div>
      </div>
    </div>
  </div>

</div>

</div>

<!-- RIGHT COLUMN: SOUTH ROUTES -->
<div class="routes-column">

<div class="route-section">
<h2 id="south-routes" class="route-direction-header">Rutas Sur – Pollença → Andratx</h2>
</div>

<div class="route-accordion">
  <!-- Route 9: Big Daddy Reverse -->
  <div class="route-item" id="route-south-3">
    <div class="route-header" onclick="toggleRoute('south-3')">
      <div class="route-title-section">
        <span class="route-icon">▶</span>
        <div>
          <div class="route-title">Desafío Big Daddy (inverso)</div>
          <div class="route-stats-inline">
            <span>📏 167 km</span>
            <span>⛰️ 4.121 m</span>
            <span class="difficulty-badge difficulty-very-hard">Muy Difícil</span>
          </div>
        </div>
      </div>
      <div class="route-actions">
        <a href="/routes/portpollenca-portandratx-big-daddy.gpx" download class="gpx-download" onclick="event.stopPropagation()">⬇ GPX</a>
      </div>
    </div>
    <div class="route-content">
      <div class="route-content-inner">
        <p class="route-description">Igual conceptualmente, incluyendo los tres "ports" (Canonge, Valldemossa, Sa Calobra). Solo para escaladores fuertes.</p>
        <div id="map-south-3" class="route-map"></div>
        <div class="elevation-profile">
          <canvas id="chart-south-3"></canvas>
        </div>
      </div>
    </div>
  </div>


</div>

</div>

</div>

<script>
// Toggle info card expansion
function toggleCard(card) {
  const wasExpanded = card.classList.contains('expanded');
  const grid = card.closest('.info-cards-grid');

  // Close all other cards
  document.querySelectorAll('.info-card.expanded').forEach(c => {
    c.classList.remove('expanded');
  });

  // Toggle this card
  if (!wasExpanded) {
    card.classList.add('expanded');
    grid.classList.add('has-expanded');
  } else {
    grid.classList.remove('has-expanded');
  }
}

// Smooth scroll to product panel (CTA card click)
function smoothScrollToProduct(event) {
  // Prevent any default behavior
  if (event) {
    event.stopPropagation();
  }

  const target = document.getElementById('finishers-gear');
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Route configuration
// Using -web.gpx files for display (75% smaller), original files for downloads
const routes = {
  'north-1': { gpx: 'portandratx-pollenca-vanilla-web.gpx', startName: 'Port d\'Andratx', endName: 'Port de Pollença' },
  'north-2': { gpx: 'portandratx-pollenca-via-caimari-web.gpx', startName: 'Port d\'Andratx', endName: 'Port de Pollença' },
  'north-3': { gpx: 'portandratx-pollenca-portvalldemossa-web.gpx', startName: 'Port d\'Andratx', endName: 'Port de Pollença' },
  'north-4': { gpx: 'portandratx-pollenca-valldemossa-sacalobra-web.gpx', startName: 'Port d\'Andratx', endName: 'Port de Pollença' },
  'north-5': { gpx: 'portandratx-pollenca-big-daddy-web.gpx', startName: 'Port d\'Andratx', endName: 'Port de Pollença' },
  'north-6': { gpx: 'portandratx-pollenca-colldesoller-orient-web.gpx', startName: 'Port d\'Andratx', endName: 'Port de Pollença' },
  'south-1': { gpx: 'portpollenca-portandratx-vanilla-web.gpx', startName: 'Port de Pollença', endName: 'Port d\'Andratx' },
  'south-2': { gpx: 'portpollenca-portandratx-canonge-valldemossa-web.gpx', startName: 'Port de Pollença', endName: 'Port d\'Andratx' },
  'south-3': { gpx: 'portpollenca-portandratx-puigpunyent-web.gpx', startName: 'Port de Pollença', endName: 'Port d\'Andratx' },
  'south-3': { gpx: 'portpollenca-portandratx-big-daddy-web.gpx', startName: 'Port de Pollença', endName: 'Port d\'Andratx' },
  'south-5': { gpx: 'portpollenca-portandratx-formentor-web.gpx', startName: 'Port de Pollença', endName: 'Port d\'Andratx' }
};

const loadedRoutes = {};

// Toggle accordion item
function toggleRoute(routeId) {
  const item = document.getElementById('route-' + routeId);
  const wasActive = item.classList.contains('active');
  const wrapper = document.querySelector('.routes-2col-wrapper');

  // Close all other items
  document.querySelectorAll('.route-item').forEach(el => {
    el.classList.remove('active');
  });

  // Open this item if it wasn't active
  if (!wasActive) {
    item.classList.add('active');
    wrapper.classList.add('has-expanded');

    // Load route if not already loaded
    if (!loadedRoutes[routeId]) {
      loadRoute(routeId);
      loadedRoutes[routeId] = true;
    }
  } else {
    wrapper.classList.remove('has-expanded');
  }
}

// Load and render a route
async function loadRoute(routeId) {
  const config = routes[routeId];
  if (!config) return;

  try {
    // Fetch GPX
    const response = await fetch('/routes/' + config.gpx);
    const gpxText = await response.text();
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxText, 'text/xml');

    // Extract coordinates
    const trkpts = Array.from(gpxDoc.querySelectorAll('trkpt'));
    const coordinates = trkpts.map(pt => ({
      lat: parseFloat(pt.getAttribute('lat')),
      lon: parseFloat(pt.getAttribute('lon')),
      ele: parseFloat(pt.querySelector('ele').textContent)
    }));

    // Render map
    renderMap(routeId, coordinates, config);

    // Render elevation chart
    renderElevationChart(routeId, coordinates);

  } catch (error) {
    console.error('Error loading route:', error);
  }
}

// Render map
function renderMap(routeId, coordinates, config) {
  const mapId = 'map-' + routeId;
  const mapDiv = document.getElementById(mapId);

  console.log('Rendering map for', routeId);
  console.log('Map div dimensions:', mapDiv.offsetWidth, 'x', mapDiv.offsetHeight);

  // Initialize map
  const map = L.map(mapId).setView([coordinates[0].lat, coordinates[0].lon], 10);
  console.log('Map initialized');

  // Add tiles
  const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  });

  tileLayer.on('tileload', function() {
    console.log('Tile loaded for', routeId);
  });

  tileLayer.on('tileerror', function(error) {
    console.error('Tile error for', routeId, error);
  });

  tileLayer.addTo(map);
  console.log('Tiles added');

  // Add route line with explicit stroke properties
  const routeLine = L.polyline(coordinates.map(c => [c.lat, c.lon]), {
    color: '#f10000',
    weight: 3,
    opacity: 0.8,
    fillOpacity: 0,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'route-polyline',
    smoothFactor: 0,  // Disable path simplification
    noClip: true      // Don't clip the path
  }).addTo(map);

  // Explicitly bring polyline to front
  routeLine.bringToFront();

  console.log('Route line added with', coordinates.length, 'points');
  console.log('Route line bounds:', routeLine.getBounds());

  // Check the actual DOM element
  setTimeout(() => {
    const pathElement = routeLine.getElement();
    if (pathElement) {
      console.log('Route line DOM element found');
      console.log('Path element tag:', pathElement.tagName);
      console.log('Path element class:', pathElement.className);
      console.log('Path computed stroke:', window.getComputedStyle(pathElement).stroke);
      console.log('Path computed stroke-width:', window.getComputedStyle(pathElement).strokeWidth);
      console.log('Path computed display:', window.getComputedStyle(pathElement).display);
      console.log('Path computed visibility:', window.getComputedStyle(pathElement).visibility);
    } else {
      console.error('Route line DOM element NOT found!');
    }
  }, 500);

  // Create custom marker icons with inline SVG
  const startIcon = L.divIcon({
    html: '<div style="width:30px;height:30px;background:#00ff00;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const endIcon = L.divIcon({
    html: '<div style="width:30px;height:30px;background:#ff0000;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  // Add markers with custom icons
  L.marker([coordinates[0].lat, coordinates[0].lon], { icon: startIcon })
    .addTo(map)
    .bindPopup('<strong>Inicio:</strong> ' + config.startName);
  console.log('Start marker added');

  const lastIdx = coordinates.length - 1;
  L.marker([coordinates[lastIdx].lat, coordinates[lastIdx].lon], { icon: endIcon })
    .addTo(map)
    .bindPopup('<strong>Fin:</strong> ' + config.endName);
  console.log('End marker added');

  // Fit bounds
  map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  console.log('Bounds fitted');

  // Force resize after animation
  setTimeout(() => {
    map.invalidateSize();
    console.log('Map invalidated for', routeId, 'new dimensions:', mapDiv.offsetWidth, 'x', mapDiv.offsetHeight);

    // Debug: Check tile visibility
    const tiles = mapDiv.querySelectorAll('.leaflet-tile');
    console.log('Number of tiles in DOM:', tiles.length);
    if (tiles.length > 0) {
      console.log('First tile dimensions:', tiles[0].offsetWidth, 'x', tiles[0].offsetHeight);
      console.log('First tile computed style:', window.getComputedStyle(tiles[0]).width, window.getComputedStyle(tiles[0]).height);
    }

    // Debug: Check route visibility
    const overlayPane = mapDiv.querySelector('.leaflet-overlay-pane');
    console.log('Overlay pane:', overlayPane ? 'found' : 'NOT FOUND');

    if (overlayPane) {
      const svgs = overlayPane.querySelectorAll('svg');
      console.log('SVGs in overlay:', svgs.length);
      if (svgs.length > 0) {
        const svg = svgs[0];
        console.log('SVG dimensions:', svg.getAttribute('width'), 'x', svg.getAttribute('height'));
        console.log('SVG style:', svg.style.cssText);
        console.log('SVG position:', window.getComputedStyle(svg).position);
      }
    }

    const paths = mapDiv.querySelectorAll('path');
    console.log('Number of path elements:', paths.length);
    if (paths.length > 0) {
      const pathStyle = window.getComputedStyle(paths[0]);
      console.log('Path stroke:', pathStyle.stroke, 'stroke-width:', pathStyle.strokeWidth, 'visibility:', pathStyle.visibility);
      console.log('Path d attribute length:', paths[0].getAttribute('d') ? paths[0].getAttribute('d').length : 0);

      // Check path bounding box
      try {
        const bbox = paths[0].getBBox();
        console.log('Path bbox:', bbox.x, bbox.y, bbox.width, bbox.height);

        // Check if bbox is outside visible area
        const svg = paths[0].closest('svg');
        const svgRect = svg.getBoundingClientRect();
        const pathRect = paths[0].getBoundingClientRect();
        console.log('SVG screen position:', svgRect.x, svgRect.y, svgRect.width, svgRect.height);
        console.log('Path screen position:', pathRect.x, pathRect.y, pathRect.width, pathRect.height);
        console.log('SVG viewBox:', svg.getAttribute('viewBox'));
        console.log('SVG transform:', svg.style.transform);

        // Sample first few path coordinates
        const dAttr = paths[0].getAttribute('d');
        const firstCoords = dAttr.substring(0, 200);
        console.log('First 200 chars of path d:', firstCoords);
      } catch(e) {
        console.log('Could not get bbox:', e.message);
      }
    }

    // Debug: Check markers
    const markers = mapDiv.querySelectorAll('.leaflet-marker-icon');
    console.log('Number of markers:', markers.length);
    if (markers.length > 0) {
      console.log('First marker dimensions:', markers[0].offsetWidth, 'x', markers[0].offsetHeight);
    }
  }, 1000);
}

// Render elevation chart
function renderElevationChart(routeId, coordinates) {
  const chartId = 'chart-' + routeId;
  const ctx = document.getElementById(chartId).getContext('2d');

  // Calculate cumulative distance
  const distancePoints = [0];
  for (let i = 1; i < coordinates.length; i++) {
    const lat1 = coordinates[i-1].lat * Math.PI / 180;
    const lat2 = coordinates[i].lat * Math.PI / 180;
    const dLat = (coordinates[i].lat - coordinates[i-1].lat) * Math.PI / 180;
    const dLon = (coordinates[i].lon - coordinates[i-1].lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    distancePoints.push(distancePoints[i-1] + 6371 * c);
  }

  // Sample data
  const sampleRate = 10;
  const sampledDistances = distancePoints.filter((_, i) => i % sampleRate === 0);
  const sampledElevations = coordinates.filter((_, i) => i % sampleRate === 0).map(c => c.ele);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: sampledDistances.map(d => d.toFixed(1)),
      datasets: [{
        label: 'Altitud (m)',
        data: sampledElevations,
        borderColor: '#f10000',
        backgroundColor: 'rgba(241, 0, 0, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (context) => 'Distancia: ' + context[0].label + ' km',
            label: (context) => 'Altitud: ' + context.parsed.y.toFixed(0) + ' m'
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Distancia (km)' },
          ticks: { maxTicksLimit: 15 }
        },
        y: {
          title: { display: true, text: 'Altitud (m)' }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

</script>

<!-- Finisher's T-Shirt Product -->
<div id="finishers-gear" class="finishers-tshirt-horizontal" style="margin: 4rem auto 2rem; max-width: 1000px; scroll-margin-top: 2rem;">
<a href="https://mallorcacycleshuttle.company.site/products/Andratx-Pollenca-Finishers-Unisex-Classic-T-p788401800" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
<div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 1rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; display: flex; flex-wrap: wrap; align-items: center;">
<div style="flex: 1 1 350px; min-width: 300px;">
<img src="/img/finishers-tshirt-andratx-pollenca.webp" alt="Camiseta de Finisher Andratx-Pollença" style="width: 100%; height: 100%; object-fit: cover; display: block;">
</div>
<div style="flex: 1 1 400px; padding: 2.5rem;">
<h2 style="color: var(--brand, #f10000); margin-bottom: 0.75rem; font-size: 1.75rem; font-weight: 700;">Conmemora Tu Ruta</h2>
<h3 style="color: #333; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.75rem;">Camiseta de Finisher Andratx-Pollença</h3>
<p style="color: #666; font-size: 1rem; margin-bottom: 1.5rem; line-height: 1.6;">Celebra haber completado esta ruta épica con nuestra camiseta exclusiva de finisher. Disponible en múltiples colores y tallas.</p>
<div style="display: inline-block; padding: 0.9rem 2rem; background: linear-gradient(135deg, var(--brand, #f10000) 0%, #ff3333 100%); color: white; border-radius: 0.5rem; font-size: 1rem; font-weight: 700; box-shadow: 0 4px 15px rgba(241, 0, 0, 0.3);">
Comprar Ahora →
</div>
</div>
</div>
</a>
</div>

<style>
/* Hover effects for finisher's t-shirt */
.finishers-tshirt-horizontal a > div:hover {
transform: translateY(-4px);
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* Mobile responsive */
@media (max-width: 768px) {
.finishers-tshirt-horizontal > a > div {
flex-direction: column;
}

.finishers-tshirt-horizontal > a > div > div:first-child {
max-height: 350px;
}
}
</style>

<style>
/* Route Direction Headers - Premium Glassmorphism */
.route-direction-header {
  font-size: 2rem;
  font-weight: 800;
  padding: 2rem 2.5rem;
  margin: 4rem 0 2.5rem;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
  color: #111;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  letter-spacing: -0.02em;
  scroll-margin-top: 2rem;
}

.route-direction-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.08) 0%, rgba(255, 51, 51, 0.03) 100%);
  z-index: 0;
  border-radius: 24px;
}

.route-direction-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(241, 0, 0, 0.6) 20%,
    rgba(241, 0, 0, 1) 50%,
    rgba(241, 0, 0, 0.6) 80%,
    transparent 100%
  );
  border-radius: 0 0 24px 24px;
  transition: height 0.4s ease;
}

.route-direction-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 64px rgba(241, 0, 0, 0.12);
  border-color: rgba(241, 0, 0, 0.2);
}

.route-direction-header:hover::after {
  height: 6px;
}

/* Add directional arrows via text content */
.route-direction-header {
  position: relative;
  z-index: 1;
}

</style>

