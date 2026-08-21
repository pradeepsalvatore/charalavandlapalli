import { NextResponse } from 'next/server'
import {
  Observer,
  getPanchangam,
} from '@ishubhamx/panchangam-js'

import { createAdminClient } from '@/lib/supabase/admin'

const VILLAGE_NAME = 'Charalavandlapalli'

const LATITUDE = 13.618901370867585
const LONGITUDE = 78.71990079068708

const TIMEZONE = 'Asia/Kolkata'
const TIMEZONE_OFFSET = 330

function getIndiaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function getRequestedDate(value: string | null) {
  if (!value) {
    return getIndiaDate()
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      'Invalid date. Use YYYY-MM-DD.'
    )
  }

  return value
}

function getCalculationDate(
  dateString: string
) {
  const [year, month, day] =
    dateString.split('-').map(Number)

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      0,
      0,
      0
    )
  )
}

function toTime(
  value: string | undefined
) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }
  ).format(new Date(value))
}

function getCurrentItem<T extends {
  startTime: string
  endTime: string
}>(
  items: T[] | undefined,
  date: Date
) {
  if (!items?.length) {
    return undefined
  }

  return (
    items.find((item) => {
      const start = new Date(
        item.startTime
      )

      const end = new Date(
        item.endTime
      )

      return (
        date >= start &&
        date <= end
      )
    }) || items[0]
  )
}

export async function GET(
  request: Request
) {
  try {
    const url = new URL(request.url)

    const dateString =
      getRequestedDate(
        url.searchParams.get('date')
      )

    const calculationDate =
      getCalculationDate(
        dateString
      )

    const supabase =
      createAdminClient()

    /*
     * 1. Check cache first.
     */

    const {
      data: existing,
      error: readError,
    } = await supabase
      .from('daily_panchang')
      .select('*')
      .eq(
        'panchang_date',
        dateString
      )
      .maybeSingle()

    if (readError) {
      console.error(
        'Panchang cache read error:',
        readError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to read Panchangam data.',
          details:
            readError.message,
        },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: existing,
      })
    }

    /*
     * 2. Calculate Panchangam.
     */

    const observer = new Observer(
      LATITUDE,
      LONGITUDE,
      0
    )

    const panchangam =
      getPanchangam(
        calculationDate,
        observer,
        {
          timezoneOffset:
            TIMEZONE_OFFSET,
        }
      )

    /*
     * 3. Find current Panchang values.
     */

    const currentTithi =
      getCurrentItem(
        panchangam.tithis,
        calculationDate
      )

    const currentNakshatra =
      getCurrentItem(
        panchangam.nakshatras,
        calculationDate
      )

    const currentYoga =
      getCurrentItem(
        panchangam.yogas,
        calculationDate
      )

    const currentKarana =
      getCurrentItem(
        panchangam.karanas,
        calculationDate
      )

    /*
     * 4. Build database record.
     */

    const row = {
      panchang_date:
        dateString,

      village_name:
        VILLAGE_NAME,

      latitude:
        LATITUDE,

      longitude:
        LONGITUDE,

      timezone:
        TIMEZONE,

      vara:
        panchangam.vara !== undefined
          ? String(
              panchangam.vara
            )
          : null,

      vara_te:
        null,

      tithi:
        currentTithi?.name ||
        null,

      tithi_te:
        null,

      paksha:
        panchangam.paksha ||
        null,

      paksha_te:
        null,

      nakshatra:
        currentNakshatra?.name ||
        null,

      nakshatra_te:
        null,

      yoga:
        currentYoga?.name ||
        null,

      yoga_te:
        null,

      karana:
        currentKarana?.name ||
        null,

      karana_te:
        null,

      sunrise:
        toTime(
          panchangam.sunrise
        ),

      sunset:
        toTime(
          panchangam.sunset
        ),

      moonrise:
        toTime(
          panchangam.moonrise
        ),

      moonset:
        toTime(
          panchangam.moonset
        ),

      rahu_kalam_start:
        toTime(
          panchangam.rahuKalamStart
        ),

      rahu_kalam_end:
        toTime(
          panchangam.rahuKalamEnd
        ),

      yamagandam_start:
        toTime(
          panchangam
            .yamagandaKalam
            ?.start
        ),

      yamagandam_end:
        toTime(
          panchangam
            .yamagandaKalam
            ?.end
        ),

      gulika_start:
        toTime(
          panchangam
            .gulikaKalam
            ?.start
        ),

      gulika_end:
        toTime(
          panchangam
            .gulikaKalam
            ?.end
        ),

      abhijit_start:
        toTime(
          panchangam
            .abhijitMuhurta
            ?.start
        ),

      abhijit_end:
        toTime(
          panchangam
            .abhijitMuhurta
            ?.end
        ),

      dur_muhurtham_start:
        toTime(
          panchangam
            .durMuhurta?.[0]
            ?.start
        ),

      dur_muhurtham_end:
        toTime(
          panchangam
            .durMuhurta?.[0]
            ?.end
        ),

      varjyam_start:
        toTime(
          panchangam
            .varjyam?.[0]
            ?.start
        ),

      varjyam_end:
        toTime(
          panchangam
            .varjyam?.[0]
            ?.end
        ),

      good_muhurthams: {
        abhijit:
          panchangam
            .abhijitMuhurta ||
          null,

        amrit:
          panchangam
            .amritKalam ||
          [],

        govardhan:
          panchangam
            .govardhanMuhurta ||
          null,
      },

      festivals:
        panchangam.festivals ||
        [],

      source:
        'panchangam-js',

      raw_data:
        panchangam,

      updated_at:
        new Date().toISOString(),
    }

    /*
     * 5. Save to Supabase.
     */

    const {
      data: saved,
      error: insertError,
    } = await supabase
      .from('daily_panchang')
      .insert(row)
      .select()
      .single()

    if (insertError) {
      /*
       * Another request may have
       * created the same date.
       */

      if (
        insertError.code ===
        '23505'
      ) {
        const {
          data: concurrent,
          error:
            concurrentError,
        } = await supabase
          .from('daily_panchang')
          .select('*')
          .eq(
            'panchang_date',
            dateString
          )
          .single()

        if (
          concurrentError ||
          !concurrent
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Panchangam was calculated but could not be retrieved.',
            },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          source: 'database',
          data: concurrent,
        })
      }

      console.error(
        'Panchang insert error:',
        insertError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to save Panchangam.',
          details:
            insertError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      source: 'calculated',
      data: saved,
    })
  } catch (error) {
    console.error(
      'Panchang API error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    )
  }
}