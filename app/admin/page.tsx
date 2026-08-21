'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type DashboardStats = {
  totalMembers: number
  pendingMembers: number
  approvedMembers: number
  totalEvents: number
  totalFestivals: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    pendingMembers: 0,
    approvedMembers: 0,
    totalEvents: 0,
    totalFestivals: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authorized, setAuthorized] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')

      // Check logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError(
          'You must be logged in to access the administrator area.'
        )

        setLoading(false)
        return
      }

      // Check administrator
      const { data: isAdmin, error: adminError } =
        await supabase.rpc('is_admin')

      if (adminError) {
        console.error(
          'Admin check failed:',
          adminError
        )

        setError(
          `Unable to verify administrator access: ${adminError.message}`
        )

        setLoading(false)
        return
      }

      if (!isAdmin) {
        setError(
          'Access denied. You are not authorized to access the administrator area.'
        )

        setLoading(false)
        return
      }

      setAuthorized(true)

      // Members
      const { count: totalMembers, error: membersError } =
        await supabase
          .from('members')
          .select('*', {
            count: 'exact',
            head: true,
          })

      if (membersError) {
        console.error(
          'Members count error:',
          membersError
        )
      }

      // Pending members
      const { count: pendingMembers, error: pendingError } =
        await supabase
          .from('members')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'pending')

      if (pendingError) {
        console.error(
          'Pending members count error:',
          pendingError
        )
      }

      // Approved members
      const { count: approvedMembers, error: approvedError } =
        await supabase
          .from('members')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'approved')

      if (approvedError) {
        console.error(
          'Approved members count error:',
          approvedError
        )
      }

      // Events
      const { count: totalEvents, error: eventsError } =
        await supabase
          .from('events')
          .select('*', {
            count: 'exact',
            head: true,
          })

      if (eventsError) {
        console.error(
          'Events count error:',
          eventsError
        )
      }

      // Festivals
      const { count: totalFestivals, error: festivalsError } =
        await supabase
          .from('festivals')
          .select('*', {
            count: 'exact',
            head: true,
          })

      if (festivalsError) {
        console.error(
          'Festivals count error:',
          festivalsError
        )
      }

      setStats({
        totalMembers: totalMembers ?? 0,
        pendingMembers: pendingMembers ?? 0,
        approvedMembers: approvedMembers ?? 0,
        totalEvents: totalEvents ?? 0,
        totalFestivals: totalFestivals ?? 0,
      })

      setLoading(false)
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <main className="admin-page">

        <section className="admin-hero">
          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI ADMIN
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Loading administrator dashboard...
            </p>

          </div>
        </section>

        <section className="section">
          <div className="container">

            <div className="admin-message">
              Loading dashboard...
            </div>

          </div>
        </section>

      </main>
    )
  }

  if (!authorized) {
    return (
      <main className="admin-page">

        <section className="admin-hero">
          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI ADMIN
            </span>

            <h1>
              Access denied
            </h1>

            <p>
              Administrator authorization is required.
            </p>

          </div>
        </section>

        <section className="section">
          <div className="container">

            <div className="admin-error">
              {error}
            </div>

            <div
              style={{
                marginTop: '20px',
              }}
            >
              <Link
                href="/login"
                className="btn primary"
              >
                Go to Login
              </Link>
            </div>

          </div>
        </section>

      </main>
    )
  }

  return (
    <main className="admin-page">

      {/* ADMIN HERO */}

      <section className="admin-hero">

        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI ADMIN
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage the Charalavandlapalli village
            community portal.
          </p>

        </div>

      </section>

      {/* DASHBOARD */}

      <section className="section">

        <div className="container">

          {/* ADMIN NAVIGATION */}

          <div className="admin-nav">

            <Link
              href="/admin"
              className="admin-nav-link active"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/members"
              className="admin-nav-link"
            >
              Members
            </Link>

            <Link
              href="/admin/events"
              className="admin-nav-link"
            >
              Events
            </Link>

            <Link
              href="/admin/gallery"
              className="admin-nav-link"
            >
              Gallery
            </Link>

            <Link
              href="/admin/settings"
              className="admin-nav-link"
            >
              Settings
            </Link>

            <Link
              href="/"
              className="admin-nav-link"
            >
              Website
            </Link>

          </div>

          {/* STATISTICS */}

          <div className="dashboard-stats">

            <Link
              href="/admin/members"
              className="dashboard-stat"
            >

              <span className="dashboard-stat-icon">
                👥
              </span>

              <span className="dashboard-stat-label">
                Total Members
              </span>

              <strong>
                {stats.totalMembers}
              </strong>

              <small>
                Manage members →
              </small>

            </Link>

            <Link
              href="/admin/members"
              className="dashboard-stat pending"
            >

              <span className="dashboard-stat-icon">
                ⏳
              </span>

              <span className="dashboard-stat-label">
                Pending Approval
              </span>

              <strong>
                {stats.pendingMembers}
              </strong>

              <small>
                Review registrations →
              </small>

            </Link>

            <Link
              href="/admin/members"
              className="dashboard-stat"
            >

              <span className="dashboard-stat-icon">
                ✓
              </span>

              <span className="dashboard-stat-label">
                Approved Members
              </span>

              <strong>
                {stats.approvedMembers}
              </strong>

              <small>
                View members →
              </small>

            </Link>

            <Link
              href="/admin/events"
              className="dashboard-stat"
            >

              <span className="dashboard-stat-icon">
                📅
              </span>

              <span className="dashboard-stat-label">
                Events
              </span>

              <strong>
                {stats.totalEvents}
              </strong>

              <small>
                View events →
              </small>

            </Link>

            <Link
              href="/events"
              className="dashboard-stat"
            >

              <span className="dashboard-stat-icon">
                🎉
              </span>

              <span className="dashboard-stat-label">
                Festivals
              </span>

              <strong>
                {stats.totalFestivals}
              </strong>

              <small>
                View calendar →
              </small>

            </Link>

          </div>

          {/* QUICK ACTIONS */}

          <div className="dashboard-heading">

            <span className="section-label">
              QUICK ACTIONS
            </span>

            <h2>
              Manage the community
            </h2>

            <p>
              Frequently used administration functions.
            </p>

          </div>

          <div className="quick-actions">

            {/* MEMBERS */}

            <Link
              href="/admin/members"
              className="quick-action"
            >

              <span className="quick-action-icon">
                👥
              </span>

              <div>

                <strong>
                  Manage Members
                </strong>

                <span>
                  Approve registrations and manage
                  member profiles.
                </span>

              </div>

              <b>→</b>

            </Link>

            {/* EVENTS */}

            <Link
              href="/admin/events"
              className="quick-action"
            >

              <span className="quick-action-icon">
                📅
              </span>

              <div>

                <strong>
                  Events & Calendar
                </strong>

                <span>
                  View village events and festivals.
                </span>

              </div>

              <b>→</b>

            </Link>

            {/* GALLERY */}

            <Link
              href="/admin/gallery"
              className="quick-action"
            >

              <span className="quick-action-icon">
                🖼️
              </span>

              <div>

                <strong>
                  Gallery
                </strong>

                <span>
                  Manage village photographs and
                  event albums.
                </span>

              </div>

              <b>→</b>

            </Link>

            {/* VILLAGE SETTINGS */}

            <Link
              href="/admin/settings"
              className="quick-action"
            >

              <span className="quick-action-icon">
                ⚙️
              </span>

              <div>

                <strong>
                  Village Settings
                </strong>

                <span>
                  Manage village address, map location
                  and contact information.
                </span>

              </div>

              <b>→</b>

            </Link>

            {/* VILLAGE UPDATES */}

            <div className="quick-action coming-soon">

              <span className="quick-action-icon">
                📰
              </span>

              <div>

                <strong>
                  Village Updates
                </strong>

                <span>
                  Publish announcements and daily
                  community updates.
                </span>

              </div>

              <em>
                Coming soon
              </em>

            </div>

            {/* COMMUNITY REQUESTS */}

            <div className="quick-action coming-soon">

              <span className="quick-action-icon">
                🤝
              </span>

              <div>

                <strong>
                  Community Requests
                </strong>

                <span>
                  Manage requests for help and
                  community support.
                </span>

              </div>

              <em>
                Coming soon
              </em>

            </div>

            {/* JOBS & OPPORTUNITIES */}

            <div className="quick-action coming-soon">

              <span className="quick-action-icon">
                💼
              </span>

              <div>

                <strong>
                  Jobs & Opportunities
                </strong>

                <span>
                  Publish recruitment and local
                  opportunities.
                </span>

              </div>

              <em>
                Coming soon
              </em>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}