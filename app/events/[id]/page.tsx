'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
  category?: {
    name: string
  } | null
}

export default function EventDetailsPage() {
  const params = useParams()
  const eventId = params?.id as string

  const [event, setEvent] =
    useState<EventItem | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        return
      }

      const supabase = createClient()

      const { data, error } = await supabase
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
          category:event_categories (
            name
          )
        `)
        .eq('id', eventId)
        .eq('status', 'published')
        .maybeSingle()

      if (error) {
        console.error(
          'Event loading error:',
          error
        )

        setError(error.message)
        setLoading(false)
        return
      }

      if (!data) {
        setError('Event not found.')
        setLoading(false)
        return
      }

      setEvent(
        data as unknown as EventItem
      )

      setLoading(false)
    }

    loadEvent()
  }, [eventId])

  function formatDate(
    dateString: string
  ) {
    const date = new Date(
      `${dateString}T00:00:00`
    )

    return {
      day: date.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
        }
      ),

      month: date.toLocaleDateString(
        'en-IN',
        {
          month: 'short',
        }
      ),

      full: date.toLocaleDateString(
        'en-IN',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      ),
    }
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
      <main>

        <section className="calendar-hero">
          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI CALENDAR
            </span>

            <h1>
              Event Details
            </h1>

            <p>
              Loading event information...
            </p>

          </div>
        </section>

        <section className="section">

          <div className="container">

            <div className="calendar-message">
              Loading event...
            </div>

          </div>

        </section>

      </main>
    )
  }

  /* =========================================
     ERROR / NOT FOUND
     ========================================= */

  if (error || !event) {
    return (
      <main>

        <section className="calendar-hero">

          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI CALENDAR
            </span>

            <h1>
              Event Not Found
            </h1>

            <p>
              The event you are looking for
              could not be found.
            </p>

          </div>

        </section>

        <section className="section">

          <div className="container">

            <div className="calendar-error">

              {error ||
                'This event does not exist or is no longer published.'}

            </div>

            <div
              style={{
                marginTop: '25px',
              }}
            >

              <Link
                href="/events"
                className="btn primary"
              >
                ← Back to Events
              </Link>

            </div>

          </div>

        </section>

      </main>
    )
  }

  const date =
    formatDate(event.event_date)

  return (
    <main>

      {/* HERO */}

      <section className="calendar-hero">

        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI CALENDAR
          </span>

          <h1>
            {event.title}
          </h1>

          <p>
            {event.category?.name ||
              'Village Event'}
          </p>

        </div>

      </section>

      {/* EVENT DETAILS */}

      <section className="section">

        <div className="container">

          {/* BACK */}

          <div className="event-detail-back">

            <Link
              href="/events"
              className="text-link"
            >
              ← Back to Festivals & Events
            </Link>

          </div>

          <article className="event-detail-card">

            {/* COVER IMAGE */}

            {event.cover_image_url && (

              <div className="event-detail-image">

                <img
                  src={
                    event.cover_image_url
                  }
                  alt={event.title}
                />

              </div>

            )}

            <div className="event-detail-content">

              {/* CATEGORY */}

              <div className="event-detail-meta">

                <span className="festival-category">
                  {event.category?.name ||
                    'Village Event'}
                </span>

              </div>

              {/* TITLE */}

              <h2>
                {event.title}
              </h2>

              {/* DESCRIPTION */}

              {event.description && (

                <p className="event-detail-description">
                  {event.description}
                </p>

              )}

              {/* INFORMATION */}

              <div className="event-detail-info">

                {/* DATE */}

                <div className="event-detail-info-row">

                  <div className="event-detail-icon">
                    📅
                  </div>

                  <div>

                    <strong>
                      Date
                    </strong>

                    <span>
                      {date.full}
                    </span>

                  </div>

                </div>

                {/* TIME */}

                {(event.start_time ||
                  event.end_time) && (

                  <div className="event-detail-info-row">

                    <div className="event-detail-icon">
                      🕐
                    </div>

                    <div>

                      <strong>
                        Time
                      </strong>

                      <span>

                        {event.start_time
                          ? formatTime(
                              event.start_time
                            )
                          : ''}

                        {event.end_time &&
                          ` - ${formatTime(
                            event.end_time
                          )}`}

                      </span>

                    </div>

                  </div>

                )}

                {/* LOCATION */}

                {event.location && (

                  <div className="event-detail-info-row">

                    <div className="event-detail-icon">
                      📍
                    </div>

                    <div>

                      <strong>
                        Location
                      </strong>

                      <span>
                        {event.location}
                      </span>

                    </div>

                  </div>

                )}

                {/* ORGANIZER */}

                {event.organizer && (

                  <div className="event-detail-info-row">

                    <div className="event-detail-icon">
                      👤
                    </div>

                    <div>

                      <strong>
                        Organizer
                      </strong>

                      <span>
                        {event.organizer}
                      </span>

                    </div>

                  </div>

                )}

                {/* CONTACT */}

                {event.contact_phone && (

                  <div className="event-detail-info-row">

                    <div className="event-detail-icon">
                      📞
                    </div>

                    <div>

                      <strong>
                        Contact
                      </strong>

                      <a
                        href={`tel:${event.contact_phone}`}
                      >
                        {event.contact_phone}
                      </a>

                    </div>

                  </div>

                )}

              </div>

              {/* ACTIONS */}

              <div className="event-detail-actions">

                <Link
                  href="/events"
                  className="btn primary"
                >
                  ← Back to Events
                </Link>

                {event.contact_phone && (

                  <a
                    href={`tel:${event.contact_phone}`}
                    className="btn ghost"
                  >
                    📞 Contact Organizer
                  </a>

                )}

              </div>

            </div>

          </article>

        </div>

      </section>

    </main>
  )
}