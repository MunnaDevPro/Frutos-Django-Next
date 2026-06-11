import Image from "next/image"
import Link from "next/link"

export default function HeroSection({ hero }) {
  return (
    <section className="bg-[#FAFAF8]">

      {/* ── MOBILE Hero ──────────────────────────────────────────────────── */}
      <div className="md:hidden relative overflow-hidden" style={{ height: '420px' }}>
        <Image
          src={hero.mobile_image_url}
          alt="Fresh produce"
          className="absolute inset-0 w-full h-full object-cover"
          width={800}
          height={600}
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)' }}
        />
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-8">
          <h1
            className="text-white mb-5"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '2rem', fontWeight: 700, lineHeight: 1.15,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            {hero.mobile_heading}
          </h1>
          <div className="flex flex-col gap-3">
            <Link
              href={hero.primary_cta_href}
              className="block text-center text-white font-semibold rounded-lg"
              style={{
                background: '#00694C', fontSize: '13.5px',
                letterSpacing: '0.06em', padding: '13px 0',
                boxShadow: '0 4px 18px rgba(0,105,76,0.4)',
              }}
            >
              {hero.primary_cta_text.toUpperCase()}
            </Link>
            <Link
              href={hero.secondary_cta_href}
              className="block text-center text-white font-semibold rounded-lg"
              style={{
                border: '1.5px solid rgba(255,255,255,0.55)', fontSize: '13.5px',
                letterSpacing: '0.06em', padding: '12px 0',
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              {hero.secondary_cta_text.toUpperCase()}
            </Link>
          </div>
        </div>
      </div>

      {/* ── DESKTOP & TABLET Hero ────────────────────────────────────────── */}
      <div className="hidden md:block max-w-[1280px] mx-auto px-6 lg:px-10 pb-10 md:pb-14 lg:pb-15 pt-6 md:pt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-10">
          <div className="w-full md:max-w-[50%] lg:max-w-[600px] flex-shrink-0 text-center md:text-left">
            <h1
              className="text-[#151E13] mb-4 md:mb-5"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 650,
                lineHeight: 1.1, textShadow: '0px 4px 4px rgba(0, 0, 0, 0.15)',
              }}
            >
              {hero.desktop_heading}
            </h1>
            <p
              className="text-[#3D4943] mb-7 md:mb-9 mx-auto md:mx-0"
              style={{ fontSize: 'clamp(14px, 1.5vw, 15.5px)', lineHeight: 1.52, maxWidth: '430px' }}
            >
              {hero.desktop_subtext}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <Link
                href={hero.primary_cta_href}
                className="inline-flex items-center justify-center bg-[#00694C] text-white font-semibold rounded-[8px] hover:bg-[#085041] transition-all duration-200 hover:-translate-y-0.5"
                style={{ fontSize: '14px', padding: '12px 24px', boxShadow: '0 4px 18px rgba(0,105,76,0.28)' }}
              >
                {hero.primary_cta_text}
              </Link>
              <Link
                href={hero.secondary_cta_href}
                className="inline-flex items-center justify-center font-semibold rounded-[8px] hover:text-[var(--logo-color)] transition-all duration-200"
                style={{
                  fontSize: '14px', padding: '11px 24px',
                  borderColor: '#ECF7E4', borderWidth: '3px', borderStyle: 'solid',
                  color: 'var(--common-color)', boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.05)',
                }}
              >
                {hero.secondary_cta_text}
              </Link>
            </div>
          </div>
          <div className="w-full md:flex-1 mt-8 md:mt-0 flex justify-center">
            <img
              src={hero.desktop_image_url}
              alt="Fresh produce"
              className="w-full h-auto object-contain max-h-[350px] md:max-h-[420px] lg:max-h-[480px]"
            />
          </div>
        </div>
      </div>

      {/* ── Feature Cards ───────────────────────────────────────────────────
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pb-8 md:pb-10 pt-4 md:pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {featureCards.map(({ id, title, sub, icon }) => (
            <div
              key={id}
              className="bg-white rounded-xl border border-[#BCCAC1]/30 flex items-center gap-3"
              style={{ padding: '14px 16px', boxShadow: '0 1px 4px rgba(21,30,19,0.05)' }}
            >
              <span className="shrink-0">{icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#151E13', lineHeight: 1.3 }}>{title}</p>
                <p style={{ fontSize: '11px', color: '#6D7A73', lineHeight: 1.4, marginTop: '2px' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

    </section>
  )
}