'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Category = {
  id: string
  name: string
}

type EventItem = {
  id: string
  category_id: string | null
  title: string
  description: string | null
  event_date: string
  start_time: string | null
  end_time: string | null
  location: string | null
  organizer: string | null
  contact_phone: string | null
  cover_image_url: string | null
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
  category?: {
    name: string
  } | null
}

type EventFilter = 'all' | 'draft' | 'published'

type EventForm = {
  title: string
  category_id: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  organizer: string
  contact_phone: string
  cover_image_url: string
  status: 'draft' | 'published'
}

const emptyForm: EventForm = {
  title: '',
  category_id: '',
  description: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location: '',
  organizer: '',
  contact_phone: '',
  cover_image_url: '',
  status: 'draft',
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [filter, setFilter] =
    useState<EventFilter>('all')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] =
    useState<string | null>(null)

  const [isAdmin, setIsAdmin] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] =
    useState<EventItem | null>(null)

  const [form, setForm] =
    useState<EventForm>(emptyForm)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  /* =========================================
     LOAD ADMIN + EVENTS
     ========================================= */

  async function loadEvents() {
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

    if (!adminResult) {
      setError(
        'Access denied. You are not authorized to manage events.'
      )

      setLoading(false)
      return
    }

    setIsAdmin(true)

    /* Categories */

    const {
      data: categoryData,
      error: categoryError,
    } = await supabase
      .from('event_categories')
      .select('id, name')
      .order('name')

    if (categoryError) {
      console.error(
        'Category loading error:',
        categoryError
      )

      setError(categoryError.message)
      setLoading(false)
      return
    }

    setCategories(categoryData || [])

    /* Events */

    const { data, error: eventsError } =
      await supabase
        .from('events')
        .select(`
          id,
          category_id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          location,
          organizer,
          contact_phone,
          cover_image_url,
          status,
          created_by,
          created_at,
          updated_at,
          category:event_categories (
            name
          )
        `)
        .order('event_date', {
          ascending: true,
        })
        .order('start_time', {
          ascending: true,
        })

    if (eventsError) {
      console.error(
        'Event loading error:',
        eventsError
      )

      setError(eventsError.message)
      setLoading(false)
      return
    }

    setEvents(
      (data || []) as unknown as EventItem[]
    )

    setLoading(false)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  /* =========================================
     FORM HELPERS
     ========================================= */

  function updateForm(
    field: keyof EventForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function openAddForm() {
    setEditingEvent(null)

    setForm({
      ...emptyForm,
      status: 'draft',
    })

    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(event: EventItem) {
    setEditingEvent(event)

    setForm({
      title: event.title,
      category_id: event.category_id || '',
      description: event.description || '',
      event_date: event.event_date,
      start_time: event.start_time
        ? event.start_time.substring(0, 5)
        : '',
      end_time: event.end_time
        ? event.end_time.substring(0, 5)
        : '',
      location: event.location || '',
      organizer: event.organizer || '',
      contact_phone: event.contact_phone || '',
      cover_image_url:
        event.cover_image_url || '',
      status:
        event.status === 'published'
          ? 'published'
          : 'draft',
    })

    setError('')
    setMessage('')
    setShowForm(true)
  }

  function closeForm() {
    if (saving) {
      return
    }

    setShowForm(false)
    setEditingEvent(null)
    setForm(emptyForm)
  }

  /* =========================================
     SAVE EVENT
     ========================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    if (!form.title.trim()) {
      setError('Event title is required.')
      setSaving(false)
      return
    }

    if (!form.event_date) {
      setError('Event date is required.')
      setSaving(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(
        'Your session has expired. Please log in again.'
      )
      setSaving(false)
      return
    }

    const eventData = {
      category_id:
        form.category_id || null,

      title: form.title.trim(),

      description:
        form.description.trim() || null,

      event_date: form.event_date,

      start_time:
        form.start_time || null,

      end_time:
        form.end_time || null,

      location:
        form.location.trim() || null,

      organizer:
        form.organizer.trim() || null,

      contact_phone:
        form.contact_phone.trim() || null,

      cover_image_url:
        form.cover_image_url.trim() || null,

      status: form.status,

      updated_at: new Date().toISOString(),
    }

    /* EDIT */

    if (editingEvent) {
      const { error: updateError } =
        await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

      if (updateError) {
        console.error(
          'Event update error:',
          updateError
        )

        setError(
          `Unable to update event: ${updateError.message}`
        )

        setSaving(false)
        return
      }

      setMessage(
        `"${form.title}" has been updated successfully.`
      )
    }

    /* CREATE */

    else {
      const { error: insertError } =
        await supabase
          .from('events')
          .insert({
            ...eventData,
            created_by: user.id,
          })

      if (insertError) {
        console.error(
          'Event insert error:',
          insertError
        )

        setError(
          `Unable to create event: ${insertError.message}`
        )

        setSaving(false)
        return
      }

      setMessage(
        `"${form.title}" has been created successfully.`
      )
    }

    setSaving(false)
    setShowForm(false)
    setEditingEvent(null)
    setForm(emptyForm)

    await loadEvents()
  }

  /* =========================================
     PUBLISH / UNPUBLISH
     ========================================= */

  async function togglePublish(
    event: EventItem
  ) {
    setActionLoading(event.id)
    setError('')
    setMessage('')

    const newStatus =
      event.status === 'published'
        ? 'draft'
        : 'published'

    const { error: updateError } =
      await supabase
        .from('events')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id)

    if (updateError) {
      console.error(
        'Publish update error:',
        updateError
      )

      setError(
        `Unable to update event: ${updateError.message}`
      )

      setActionLoading(null)
      return
    }

    setMessage(
      `"${event.title}" is now ${newStatus}.`
    )

    setActionLoading(null)

    await loadEvents()
  }

  /* =========================================
     DELETE
     ========================================= */

  async function deleteEvent(
    event: EventItem
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setActionLoading(event.id)
    setError('')
    setMessage('')

    const { error: deleteError } =
      await supabase
        .from('events')
        .delete()
        .eq('id', event.id)

    if (deleteError) {
      console.error(
        'Event delete error:',
        deleteError
      )

      setError(
        `Unable to delete event: ${deleteError.message}`
      )

      setActionLoading(null)
      return
    }

    setMessage(
      `"${event.title}" has been deleted.`
    )

    setActionLoading(null)

    await loadEvents()
  }

  /* =========================================
     FILTER
     ========================================= */

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter(
          (event) =>
            event.status === filter
        )

  const totalEvents = events.length

  const publishedEvents =
    events.filter(
      (event) =>
        event.status === 'published'
    ).length

  const draftEvents =
    events.filter(
      (event) =>
        event.status === 'draft'
    ).length

  /* =========================================
     FORMATTERS
     ========================================= */

  function formatDate(
    date: string
  ) {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  function formatTime(
    time: string | null
  ) {
    if (!time) {
      return ''
    }

    const [hourString, minute] =
      time.split(':')

    const hour =
      Number(hourString)

    const suffix =
      hour >= 12
        ? 'PM'
        : 'AM'

    const displayHour =
      hour % 12 || 12

    return `${displayHour}:${minute} ${suffix}`
  }

  /* =========================================
     LOADING
     ========================================= */

  if (loading) {
    return (
      <main className="admin-page">

        <section className="admin-hero">

          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI ADMIN
            </span>

            <h1>
              Event Management
            </h1>

            <p>
              Loading administrator access...
            </p>

          </div>

        </section>

        <section className="section">

          <div className="container">

            <div className="admin-message">
              Loading events...
            </div>

          </div>

        </section>

      </main>
    )
  }

  /* =========================================
     ACCESS DENIED
     ========================================= */

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
              Administrator authorization
              is required.
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

  /* =========================================
     ADMIN PAGE
     ========================================= */

  return (
    <main className="admin-page">

      {/* HERO */}

      <section className="admin-hero">

        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI ADMIN
          </span>

          <h1>
            Event Management
          </h1>

          <p>
            Create, publish and manage village
            events and activities.
          </p>

        </div>

      </section>

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
              className="admin-nav-link"
            >
              Members
            </Link>

            <Link
              href="/admin/events"
              className="admin-nav-link active"
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

          {/* MESSAGES */}

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {message && (
            <div className="admin-success">
              {message}
            </div>
          )}

          {/* STATISTICS */}

          <div className="admin-stats">

            <button
              type="button"
              className={
                filter === 'all'
                  ? 'admin-stat active'
                  : 'admin-stat'
              }
              onClick={() =>
                setFilter('all')
              }
            >

              <span>
                All Events
              </span>

              <strong>
                {totalEvents}
              </strong>

            </button>

            <button
              type="button"
              className={
                filter === 'published'
                  ? 'admin-stat active'
                  : 'admin-stat'
              }
              onClick={() =>
                setFilter('published')
              }
            >

              <span>
                Published
              </span>

              <strong>
                {publishedEvents}
              </strong>

            </button>

            <button
              type="button"
              className={
                filter === 'draft'
                  ? 'admin-stat active'
                  : 'admin-stat'
              }
              onClick={() =>
                setFilter('draft')
              }
            >

              <span>
                Drafts
              </span>

              <strong>
                {draftEvents}
              </strong>

            </button>

          </div>

          {/* HEADER */}

          <div className="admin-section-header">

            <div>

              <span className="section-label">
                EVENTS
              </span>

              <h2>
                {filter === 'all'
                  ? 'All events'
                  : filter === 'published'
                    ? 'Published events'
                    : 'Draft events'}
              </h2>

            </div>

            <button
              type="button"
              className="btn primary"
              onClick={openAddForm}
            >
              + Add Event
            </button>

          </div>

          {/* FORM */}

          {showForm && (

            <div className="event-form-card">

              <div className="event-form-header">

                <div>

                  <span className="section-label">
                    {editingEvent
                      ? 'EDIT EVENT'
                      : 'NEW EVENT'}
                  </span>

                  <h2>
                    {editingEvent
                      ? 'Edit event'
                      : 'Create a new event'}
                  </h2>

                </div>

                <button
                  type="button"
                  className="form-close"
                  onClick={closeForm}
                  disabled={saving}
                >
                  ✕
                </button>

              </div>

              <form
                onSubmit={handleSubmit}
                className="event-form"
              >

                {/* TITLE */}

                <div className="form-field full">

                  <label htmlFor="title">
                    Event Title *
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      updateForm(
                        'title',
                        e.target.value
                      )
                    }
                    placeholder="Example: Village Sports Day"
                    required
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-field">

                  <label htmlFor="category">
                    Category
                  </label>

                  <select
                    id="category"
                    value={form.category_id}
                    onChange={(e) =>
                      updateForm(
                        'category_id',
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* STATUS */}

                <div className="form-field">

                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) =>
                      updateForm(
                        'status',
                        e.target.value
                      )
                    }
                  >

                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>

                  </select>

                </div>

                {/* DATE */}

                <div className="form-field">

                  <label htmlFor="event_date">
                    Event Date *
                  </label>

                  <input
                    id="event_date"
                    type="date"
                    value={form.event_date}
                    onChange={(e) =>
                      updateForm(
                        'event_date',
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                {/* START TIME */}

                <div className="form-field">

                  <label htmlFor="start_time">
                    Start Time
                  </label>

                  <input
                    id="start_time"
                    type="time"
                    value={form.start_time}
                    onChange={(e) =>
                      updateForm(
                        'start_time',
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* END TIME */}

                <div className="form-field">

                  <label htmlFor="end_time">
                    End Time
                  </label>

                  <input
                    id="end_time"
                    type="time"
                    value={form.end_time}
                    onChange={(e) =>
                      updateForm(
                        'end_time',
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* LOCATION */}

                <div className="form-field">

                  <label htmlFor="location">
                    Location
                  </label>

                  <input
                    id="location"
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      updateForm(
                        'location',
                        e.target.value
                      )
                    }
                    placeholder="Village Community Grounds"
                  />

                </div>

                {/* ORGANIZER */}

                <div className="form-field">

                  <label htmlFor="organizer">
                    Organizer
                  </label>

                  <input
                    id="organizer"
                    type="text"
                    value={form.organizer}
                    onChange={(e) =>
                      updateForm(
                        'organizer',
                        e.target.value
                      )
                    }
                    placeholder="Village Committee"
                  />

                </div>

                {/* PHONE */}

                <div className="form-field">

                  <label htmlFor="contact_phone">
                    Contact Phone
                  </label>

                  <input
                    id="contact_phone"
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) =>
                      updateForm(
                        'contact_phone',
                        e.target.value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />

                </div>

                {/* IMAGE */}

                <div className="form-field full">

                  <label htmlFor="cover_image_url">
                    Cover Image URL
                  </label>

                  <input
                    id="cover_image_url"
                    type="url"
                    value={
                      form.cover_image_url
                    }
                    onChange={(e) =>
                      updateForm(
                        'cover_image_url',
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                  />

                  <small>
                    Image upload will be added
                    later using Supabase Storage.
                  </small>

                </div>

                {/* DESCRIPTION */}

                <div className="form-field full">

                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    rows={5}
                    value={form.description}
                    onChange={(e) =>
                      updateForm(
                        'description',
                        e.target.value
                      )
                    }
                    placeholder="Describe the event..."
                  />

                </div>

                {/* ACTIONS */}

                <div className="event-form-actions">

                  <button
                    type="button"
                    className="admin-btn reject"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-btn approve"
                    disabled={saving}
                  >
                    {saving
                      ? 'Saving...'
                      : editingEvent
                        ? 'Save Changes'
                        : 'Create Event'}
                  </button>

                </div>

              </form>

            </div>

          )}

          {/* EVENT LIST */}

          {filteredEvents.length === 0 ? (

            <div className="admin-empty">

              <div className="admin-empty-icon">
                📅
              </div>

              <h3>
                No events found
              </h3>

              <p>
                Create your first village event
                using the Add Event button.
              </p>

            </div>

          ) : (

            <div className="admin-event-list">

              {filteredEvents.map(
                (event) => (

                  <article
                    key={event.id}
                    className="admin-event-card"
                  >

                    {/* IMAGE */}

                    {event.cover_image_url && (
                      <div className="admin-event-image">

                        <img
                          src={
                            event.cover_image_url
                          }
                          alt={event.title}
                        />

                      </div>
                    )}

                    {/* CONTENT */}

                    <div className="admin-event-content">

                      <div className="admin-event-top">

                        <div className="event-date-box">

                          <strong>
                            {new Date(
                              `${event.event_date}T00:00:00`
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                day: '2-digit',
                              }
                            )}
                          </strong>

                          <span>
                            {new Date(
                              `${event.event_date}T00:00:00`
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                month: 'short',
                              }
                            )}
                          </span>

                        </div>

                        <div className="admin-event-title">

                          <div className="event-meta">

                            <span className="event-category">
                              {event.category?.name ||
                                'Other'}
                            </span>

                            <span
                              className={`member-status ${event.status}`}
                            >
                              {event.status}
                            </span>

                          </div>

                          <h3>
                            {event.title}
                          </h3>

                          <p>
                            {event.description ||
                              'No description provided.'}
                          </p>

                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="admin-event-details">

                        <span>
                          📅{' '}
                          {formatDate(
                            event.event_date
                          )}
                        </span>

                        {event.start_time && (
                          <span>
                            🕐{' '}
                            {formatTime(
                              event.start_time
                            )}

                            {event.end_time &&
                              ` - ${formatTime(
                                event.end_time
                              )}`}
                          </span>
                        )}

                        {event.location && (
                          <span>
                            📍 {event.location}
                          </span>
                        )}

                        {event.organizer && (
                          <span>
                            👤 {event.organizer}
                          </span>
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="admin-event-actions">

                        <button
                          type="button"
                          className="admin-btn approve"
                          onClick={() =>
                            openEditForm(event)
                          }
                          disabled={
                            actionLoading ===
                            event.id
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() =>
                            togglePublish(event)
                          }
                          disabled={
                            actionLoading ===
                            event.id
                          }
                        >
                          {actionLoading ===
                          event.id
                            ? 'Updating...'
                            : event.status ===
                                'published'
                              ? 'Unpublish'
                              : 'Publish'}
                        </button>

                        <button
                          type="button"
                          className="admin-btn reject"
                          onClick={() =>
                            deleteEvent(event)
                          }
                          disabled={
                            actionLoading ===
                            event.id
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>

      </section>

    </main>
  )
}