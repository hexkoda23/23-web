import { useEffect } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import Footer from '../components/Footer.jsx'
import ImageCard from '../components/ImageCard.jsx'

// Curated studio lookbook items
const LOOKBOOK_ITEMS = [
  { id: 1, imageUrl: '/lookbook/1.jpg', href: 'https://catlog.shop/products/23-x-itl-1766706523775-x6p' },
  { id: 2, imageUrl: '/lookbook/2.jpg', href: 'https://catlog.shop/products/23-x-sober-1766706198646-yl1' },
  { id: 3, imageUrl: '/lookbook/3.jpg', href: 'https://catlog.shop/products/23-x-itl-1766706523775-x6p' },
  { id: 4, imageUrl: '/lookbook/4.jpg', href: 'https://catlog.shop/products/23-x-italawa-1766705289691-3ej' },
  { id: 5, imageUrl: '/lookbook/5.jpg', href: 'https://catlog.shop/products/23-x-italawa-1766705289691-3ej' },
  { id: 6, imageUrl: '/lookbook/6.jpg', href: 'https://catlog.shop/products/23-x-italawa-1766705289691-3ej' },
  { id: 7, imageUrl: '/lookbook/7.jpg', href: 'https://catlog.shop/products/23-x-ashante-1766706425607-swh' },
  { id: 8, imageUrl: '/lookbook/8.jpg', href: 'https://catlog.shop/products/23-x-itl-1766706523775-x6p' },
  { id: 9, imageUrl: '/lookbook/9.jpg', href: 'https://catlog.shop/products/23-x-itl-1766706523775-x6p' },
  { id: 10, imageUrl: '/lookbook/10.jpg', href: 'https://catlog.shop/products/23-x-italawa-1766705289691-3ej' },
  { id: 11, imageUrl: '/lookbook/11.jpg', href: 'https://catlog.shop/products/23-x-sober-1766706198646-yl1' },
  { id: 12, imageUrl: '/lookbook/12.jpg', href: 'https://catlog.shop/products/23-x-itl-1766706523775-x6p' },
  { id: 13, imageUrl: '/lookbook/13.jpg', href: 'https://catlog.shop/products/23-x-ashante-1766706425607-swh' },
  { id: 14, imageUrl: '/lookbook/14.jpg', href: 'https://catlog.shop/products/23-x-ashante-1766706425607-swh' },
  { id: 15, imageUrl: '/lookbook/15.jpg', href: 'https://catlog.shop/products/23-x-sober-1766706198646-yl1' },
  { id: 16, imageUrl: '/lookbook/16.jpg', href: 'https://catlog.shop/products/23-x-sober-1766706198646-yl1' },
  { id: 17, imageUrl: '/lookbook/17.jpg', href: 'https://catlog.shop/products/23-x-italawa-1766705289691-3ej' },
  { id: 18, imageUrl: '/lookbook/18.jpg', href: 'https://catlog.shop/products/23-x-itl-1766706523775-x6p' },
  { id: 19, imageUrl: '/lookbook/19.jpg', href: 'https://catlog.shop/products/23-x-itl-1766706523775-x6p' },
  { id: 20, imageUrl: '/lookbook/20.jpg', href: 'https://catlog.shop/products/23-x-sober-1766706198646-yl1' },
]

function Lookbook() {
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-neutral-100">
        <main>
          {/* Intro */}
          <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">
              Lookbook 23 — Studio Series
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl font-medium leading-tight text-neutral-50">
              A controlled space. Clean light.
              <span className="block">Every detail intentional.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm text-neutral-300 leading-relaxed">
              This first chapter of 23 is shot entirely in-studio. No distractions,
              no noise — just form, texture, and presence. These pieces aren’t styled
              to shout. They’re designed to stay with you.
            </p>
          </section>

          {/* Grid */}
          <section className="mx-auto max-w-6xl px-6 pb-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {LOOKBOOK_ITEMS.map((item, index) => (
                <div
                  key={item.id}
                  className={
                    index === 0
                      ? 'sm:col-span-2 lg:col-span-3'
                      : index === 4
                      ? 'sm:col-span-2'
                      : ''
                  }
                >
                  <ImageCard
                    imageUrl={item.imageUrl}
                    href={item.href}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Editorial Footer */}
          <section className="mx-auto max-w-6xl px-6 pb-32">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-xl font-medium text-neutral-50">
                This is only the beginning.
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Future chapters of 23 will move beyond the studio — into streets,
                after-hours spaces, and lived-in moments. For now, this collection
                exists as a foundation. Pure silhouettes. Quiet confidence.
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Each piece carries a unique barcode, unlocking a single creative
                story. What you wear is no longer just what people see — it’s what
                they can access.

                NOTE :

                ITAMERIN TO LONDON BY W3STIX AND INFAMOUS IS A SONG ABOUT MOVEMENT, ELEVATION, AND THE HUNGER TO RISE. IT TELLS A HUSTLER'S JOURNEY FROM HUMBLE BEGINNINGS TO BIGGER STAGES, MIXING STREET ROOTS WITH DREAMS OF INTERNATIONAL SUCCESS. LONDON ISN'T JUST A PLACE, IT REPRESENTS LEVELING UP.
                THE SONG BLENDS:
                REAL STRUGGLE → CONFIDENCE
                STREET ENERGY → SOFT LIFE AMBITION
                GROWTH MENTALLY, FINANCIALLY, AND GLOBALLY
                OVERALL, IT'S A SOUNDTRACK FOR ANYONE MOVING FROM WHERE THEY STARTED TO WHERE THEY'RE DESTINED TO BE.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}

export default Lookbook
