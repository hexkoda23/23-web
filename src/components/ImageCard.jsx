import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ImageCard({ imageUrl, href }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Image card */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-2xl focus:outline-none"
      >
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </button>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <img
                src={imageUrl}
                alt=""
                className="max-h-[90vh] w-full object-contain"
              />

              {/* Overlay CTA */}
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-neutral-200 px-10 py-3 text-xs uppercase tracking-[0.35em] text-neutral-100 backdrop-blur-md transition hover:bg-neutral-100 hover:text-black"
                >
                  Shop Now
                </a>
              </div>

              {/* Close hint */}
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 text-xs uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-100"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ImageCard
