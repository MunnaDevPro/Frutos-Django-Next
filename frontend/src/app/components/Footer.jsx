import Link from 'next/link'
import Image from 'next/image'

// ── Robust Inline SVG Icons ──────────
const FacebookIcon = (props) => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
)

const InstagramIcon = (props) => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
)

const TwitterIcon = (props) => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.7 5.5 4.4 9 4.5C11.6 4.6 17.7 2.8 22 4z"/>
    </svg>
)

const GlobeIcon = (props) => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
)

const MailIcon = (props) => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
    </svg>
)

const PhoneIcon = (props) => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.15 6.15l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
)

const MapPinIcon = (props) => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
)

const SendIcon = (props) => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
)

const LeafIcon = (props) => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 1 9.8a7 7 0 0 1-9 8.2z"/>
        <path d="M9 22v-4h4"/>
    </svg>
)

export default function Footer({ config }) {
    if (!config) return null

    const {
        brand_name       = 'El Árbol',
        brand_tagline    = 'Artisan produce, delivered with care.',
        footer_logo_url  = '',
        contact_email    = 'hello@elarbol.com',
        contact_phone    = '+880 1712-345678',
        contact_address  = 'House 12, Road 5, Dhanmondi, Dhaka, Bangladesh',
        nav_links        = [],
        store_locations  = [],
        social_links     = [],
        payment_methods  = [],
    } = config

    // Fallbacks if data are empty
    const activeContactEmail = contact_email || 'hello@elarbol.com';
    const activeContactPhone = contact_phone || '+880 1712-345678';
    const activeContactAddress = contact_address || 'House 12, Road 5, Dhanmondi, Dhaka, Bangladesh';

    const activePaymentMethods = payment_methods && payment_methods.length > 0 ? payment_methods : [
        { title: 'Visa' },
        { title: 'Mastercard' },
        { title: 'Amex' }
    ];

    const activeNavLinks = nav_links && nav_links.length > 0 ? nav_links : [
        { label: 'Shop All', href: '/shop' },
        { label: 'Our Stores', href: '/stores' },
        { label: 'About Us', href: '/about' },
        { label: 'Wholesale', href: '/wholesale' }
    ];

    const activeStoreLocations = store_locations && store_locations.length > 0 ? store_locations : [
        { name: 'FreshDrop (Dhanmondi)', slug: 'dhaka-dhanmondi' }
    ];

    const activeSocialLinks = social_links && social_links.length > 0 ? social_links : [
        { title: 'Facebook', url: 'https://facebook.com', icon_name: 'facebook' },
        { title: 'Instagram', url: 'https://instagram.com', icon_name: 'instagram' },
        { title: 'Twitter', url: 'https://twitter.com', icon_name: 'twitter' }
    ];

    const currentYear = new Date().getFullYear()
    const copyrightText = `© ${currentYear} ${brand_name}. All rights reserved.`

    // Map string social names to custom SVG icons
    const renderSocialIcon = (name) => {
        const iconProps = { className: "w-4 h-4 transition-transform duration-300 group-hover:scale-110" };
        switch (name?.toLowerCase()) {
            case 'facebook':
                return <FacebookIcon {...iconProps} />;
            case 'instagram':
                return <InstagramIcon {...iconProps} />;
            case 'twitter':
                return <TwitterIcon {...iconProps} />;
            case 'globe':
                return <GlobeIcon {...iconProps} />;
            default:
                return <GlobeIcon {...iconProps} />;
        }
    }

    return (
        <footer className="relative bg-gradient-to-b from-[#085041] via-[#053c31] to-[#03201a] text-white rounded-t-[2rem] md:rounded-t-[3.5rem] overflow-hidden shadow-2xl border-t border-white/10 mt-12">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

            <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-white/10">
                    
                    {/* Brand Info & Newsletter */}
                    <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                                {footer_logo_url ? (
                                    <Image
                                        src={footer_logo_url}
                                        alt={`${brand_name} logo`}
                                        width={40}
                                        height={40}
                                        className="object-contain filter brightness-0 invert transition-transform duration-500 group-hover:rotate-12"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
                                        <LeafIcon className="w-5 h-5 text-emerald-300" />
                                    </div>
                                )}
                                <span className="font-serif text-2xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-emerald-300">
                                    {brand_name}
                                </span>
                            </Link>
                            <p className="text-sm text-gray-300/80 leading-relaxed max-w-sm">
                                {brand_tagline}
                            </p>
                        </div>

                        {/* Beautiful Newsletter Input */}
                        <div className="max-w-sm">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-3">
                                Stay Updated
                            </h4>
                            <div className="relative flex items-center">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                                />
                                <button className="absolute right-1.5 p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer" aria-label="Subscribe">
                                    <SendIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Social Links */}
                        {activeSocialLinks.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-3">
                                    Follow Us
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {activeSocialLinks.map((s, i) => (
                                        <a                          
                                            key={i}
                                            href={s.url}
                                            title={s.title}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white text-gray-300 transition-all duration-300 hover:-translate-y-1 shadow-lg cursor-pointer"
                                        >
                                            {renderSocialIcon(s.icon_name)}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400/90 mb-5 pb-2 border-b border-white/5">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {activeNavLinks.map((link) => (
                                <li key={link.label}>
                                    <Link 
                                        href={link.href} 
                                        className="inline-flex items-center text-sm text-gray-300 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Store Locations */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400/90 mb-5 pb-2 border-b border-white/5">
                            Our Stores
                        </h4>
                        <ul className="space-y-3">
                            {activeStoreLocations.map((store, i) => (
                                <li key={store.slug || i}>
                                    <Link 
                                        href={`/stores/${store.slug || ''}`} 
                                        className="inline-flex items-center text-sm text-gray-300 transition-colors duration-200"
                                    >
                                        {store.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Details & Payments */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400/90 mb-5 pb-2 border-b border-white/5">
                                Contact Us
                            </h4>
                            <ul className="space-y-4">
                                {activeContactEmail && (
                                    <li className="flex items-start gap-3">
                                        <MailIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
                                        <a href={`mailto:${activeContactEmail}`} className="text-sm text-gray-300 transition-colors duration-200 break-all">
                                            {activeContactEmail}
                                        </a>
                                    </li>
                                )}
                                {activeContactPhone && (
                                    <li className="flex items-start gap-3">
                                        <PhoneIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
                                        <a href={`tel:${activeContactPhone}`} className="text-sm text-gray-300 transition-colors duration-200">
                                            {activeContactPhone}
                                        </a>
                                    </li>
                                )}
                                {activeContactAddress && (
                                    <li className="flex items-start gap-3">
                                        <MapPinIcon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-300 leading-relaxed">
                                            {activeContactAddress}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Payment Options */}
                        {activePaymentMethods.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-3">
                                    We Accept
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {activePaymentMethods.map((pm, i) => (
                                        <div
                                            key={i}
                                            title={pm.title}
                                            className="flex items-center justify-center bg-white/5 border border-white/10 rounded-lg p-1 min-w-[52px] h-[32px] hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                        >
                                            {pm.image_url ? (
                                                <Image
                                                    src={pm.image_url}
                                                    alt={pm.title}
                                                    width={44}
                                                    height={20}
                                                    className="object-contain max-h-[18px]"
                                                />
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-tight">
                                                    {pm.title}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                    <p className="order-2 md:order-1 text-center md:text-left">
                        {copyrightText}
                    </p>

                    <p className="order-1 md:order-2 text-center">
                        Developed by{' '}
                        <a 
                            href="https://www.intelligentsystemsltd.com/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white hover:text-emerald-300 font-medium transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-emerald-300"
                        >
                            Intelligent Systems and Solutions Limited
                        </a>
                    </p>

                    <div className="order-3 flex gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookies Settings'].map((item) => (
                            <a 
                                key={item} 
                                href="#" 
                                className="hover:text-white transition-colors duration-200"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}