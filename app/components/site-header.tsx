'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SiteHeader() {
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  useEffect(() => {
    const supabase = createClient()

    async function loadAuthState() {
      setCheckingAuth(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setLoggedIn(false)
        setIsAdmin(false)
        setCheckingAuth(false)
        return
      }

      setLoggedIn(true)

      const { data: adminStatus, error } =
        await supabase.rpc('is_admin')

      if (error) {
        console.error(
          'Unable to check admin status:',
          error
        )

        setIsAdmin(false)
      } else {
        setIsAdmin(adminStatus === true)
      }

      setCheckingAuth(false)
    }

    loadAuthState()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          'Auth state changed:',
          event
        )

        if (!session?.user) {
          setLoggedIn(false)
          setIsAdmin(false)
          setCheckingAuth(false)
          return
        }

        setLoggedIn(true)

        const { data: adminStatus, error } =
          await supabase.rpc('is_admin')

        if (error) {
          console.error(
            'Unable to check admin status:',
            error
          )

          setIsAdmin(false)
        } else {
          setIsAdmin(adminStatus === true)
        }

        setCheckingAuth(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    if (loggingOut) {
      return
    }

    setLoggingOut(true)
    closeMenu()

    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error(
        'Logout error:',
        error
      )

      setLoggingOut(false)
      return
    }

    setLoggedIn(false)
    setIsAdmin(false)

    router.push('/')
    router.refresh()
  }

  return (
    <header className="site-header">
      <div className="container nav">

        {/* BRAND */}

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

        {/* MOBILE MENU */}

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

        {/* NAVIGATION */}

        <nav
          className={
            menuOpen
              ? 'open'
              : ''
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

          {/* AUTHENTICATION */}

          {checkingAuth ? (
            <span
              className="nav-login"
              style={{
                opacity: 0.6,
              }}
            >
              ...
            </span>
          ) : !loggedIn ? (
            <>
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
            </>
          ) : (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="nav-login"
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              )}

              <button
                type="button"
                className="nav-cta"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut
                  ? 'Logging out...'
                  : 'Logout'}
              </button>
            </>
          )}

        </nav>

      </div>
    </header>
  )
}