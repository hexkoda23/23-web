import { NavLink } from 'react-router-dom'

// Minimal top navigation for the lookbook
function Header() {
  return (
    <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="text-xl tracking-[0.35em] uppercase text-neutral-100">
          23
        </div>
        <nav className="flex items-center gap-8 text-sm uppercase tracking-[0.25em] text-neutral-400">
          <NavLink
            to="/lookbook"
            className={({ isActive }) =>
              [
                'transition-colors hover:text-neutral-100',
                isActive ? 'text-neutral-100' : '',
              ].join(' ')
            }
          >
            Lookbook
          </NavLink>
          <a
            href="https://23-1111111150.myshopify.com/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-neutral-100"
          >
            Shop
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header


