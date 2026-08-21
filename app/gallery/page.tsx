'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type GalleryAlbum = {
  id: string
  title: string
  description: string | null
  event_id: string | null
  cover_image_url: string | null
  album_date: string | null
  status: string
  event?: {
    title: string
  } | null
  photos?: {
    id: string
  }[]
}

export default function GalleryPage() {
  const [albums, setAlbums] =
    useState<GalleryAlbum[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadGallery() {
      const supabase = createClient()

      const { data, error } =
        await supabase
          .from('gallery_albums')
          .select(`
            id,
            title,
            description,
            event_id,
            cover_image_url,
            album_date,
            status,
            event:events (
              title
            ),
            photos:gallery_photos (
              id
            )
          `)
          .eq('status', 'published')
          .order('album_date', {
            ascending: false,
            nullsFirst: false,
          })

      if (error) {
        console.error(
          'Gallery query error:',
          error
        )

        setError(
          `Unable to load gallery: ${error.message}`
        )

        setLoading(false)
        return
      }

      setAlbums(
        (data || []) as unknown as GalleryAlbum[]
      )

      setLoading(false)
    }

    loadGallery()
  }, [])

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
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  return (
    <main>

      {/* =====================================
          HERO
          ===================================== */}

      <section className="gallery-hero">

        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI GALLERY
          </span>

          <h1>
            Village Memories
          </h1>

          <p>
            Moments, celebrations and memories
            from our village community.
          </p>

        </div>

      </section>

      {/* =====================================
          GALLERY
          ===================================== */}

      <section className="section">

        <div className="container">

          {/* LOADING */}

          {loading && (

            <div className="calendar-message">
              Loading gallery...
            </div>

          )}

          {/* ERROR */}

          {!loading && error && (

            <div className="calendar-error">

              {error}

            </div>

          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            albums.length === 0 && (

              <div className="gallery-empty">

                <div className="gallery-empty-icon">
                  📷
                </div>

                <h2>
                  Gallery coming soon
                </h2>

                <p>
                  Village photographs and
                  memories will be added here.
                </p>

              </div>

            )}

          {/* ALBUMS */}

          {!loading &&
            !error &&
            albums.length > 0 && (

              <div className="gallery-albums-grid">

                {albums.map((album) => (

                  <article
                    key={album.id}
                    className="gallery-album-card"
                  >

                    {/* COVER */}

                    <Link
                      href={`/gallery/${album.id}`}
                      className="gallery-cover"
                    >

                      {album.cover_image_url ? (

                        <img
                          src={
                            album.cover_image_url
                          }
                          alt={album.title}
                        />

                      ) : (

                        <div className="gallery-cover-placeholder">
                          <span>
                            📷
                          </span>
                        </div>

                      )}

                      <div className="gallery-photo-count">

                        {album.photos?.length || 0}{' '}
                        {album.photos?.length === 1
                          ? 'Photo'
                          : 'Photos'}

                      </div>

                    </Link>

                    {/* CONTENT */}

                    <div className="gallery-album-content">

                      <div className="gallery-album-meta">

                        {album.album_date && (

                          <span>
                            {formatDate(
                              album.album_date
                            )}
                          </span>

                        )}

                      </div>

                      <h2>

                        <Link
                          href={`/gallery/${album.id}`}
                        >
                          {album.title}
                        </Link>

                      </h2>

                      {album.description && (

                        <p>
                          {album.description}
                        </p>

                      )}

                      {/* LINKED EVENT */}

                      {album.event?.title && (

                        <div className="gallery-event-link">

                          <span>
                            Event
                          </span>

                          <strong>
                            {album.event.title}
                          </strong>

                        </div>

                      )}

                      <Link
                        href={`/gallery/${album.id}`}
                        className="gallery-view-link"
                      >
                        View Album →
                      </Link>

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