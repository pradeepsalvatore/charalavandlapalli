'use client'

import Link from 'next/link'
import { ChangeEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Album = {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  album_date: string | null
  status: string
}

type Photo = {
  id: string
  album_id: string
  photo_url: string
  caption: string | null
  display_order: number
  created_at: string
}

export default function GalleryPhotoManager() {
  const params = useParams()
  const albumId = params.id as string

  const supabase = createClient()

  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([])

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  /* =========================================
     LOAD ALBUM
     ========================================= */

  async function loadAlbum() {
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
      console.error(adminError)

      setError(
        `Unable to verify administrator access: ${adminError.message}`
      )

      setLoading(false)
      return
    }

    if (!adminResult) {
      setError(
        'Access denied. Administrator authorization is required.'
      )

      setLoading(false)
      return
    }

    /* =========================================
       ALBUM
       ========================================= */

    const { data: albumData, error: albumError } =
      await supabase
        .from('gallery_albums')
        .select(`
          id,
          title,
          description,
          cover_image_url,
          album_date,
          status
        `)
        .eq('id', albumId)
        .single()

    if (albumError) {
      console.error(albumError)

      setError(
        `Unable to load album: ${albumError.message}`
      )

      setLoading(false)
      return
    }

    setAlbum(albumData)

    /* =========================================
       PHOTOS
       ========================================= */

    const { data: photoData, error: photoError } =
      await supabase
        .from('gallery_photos')
        .select(`
          id,
          album_id,
          photo_url,
          caption,
          display_order,
          created_at
        `)
        .eq('album_id', albumId)
        .order('display_order', {
          ascending: true,
        })

    if (photoError) {
      console.error(photoError)

      setError(
        `Unable to load photos: ${photoError.message}`
      )

      setLoading(false)
      return
    }

    setPhotos(photoData || [])
    setLoading(false)
  }

  useEffect(() => {
    if (albumId) {
      loadAlbum()
    }
  }, [albumId])

  /* =========================================
     FILE SELECTION
     ========================================= */

  function handleFileSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files || []
    )

    setError('')
    setMessage('')

    if (files.length === 0) {
      return
    }

    const validFiles: File[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(
          `${file.name} is not an image file.`
        )
        continue
      }

      /*
       * 10 MB maximum per image for now.
       */

      if (file.size > 10 * 1024 * 1024) {
        setError(
          `${file.name} is larger than 10 MB.`
        )
        continue
      }

      validFiles.push(file)
    }

    setSelectedFiles(validFiles)
  }

  /* =========================================
     UPLOAD PHOTOS
     ========================================= */

  async function uploadPhotos() {
    if (selectedFiles.length === 0) {
      setError(
        'Please select at least one image.'
      )
      return
    }

    if (!album) {
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(
        'Your session has expired. Please log in again.'
      )

      setUploading(false)
      return
    }

    const startingOrder = photos.length

    let uploadedCount = 0

    for (
      let index = 0;
      index < selectedFiles.length;
      index++
    ) {
      const file = selectedFiles[index]

      /*
       * Keep files organized by album.
       */

      const extension =
        file.name.split('.').pop() || 'jpg'

      const uniqueName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`

      const filePath =
        `${albumId}/${uniqueName}`

      /* =====================================
         STORAGE UPLOAD
         ===================================== */

      const { error: uploadError } =
        await supabase.storage
          .from('gallery')
          .upload(
            filePath,
            file,
            {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type,
            }
          )

      if (uploadError) {
        console.error(
          'Storage upload error:',
          uploadError
        )

        setError(
          `Unable to upload ${file.name}: ${uploadError.message}`
        )

        continue
      }

      /* =====================================
         PUBLIC URL
         ===================================== */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      const photoUrl =
        publicUrlData.publicUrl

      /* =====================================
         DATABASE RECORD
         ===================================== */

      const { error: insertError } =
        await supabase
          .from('gallery_photos')
          .insert({
            album_id: albumId,
            photo_url: photoUrl,
            caption: null,
            display_order:
              startingOrder + uploadedCount,
            uploaded_by: user.id,
          })

      if (insertError) {
        console.error(
          'Photo database error:',
          insertError
        )

        /*
         * If DB insert fails, remove the
         * uploaded file to avoid orphan files.
         */

        await supabase.storage
          .from('gallery')
          .remove([filePath])

        setError(
          `Unable to save ${file.name}: ${insertError.message}`
        )

        continue
      }

      uploadedCount++
    }

    setSelectedFiles([])
    setUploading(false)

    if (uploadedCount > 0) {
      setMessage(
        `${uploadedCount} photo${
          uploadedCount === 1 ? '' : 's'
        } uploaded successfully.`
      )
    }

    await loadAlbum()
  }

  /* =========================================
     DELETE PHOTO
     ========================================= */

  async function deletePhoto(
    photo: Photo
  ) {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this photo?'
      )

    if (!confirmed) {
      return
    }

    setDeleting(photo.id)
    setError('')
    setMessage('')

    /*
     * Extract the Storage path from the
     * public URL.
     */

    const marker =
      '/storage/v1/object/public/gallery/'

    const markerIndex =
      photo.photo_url.indexOf(marker)

    if (markerIndex !== -1) {
      const filePath =
        photo.photo_url.substring(
          markerIndex + marker.length
        )

      const { error: storageError } =
        await supabase.storage
          .from('gallery')
          .remove([filePath])

      if (storageError) {
        console.error(
          'Storage delete error:',
          storageError
        )

        setError(
          `Unable to delete storage file: ${storageError.message}`
        )

        setDeleting(null)
        return
      }
    }

    /* =====================================
       DATABASE DELETE
       ===================================== */

    const { error: deleteError } =
      await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photo.id)

    if (deleteError) {
      console.error(deleteError)

      setError(
        `Unable to delete photo: ${deleteError.message}`
      )

      setDeleting(null)
      return
    }

    setMessage(
      'Photo deleted successfully.'
    )

    setDeleting(null)

    await loadAlbum()
  }

  /* =========================================
     SET COVER PHOTO
     ========================================= */

  async function setCoverPhoto(
    photoUrl: string
  ) {
    if (!album) {
      return
    }

    setError('')
    setMessage('')

    const { error: updateError } =
      await supabase
        .from('gallery_albums')
        .update({
          cover_image_url: photoUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', album.id)

    if (updateError) {
      console.error(updateError)

      setError(
        `Unable to set cover photo: ${updateError.message}`
      )

      return
    }

    setAlbum({
      ...album,
      cover_image_url: photoUrl,
    })

    setMessage(
      'Album cover updated successfully.'
    )
  }

  /* =========================================
     UPDATE CAPTION
     ========================================= */

  async function updateCaption(
    photo: Photo,
    caption: string
  ) {
    const { error: updateError } =
      await supabase
        .from('gallery_photos')
        .update({
          caption:
            caption.trim() || null,
        })
        .eq('id', photo.id)

    if (updateError) {
      console.error(updateError)

      setError(
        `Unable to update caption: ${updateError.message}`
      )

      return
    }

    setPhotos((current) =>
      current.map((item) =>
        item.id === photo.id
          ? {
              ...item,
              caption:
                caption.trim() || null,
            }
          : item
      )
    )
  }

  /* =========================================
     DATE
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
              Photo Manager
            </h1>

            <p>
              Loading album...
            </p>

          </div>

        </section>

      </main>
    )
  }

  /* =========================================
     ERROR / ACCESS DENIED
     ========================================= */

  if (error && !album) {
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
                href="/admin/gallery"
                className="btn primary"
              >
                Back to Gallery
              </Link>

            </div>

          </div>

        </section>

      </main>
    )
  }

  if (!album) {
    return null
  }

  /* =========================================
     PAGE
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
            Photo Manager
          </h1>

          <p>
            Manage photos for{' '}
            <strong>{album.title}</strong>
          </p>

        </div>

      </section>

      {/* CONTENT */}

      <section className="section">

        <div className="container">

          {/* ADMIN NAV */}

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

          {/* BACK */}

          <div
            style={{
              marginBottom: '25px',
            }}
          >

            <Link
              href="/admin/gallery"
              className="text-link"
            >
              ← Back to Gallery
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

          {/* ALBUM INFO */}

          <div className="admin-album-info">

            <div>

              <span className="section-label">
                ALBUM
              </span>

              <h2>
                {album.title}
              </h2>

              {album.description && (
                <p>
                  {album.description}
                </p>
              )}

              <div className="admin-album-meta">

                {album.album_date && (
                  <span>
                    📅{' '}
                    {formatDate(
                      album.album_date
                    )}
                  </span>
                )}

                <span>
                  {album.status ===
                  'published'
                    ? '🟢 Published'
                    : '🟡 Draft'}
                </span>

                <span>
                  📷 {photos.length}{' '}
                  {photos.length === 1
                    ? 'photo'
                    : 'photos'}
                </span>

              </div>

            </div>

          </div>

          {/* UPLOAD */}

          <div className="photo-upload-card">

            <div className="section-label">
              ADD PHOTOS
            </div>

            <h2>
              Upload village memories
            </h2>

            <p>
              Select one or more images from
              your computer.
            </p>

            <div className="photo-upload-controls">

              <label
                htmlFor="gallery-files"
                className="btn"
              >
                Choose Photos
              </label>

              <input
                id="gallery-files"
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleFileSelection
                }
                style={{
                  display: 'none',
                }}
              />

              {selectedFiles.length > 0 && (
                <span>
                  {selectedFiles.length}{' '}
                  {selectedFiles.length === 1
                    ? 'photo'
                    : 'photos'}{' '}
                  selected
                </span>
              )}

              <button
                type="button"
                className="btn primary"
                onClick={uploadPhotos}
                disabled={
                  uploading ||
                  selectedFiles.length === 0
                }
              >
                {uploading
                  ? 'Uploading...'
                  : 'Upload Photos'}
              </button>

            </div>

            {selectedFiles.length > 0 && (

              <div className="selected-files">

                {selectedFiles.map(
                  (file, index) => (

                    <div
                      key={`${file.name}-${index}`}
                      className="selected-file"
                    >
                      <span>
                        {file.name}
                      </span>

                      <small>
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{' '}
                        MB
                      </small>
                    </div>

                  )
                )}

              </div>

            )}

            <small className="upload-note">
              Images must be less than 10 MB.
            </small>

          </div>

          {/* PHOTOS */}

          <div className="admin-section-header">

            <div>

              <span className="section-label">
                PHOTOS
              </span>

              <h2>
                Album Photos
              </h2>

            </div>

          </div>

          {photos.length === 0 ? (

            <div className="admin-empty">

              <div className="admin-empty-icon">
                📷
              </div>

              <h3>
                No photos yet
              </h3>

              <p>
                Choose photos above to add
                them to this album.
              </p>

            </div>

          ) : (

            <div className="photo-manager-grid">

              {photos.map((photo) => (

                <article
                  key={photo.id}
                  className="photo-manager-card"
                >

                  <div className="photo-manager-image">

                    <img
                      src={photo.photo_url}
                      alt={
                        photo.caption ||
                        album.title
                      }
                    />

                    {album.cover_image_url ===
                      photo.photo_url && (

                      <span className="photo-cover-badge">
                        Cover Photo
                      </span>

                    )}

                  </div>

                  <div className="photo-manager-content">

                    <input
                      type="text"
                      defaultValue={
                        photo.caption || ''
                      }
                      placeholder="Add a caption..."
                      onBlur={(event) =>
                        updateCaption(
                          photo,
                          event.target.value
                        )
                      }
                    />

                    <div className="photo-manager-actions">

                      {album.cover_image_url !==
                        photo.photo_url && (

                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() =>
                            setCoverPhoto(
                              photo.photo_url
                            )
                          }
                        >
                          ⭐ Set Cover
                        </button>

                      )}

                      <button
                        type="button"
                        className="admin-btn reject"
                        onClick={() =>
                          deletePhoto(photo)
                        }
                        disabled={
                          deleting === photo.id
                        }
                      >
                        {deleting === photo.id
                          ? 'Deleting...'
                          : '🗑️ Delete'}
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