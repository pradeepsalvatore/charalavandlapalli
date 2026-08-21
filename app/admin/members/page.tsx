'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Member = {
  id: string
  user_id: string | null
  auth_user_id: string | null
  full_name: string
  phone: string | null
  email: string | null
  date_of_birth: string | null
  gender: string | null
  occupation: string | null
  education: string | null
  skills: string | null
  village_area: string | null
  address: string | null
  profile_photo_url: string | null
  status: string
  is_public: boolean
  created_at: string
  approved_at: string | null
  approved_by: string | null
}

type Filter = 'pending' | 'approved' | 'rejected'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filter, setFilter] = useState<Filter>('pending')

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function checkAdminAndLoadMembers() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(
        'You must be logged in to access the admin area.'
      )
      setLoading(false)
      return
    }

    const { data: adminResult, error: adminError } =
      await supabase.rpc('is_admin')

    if (adminError) {
      console.error('Admin check failed:', adminError)

      setError(
        `Unable to verify administrator access: ${adminError.message}`
      )

      setLoading(false)
      return
    }

    if (!adminResult) {
      setError(
        'Access denied. You are not authorized to access the administrator area.'
      )

      setLoading(false)
      return
    }

    setIsAdmin(true)

    const { data, error: membersError } = await supabase
      .from('members')
      .select(`
        id,
        user_id,
        auth_user_id,
        full_name,
        phone,
        email,
        date_of_birth,
        gender,
        occupation,
        education,
        skills,
        village_area,
        address,
        profile_photo_url,
        status,
        is_public,
        created_at,
        approved_at,
        approved_by
      `)
      .order('created_at', {
        ascending: false,
      })

    if (membersError) {
      console.error(
        'Member loading error:',
        membersError
      )

      setError(membersError.message)
      setLoading(false)
      return
    }

    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    checkAdminAndLoadMembers()
  }, [])

  async function updateMemberStatus(
    member: Member,
    newStatus: 'approved' | 'rejected'
  ) {
    setActionLoading(member.id)
    setError('')
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(
        'Your session has expired. Please log in again.'
      )
      setActionLoading(null)
      return
    }

    const updateData = {
      status: newStatus,
      approved_at:
        newStatus === 'approved'
          ? new Date().toISOString()
          : null,
      approved_by:
        newStatus === 'approved'
          ? user.id
          : null,
    }

    const { error: updateError } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', member.id)

    if (updateError) {
      console.error(
        'Member status update failed:',
        updateError
      )

      setError(
        `Unable to update ${member.full_name}: ${updateError.message}`
      )

      setActionLoading(null)
      return
    }

    setMembers((currentMembers) =>
      currentMembers.map((currentMember) =>
        currentMember.id === member.id
          ? {
              ...currentMember,
              ...updateData,
            }
          : currentMember
      )
    )

    setMessage(
      `${member.full_name} has been ${newStatus}.`
    )

    setActionLoading(null)
  }

  const pendingCount = members.filter(
    (member) => member.status === 'pending'
  ).length

  const approvedCount = members.filter(
    (member) => member.status === 'approved'
  ).length

  const rejectedCount = members.filter(
    (member) => member.status === 'rejected'
  ).length

  const filteredMembers = members.filter(
    (member) => member.status === filter
  )

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  /* ================================
     LOADING
     ================================ */

  if (loading) {
    return (
      <main className="admin-page">

        <section className="admin-hero">
          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI ADMIN
            </span>

            <h1>
              Member Management
            </h1>

            <p>
              Loading administrator access...
            </p>

          </div>
        </section>

        <section className="section">

          <div className="container">

            <div className="admin-message">
              Loading members...
            </div>

          </div>

        </section>

      </main>
    )
  }

  /* ================================
     ACCESS DENIED
     ================================ */

  if (error && !isAdmin) {
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

            <div style={{ marginTop: '20px' }}>

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

  /* ================================
     ADMIN PAGE
     ================================ */

  return (
    <main className="admin-page">

      {/* ==============================
          HERO
          ============================== */}

      <section className="admin-hero">

        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI ADMIN
          </span>

          <h1>
            Member Management
          </h1>

          <p>
            Review and manage village community
            registrations.
          </p>

        </div>

      </section>

      {/* ==============================
          CONTENT
          ============================== */}

      <section className="section">

        <div className="container">

          {/* ADMIN NAVIGATION */}

          <div className="admin-nav">

            <Link
              href="/admin"
              className="admin-nav-link"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/members"
              className="admin-nav-link active"
            >
              Members
            </Link>

            <Link
              href="/events"
              className="admin-nav-link"
            >
              Events
            </Link>

            <Link
              href="/"
              className="admin-nav-link"
            >
              Website
            </Link>

          </div>

          {/* ERROR */}

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="admin-success">
              {message}
            </div>
          )}

          {/* ==============================
              MEMBER STATISTICS
              ============================== */}

          <div className="admin-stats">

            <button
              type="button"
              className={
                filter === 'pending'
                  ? 'admin-stat active'
                  : 'admin-stat'
              }
              onClick={() => {
                setFilter('pending')
                setMessage('')
              }}
            >

              <span>
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>

            </button>

            <button
              type="button"
              className={
                filter === 'approved'
                  ? 'admin-stat active'
                  : 'admin-stat'
              }
              onClick={() => {
                setFilter('approved')
                setMessage('')
              }}
            >

              <span>
                Approved
              </span>

              <strong>
                {approvedCount}
              </strong>

            </button>

            <button
              type="button"
              className={
                filter === 'rejected'
                  ? 'admin-stat active'
                  : 'admin-stat'
              }
              onClick={() => {
                setFilter('rejected')
                setMessage('')
              }}
            >

              <span>
                Rejected
              </span>

              <strong>
                {rejectedCount}
              </strong>

            </button>

          </div>

          {/* ==============================
              MEMBER SECTION HEADER
              ============================== */}

          <div className="admin-section-header">

            <div>

              <span className="section-label">
                MEMBERS
              </span>

              <h2>
                {filter === 'pending'
                  ? 'Pending registrations'
                  : filter === 'approved'
                    ? 'Approved members'
                    : 'Rejected registrations'}
              </h2>

            </div>

            <span className="member-count">

              {filteredMembers.length}{' '}

              member
              {filteredMembers.length !== 1
                ? 's'
                : ''}

            </span>

          </div>

          {/* ==============================
              EMPTY STATE
              ============================== */}

          {filteredMembers.length === 0 ? (

            <div className="admin-empty">

              <div className="admin-empty-icon">
                ✓
              </div>

              <h3>
                No {filter} members
              </h3>

              <p>
                There are currently no members in
                this category.
              </p>

            </div>

          ) : (

            /* ==============================
               MEMBER LIST
               ============================== */

            <div className="admin-member-list">

              {filteredMembers.map((member) => (

                <article
                  key={member.id}
                  className="admin-member-card"
                >

                  {/* =========================
                      MEMBER HEADER
                      ========================= */}

                  <div className="admin-member-main">

                    <div className="member-avatar">

                      {member.profile_photo_url ? (

                        <img
                          src={member.profile_photo_url}
                          alt={member.full_name}
                        />

                      ) : (

                        member.full_name
                          .charAt(0)
                          .toUpperCase()

                      )}

                    </div>

                    <div className="member-info">

                      <h3>
                        {member.full_name}
                      </h3>

                      {member.email && (
                        <p>
                          ✉️ {member.email}
                        </p>
                      )}

                      {member.phone && (
                        <p>
                          📱 {member.phone}
                        </p>
                      )}

                      <small>
                        Registered{' '}
                        {formatDate(
                          member.created_at
                        )}
                      </small>

                    </div>

                    <span
                      className={`member-status ${member.status}`}
                    >
                      {member.status}
                    </span>

                  </div>

                  {/* =========================
                      MEMBER DETAILS
                      ========================= */}

                  <div className="admin-member-details">

                    {member.date_of_birth && (
                      <div>

                        <span>
                          Date of Birth
                        </span>

                        <strong>
                          {formatDate(
                            member.date_of_birth
                          )}
                        </strong>

                      </div>
                    )}

                    {member.gender && (
                      <div>

                        <span>
                          Gender
                        </span>

                        <strong>
                          {member.gender}
                        </strong>

                      </div>
                    )}

                    {member.occupation && (
                      <div>

                        <span>
                          Occupation
                        </span>

                        <strong>
                          {member.occupation}
                        </strong>

                      </div>
                    )}

                    {member.education && (
                      <div>

                        <span>
                          Education
                        </span>

                        <strong>
                          {member.education}
                        </strong>

                      </div>
                    )}

                    {member.village_area && (
                      <div>

                        <span>
                          Village Area
                        </span>

                        <strong>
                          {member.village_area}
                        </strong>

                      </div>
                    )}

                    {member.skills && (
                      <div>

                        <span>
                          Skills
                        </span>

                        <strong>
                          {member.skills}
                        </strong>

                      </div>
                    )}

                    {member.address && (
                      <div>

                        <span>
                          Address
                        </span>

                        <strong>
                          {member.address}
                        </strong>

                      </div>
                    )}

                    <div>

                      <span>
                        Public Profile
                      </span>

                      <strong>
                        {member.is_public
                          ? 'Yes'
                          : 'No'}
                      </strong>

                    </div>

                  </div>

                  {/* =========================
                      ACTIONS
                      ========================= */}

                  {member.status === 'pending' && (

                    <div className="admin-member-actions">

                      <button
                        type="button"
                        className="admin-btn approve"
                        disabled={
                          actionLoading === member.id
                        }
                        onClick={() =>
                          updateMemberStatus(
                            member,
                            'approved'
                          )
                        }
                      >

                        {actionLoading === member.id
                          ? 'Updating...'
                          : '✓ Approve'}

                      </button>

                      <button
                        type="button"
                        className="admin-btn reject"
                        disabled={
                          actionLoading === member.id
                        }
                        onClick={() =>
                          updateMemberStatus(
                            member,
                            'rejected'
                          )
                        }
                      >
                        Reject
                      </button>

                    </div>

                  )}

                  {/* =========================
                      APPROVED INFORMATION
                      ========================= */}

                  {member.status === 'approved' &&
                    member.approved_at && (

                    <div className="approved-info">

                      Approved on{' '}

                      {formatDate(
                        member.approved_at
                      )}

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  )
}