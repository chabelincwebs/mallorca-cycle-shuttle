---
title: "Master Cycling Guide: The Big Daddy Challenge"
description: "Epic all-day traverse of Mallorcas Serra de Tramuntana with 8 classified cols and optional bonus ports"
translationKey: "guide-big-daddy"
---

<p class="header-subtitle">
Bike out, bus back.
</p>

<div class="hero-intro-banner">
<div class="hero-intro-content">
<p class="hero-intro-centered fade-in-up">
Will this be your <strong>best day on a bike?</strong>
</p>
<p class="hero-intro-main fade-in-up delay-1">
An epic, all-day traverse of <span class="highlight">Mallorca's Serra de Tramuntana</span> with three optional "bonus" ports for extra bite: <strong>Port des Canonge</strong>, <strong>Port de Valldemossa</strong>, and <strong>Port de Sa Calobra</strong>
</p>
<p class="hero-intro-features fade-in-up delay-2">
Butter-smooth tarmac • 8 classified cols • Coastal cliffs • Pine forest • High mountains • Frequent café villages
</p>
</div>
</div>

<style>
/* Center Page Title */
h1 {
  text-align: center;
  margin-bottom: 1rem;
}

/* Header Subtitle - Below Title */
.header-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #555;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  margin: 0 auto 2.5rem auto;
  max-width: 800px;
  letter-spacing: -0.01em;
}

/* Hero Intro Banner - Premium Glassmorphism */
.hero-intro-banner {
  margin: 0 0 2rem 0;
  padding: 1.8rem 2.5rem 3rem 2.5rem;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 28px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.hero-intro-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.06) 0%, rgba(255, 51, 51, 0.02) 100%);
  z-index: 0;
  border-radius: 28px;
}

.hero-intro-banner::after {
  content: '';
  position: absolute;
  top: 0;
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
}

.hero-intro-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Italic First Line */
.hero-intro-italic {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #555;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Centered "brilliant" Line */
.hero-intro-centered {
  font-size: 2rem;
  line-height: 1.4;
  font-weight: 800;
  text-align: center;
  margin: 0;
  color: #111;
}

.hero-intro-centered strong {
  background: linear-gradient(135deg, rgba(241, 0, 0, 1) 0%, rgba(255, 51, 51, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Main Intro Paragraph */
.hero-intro-main {
  font-size: 1.35rem;
  line-height: 1.7;
  color: #222;
  font-weight: 500;
  text-align: center;
  margin: 0;
  letter-spacing: -0.01em;
}

.hero-intro-main strong {
  font-weight: 700;
  color: #111;
}

.hero-intro-main .highlight {
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.12) 0%, rgba(255, 51, 51, 0.08) 100%);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  color: #111;
}

.hero-intro-main .highlight-red {
  background: linear-gradient(135deg, rgba(241, 0, 0, 1) 0%, rgba(255, 51, 51, 0.95) 100%);
  color: white;
  padding: 0.2rem 0.75rem;
  border-radius: 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(241, 0, 0, 0.3);
}

/* Hero Links - Clickable Highlights */
.hero-link {
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.hero-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(241, 0, 0, 0.4);
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Features Line */
.hero-intro-features {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  text-align: center;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Fade-in animations */
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
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

.fade-in-up.delay-1 {
  animation-delay: 0.2s;
}

.fade-in-up.delay-2 {
  animation-delay: 0.4s;
}

.fade-in-up.delay-3 {
  animation-delay: 0.6s;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-subtitle {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

  .hero-intro-banner {
    padding: 1.2rem 1.5rem 2rem 1.5rem;
    margin: 0 0 3rem 0;
  }

  .hero-intro-centered {
    font-size: 1.6rem;
  }

  .hero-intro-main {
    font-size: 1.15rem;
  }

  .hero-intro-main .highlight-red {
    font-size: 1rem;
    padding: 0.15rem 0.5rem;
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
<h3>Snapshot</h3>
</div>
<div class="info-card-content">
<p><strong>Distance & climbing:</strong> Roughly 162–167 km with ~4,300 m of ascent</p>
<p><strong>Cols:</strong> 8 classified</p>
<p><strong>Surface:</strong> Butter-smooth tarmac</p>
<p><strong>Scenery:</strong> Coastal cliffs, pine forest, high mountains</p>
<p><strong>Fuel stops:</strong> Frequent café villages</p>
<p><strong>Difficulty:</strong> Not for everyone – unrelenting in places</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🔑</span>
<span class="card-toggle">+</span>
</div>
<h3>What It Is</h3>
</div>
<div class="info-card-content">
<p>An epic, all-day traverse of Mallorca's Serra de Tramuntana with three optional "bonus" ports for extra bite: Port des Canonge, Port de Valldemossa, and Port de Sa Calobra.</p>
<p>You set the pace and the stopping strategy. We get you to the start by <a href="https://mallorcacycleshuttle.company.site/products/Scheduled-Bike-Buses-c15728235" target="_blank" rel="noopener noreferrer">shuttle</a>; you ride the spine of the range; you finish with a bus back.</p>
<p>Expect long, steady climbs, stacked back-to-back. "Unrelenting" is the word riders use most.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🚴</span>
<span class="card-toggle">+</span>
</div>
<h3>Route Concept</h3>
</div>
<div class="info-card-content">
<p><strong>Bike bus to the start</strong> – roll out fresh.</p>
<p><strong>Ride the Tramuntana</strong> – stitch together the classic coastal road and high-mountain passes.</p>
<p><strong>Optional add-ons</strong> – drop to sea level at one or more ports, then climb back out.</p>
<p><strong>Bus back</strong> – legs up, stories out.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">📊</span>
<span class="card-toggle">+</span>
</div>
<h3>Key Stats</h3>
</div>
<div class="info-card-content">
<p><strong>Full Big Daddy:</strong> ~162–167 km / ~4,300 m depending on add-ons</p>
<p><strong>Shortest return-route options:</strong> From ~115 km / ~2,400 m</p>
<p><strong>Views:</strong> You'll crest 8 classified cols wrapped in some of Mallorca's finest views – limestone peaks, terraced hillsides, turquoise coves. On clear days you can see across the Med toward Barcelona.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">☕</span>
<span class="card-toggle">+</span>
</div>
<h3>Café Strategy</h3>
</div>
<div class="info-card-content">
<p>If your fuel of choice is excellent coffee plus cake or tapas, you're in luck. Roughly every hour you roll through a village with solid options – Estellencs, Banyalbufar, Deià, Valldemossa, Sóller, and more.</p>
<p><strong>Pro tip:</strong> If you descend to any Port, you're at sea level – the only way out is up.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">💪</span>
<span class="card-toggle">+</span>
</div>
<h3>Who Should Do It</h3>
</div>
<div class="info-card-content">
<p><strong>This is hard – very hard.</strong></p>
<p>It's a personal sportive with better scenery, better surfaces, and usually better weather than most events.</p>
<p>If you're not there yet, get there – the memories are worth the work.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🗺️</span>
<span class="card-toggle">+</span>
</div>
<h3>Variations & Files</h3>
</div>
<div class="info-card-content">
<p>You can scale the challenge:</p>
<p><strong>Shortest return-route options:</strong> From ~115 km / ~2,400 m</p>
<p><strong>Full Big Daddy:</strong> ~162–167 km / ~4,300 m depending on add-ons</p>
<p><strong>GPX files:</strong> Full GPX files available below.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🚌</span>
<span class="card-toggle">+</span>
</div>
<h3>Logistics</h3>
</div>
<div class="info-card-content">
<p><strong>Bike out, bus back:</strong> Take the <a href="https://mallorcacycleshuttle.company.site/products/Scheduled-Bike-Buses-c15728235" target="_blank" rel="noopener noreferrer">scheduled bike bus</a> to the start, ride back along the Tramuntana, and meet the return bus.</p>
<p><strong>Schedules:</strong> See our current scheduled bike bus times to plan your day.</p>
<p><strong>Road surfaces:</strong> Predominantly smooth tarmac; watch for damp patches on shaded or coastal sections.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🛟</span>
<span class="card-toggle">+</span>
</div>
<h3>Peace of Mind</h3>
</div>
<div class="info-card-content">
<p><strong>Mallorca Bicycle Rescue</strong></p>
<p>Murphy's law happens. If bike or body breaks down:</p>
<ul>
<li>We take you to a local bike shop, back to your accommodation, or to your rental shop – your choice.</li>
<li>Simple, fast, island-wide.</li>
</ul>
<p><a href="https://mallorcacycleshuttle.company.site/products/Rescue-&-Recovery-c15728236" target="_blank" rel="noopener noreferrer">Get cover</a> before you roll so you can ride far without second-guessing.</p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">📅</span>
<span class="card-toggle">+</span>
</div>
<h3>Schedule</h3>
</div>
<div class="info-card-content">
<p>Use the bike bus to Port d'Andratx from Port de Pollença/Alcúdia/Playa de Muro and from Peguera, Playa de Palma & Santa Ponsa to Port de Pollença.</p>
<p><a href="https://mallorcacycleshuttle.company.site/products/Scheduled-Bike-Buses-c15728235" target="_blank" rel="noopener noreferrer" class="cta">View Schedule & Book →</a></p>
</div>
</div>

<div class="info-card" onclick="toggleCard(this)">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">💡</span>
<span class="card-toggle">+</span>
</div>
<h3>Summary</h3>
</div>
<div class="info-card-content">
<p>Big miles, big vertical, big coastline, big mountains.</p>
<p>The Big Daddy Challenge is Mallorca's all-day masterpiece.</p>
<p>Plan your cafés, respect the climbs, carry what you need, and give yourself time.</p>
<p>Then go see why riders come back calling it their best day on a bike.</p>
</div>
</div>

<div class="info-card" onclick="window.open('https://mallorcacycleshuttle.company.site/products/Andratx-Pollenca-Finishers-Unisex-Classic-T-p788401800', '_blank')" style="cursor: pointer;">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">👕</span>
<span class="card-toggle">+</span>
</div>
<h3>Finisher's Gear</h3>
</div>
<div class="info-card-content">
<p><strong>Celebrate your achievement!</strong></p>
<p>Get your exclusive Port d'Andratx-Port de Pollença finisher's t-shirt and show the world you conquered this epic route.</p>
<p style="color: var(--brand, #f10000); font-weight: 700; margin-top: 1rem;">Shop Now →</p>
</div>
</div>

<div class="info-card" onclick="window.open('https://mallorcacycleshuttle.company.site/products/Departure-towns-c28971057', '_blank')" style="cursor: pointer;">
<div class="info-card-header">
<div class="info-card-header-top">
<span style="font-size: 1.5rem;">🚌</span>
<span class="card-toggle">+</span>
</div>
<h3>Book Your Shuttle</h3>
</div>
<div class="info-card-content">
<p><strong>Need a ride to start your adventure?</strong></p>
<p>Browse all departure towns and book your shuttle to Port d'Andratx or Port de Pollença. We've got you covered!</p>
<p style="color: var(--brand, #f10000); font-weight: 700; margin-top: 1rem;">View Shuttles →</p>
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
  bottom: 0;
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.05) 0%, rgba(255, 51, 51, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
  border-radius: 20px;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(241, 0, 0, 0.15);
  border-color: rgba(241, 0, 0, 0.2);
}

.info-card:hover::before {
  opacity: 1;
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
  opacity: 1;
}

.info-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
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

/* Floating Icon Badge - Top Right */
.info-card-header-top > span:first-child {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(241, 0, 0, 0.9) 0%, rgba(255, 51, 51, 0.85) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 4px 16px rgba(241, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.9);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.info-card:hover .info-card-header-top > span:first-child {
  transform: rotate(12deg) scale(1.1);
  box-shadow: 0 6px 24px rgba(241, 0, 0, 0.4);
}

.info-card.expanded .info-card-header-top > span:first-child {
  transform: scale(1.15);
  background: linear-gradient(135deg, rgba(241, 0, 0, 1) 0%, rgba(255, 51, 51, 0.95) 100%);
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
<h2 id="north-routes" class="route-direction-header">North Routes – Andratx → Pollença</h2>
</div>

<div class="route-accordion">
  <!-- Route 1: Big Daddy Full -->
  <div class="route-item" id="route-north-1">
    <div class="route-header" onclick="toggleRoute('north-1')">
      <div class="route-title-section">
        <span class="route-icon">▶</span>
        <div>
          <div class="route-title">Big Daddy Challenge (8 classified cols)</div>
          <div class="route-stats-inline">
            <span>📏 162 km</span>
            <span>⛰️ 4,267 m</span>
            <span class="difficulty-badge difficulty-very-hard">Very Hard</span>
          </div>
        </div>
      </div>
      <div class="route-actions">
        <a href="/routes/portandratx-pollenca-big-daddy.gpx" download class="gpx-download" onclick="event.stopPropagation()">⬇ GPX</a>
      </div>
    </div>
    <div class="route-content">
      <div class="route-content-inner">
        <p class="route-description">Coastal section + Port des Canonge + Port Valldemossa → long side Puig Major → aqueduct → Coll dels Reis → Sa Calobra (down & up) → Lluc → Pollença/Port. Very hard.</p>
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
<h2 id="south-routes" class="route-direction-header">South Routes – Pollença → Andratx</h2>
</div>

<div class="route-accordion">
  <!-- Route: Big Daddy Reverse -->
  <div class="route-item" id="route-south-3">
    <div class="route-header" onclick="toggleRoute('south-3')">
      <div class="route-title-section">
        <span class="route-icon">▶</span>
        <div>
          <div class="route-title">Big Daddy Challenge (reverse)</div>
          <div class="route-stats-inline">
            <span>📏 167 km</span>
            <span>⛰️ 4,121 m</span>
            <span class="difficulty-badge difficulty-very-hard">Very Hard</span>
          </div>
        </div>
      </div>
      <div class="route-actions">
        <a href="/routes/portpollenca-portandratx-big-daddy.gpx" download class="gpx-download" onclick="event.stopPropagation()">⬇ GPX</a>
      </div>
    </div>
    <div class="route-content">
      <div class="route-content-inner">
        <p class="route-description">As above conceptually, including the three "ports" (Canonge, Valldemossa, Sa Calobra). For strong climbers only.</p>
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
    .bindPopup('<strong>Start:</strong> ' + config.startName);
  console.log('Start marker added');

  const lastIdx = coordinates.length - 1;
  L.marker([coordinates[lastIdx].lat, coordinates[lastIdx].lon], { icon: endIcon })
    .addTo(map)
    .bindPopup('<strong>End:</strong> ' + config.endName);
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
        label: 'Elevation (m)',
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
            title: (context) => 'Distance: ' + context[0].label + ' km',
            label: (context) => 'Elevation: ' + context.parsed.y.toFixed(0) + ' m'
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Distance (km)' },
          ticks: { maxTicksLimit: 15 }
        },
        y: {
          title: { display: true, text: 'Elevation (m)' }
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
<img src="/img/finishers-tshirt-andratx-pollenca.webp" alt="Andratx-Pollença Finisher's T-Shirt" style="width: 100%; height: 100%; object-fit: cover; display: block;">
</div>
<div style="flex: 1 1 400px; padding: 2.5rem;">
<h2 style="color: var(--brand, #f10000); margin-bottom: 0.75rem; font-size: 1.75rem; font-weight: 700;">Commemorate Your Ride</h2>
<h3 style="color: #333; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.75rem;">Andratx-Pollença Finisher's T-Shirt</h3>
<p style="color: #666; font-size: 1rem; margin-bottom: 1.5rem; line-height: 1.6;">Celebrate completing this epic route with our exclusive finisher's t-shirt. Available in multiple colors and sizes.</p>
<div style="display: inline-block; padding: 0.9rem 2rem; background: linear-gradient(135deg, var(--brand, #f10000) 0%, #ff3333 100%); color: white; border-radius: 0.5rem; font-size: 1rem; font-weight: 700; box-shadow: 0 4px 15px rgba(241, 0, 0, 0.3);">
Shop Now →
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

