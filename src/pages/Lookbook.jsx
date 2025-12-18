import { useEffect } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import Footer from '../components/Footer.jsx'
import ImageCard from '../components/ImageCard.jsx'

// Manually curated lookbook items
const LOOKBOOK_ITEMS = [
  { id: 1, imageUrl: '/lookbook/1.jpg', href: 'https://www.shopify.com' },
  { id: 2, imageUrl: '/lookbook/2.jpg', href: 'https://www.shopify.com' },
  { id: 3, imageUrl: '/lookbook/3.jpg', href: 'https://www.shopify.com' },
  { id: 4, imageUrl: '/lookbook/4.jpg', href: 'https://www.shopify.com' },
  { id: 5, imageUrl: '/lookbook/5.jpg', href: 'https://www.shopify.com' },
  { id: 6, imageUrl: '/lookbook/6.jpg', href: 'https://www.shopify.com' },
  { id: 7, imageUrl: '/lookbook/7.jpg', href: 'https://www.shopify.com' },
  { id: 8, imageUrl: '/lookbook/8.jpg', href: 'https://www.shopify.com' },
  { id: 9, imageUrl: '/lookbook/9.jpg', href: 'https://www.shopify.com' },
]

function Lookbook() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col bg-black text-neutral-100">
        <main className="flex-1">
          <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
            {/* Intro */}
            <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                  Lookbook 23 — Studio Preview
                </p>
                <h2 className="mt-4 text-xl font-medium text-neutral-50">
                  A controlled beginning.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                  This first chapter is quiet by design. Shot in studio, under
                  deliberate light, the pieces are presented without context,
                  without distraction. Form, fabric, and intention come first.
                  The noise will come later.
                </p>
              </div>

              <p className="max-w-xs text-[0.75rem] leading-relaxed text-neutral-500">
                These images are not the final world of 23 — they are the
                foundation. Clean frames, honest silhouettes, and garments
                shown as objects before they become stories.
              </p>
            </div>

            {/* Editorial grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {LOOKBOOK_ITEMS.map((item, index) => (
                <div
                  key={item.id}
                  className={
                    index % 5 === 0
                      ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2'
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

            {/* Extended editorial footer section */}
            <div className="mx-auto mt-32 max-w-3xl text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                About this release
              </p>

              <h3 className="mt-6 text-lg font-medium text-neutral-50">
                Before the streets, before the noise.
              </h3>

              <p className="mt-6 text-sm leading-relaxed text-neutral-400">
                Every piece shown here is part of a larger system. Each garment
                carries a unique barcode — a key that unlocks a single creative
                world. Music, visuals, writing, film. One shirt, one craft.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                This studio shoot exists to document the garments in their
                purest state. No narrative imposed. No environment influencing
                interpretation. What you see here is the canvas — not the
                artwork that will eventually live inside it.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                Future lookbooks will move outward: into rooms, into movement,
                into people. For now, this is the pause before impact.
              </p>

              <p className="mt-10 text-xs uppercase tracking-[0.3em] text-neutral-500">
                23 is not worn to be seen. It is worn to be accessed.
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
