'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type CalendarItem = {
  id: string
  name: string
  description: string | null
  date: string
  type: 'festival' | 'event'
  category: string
  isOptional?: boolean
  isPublicHoliday?: boolean
  location?: string | null
  startTime?: string | null
  organizer?: string | null
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'national', label: '🇮🇳 National' },
  { value: 'regional', label: '🏛️ Andhra Pradesh' },
  { value: 'religious', label: '🛕 Religious' },
  { value: 'village', label: '🏡 Village Events' },
]

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)

  return {
    day: date.toLocaleDateString('en-IN', {
      day: '2-digit',
    }),
    month: date.toLocaleDateString('en-IN', {
      month: 'short',
    }),
    weekday: date.toLocaleDateString('en-IN', {
      weekday: 'long',
    }),
  }
}

function getFestivalCategory(item: CalendarItem) {
  if (item.isOptional) {
    return 'Optional Holiday'
  }

  if (item.category === 'national') {
    return 'National'
  }

  if (item.category === 'regional') {
    return 'Andhra Pradesh'
  }

  if (item.category === 'religious') {
    return 'Religious'
  }

  return 'Festival'
}

function getItemCategory(item: CalendarItem) {
  if (item.type === 'event') {
    return 'Village Event'
  }

  return getFestivalCategory(item)
}

export default function EventsPage() {
  const [items, setItems] = useState<CalendarItem[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCalendar() {
      const supabase = createClient()

      const festivalsResult = await supabase
        .from('festivals')
        .select(`
          id,
          name,
          description,
          festival_date,
          festival_type,
          holiday_type,
          is_optional,
          is_public_holiday
        `)
        .eq('status', 'published')
        .order('festival_date', {
          ascending: true,
        })

      const eventsResult = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          event_date,
          start_time,
          location,
          organizer,
          status
        `)
        .eq('status', 'published')
        .order('event_date', {
          ascending: true,
        })

      if (festivalsResult.error) {
        console.error(
          'Festival query error:',
          festivalsResult.error
        )

        setError(
          `Festival query failed: ${festivalsResult.error.message}`
        )

        setLoading(false)
        return
      }

      if (eventsResult.error) {
        console.error(
          'Event query error:',
          eventsResult.error
        )

        setError(
          `Event query failed: ${eventsResult.error.message}`
        )

        setLoading(false)
        return
      }

      const festivalItems: CalendarItem[] =
        (festivalsResult.data || []).map((festival) => ({
          id: `festival-${festival.id}`,
          name: festival.name,
          description: festival.description,
          date: festival.festival_date,
          type: 'festival',
          category: festival.festival_type || 'religious',
          isOptional: festival.is_optional,
          isPublicHoliday: festival.is_public_holiday,
        }))

      const eventItems: CalendarItem[] =
        (eventsResult.data || []).map((event) => ({
          id: `event-${event.id}`,
          name: event.title,
          description: event.description,
          date: event.event_date,
          type: 'event',
          category: 'village',
          location: event.location,
          startTime: event.start_time,
          organizer: event.organizer,
        }))

      const combinedItems = [
        ...festivalItems,
        ...eventItems,
      ].sort((a, b) =>
        a.date.localeCompare(b.date)
      )

      console.log('Festival records:', festivalItems)
      console.log('Village event records:', eventItems)
      console.log('Combined calendar:', combinedItems)

      setItems(combinedItems)
      setLoading(false)
    }

    loadCalendar()
  }, [])

  const today = new Date()

  today.setHours(0, 0, 0, 0)

  const upcomingItems = items.filter((item) => {
    const itemDate = new Date(
      `${item.date}T00:00:00`
    )

    return itemDate >= today
  })

  const filteredItems =
    filter === 'all'
      ? upcomingItems
      : upcomingItems.filter((item) => {
          if (filter === 'village') {
            return item.type === 'event'
          }

          return (
            item.type === 'festival' &&
            item.category === filter
          )
        })

  return (
    <main>

      {/* HERO */}

      <section className="calendar-hero">
        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI CALENDAR
          </span>

          <h1>Festivals & Events</h1>

          <p>
            National celebrations, Andhra Pradesh festivals,
            holidays and community events.
          </p>

        </div>
      </section>

      {/* CALENDAR */}

      <section className="section">

        <div className="container">

          {/* FILTERS */}

          <div className="calendar-filters">

            {filters.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={
                  filter === item.value
                    ? 'calendar-filter active'
                    : 'calendar-filter'
                }
              >
                {item.label}
              </button>
            ))}

          </div>

          {/* LOADING */}

          {loading && (
            <div className="calendar-message">
              Loading calendar...
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="calendar-error">
              Unable to load the calendar.
              <br />
              {error}
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredItems.length === 0 && (
              <div className="calendar-message">
                No upcoming events found.
              </div>
            )}

          {/* CALENDAR ITEMS */}

          {!loading &&
            !error &&
            filteredItems.length > 0 && (

              <div className="festival-list">

                {filteredItems.map((item) => {

                  const date = formatDate(item.date)

                  return (
                    <article
                      key={item.id}
                      className="festival-card"
                    >

                      {/* DATE */}

                      <div className="festival-date">

                        <strong>
                          {date.day}
                        </strong>

                        <span>
                          {date.month}
                        </span>

                      </div>

                      {/* CONTENT */}

                      <div className="festival-content">

                        <div className="festival-meta">

                          <span className="festival-category">
                            {item.type === 'event'
                              ? '🏡 Village Event'
                              : getItemCategory(item)}
                          </span>

                          {item.isOptional && (
                            <span className="optional-badge">
                              Optional
                            </span>
                          )}

                        </div>

                        <h2>
                          {item.name}
                        </h2>

                        <p>
                          {item.description ||
                            'Charalavandlapalli community event.'}
                        </p>

                        <div className="calendar-details">

                          <small>
                            {date.weekday}
                          </small>

                          {item.startTime && (
                            <small>
                              🕐 {item.startTime.slice(0, 5)}
                            </small>
                          )}

                          {item.location && (
                            <small>
                              📍 {item.location}
                            </small>
                          )}

                        </div>

                        {item.organizer && (
                          <small>
                            Organized by {item.organizer}
                          </small>
                        )}

                      </div>

                    </article>
                  )
                })}

              </div>
            )}

        </div>

      </section>

    </main>
  )
}