'use client'

import { useEffect, useState } from 'react'

type PanchangData = {
  panchang_date: string
  village_name: string

  vara: string | null
  tithi: string | null
  paksha: string | null
  nakshatra: string | null
  yoga: string | null
  karana: string | null

  sunrise: string | null
  sunset: string | null
  moonrise: string | null
  moonset: string | null

  rahu_kalam_start: string | null
  rahu_kalam_end: string | null

  yamagandam_start: string | null
  yamagandam_end: string | null

  gulika_start: string | null
  gulika_end: string | null

  abhijit_start: string | null
  abhijit_end: string | null

  dur_muhurtham_start: string | null
  dur_muhurtham_end: string | null

  varjyam_start: string | null
  varjyam_end: string | null

  raw_data?: {
    masa?: {
      name?: string
      isAdhika?: boolean
    }

    ritu?: string
    ayana?: string

    samvat?: {
      shaka?: number
      vikram?: number
      samvatsara?: string
    }

    moonRashi?: {
      name?: string
    }

    sunRashi?: {
      name?: string
    }

    nakshatraPada?: number

    currentHora?: string

    choghadiya?: {
      day?: Array<{
        name: string
        rating: string
        startTime: string
        endTime: string
      }>
    }
  }
}

type ApiResponse = {
  success: boolean
  source?: string
  data?: PanchangData
  error?: string
}

const TELUGU: Record<string, string> = {
  Sunday: 'ఆదివారం',
  Monday: 'సోమవారం',
  Tuesday: 'మంగళవారం',
  Wednesday: 'బుధవారం',
  Thursday: 'గురువారం',
  Friday: 'శుక్రవారం',
  Saturday: 'శనివారం',

  Shukla: 'శుక్ల పక్షం',
  Krishna: 'కృష్ణ పక్షం',

  Pratipada: 'పాడ్యమి',
  Dwitiya: 'విదియ',
  Tritiya: 'తదియ',
  Chaturthi: 'చవితి',
  Panchami: 'పంచమి',
  Shashthi: 'షష్ఠి',
  Saptami: 'సప్తమి',
  Ashtami: 'అష్టమి',
  Navami: 'నవమి',
  Dashami: 'దశమి',
  Ekadashi: 'ఏకాదశి',
  Dwadashi: 'ద్వాదశి',
  Trayodashi: 'త్రయోదశి',
  Chaturdashi: 'చతుర్దశి',
  Purnima: 'పౌర్ణమి',
  Amavasya: 'అమావాస్య',

  Ashwini: 'అశ్విని',
  Bharani: 'భరణి',
  Krittika: 'కృత్తిక',
  Rohini: 'రోహిణి',
  Mrigashira: 'మృగశిర',
  Ardra: 'ఆర్ద్ర',
  Punarvasu: 'పునర్వసు',
  Pushya: 'పుష్యమి',
  Ashlesha: 'ఆశ్లేష',
  Magha: 'మఘ',
  PurvaPhalguni: 'పుబ్బ',
  UttaraPhalguni: 'ఉత్తర',
  Hasta: 'హస్త',
  Chitra: 'చిత్త',
  Swati: 'స్వాతి',
  Vishakha: 'విశాఖ',
  Anuradha: 'అనూరాధ',
  Jyeshtha: 'జ్యేష్ఠ',
  Mula: 'మూల',
  PurvaAshadha: 'పూర్వాషాఢ',
  UttaraAshadha: 'ఉత్తరాషాఢ',
  Shravana: 'శ్రవణం',
  Dhanishta: 'ధనిష్ఠ',
  Shatabhisha: 'శతభిషం',
  PurvaBhadrapada: 'పూర్వాభాద్ర',
  UttaraBhadrapada: 'ఉత్తరాభాద్ర',
  Revati: 'రేవతి',

  Vishkambha: 'విష్కంభ',
  Priti: 'ప్రీతి',
  Ayushman: 'ఆయుష్మాన్',
  Saubhagya: 'సౌభాగ్య',
  Shobhana: 'శోభన',
  Atiganda: 'అతిగండ',
  Sukarma: 'సుకర్మ',
  Dhriti: 'ధృతి',
  Shula: 'శూల',
  Ganda: 'గండ',
  Vriddhi: 'వృద్ధి',
  Dhruva: 'ధ్రువ',
  Vyaghata: 'వ్యాఘాత',
  Harshana: 'హర్షణ',
  Vajra: 'వజ్ర',
  Siddhi: 'సిద్ధి',
  Vyatipata: 'వ్యతీపాత',
  Variyana: 'వరీయాన్',
  Parigha: 'పరిఘ',
  Shiva: 'శివ',
  Siddha: 'సిద్ధ',
  Sadhya: 'సాధ్య',
  Shubha: 'శుభ',
  Brahma: 'బ్రహ్మ',
  Indra: 'ఇంద్ర',
  Vaidhriti: 'వైధృతి',

  Taitila: 'తైతిల',
  Gara: 'గర',
  Vanija: 'వణిజ',
  Vishti: 'విష్టి',
  Bava: 'బవ',
  Balava: 'బాలవ',
  Kaulava: 'కౌలవ',

  Varsha: 'వర్ష ఋతువు',
  Dakshinayana: 'దక్షిణాయనం',

  Leo: 'సింహం',
  Scorpio: 'వృశ్చికం',
  Sagittarius: 'ధనుస్సు',
  Cancer: 'కర్కాటకం',
  Gemini: 'మిథునం',
  Pisces: 'మీనం',
  Aquarius: 'కుంభం',
  Virgo: 'కన్య',
  Aries: 'మేషం',
  Taurus: 'వృషభం',
  Libra: 'తుల',
  Capricorn: 'మకరం',
}

function telugu(
  value: string | null | undefined
) {
  if (!value) {
    return '--'
  }

  return TELUGU[value] || value
}

/*
 * Database stores times as HH:mm:ss.
 * Keep this formatter timezone-independent.
 */
function formatTime(
  value: string | null
) {
  if (!value) {
    return '--'
  }

  const parts = value.split(':')

  if (parts.length < 2) {
    return value
  }

  let hour = Number(parts[0])

  const minute = parts[1]

  const period =
    hour >= 12 ? 'PM' : 'AM'

  hour = hour % 12 || 12

  return `${hour}:${minute} ${period}`
}

/*
 * Treat YYYY-MM-DD as a calendar date.
 *
 * IMPORTANT:
 * Use UTC here so the browser's local timezone
 * cannot move the date backwards or forwards.
 */
function parseCalendarDate(
  dateString: string
) {
  const [
    year,
    month,
    day,
  ] = dateString
    .split('-')
    .map(Number)

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  )
}

/*
 * Format the calendar date without
 * applying the browser's timezone.
 */
function formatDate(
  dateString: string
) {
  const date =
    parseCalendarDate(
      dateString
    )

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  ).format(date)
}

/*
 * Get weekday from the calendar date.
 */
function getWeekday(
  dateString: string
) {
  const date =
    parseCalendarDate(
      dateString
    )

  return new Intl.DateTimeFormat(
    'en-US',
    {
      timeZone: 'UTC',
      weekday: 'long',
    }
  ).format(date)
}

/*
 * Get today's date in India.
 */
function getTodayIndia() {
  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).format(new Date())
}

/*
 * Move forward/backward by calendar days.
 *
 * This is the important fix for the
 * Previous / Next issue.
 */
function changeDate(
  dateString: string,
  days: number
) {
  const date =
    parseCalendarDate(
      dateString
    )

  date.setUTCDate(
    date.getUTCDate() + days
  )

  const year =
    date.getUTCFullYear()

  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      date.getUTCDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function TimeRange({
  start,
  end,
}: {
  start: string | null
  end: string | null
}) {
  return (
    <strong className="panchang-time">
      {formatTime(start)} –{' '}
      {formatTime(end)}
    </strong>
  )
}

export default function PanchangamPage() {
  const [date, setDate] =
    useState(getTodayIndia())

  const [data, setData] =
    useState<PanchangData | null>(
      null
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let cancelled = false

    async function loadPanchang() {
      try {
        setLoading(true)
        setError('')

        const response =
          await fetch(
            `/api/panchang?date=${date}`,
            {
              cache: 'no-store',
            }
          )

        const result: ApiResponse =
          await response.json()

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.error ||
              'Unable to load Panchangam.'
          )
        }

        if (!cancelled) {
          setData(result.data)
        }
      } catch (error) {
        console.error(
          'Panchang page error:',
          error
        )

        if (!cancelled) {
          setData(null)

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load Panchangam.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPanchang()

    return () => {
      cancelled = true
    }
  }, [date])

  function previousDay() {
    setDate(
      changeDate(date, -1)
    )
  }

  function nextDay() {
    setDate(
      changeDate(date, 1)
    )
  }

  function today() {
    setDate(
      getTodayIndia()
    )
  }

  return (
    <main className="panchang-page">

      {/* =========================
          HERO
      ========================== */}

      <section className="panchang-hero">

        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI COMMUNITY
          </span>

          <h1>
            🪔 పంచాంగ వివరాలు
          </h1>

          <p>
            Panchangam
          </p>

          <div className="panchang-location">
            📍 Charalavandlapalli,
            Andhra Pradesh
          </div>

        </div>

      </section>

      <section className="section">

        <div className="container">

          {/* =========================
              DATE NAVIGATION
          ========================== */}

          <div className="panchang-date-nav">

            <button
              type="button"
              className="btn"
              onClick={previousDay}
              disabled={loading}
            >
              ← Previous
            </button>

            <div className="panchang-date">

              <strong>
                {formatDate(date)}
              </strong>

              <span>
                {date}
              </span>

            </div>

            <button
              type="button"
              className="btn"
              onClick={nextDay}
              disabled={loading}
            >
              Next →
            </button>

          </div>

          {/* TODAY BUTTON */}

          <div className="panchang-today">

            <button
              type="button"
              className="btn secondary"
              onClick={today}
              disabled={
                date ===
                getTodayIndia()
              }
            >
              Today
            </button>

          </div>

          {/* =========================
              LOADING
          ========================== */}

          {loading && (
            <div className="panchang-loading">

              <div className="panchang-spinner">
                ⟳
              </div>

              <h2>
                పంచాంగం సిద్ధమవుతోంది
              </h2>

              <p>
                Preparing Panchangam...
              </p>

            </div>
          )}

          {/* =========================
              ERROR
          ========================== */}

          {!loading && error && (
            <div className="calendar-error">

              <h2>
                Panchangam unavailable
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setData(null)
                  setDate(
                    date
                  )
                }}
              >
                Try Again
              </button>

            </div>
          )}

          {/* =========================
              PANCHANG DATA
          ========================== */}

          {!loading &&
            !error &&
            data && (
              <>

                {/* =====================
                    BASIC DETAILS
                ====================== */}

                <section className="panchang-section">

                  <div className="panchang-section-heading">

                    <span>
                      🪔
                    </span>

                    <div>

                      <h2>
                        పంచాంగ వివరాలు
                      </h2>

                      <p>
                        Panchang Details
                      </p>

                    </div>

                  </div>

                  <div className="panchang-grid">

                    {/* TITHI */}

                    <article className="panchang-card">

                      <span className="panchang-icon">
                        🌙
                      </span>

                      <span className="panchang-label">
                        తిథి
                      </span>

                      <strong>
                        {telugu(
                          data.tithi
                        )}
                      </strong>

                      <small>
                        {data.tithi ||
                          '--'}
                      </small>

                    </article>

                    {/* NAKSHATRA */}

                    <article className="panchang-card">

                      <span className="panchang-icon">
                        ⭐
                      </span>

                      <span className="panchang-label">
                        నక్షత్రం
                      </span>

                      <strong>
                        {telugu(
                          data.nakshatra
                        )}
                      </strong>

                      <small>
                        {data.nakshatra ||
                          '--'}
                      </small>

                    </article>

                    {/* VARA */}

                    <article className="panchang-card">

                      <span className="panchang-icon">
                        📅
                      </span>

                      <span className="panchang-label">
                        వారం
                      </span>

                      <strong>
                        {telugu(
                          getWeekday(
                            data.panchang_date
                          )
                        )}
                      </strong>

                      <small>
                        {getWeekday(
                          data.panchang_date
                        )}
                      </small>

                    </article>

                    {/* PAKSHA */}

                    <article className="panchang-card">

                      <span className="panchang-icon">
                        🌓
                      </span>

                      <span className="panchang-label">
                        పక్షం
                      </span>

                      <strong>
                        {telugu(
                          data.paksha
                        )}
                      </strong>

                      <small>
                        {data.paksha ||
                          '--'}
                      </small>

                    </article>

                    {/* YOGA */}

                    <article className="panchang-card">

                      <span className="panchang-icon">
                        🕉️
                      </span>

                      <span className="panchang-label">
                        యోగం
                      </span>

                      <strong>
                        {telugu(
                          data.yoga
                        )}
                      </strong>

                      <small>
                        {data.yoga ||
                          '--'}
                      </small>

                    </article>

                    {/* KARANA */}

                    <article className="panchang-card">

                      <span className="panchang-icon">
                        🔱
                      </span>

                      <span className="panchang-label">
                        కరణం
                      </span>

                      <strong>
                        {telugu(
                          data.karana
                        )}
                      </strong>

                      <small>
                        {data.karana ||
                          '--'}
                      </small>

                    </article>

                  </div>

                </section>

                {/* =====================
                    SUN & MOON
                ====================== */}

                <section className="panchang-section">

                  <div className="panchang-section-heading">

                    <span>
                      ☀️
                    </span>

                    <div>

                      <h2>
                        సూర్య చంద్ర సమయాలు
                      </h2>

                      <p>
                        Sun &amp; Moon Timings
                      </p>

                    </div>

                  </div>

                  <div className="timing-grid">

                    {/* SUNRISE */}

                    <div className="timing-card">

                      <span>
                        🌅
                      </span>

                      <div>

                        <small>
                          సూర్యోదయం
                        </small>

                        <strong>
                          {formatTime(
                            data.sunrise
                          )}
                        </strong>

                        <em>
                          Sunrise
                        </em>

                      </div>

                    </div>

                    {/* SUNSET */}

                    <div className="timing-card">

                      <span>
                        🌇
                      </span>

                      <div>

                        <small>
                          సూర్యాస్తమయం
                        </small>

                        <strong>
                          {formatTime(
                            data.sunset
                          )}
                        </strong>

                        <em>
                          Sunset
                        </em>

                      </div>

                    </div>

                    {/* MOONRISE */}

                    <div className="timing-card">

                      <span>
                        🌙
                      </span>

                      <div>

                        <small>
                          చంద్రోదయం
                        </small>

                        <strong>
                          {formatTime(
                            data.moonrise
                          )}
                        </strong>

                        <em>
                          Moonrise
                        </em>

                      </div>

                    </div>

                    {/* MOONSET */}

                    <div className="timing-card">

                      <span>
                        🌘
                      </span>

                      <div>

                        <small>
                          చంద్రాస్తమయం
                        </small>

                        <strong>
                          {formatTime(
                            data.moonset
                          )}
                        </strong>

                        <em>
                          Moonset
                        </em>

                      </div>

                    </div>

                  </div>

                </section>

                {/* =====================
                    IMPORTANT TIMINGS
                ====================== */}

                <section className="panchang-section">

                  <div className="panchang-section-heading">

                    <span>
                      ⏰
                    </span>

                    <div>

                      <h2>
                        ముఖ్యమైన కాలాలు
                      </h2>

                      <p>
                        Important Timings
                      </p>

                    </div>

                  </div>

                  <div className="period-grid">

                    {/* RAHU */}

                    <div className="period-card danger">

                      <div>

                        <span>
                          ⚠️
                        </span>

                        <div>

                          <strong>
                            రాహుకాలం
                          </strong>

                          <small>
                            Rahu Kalam
                          </small>

                        </div>

                      </div>

                      <TimeRange
                        start={
                          data.rahu_kalam_start
                        }
                        end={
                          data.rahu_kalam_end
                        }
                      />

                    </div>

                    {/* YAMAGANDAM */}

                    <div className="period-card danger">

                      <div>

                        <span>
                          ⚠️
                        </span>

                        <div>

                          <strong>
                            యమగండం
                          </strong>

                          <small>
                            Yamagandam
                          </small>

                        </div>

                      </div>

                      <TimeRange
                        start={
                          data.yamagandam_start
                        }
                        end={
                          data.yamagandam_end
                        }
                      />

                    </div>

                    {/* GULIKA */}

                    <div className="period-card warning">

                      <div>

                        <span>
                          🕯️
                        </span>

                        <div>

                          <strong>
                            గుళిక కాలం
                          </strong>

                          <small>
                            Gulika Kalam
                          </small>

                        </div>

                      </div>

                      <TimeRange
                        start={
                          data.gulika_start
                        }
                        end={
                          data.gulika_end
                        }
                      />

                    </div>

                    {/* ABHIJIT */}

                    <div className="period-card good">

                      <div>

                        <span>
                          ✨
                        </span>

                        <div>

                          <strong>
                            అభిజిత్ ముహూర్తం
                          </strong>

                          <small>
                            Abhijit Muhurta
                          </small>

                        </div>

                      </div>

                      <TimeRange
                        start={
                          data.abhijit_start
                        }
                        end={
                          data.abhijit_end
                        }
                      />

                    </div>

                    {/* DUR MUHURTAM */}

                    <div className="period-card warning">

                      <div>

                        <span>
                          🚫
                        </span>

                        <div>

                          <strong>
                            దుర్ముహూర్తం
                          </strong>

                          <small>
                            Dur Muhurta
                          </small>

                        </div>

                      </div>

                      <TimeRange
                        start={
                          data.dur_muhurtham_start
                        }
                        end={
                          data.dur_muhurtham_end
                        }
                      />

                    </div>

                    {/* VARJYAM */}

                    <div className="period-card warning">

                      <div>

                        <span>
                          ⚠️
                        </span>

                        <div>

                          <strong>
                            వర్జ్యం
                          </strong>

                          <small>
                            Varjyam
                          </small>

                        </div>

                      </div>

                      <TimeRange
                        start={
                          data.varjyam_start
                        }
                        end={
                          data.varjyam_end
                        }
                      />

                    </div>

                  </div>

                </section>

                {/* =====================
                    ADDITIONAL DETAILS
                ====================== */}

                <section className="panchang-section">

                  <div className="panchang-section-heading">

                    <span>
                      📜
                    </span>

                    <div>

                      <h2>
                        ఇతర వివరాలు
                      </h2>

                      <p>
                        Additional Details
                      </p>

                    </div>

                  </div>

                  <div className="additional-grid">

                    {/* MASA */}

                    <div>

                      <small>
                        మాసం / Masa
                      </small>

                      <strong>
                        {
                          data.raw_data
                            ?.masa?.name ||
                          '--'
                        }
                      </strong>

                    </div>

                    {/* RITU */}

                    <div>

                      <small>
                        ఋతువు / Ritu
                      </small>

                      <strong>
                        {
                          data.raw_data
                            ?.ritu ||
                          '--'
                        }
                      </strong>

                    </div>

                    {/* AYANA */}

                    <div>

                      <small>
                        అయనం / Ayana
                      </small>

                      <strong>
                        {
                          data.raw_data
                            ?.ayana ||
                          '--'
                        }
                      </strong>

                    </div>

                    {/* MOON RASHI */}

                    <div>

                      <small>
                        చంద్ర రాశి / Moon Rashi
                      </small>

                      <strong>
                        {
                          data.raw_data
                            ?.moonRashi
                            ?.name ||
                          '--'
                        }
                      </strong>

                    </div>

                    {/* SUN RASHI */}

                    <div>

                      <small>
                        సూర్య రాశి / Sun Rashi
                      </small>

                      <strong>
                        {
                          data.raw_data
                            ?.sunRashi
                            ?.name ||
                          '--'
                        }
                      </strong>

                    </div>

                    {/* SAMVATSARA */}

                    <div>

                      <small>
                        సంవత్సరం / Samvatsara
                      </small>

                      <strong>
                        {
                          data.raw_data
                            ?.samvat
                            ?.samvatsara ||
                          '--'
                        }
                      </strong>

                    </div>

                  </div>

                </section>

                {/* =====================
                    LOCATION
                ====================== */}

                <div className="panchang-source">

                  <span>
                    📍
                  </span>

                  <div>

                    <strong>
                      Charalavandlapalli
                    </strong>

                    <p>
                      Panchangam calculated
                      specifically for our
                      village location.
                    </p>

                  </div>

                </div>

              </>
            )}

        </div>

      </section>

    </main>
  )
}