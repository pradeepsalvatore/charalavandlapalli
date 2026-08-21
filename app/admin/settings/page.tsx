'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type VillageSettings = {
  id: string
  village_name: string
  address: string | null
  post_office: string | null
  mandal: string | null
  district: string | null
  state: string | null
  country: string | null
  pincode: string | null
  latitude: number | null
  longitude: number | null
  google_maps_url: string | null
  contact_phone: string | null
  contact_email: string | null
}

const emptySettings: VillageSettings = {
  id: '',
  village_name: '',
  address: '',
  post_office: '',
  mandal: '',
  district: '',
  state: '',
  country: '',
  pincode: '',
  latitude: null,
  longitude: null,
  google_maps_url: '',
  contact_phone: '',
  contact_email: '',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<VillageSettings>(emptySettings)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      setError('')

      // Check logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError(
          'You must be logged in to access administrator settings.'
        )

        setLoading(false)
        return
      }

      // Check admin
      const { data: isAdmin, error: adminError } =
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

      if (!isAdmin) {
        setError(
          'Access denied. Administrator access is required.'
        )

        setLoading(false)
        return
      }

      setAuthorized(true)

      // Load village settings
      const { data, error: settingsError } =
        await supabase
          .from('village_settings')
          .select(`
            id,
            village_name,
            address,
            post_office,
            mandal,
            district,
            state,
            country,
            pincode,
            latitude,
            longitude,
            google_maps_url,
            contact_phone,
            contact_email
          `)
          .limit(1)
          .maybeSingle()

      if (settingsError) {
        console.error(
          'Village settings error:',
          settingsError
        )

        setError(
          `Unable to load village settings: ${settingsError.message}`
        )

        setLoading(false)
        return
      }

      if (data) {
        setSettings({
          ...emptySettings,
          ...data,
        })
      }

      setLoading(false)
    }

    loadSettings()
  }, [])

  function updateField(
    field: keyof VillageSettings,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }))

    setSuccess('')
    setError('')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    if (!settings.village_name.trim()) {
      setError('Village name is required.')
      setSaving(false)
      return
    }

    const latitude =
      settings.latitude === null ||
      settings.latitude === undefined ||
      Number.isNaN(Number(settings.latitude))
        ? null
        : Number(settings.latitude)

    const longitude =
      settings.longitude === null ||
      settings.longitude === undefined ||
      Number.isNaN(Number(settings.longitude))
        ? null
        : Number(settings.longitude)

    const payload = {
      village_name:
        settings.village_name.trim(),

      address:
        settings.address?.trim() || null,

      post_office:
        settings.post_office?.trim() || null,

      mandal:
        settings.mandal?.trim() || null,

      district:
        settings.district?.trim() || null,

      state:
        settings.state?.trim() || null,

      country:
        settings.country?.trim() || null,

      pincode:
        settings.pincode?.trim() || null,

      latitude,

      longitude,

      google_maps_url:
        settings.google_maps_url?.trim() || null,

      contact_phone:
        settings.contact_phone?.trim() || null,

      contact_email:
        settings.contact_email?.trim() || null,

      updated_at: new Date().toISOString(),
    }

    let result

    if (settings.id) {
      result = await supabase
        .from('village_settings')
        .update(payload)
        .eq('id', settings.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('village_settings')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      console.error(
        'Save village settings error:',
        result.error
      )

      setError(
        `Unable to save settings: ${result.error.message}`
      )

      setSaving(false)
      return
    }

    if (result.data) {
      setSettings({
        ...emptySettings,
        ...result.data,
      })
    }

    setSuccess(
      'Village information saved successfully.'
    )

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="admin-page">

        <section className="admin-hero">
          <div className="container">

            <span className="section-label">
              CHARALAVANDLAPALLI ADMIN
            </span>

            <h1>
              Village Settings
            </h1>

            <p>
              Loading village information...
            </p>

          </div>
        </section>

        <section className="section">
          <div className="container">

            <div className="admin-message">
              Loading settings...
            </div>

          </div>
        </section>

      </main>
    )
  }

  if (!authorized) {
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

  return (
    <main className="admin-page">

      {/* HERO */}

      <section className="admin-hero">
        <div className="container">

          <span className="section-label">
            CHARALAVANDLAPALLI ADMIN
          </span>

          <h1>
            Village Settings
          </h1>

          <p>
            Manage the official village address,
            location and contact information.
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
              className="admin-nav-link"
            >
              Gallery
            </Link>

            <Link
              href="/admin/settings"
              className="admin-nav-link active"
            >
              Settings
            </Link>

            <Link
              href="/"
              className="admin-nav-link"
            >
              Website
            </Link>

          </div>

          <div className="dashboard-heading">

            <span className="section-label">
              VILLAGE INFORMATION
            </span>

            <h2>
              Official village details
            </h2>

            <p>
              This information can be displayed
              throughout the public website.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              className="admin-message"
              style={{
                marginBottom: '20px',
              }}
            >
              {success}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="admin-form"
          >

            {/* BASIC INFORMATION */}

            <div className="admin-form-section">

              <h3>
                Basic Information
              </h3>

              <div className="form-field">

                <label htmlFor="village_name">
                  Village Name
                </label>

                <input
                  id="village_name"
                  type="text"
                  value={settings.village_name}
                  onChange={(event) =>
                    updateField(
                      'village_name',
                      event.target.value
                    )
                  }
                  placeholder="Charalavandlapalli"
                  required
                />

              </div>

              <div className="form-field">

                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  value={settings.address || ''}
                  onChange={(event) =>
                    updateField(
                      'address',
                      event.target.value
                    )
                  }
                  placeholder="Village address"
                  rows={3}
                />

              </div>

            </div>

            {/* LOCATION */}

            <div className="admin-form-section">

              <h3>
                Location
              </h3>

              <div className="form-grid">

                <div className="form-field">

                  <label htmlFor="post_office">
                    Post Office
                  </label>

                  <input
                    id="post_office"
                    type="text"
                    value={settings.post_office || ''}
                    onChange={(event) =>
                      updateField(
                        'post_office',
                        event.target.value
                      )
                    }
                    placeholder="Chintaparthi Post"
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="pincode">
                    PIN Code
                  </label>

                  <input
                    id="pincode"
                    type="text"
                    value={settings.pincode || ''}
                    onChange={(event) =>
                      updateField(
                        'pincode',
                        event.target.value
                      )
                    }
                    placeholder="517277"
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="mandal">
                    Mandal
                  </label>

                  <input
                    id="mandal"
                    type="text"
                    value={settings.mandal || ''}
                    onChange={(event) =>
                      updateField(
                        'mandal',
                        event.target.value
                      )
                    }
                    placeholder="Valmikipuram"
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="district">
                    District
                  </label>

                  <input
                    id="district"
                    type="text"
                    value={settings.district || ''}
                    onChange={(event) =>
                      updateField(
                        'district',
                        event.target.value
                      )
                    }
                    placeholder="Annamayya"
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    value={settings.state || ''}
                    onChange={(event) =>
                      updateField(
                        'state',
                        event.target.value
                      )
                    }
                    placeholder="Andhra Pradesh"
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="country">
                    Country
                  </label>

                  <input
                    id="country"
                    type="text"
                    value={settings.country || ''}
                    onChange={(event) =>
                      updateField(
                        'country',
                        event.target.value
                      )
                    }
                    placeholder="India"
                  />

                </div>

              </div>

            </div>

            {/* MAP */}

            <div className="admin-form-section">

              <h3>
                Map Location
              </h3>

              <p
                style={{
                  marginBottom: '20px',
                }}
              >
                Use the exact latitude and longitude
                of the village location.
              </p>

              <div className="form-grid">

                <div className="form-field">

                  <label htmlFor="latitude">
                    Latitude
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={
                      settings.latitude ?? ''
                    }
                    onChange={(event) =>
                      updateField(
                        'latitude',
                        event.target.value
                      )
                    }
                    placeholder="13.618901370867585"
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="longitude">
                    Longitude
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={
                      settings.longitude ?? ''
                    }
                    onChange={(event) =>
                      updateField(
                        'longitude',
                        event.target.value
                      )
                    }
                    placeholder="78.71990079068708"
                  />

                </div>

              </div>

              <div className="form-field">

                <label htmlFor="google_maps_url">
                  Google Maps URL
                </label>

                <input
                  id="google_maps_url"
                  type="url"
                  value={
                    settings.google_maps_url || ''
                  }
                  onChange={(event) =>
                    updateField(
                      'google_maps_url',
                      event.target.value
                    )
                  }
                  placeholder="https://maps.app.goo.gl/..."
                />

              </div>

            </div>

            {/* CONTACT */}

            <div className="admin-form-section">

              <h3>
                Contact Information
              </h3>

              <div className="form-grid">

                <div className="form-field">

                  <label htmlFor="contact_phone">
                    Contact Phone
                  </label>

                  <input
                    id="contact_phone"
                    type="tel"
                    value={
                      settings.contact_phone || ''
                    }
                    onChange={(event) =>
                      updateField(
                        'contact_phone',
                        event.target.value
                      )
                    }
                    placeholder="+91..."
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="contact_email">
                    Contact Email
                  </label>

                  <input
                    id="contact_email"
                    type="email"
                    value={
                      settings.contact_email || ''
                    }
                    onChange={(event) =>
                      updateField(
                        'contact_email',
                        event.target.value
                      )
                    }
                    placeholder="contact@example.com"
                  />

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginTop: '10px',
              }}
            >

              <button
                type="submit"
                className="btn primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save Village Information'}
              </button>

              <Link
                href="/admin"
                className="btn ghost"
              >
                Cancel
              </Link>

            </div>

          </form>

        </div>

      </section>

    </main>
  )
}