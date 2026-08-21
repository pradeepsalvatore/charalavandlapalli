'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
}

export default function GalleryAlbumPage() {
  const params = useParams()
  const albumId = params.id as string

  const supabase = createClient()

  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedPhoto, setSelectedPhoto] =
    useState<Photo | null>(null)

  useEffect(() => {
    async function loadAlbum() {
      setLoading(true)
      setError('')

      const {
        data: albumData,
        error: albumError,
      } = await supabase
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
        .eq('status', 'published')
        .single()

      if (albumError) {
        console.error(
          'Gallery album error:',
          albumError
        )

        setError(
          'This gallery album could not be found.'
        )

        setLoading(false)
        return
      }

      const {
        data: photoData,
        error: photoError,
      } = await supabase
        .from('gallery_photos')
        .select(`
          id,
          album_id,
          photo_url,
          caption,
          display_order
        `)
        .eq('album_id', albumId)
        .order('display_order', {
          ascending: true,
        })

      if (photoError) {
        console.error(
          'Gallery photos error:',
          photoError
        )

        setError(
          `Unable to load gallery photos: ${photoError.message}`
        )

        setLoading(false)
        return
      }

      setAlbum(albumData)
      setPhotos(photoData || [])

      setLoading(false)
    }

    if (albumId) {
      loadAlbum()
    }
  }, [albumId])

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
        month: 'long',
        year: 'numeric',
      }
    )
  }

  function closePhoto() {
    setSelectedPhoto(null)
  }

  function showPreviousPhoto() {
    if (!selectedPhoto || photos.length === 0) {
      return
    }

    const currentIndex =
      photos.findIndex(
        (photo) =>
          photo.id === selectedPhoto.id
      )

    const previousIndex =
      currentIndex <= 0
        ? photos.length - 1
        : currentIndex - 1

    setSelectedPhoto(
      photos[previousIndex]
    )
  }

  function showNextPhoto() {
    if (!selectedPhoto || photos.length === 0) {
      return
    }

    const currentIndex =
      photos.findIndex(
        (photo) =>
          photo.id === selectedPhoto.id
      )

    const nextIndex =
      currentIndex >= photos.length - 1
        ? 0
        : currentIndex + 1

    setSelectedPhoto(
      photos[nextIndex]
    )
  }

  /* =========================================
     LOADING
     ========================================= */

  if (loading) {
    return (
      <main>

        <section className="calendar-hero">

          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI GALLERY
            </span>

            <h1>
              Loading Gallery...
            </h1>

            <p>
              Please wait while we load
              the album.
            </p>

          </div>

        </section>

      </main>
    )
  }

  /* =========================================
     ERROR
     ========================================= */

  if (error || !album) {
    return (
      <main>

        <section className="calendar-hero">

          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI GALLERY
            </span>

            <h1>
              Gallery Not Found
            </h1>

            <p>
              This album may have been removed
              or is not currently published.
            </p>

          </div>

        </section>

        <section className="section">

          <div className="container">

            <div className="calendar-error">
              {error ||
                'This gallery album is not available.'}
            </div>

            <div
              style={{
                marginTop: '25px',
              }}
            >

              <Link
                href="/gallery"
                className="btn primary"
              >
                ← Back to Gallery
              </Link>

            </div>

          </div>

        </section>

      </main>
    )
  }

  return (
    <main>

      {/* =====================================
          HERO
          ===================================== */}

      <section className="calendar-hero">

        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI GALLERY
          </span>

          <h1>
            {album.title}
          </h1>

          {album.description && (
            <p>
              {album.description}
            </p>
          )}

          {album.album_date && (
            <div className="gallery-album-date">
              📅 {formatDate(album.album_date)}
            </div>
          )}

        </div>

      </section>

      {/* =====================================
          GALLERY
          ===================================== */}

      <section className="section">

        <div className="container">

          <div
            style={{
              marginBottom: '30px',
            }}
          >

            <Link
              href="/gallery"
              className="text-link"
            >
              ← Back to Gallery
            </Link>

          </div>

          {photos.length === 0 ? (

            <div className="calendar-message">

              <div
                style={{
                  fontSize: '42px',
                  marginBottom: '12px',
                }}
              >
                📷
              </div>

              <h2>
                Photos coming soon
              </h2>

              <p>
                Photos for this album will
                be added soon.
              </p>

            </div>

          ) : (

            <>

              {/* PHOTO COUNT */}

              <div className="gallery-album-heading">

                <div>

                  <span className="section-label">
                    ALBUM
                  </span>

                  <h2>
                    {photos.length}{' '}
                    {photos.length === 1
                      ? 'Photo'
                      : 'Photos'}
                  </h2>

                </div>

              </div>

              {/* PHOTO GRID */}

              <div className="public-gallery-grid">

                {photos.map((photo) => (

                  <button
                    key={photo.id}
                    type="button"
                    className="public-gallery-photo"
                    onClick={() =>
                      setSelectedPhoto(photo)
                    }
                    aria-label={
                      photo.caption ||
                      'View photo'
                    }
                  >

                    <img
                      src={photo.photo_url}
                      alt={
                        photo.caption ||
                        album.title
                      }
                    />

                    {photo.caption && (

                      <span className="public-gallery-caption">
                        {photo.caption}
                      </span>

                    )}

                  </button>

                ))}

              </div>

            </>

          )}

        </div>

      </section>

      {/* =====================================
          LIGHTBOX
          ===================================== */}

      {selectedPhoto && (

        <div
          className="gallery-lightbox"
          onClick={closePhoto}
          role="dialog"
          aria-modal="true"
        >

          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={closePhoto}
            aria-label="Close photo"
          >
            ×
          </button>

          <button
            type="button"
            className="gallery-lightbox-prev"
            onClick={(event) => {
              event.stopPropagation()
              showPreviousPhoto()
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <div
            className="gallery-lightbox-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <img
              src={selectedPhoto.photo_url}
              alt={
                selectedPhoto.caption ||
                album.title
              }
            />

            {selectedPhoto.caption && (

              <div className="gallery-lightbox-caption">
                {selectedPhoto.caption}
              </div>

            )}

          </div>

          <button
            type="button"
            className="gallery-lightbox-next"
            onClick={(event) => {
              event.stopPropagation()
              showNextPhoto()
            }}
            aria-label="Next photo"
          >
            ›
          </button>

        </div>

      )}

    </main>
  )
}