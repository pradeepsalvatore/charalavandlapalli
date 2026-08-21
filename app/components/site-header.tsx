'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="container nav">

        <Link
          href="/"
          className="brand"
          onClick={closeMenu}
        >
          <span className="brand-mark">
            C
          </span>

          <span>
            <strong>
              Charalavandlapalli
            </strong>

            <small>
              Village Community
            </small>
          </span>
        </Link>

        <button
          type="button"
          className="menu-btn"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav
          className={
            menuOpen ? 'open' : ''
          }
        >

          <Link
            href="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            href="/#about"
            onClick={closeMenu}
          >
            About
          </Link>

          <Link
            href="/events"
            onClick={closeMenu}
          >
            Events
          </Link>

          {/* PANCHANGAM */}

          <Link
            href="/panchangam"
            onClick={closeMenu}
            className="nav-panchangam"
          >
            <span>
              🪔
            </span>
            Panchangam
          </Link>

          <Link
            href="/#gallery"
            onClick={closeMenu}
          >
            Gallery
          </Link>

          <Link
            href="/#updates"
            onClick={closeMenu}
          >
            Updates
          </Link>

          <Link
            href="/#community"
            onClick={closeMenu}
          >
            Community
          </Link>

          <Link
            href="/login"
            className="nav-login"
            onClick={closeMenu}
          >
            Login
          </Link>

          <Link
            href="/register"
            className="nav-cta"
            onClick={closeMenu}
          >
            Join Community
          </Link>

        </nav>

      </div>
    </header>
  )
}