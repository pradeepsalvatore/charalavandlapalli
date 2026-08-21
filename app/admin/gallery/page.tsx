'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type EventItem = {
  id: string
  title: string
  event_date: string
}

type GalleryPhotoReference = {
  id: string
  photo_url: string
}

type GalleryAlbum = {
  id: string
  title: string
  description: string | null
  event_id: string | null
  cover_image_url: string | null
  album_date: string | null
  status: string
  created_at: string

  event?: {
    title: string
  } | null

  photos?: GalleryPhotoReference[]
}

type AlbumForm = {
  title: string
  description: string
  event_id: string
  cover_image_url: string
  album_date: string
  status: 'draft' | 'published'
}

const emptyForm: AlbumForm = {
  title: '',
  description: '',
  event_id: '',
  cover_image_url: '',
  album_date: '',
  status: 'draft',
}

export default function AdminGalleryPage() {
  const supabase = createClient()

  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [events, setEvents] = useState<EventItem[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] =
    useState<string | null>(null)

  const [isAdmin, setIsAdmin] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingAlbum, setEditingAlbum] =
    useState<GalleryAlbum | null>(null)

  const [form, setForm] =
    useState<AlbumForm>(emptyForm)

  const [filter, setFilter] =
    useState<'all' | 'draft' | 'published'>('all')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  /* =========================================
     LOAD DATA
     ========================================= */

  async function loadGallery() {
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

    const {
      data: adminResult,
      error: adminError,
    } = await supabase.rpc('is_admin')

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
        'Access denied. You are not authorized to manage the gallery.'
      )

      setLoading(false)
      return
    }

    setIsAdmin(true)

    /* =========================================
       EVENTS
       ========================================= */

    const {
      data: eventData,
      error: eventError,
    } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date
      `)
      .order('event_date', {
        ascending: false,
      })

    if (eventError) {
      console.error(
        'Event loading error:',
        eventError
      )

      setError(
        `Unable to load events: ${eventError.message}`
      )

      setLoading(false)
      return
    }

    setEvents(eventData || [])

    /* =========================================
       ALBUMS
       ========================================= */

    const {
      data,
      error: albumError,
    } = await supabase
      .from('gallery_albums')
      .select(`
        id,
        title,
        description,
        event_id,
        cover_image_url,
        album_date,
        status,
        created_at,

        event:events (
          title
        ),

        photos:gallery_photos (
          id,
          photo_url
        )
      `)
      .order('album_date', {
        ascending: false,
        nullsFirst: false,
      })

    if (albumError) {
      console.error(
        'Gallery loading error:',
        albumError
      )

      setError(
        `Unable to load gallery albums: ${albumError.message}`
      )

      setLoading(false)
      return
    }

    setAlbums(
      (data || []) as unknown as GalleryAlbum[]
    )

    setLoading(false)
  }

  useEffect(() => {
    loadGallery()
  }, [])

  /* =========================================
     FORM
     ========================================= */

  function updateForm(
    field: keyof AlbumForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function openAddForm() {
    setEditingAlbum(null)

    setForm({
      ...emptyForm,
      status: 'draft',
    })

    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(
    album: GalleryAlbum
  ) {
    setEditingAlbum(album)

    setForm({
      title: album.title,
      description: album.description || '',
      event_id: album.event_id || '',
      cover_image_url:
        album.cover_image_url || '',
      album_date: album.album_date || '',
      status:
        album.status === 'published'
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
    setEditingAlbum(null)
    setForm(emptyForm)
  }

  /* =========================================
     SAVE ALBUM
     ========================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    if (!form.title.trim()) {
      setError('Album title is required.')
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

    const albumData = {
      title: form.title.trim(),

      description:
        form.description.trim() || null,

      event_id:
        form.event_id || null,

      cover_image_url:
        form.cover_image_url.trim() || null,

      album_date:
        form.album_date || null,

      status: form.status,

      updated_at:
        new Date().toISOString(),
    }

    /* =========================================
       EDIT
       ========================================= */

    if (editingAlbum) {
      const {
        error: updateError,
      } = await supabase
        .from('gallery_albums')
        .update(albumData)
        .eq('id', editingAlbum.id)

      if (updateError) {
        console.error(
          'Album update error:',
          updateError
        )

        setError(
          `Unable to update album: ${updateError.message}`
        )

        setSaving(false)
        return
      }

      setMessage(
        `"${form.title}" has been updated successfully.`
      )
    }

    /* =========================================
       CREATE
       ========================================= */

    else {
      const {
        error: insertError,
      } = await supabase
        .from('gallery_albums')
        .insert({
          ...albumData,
          created_by: user.id,
        })

      if (insertError) {
        console.error(
          'Album insert error:',
          insertError
        )

        setError(
          `Unable to create album: ${insertError.message}`
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
    setEditingAlbum(null)
    setForm(emptyForm)

    await loadGallery()
  }

  /* =========================================
     PUBLISH / UNPUBLISH
     ========================================= */

  async function togglePublish(
    album: GalleryAlbum
  ) {
    setActionLoading(album.id)
    setError('')
    setMessage('')

    const newStatus =
      album.status === 'published'
        ? 'draft'
        : 'published'

    const {
      error: updateError,
    } = await supabase
      .from('gallery_albums')
      .update({
        status: newStatus,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', album.id)

    if (updateError) {
      console.error(
        'Album publish error:',
        updateError
      )

      setError(
        `Unable to update album: ${updateError.message}`
      )

      setActionLoading(null)
      return
    }

    setMessage(
      `"${album.title}" is now ${newStatus}.`
    )

    setActionLoading(null)

    await loadGallery()
  }

  /* =========================================
     STORAGE PATH
     ========================================= */

  function getStoragePath(
    photoUrl: string
  ) {
    const marker =
      '/storage/v1/object/public/gallery/'

    const markerIndex =
      photoUrl.indexOf(marker)

    if (markerIndex === -1) {
      return null
    }

    return photoUrl.substring(
      markerIndex + marker.length
    )
  }

  /* =========================================
     DELETE
     ========================================= */

  async function deleteAlbum(
    album: GalleryAlbum
  ) {
    const photoCount =
      album.photos?.length || 0

    const confirmation =
      photoCount > 0
        ? `This album contains ${photoCount} photo(s). Are you sure you want to delete "${album.title}"?`
        : `Are you sure you want to delete "${album.title}"?`

    const confirmed =
      window.confirm(confirmation)

    if (!confirmed) {
      return
    }

    setActionLoading(album.id)
    setError('')
    setMessage('')

    /* =========================================
       DELETE STORAGE FILES
       ========================================= */

    const storagePaths =
      (album.photos || [])
        .map((photo) =>
          getStoragePath(
            photo.photo_url
          )
        )
        .filter(
          (path): path is string =>
            Boolean(path)
        )

    if (storagePaths.length > 0) {
      const {
        error: storageDeleteError,
      } = await supabase.storage
        .from('gallery')
        .remove(storagePaths)

      if (storageDeleteError) {
        console.error(
          'Storage deletion error:',
          storageDeleteError
        )

        /*
         * We continue because the database
         * records should still be removable.
         */
      }
    }

    /* =========================================
       DELETE PHOTO RECORDS
       ========================================= */

    const {
      error: photoDeleteError,
    } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('album_id', album.id)

    if (photoDeleteError) {
      console.error(
        'Photo deletion error:',
        photoDeleteError
      )

      setError(
        `Unable to delete album photos: ${photoDeleteError.message}`
      )

      setActionLoading(null)
      return
    }

    /* =========================================
       DELETE ALBUM
       ========================================= */

    const {
      error: albumDeleteError,
    } = await supabase
      .from('gallery_albums')
      .delete()
      .eq('id', album.id)

    if (albumDeleteError) {
      console.error(
        'Album deletion error:',
        albumDeleteError
      )

      setError(
        `Unable to delete album: ${albumDeleteError.message}`
      )

      setActionLoading(null)
      return
    }

    setMessage(
      `"${album.title}" has been deleted.`
    )

    setActionLoading(null)

    await loadGallery()
  }

  /* =========================================
     FILTER
     ========================================= */

  const filteredAlbums =
    filter === 'all'
      ? albums
      : albums.filter(
          (album) =>
            album.status === filter
        )

  const totalAlbums =
    albums.length

  const publishedAlbums =
    albums.filter(
      (album) =>
        album.status === 'published'
    ).length

  const draftAlbums =
    albums.filter(
      (album) =>
        album.status === 'draft'
    ).length

  /* =========================================
     FORMAT DATE
     ========================================= */

  function formatDate(
    dateString: string | null
  ) {
    if (!dateString) {
      return ''
    }

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
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
              Gallery Management
            </h1>

            <p>
              Loading administrator access...
            </p>

          </div>

        </section>

        <section className="section">

          <div className="container">

            <div className="admin-message">
              Loading gallery...
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
            Gallery Management
          </h1>

          <p>
            Create and manage village photo
            albums and memories.
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
              className="admin-nav-link"
            >
              Events
            </Link>

            <Link
              href="/admin/gallery"
              className="admin-nav-link active"
            >
              Gallery
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
                All Albums
              </span>

              <strong>
                {totalAlbums}
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
                {publishedAlbums}
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
                {draftAlbums}
              </strong>

            </button>

          </div>

          {/* SECTION HEADER */}

          <div className="admin-section-header">

            <div>

              <span className="section-label">
                GALLERY
              </span>

              <h2>
                {filter === 'all'
                  ? 'All albums'
                  : filter === 'published'
                    ? 'Published albums'
                    : 'Draft albums'}
              </h2>

            </div>

            <button
              type="button"
              className="btn primary"
              onClick={openAddForm}
            >
              + Create Album
            </button>

          </div>

          {/* =====================================
              ALBUM FORM
              ===================================== */}

          {showForm && (

            <div className="event-form-card">

              <div className="event-form-header">

                <div>

                  <span className="section-label">

                    {editingAlbum
                      ? 'EDIT ALBUM'
                      : 'NEW ALBUM'}

                  </span>

                  <h2>

                    {editingAlbum
                      ? 'Edit gallery album'
                      : 'Create a gallery album'}

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

                  <label htmlFor="album-title">
                    Album Title *
                  </label>

                  <input
                    id="album-title"
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      updateForm(
                        'title',
                        e.target.value
                      )
                    }
                    placeholder="Example: Village Sports Day 2026"
                    required
                  />

                </div>

                {/* EVENT */}

                <div className="form-field">

                  <label htmlFor="album-event">
                    Related Event
                  </label>

                  <select
                    id="album-event"
                    value={form.event_id}
                    onChange={(e) =>
                      updateForm(
                        'event_id',
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      No related event
                    </option>

                    {events.map((event) => (

                      <option
                        key={event.id}
                        value={event.id}
                      >
                        {event.title}
                      </option>

                    ))}

                  </select>

                </div>

                {/* DATE */}

                <div className="form-field">

                  <label htmlFor="album-date">
                    Album Date
                  </label>

                  <input
                    id="album-date"
                    type="date"
                    value={form.album_date}
                    onChange={(e) =>
                      updateForm(
                        'album_date',
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* STATUS */}

                <div className="form-field">

                  <label htmlFor="album-status">
                    Status
                  </label>

                  <select
                    id="album-status"
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

                {/* COVER IMAGE */}

                <div className="form-field">

                  <label htmlFor="cover-image">
                    Cover Image URL
                  </label>

                  <input
                    id="cover-image"
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

                </div>

                {/* DESCRIPTION */}

                <div className="form-field full">

                  <label htmlFor="album-description">
                    Description
                  </label>

                  <textarea
                    id="album-description"
                    rows={5}
                    value={form.description}
                    onChange={(e) =>
                      updateForm(
                        'description',
                        e.target.value
                      )
                    }
                    placeholder="Describe the memories in this album..."
                  />

                </div>

                {/* NOTE */}

                <div className="form-field full">

                  <small>
                    After creating the album,
                    use the 📷 Photos button
                    to upload and manage images
                    using Supabase Storage.
                  </small>

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
                      : editingAlbum
                        ? 'Save Changes'
                        : 'Create Album'}
                  </button>

                </div>

              </form>

            </div>

          )}

          {/* =====================================
              ALBUM LIST
              ===================================== */}

          {filteredAlbums.length === 0 ? (

            <div className="admin-empty">

              <div className="admin-empty-icon">
                📷
              </div>

              <h3>
                No albums found
              </h3>

              <p>
                Create your first village
                photo album.
              </p>

            </div>

          ) : (

            <div className="admin-gallery-grid">

              {filteredAlbums.map((album) => (

                <article
                  key={album.id}
                  className="admin-gallery-card"
                >

                  {/* COVER */}

                  <div className="admin-gallery-cover">

                    {album.cover_image_url ? (

                      <img
                        src={
                          album.cover_image_url
                        }
                        alt={album.title}
                      />

                    ) : (

                      <div className="admin-gallery-placeholder">
                        📷
                      </div>

                    )}

                    <span
                      className={`member-status ${album.status}`}
                    >
                      {album.status}
                    </span>

                  </div>

                  {/* CONTENT */}

                  <div className="admin-gallery-content">

                    <h3>
                      {album.title}
                    </h3>

                    {album.album_date && (

                      <small>
                        📅{' '}
                        {formatDate(
                          album.album_date
                        )}
                      </small>

                    )}

                    {album.event?.title && (

                      <small>
                        🏡{' '}
                        {album.event.title}
                      </small>

                    )}

                    <p>
                      {album.description ||
                        'No description provided.'}
                    </p>

                    <div className="admin-gallery-photo-count">

                      📷{' '}
                      {album.photos?.length || 0}{' '}
                      {album.photos?.length === 1
                        ? 'photo'
                        : 'photos'}

                    </div>

                    {/* ACTIONS */}

                    <div className="admin-event-actions">

                      {/* PUBLIC ALBUM */}

                      <Link
                        href={`/gallery/${album.id}`}
                        className="admin-btn"
                      >
                        View
                      </Link>

                      {/* PHOTO MANAGER */}

                      <Link
                        href={`/admin/gallery/${album.id}`}
                        className="admin-btn approve"
                      >
                        📷 Photos
                      </Link>

                      {/* EDIT */}

                      <button
                        type="button"
                        className="admin-btn approve"
                        onClick={() =>
                          openEditForm(album)
                        }
                        disabled={
                          actionLoading ===
                          album.id
                        }
                      >
                        ✏️ Edit
                      </button>

                      {/* PUBLISH */}

                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() =>
                          togglePublish(album)
                        }
                        disabled={
                          actionLoading ===
                          album.id
                        }
                      >
                        {actionLoading ===
                        album.id
                          ? 'Updating...'
                          : album.status ===
                              'published'
                            ? 'Unpublish'
                            : 'Publish'}
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        className="admin-btn reject"
                        onClick={() =>
                          deleteAlbum(album)
                        }
                        disabled={
                          actionLoading ===
                          album.id
                        }
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  )
}