import { useState } from 'react'

const packages = [
  {
    tier: 'Standard Listing',
    tagline: 'Get found locally',
    price: 'Free',
    priceSub: '8% booking commission',
    accent: 'teal',
    icon: '📋',
    features: [
      'Basic search directory listing',
      'Shareable web link & printable QR code sign',
      'Instant WhatsApp confirmation trigger',
    ],
    ideal: 'Small church annexes, school rooms, local sports grounds',
    cta: 'List for Free',
  },
  {
    tier: 'Growth Booster',
    tagline: 'Amplify your reach',
    price: '$49 FJD/mo',
    priceSub: 'or +4% additional commission',
    accent: 'coral',
    icon: '🚀',
    features: [
      'Featured placement on platform homepage',
      'Auto-generated Facebook & Instagram ad banners',
      'Google Business Profile setup & search indexing',
    ],
    ideal: 'Mid-size civic halls, community centers, private gardens',
    cta: 'Start Growing',
    popular: true,
  },
  {
    tier: 'Enterprise Showcase',
    tagline: 'Full-service presence',
    price: '$149 FJD/mo',
    priceSub: 'flat recurring fee',
    accent: 'sand',
    icon: '🏆',
    features: [
      'Professional photography & 360° virtual tour',
      'Targeted Meta (Facebook) ad campaign execution',
      'Dedicated landing page + direct WhatsApp lead bot',
    ],
    ideal: 'Prime Suva auditoriums, boutique resort grounds, large venues',
    cta: 'Go Enterprise',
  },
]

const channels = [
  {
    icon: '📘',
    name: 'Meta (Facebook & Instagram)',
    desc: 'Facebook dominates digital activity in Fiji. Generate dynamic social post graphics and ad templates directly from venue listing photos and live pricing data.',
    tags: ['Auto-banner generation', 'Targeted ad campaigns', 'Story formats'],
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🔍',
    name: 'Local SEO & Google Maps',
    desc: 'Auto-generate schema markup for each venue to capture high-intent searches like "hall rental Suva" or "wedding venue near me" on Google and Maps.',
    tags: ['Schema markup', 'Google Business Profile', 'Maps listing'],
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  {
    icon: '🤝',
    name: 'Vendor Ecosystem Cross-Promotions',
    desc: 'Partner with Suva caterers, sound hire services, and decorators to cross-promote featured venues in exchange for referral discounts applied at checkout.',
    tags: ['Caterer tie-ins', 'Sound hire deals', 'Decorator referrals'],
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
]

const viralLoops = [
  {
    icon: '📣',
    title: 'Renter Share Incentives',
    desc: 'Offer customers a 5% discount on cleaning fees or add-ons when they broadcast their upcoming event page on Facebook — generating organic referral traffic at zero ad spend.',
    metric: '5% discount',
    metricLabel: 'on cleaning fees or add-ons',
    visual: 'coral',
  },
  {
    icon: '📲',
    title: 'Automated QR Kit',
    desc: 'Supply venue managers with ready-to-print poster templates featuring custom QR codes — converting walk-in hall inquiries directly into confirmed online bookings.',
    metric: '100% trackable',
    metricLabel: 'walk-in-to-booking conversion',
    visual: 'teal',
  },
]

type ChannelTab = 'meta' | 'seo' | 'vendor'
const channelKeys: ChannelTab[] = ['meta', 'seo', 'vendor']

export default function App() {
  const [activePackage, setActivePackage] = useState(1)
  const [activeChannel, setActiveChannel] = useState(0)
  const [shareChoice, setShareChoice] = useState<null | 'frontend' | 'backend'>(null)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0b2e2b 0%, #133d38 30%, #1a5450 60%, #2a4a20 100%)' }}>
      {/* Mesh overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(51,160,153,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(224,92,53,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 10%, rgba(200,184,154,0.08) 0%, transparent 40%)`,
        }}
      />

      <div className="relative">
        {/* Header */}
        <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-lg">🏝️</div>
            <div>
              <div className="text-white font-bold text-base tracking-tight leading-none">eBooking Fiji</div>
              <div className="text-teal-300 text-xs font-mono mt-0.5">Marketing Platform</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-teal-200">
            <a href="#packages" className="hover:text-white transition-colors">Packages</a>
            <a href="#channels" className="hover:text-white transition-colors">Channels</a>
            <a href="#viral" className="hover:text-white transition-colors">Viral Loops</a>
            <button className="bg-coral-500 hover:bg-coral-400 text-white px-4 py-1.5 rounded-full font-semibold transition-colors text-xs">
              Get Started
            </button>
          </nav>
        </header>

        {/* Hero */}
        <section className="px-6 pt-12 pb-20 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-800/60 border border-teal-600/40 rounded-full px-4 py-1.5 text-teal-200 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-pulse" />
            Platform Marketing Architecture — eBooking Fiji
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            Promote Fiji venues
            <br />
            <em className="italic text-teal-300 not-italic" style={{ fontStyle: 'italic' }}>effortlessly.</em>
          </h1>

          <p className="text-teal-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            An automated marketing layer embedded into eBooking — so hosts spend time hosting, not advertising.
            From WhatsApp confirmations to Meta ad campaigns.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="bg-coral-500 hover:bg-coral-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-coral-600/30">
              Explore Marketing Packages
            </button>
            <button className="border border-teal-400/40 text-teal-200 hover:text-white hover:border-teal-300 px-8 py-3.5 rounded-2xl transition-colors font-semibold">
              See Live Demo
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-xl mx-auto">
            {[
              { n: '3', label: 'Marketing Tiers' },
              { n: '5%', label: 'Viral Share Discount' },
              { n: '$0', label: 'to List & Earn' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{s.n}</div>
                <div className="text-teal-300 text-xs mt-1 font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Tiered Venue Marketing Packages
            </h2>
            <p className="text-teal-300 text-base">Choose the marketing muscle your venue needs</p>
          </div>

          {/* Package selector tabs */}
          <div className="flex gap-2 justify-center mb-8 flex-wrap">
            {packages.map((p, i) => (
              <button
                key={p.tier}
                onClick={() => setActivePackage(i)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activePackage === i
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-white/10 text-teal-200 hover:bg-white/20'
                }`}
              >
                {p.icon} {p.tier}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          <div className="grid md:grid-cols-3 gap-5">
            {packages.map((pkg, i) => (
              <div
                key={pkg.tier}
                onClick={() => setActivePackage(i)}
                className={`relative rounded-3xl p-7 cursor-pointer transition-all duration-300 ${
                  activePackage === i
                    ? 'bg-white shadow-2xl scale-[1.02]'
                    : 'bg-white/8 border border-white/15 hover:bg-white/12'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className={`text-3xl mb-4`}>{pkg.icon}</div>

                <h3
                  className={`text-xl font-bold mb-1 ${activePackage === i ? 'text-teal-900' : 'text-white'}`}
                  style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                >
                  {pkg.tier}
                </h3>
                <p className={`text-xs font-mono mb-5 ${activePackage === i ? 'text-teal-600' : 'text-teal-300'}`}>
                  {pkg.tagline}
                </p>

                <div className="mb-5">
                  <span className={`text-3xl font-bold ${activePackage === i ? 'text-teal-800' : 'text-white'}`} style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {pkg.price}
                  </span>
                  <div className={`text-xs mt-1 ${activePackage === i ? 'text-sand-600' : 'text-teal-400'}`}>{pkg.priceSub}</div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className={activePackage === i ? 'text-sand-800' : 'text-teal-100'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className={`text-xs mb-6 p-3 rounded-xl ${activePackage === i ? 'bg-sand-100 text-sand-700' : 'bg-white/8 text-teal-300'}`}>
                  <span className="font-semibold">Ideal for:</span> {pkg.ideal}
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    activePackage === i
                      ? 'bg-teal-700 text-white hover:bg-teal-600 shadow-md shadow-teal-700/30'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {pkg.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Channels */}
        <section id="channels" className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                Core Fiji Digital
                <br />
                <em style={{ fontStyle: 'italic', color: 'var(--color-teal-300, #82d0ca)' }}>Marketing Channels</em>
              </h2>
              <p className="text-teal-200 text-base leading-relaxed mb-8">
                Every venue listing automatically syncs with Fiji's most active digital channels — from Facebook feeds to Google Maps, without lifting a finger.
              </p>

              <div className="space-y-3">
                {channels.map((ch, i) => (
                  <button
                    key={ch.name}
                    onClick={() => setActiveChannel(i)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      activeChannel === i
                        ? 'bg-white border-white shadow-lg'
                        : 'bg-white/8 border-white/15 hover:bg-white/12'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ch.icon}</span>
                      <div>
                        <div className={`font-bold text-sm ${activeChannel === i ? 'text-teal-900' : 'text-white'}`}>{ch.name}</div>
                        <div className={`text-xs mt-0.5 ${activeChannel === i ? 'text-sand-600' : 'text-teal-400'}`}>
                          {ch.tags.join(' · ')}
                        </div>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        activeChannel === i ? 'border-teal-500 bg-teal-500' : 'border-teal-500/40'
                      }`}>
                        {activeChannel === i && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel detail panel */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="text-4xl mb-4">{channels[activeChannel].icon}</div>
              <h3 className="text-2xl font-bold text-teal-900 mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                {channels[activeChannel].name}
              </h3>
              <p className="text-sand-700 text-sm leading-relaxed mb-6">{channels[activeChannel].desc}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {channels[activeChannel].tags.map(t => (
                  <span key={t} className="bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-200">
                    {t}
                  </span>
                ))}
              </div>

              {/* Mock preview card */}
              <div className="bg-sand-50 border border-sand-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-xs font-bold">V</div>
                  <div>
                    <div className="text-xs font-bold text-sand-900">Venue Host · Suva, Fiji</div>
                    <div className="text-xs text-sand-500 font-mono">Auto-generated · just now</div>
                  </div>
                </div>
                <div className="text-sm text-sand-800 mb-3">
                  {activeChannel === 0 && '📢 Grand Hall now available for weekend bookings! Seats 200. Air-conditioned. Catering available. Book via link ↓'}
                  {activeChannel === 1 && '📍 Grand Hall Suva — "hall rental Suva" — ⭐ 4.9 · 47 reviews · Open for bookings'}
                  {activeChannel === 2 && '🎉 Book Grand Hall + save 10% on Suva Catering Co. services when booked through eBooking Fiji!'}
                </div>
                <div className="bg-teal-600 text-white text-xs text-center py-2 rounded-xl font-semibold">
                  {activeChannel === 0 ? 'Book on Facebook' : activeChannel === 1 ? 'Get Directions · Book Now' : 'Claim Partner Discount'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Viral Loops */}
        <section id="viral" className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Built-In Viral Loops
            </h2>
            <p className="text-teal-300 text-base">Organic growth mechanisms that run themselves</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {viralLoops.map(loop => (
              <div key={loop.title} className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    loop.visual === 'coral' ? 'bg-coral-100' : 'bg-teal-100'
                  }`}>
                    {loop.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-teal-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{loop.title}</h3>
                    <div className={`text-xs font-mono mt-1 font-bold ${loop.visual === 'coral' ? 'text-coral-500' : 'text-teal-600'}`}>
                      {loop.metric} <span className="text-sand-500 font-normal">{loop.metricLabel}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sand-700 text-sm leading-relaxed mb-6">{loop.desc}</p>

                {/* Visual flow */}
                <div className="flex items-center gap-2 text-xs">
                  {loop.visual === 'coral' ? (
                    <>
                      <div className="flex-1 bg-coral-50 border border-coral-200 rounded-xl p-3 text-center">
                        <div className="font-bold text-coral-700">Customer Books</div>
                      </div>
                      <span className="text-teal-400">→</span>
                      <div className="flex-1 bg-coral-50 border border-coral-200 rounded-xl p-3 text-center">
                        <div className="font-bold text-coral-700">Shares on FB</div>
                      </div>
                      <span className="text-teal-400">→</span>
                      <div className="flex-1 bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
                        <div className="font-bold text-teal-700">5% Discount</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
                        <div className="font-bold text-teal-700">QR Poster Up</div>
                      </div>
                      <span className="text-teal-400">→</span>
                      <div className="flex-1 bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
                        <div className="font-bold text-teal-700">Walk-in Scans</div>
                      </div>
                      <span className="text-teal-400">→</span>
                      <div className="flex-1 bg-coral-50 border border-coral-200 rounded-xl p-3 text-center">
                        <div className="font-bold text-coral-700">Online Booking</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA: Feature integration question */}
        <section className="px-6 pb-24 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-3xl font-bold text-teal-900 mb-3" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              How would you like to build the social auto-sharing features?
            </h2>
            <p className="text-sand-600 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
              Choose your integration approach — we can embed sharing flows directly into the React/Vite frontend for instant UX, or route campaigns through backend API webhooks for richer automation and analytics.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setShareChoice('frontend')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  shareChoice === 'frontend'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-sand-200 hover:border-teal-300 hover:bg-teal-50/50'
                }`}
              >
                <div className="text-2xl mb-3">⚛️</div>
                <div className="font-bold text-teal-900 mb-1">React/Vite Frontend</div>
                <div className="text-xs text-sand-600 leading-relaxed">
                  Share buttons, preview cards, and QR generator embedded directly in the booking confirmation flow. Fastest to ship, visible to users immediately.
                </div>
                {shareChoice === 'frontend' && (
                  <div className="mt-3 text-xs font-semibold text-teal-600 font-mono">✓ Selected</div>
                )}
              </button>

              <button
                onClick={() => setShareChoice('backend')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  shareChoice === 'backend'
                    ? 'border-coral-500 bg-coral-50'
                    : 'border-sand-200 hover:border-coral-300 hover:bg-coral-50/50'
                }`}
              >
                <div className="text-2xl mb-3">🔗</div>
                <div className="font-bold text-teal-900 mb-1">Backend API Webhooks</div>
                <div className="text-xs text-sand-600 leading-relaxed">
                  Campaigns triggered via webhook on booking events. Full automation — Meta Ads API, Google My Business, WhatsApp Business API. Richer attribution.
                </div>
                {shareChoice === 'backend' && (
                  <div className="mt-3 text-xs font-semibold text-coral-600 font-mono">✓ Selected</div>
                )}
              </button>
            </div>

            {shareChoice && (
              <button className={`px-8 py-3.5 rounded-2xl font-bold text-white transition-all hover:scale-105 shadow-lg ${
                shareChoice === 'frontend' ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/30' : 'bg-coral-500 hover:bg-coral-400 shadow-coral-500/30'
              }`}>
                Build {shareChoice === 'frontend' ? 'Frontend Integration' : 'Backend Webhooks'} →
              </button>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-teal-400 text-xs font-mono">
          <div>eBooking Fiji · Platform Marketing Architecture</div>
          <div className="flex gap-6">
            <span>Standard 8% commission</span>
            <span>·</span>
            <span>Growth $49 FJD/mo</span>
            <span>·</span>
            <span>Enterprise $149 FJD/mo</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
