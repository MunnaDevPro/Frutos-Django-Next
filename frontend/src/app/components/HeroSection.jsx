import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"

export default function HeroSection({ hero }) {
  const primaryHref = hero?.primary_cta_href || "/shop"
  const secondaryHref = hero?.secondary_cta_href || "/stores"

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#F2EFE2" }}
    >
      {/* ── Full-Width Seamless Reference Hero Artwork (Top=0, Right=0, Uncropped) ── */}
      <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none select-none">
        <Image
          src="/homepage/hero_full.jpg?v=3"
          alt="Fresh produce basket from local farms"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-right-top"
        />
      </div>

      {/* ── Content Container (Aligned with Category Bar & All Sections Below) ── */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between min-h-[320px] md:min-h-[340px] lg:min-h-[375px] xl:min-h-[395px] pt-6 pb-8 md:pt-7 md:pb-11">

          {/* ── Left Text Column ── */}
          <div className="w-full md:w-[46%] lg:w-[44%] shrink-0 text-left">
            {/* Eyebrow + horizontal line */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="uppercase font-semibold tracking-[0.16em] shrink-0"
                style={{ fontSize: "11.5px", color: "#445747" }}
              >
                PREMIUM &bull; FRESH &bull; LOCAL
              </span>
              <span
                className="h-[1px] w-24 sm:w-36 lg:w-44"
                style={{ backgroundColor: "#B8B59E" }}
              />
            </div>

            {/* Main Serif Italic Heading */}
            <h1
              className="mb-3.5"
              style={{
                fontFamily: 'var(--font-newsreader), "Playfair Display", Georgia, serif',
                fontSize: "clamp(2.35rem, 4.1vw, 3.5rem)",
                fontWeight: 700,
                fontStyle: "italic",
                lineHeight: 1.06,
                color: "#16351D",
                letterSpacing: "-0.01em",
              }}
            >
              Fresh Produce,
              <br />
              Healthier You
            </h1>

            {/* Subtitle */}
            <p
              className="mb-6"
              style={{
                color: "#2F3B30",
                fontSize: "clamp(13.5px, 1.15vw, 15px)",
                lineHeight: 1.52,
                maxWidth: "390px",
                fontWeight: 450,
              }}
            >
              From local farms to your table — experience the freshness of nature, delivered with care.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-full text-white font-semibold transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
                style={{
                  backgroundColor: "#17361E",
                  fontSize: "13.5px",
                  padding: "10.5px 22px",
                  boxShadow: "0 4px 12px rgba(23, 54, 30, 0.22)",
                }}
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-200 hover:bg-[#E6E2D1] active:scale-[0.98]"
                style={{
                  backgroundColor: "rgba(242, 239, 226, 0.75)",
                  border: "1px solid #636B5E",
                  color: "#1B2E1E",
                  fontSize: "13.5px",
                  padding: "9.5px 22px",
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-[#243E28]" />
                <span>Find a Store</span>
              </Link>
            </div>
          </div>

          {/* ── Mobile Hero Image (Shown only on <768px) ── */}
          <div className="relative md:hidden w-full h-[220px] sm:h-[260px] mt-5 rounded-xl overflow-hidden select-none pointer-events-none">
            <Image
              src="/homepage/hero_full.jpg?v=3"
              alt="Fresh produce basket from local farms"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-right"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
