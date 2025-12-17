import { useEffect } from 'react'
import PageTransition from '../components/PageTransition.jsx'
import Footer from '../components/Footer.jsx'
import ImageCard from '../components/ImageCard.jsx'

// Manually curated lookbook items
const LOOKBOOK_ITEMS = [
  {
    id: 1,
    imageUrl: '/lookbook/1.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 2,
    imageUrl: '/lookbook/2.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 3,
    imageUrl: '/lookbook/3.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 4,
    imageUrl: '/lookbook/4.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 5,
    imageUrl: '/lookbook/5.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 6,
    imageUrl: '/lookbook/6.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 7,
    imageUrl: '/lookbook/7.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 8,
    imageUrl: '/lookbook/8.jpg',
    href: 'https://www.shopify.com',
  },
  {
    id: 9,
    imageUrl: '/lookbook/9.jpg',
    href: 'https://www.shopify.com',
  },
]

function Lookbook() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col bg-black text-neutral-100">
        <main className="flex-1">
          <section className="mx-auto max-w-6xl px-6 pb-16 pt-10">
            {/* Intro strip */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                  Lookbook 23
                </p>
                <h2 className="mt-2 text-lg font-medium text-neutral-50">
                  Fragments from the late shift.
                </h2>
              </div>
              <p className="max-w-xs text-[0.7rem] leading-relaxed text-neutral-500">
                Shot somewhere between night buses and after-parties. Less
                product, more feeling.
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
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}

export default Lookbook
