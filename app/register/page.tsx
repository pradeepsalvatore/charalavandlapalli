'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [occupation, setOccupation] = useState('')
  const [education, setEducation] = useState('')
  const [skills, setSkills] = useState('')
  const [villageArea, setVillageArea] = useState('')
  const [address, setAddress] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters long.'
      )
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          occupation: occupation || null,
          education: education || null,
          skills: skills || null,
          village_area: villageArea || null,
          address: address || null,
        },
      },
    })

    if (error) {
      console.error('Registration error:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError(
        'Registration could not be completed. Please try again.'
      )
      setLoading(false)
      return
    }

    if (data.session) {
      setSuccess(
        'Registration successful! Your membership is now pending administrator approval.'
      )
    } else {
      setSuccess(
        'Registration successful! Please check your email to confirm your account. Your membership will be reviewed by the administrator.'
      )
    }

    setLoading(false)
  }

  return (
    <main className="register-page">

      <section className="register-hero">
        <div className="container">

          <span className="section-label">
            JOIN OUR COMMUNITY
          </span>

          <h1>
            Become a member
          </h1>

          <p>
            Register with the Charalavandlapalli community
            and stay connected with village events,
            updates and opportunities.
          </p>

        </div>
      </section>

      <section className="section">

        <div className="container">

          <div className="register-form-wrapper">

            <div className="register-intro">

              <span className="section-label">
                MEMBER REGISTRATION
              </span>

              <h2>
                Tell us about yourself
              </h2>

              <p>
                Your registration will be reviewed by a
                community administrator before your profile
                becomes publicly visible.
              </p>

            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {success && (
              <div className="form-success">
                {success}
              </div>
            )}

            {!success && (
              <form
                onSubmit={handleSubmit}
                className="member-form"
              >

                {/* BASIC INFORMATION */}

                <div className="form-section">

                  <h3>
                    Basic information
                  </h3>

                  <div className="form-grid">

                    <div className="form-field full">
                      <label htmlFor="fullName">
                        Full Name *
                      </label>

                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="email">
                        Email *
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        required
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="phone">
                        Mobile Number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        placeholder="10 digit mobile number"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="dateOfBirth">
                        Date of Birth
                      </label>

                      <input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) =>
                          setDateOfBirth(e.target.value)
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="gender">
                        Gender
                      </label>

                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) =>
                          setGender(e.target.value)
                        }
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="male">
                          Male
                        </option>

                        <option value="female">
                          Female
                        </option>

                        <option value="other">
                          Other
                        </option>

                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* ACCOUNT */}

                <div className="form-section">

                  <h3>
                    Account
                  </h3>

                  <div className="form-grid">

                    <div className="form-field full">

                      <label htmlFor="password">
                        Password *
                      </label>

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                      />

                      <small>
                        Your password is securely handled by
                        Supabase Authentication.
                      </small>

                    </div>

                  </div>

                </div>

                {/* PROFESSIONAL */}

                <div className="form-section">

                  <h3>
                    Education & work
                  </h3>

                  <div className="form-grid">

                    <div className="form-field">
                      <label htmlFor="occupation">
                        Occupation
                      </label>

                      <input
                        id="occupation"
                        type="text"
                        value={occupation}
                        onChange={(e) =>
                          setOccupation(e.target.value)
                        }
                        placeholder="e.g. Teacher, Farmer, Engineer"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="education">
                        Education
                      </label>

                      <input
                        id="education"
                        type="text"
                        value={education}
                        onChange={(e) =>
                          setEducation(e.target.value)
                        }
                        placeholder="e.g. B.Tech, Degree"
                      />
                    </div>

                    <div className="form-field full">
                      <label htmlFor="skills">
                        Skills
                      </label>

                      <input
                        id="skills"
                        type="text"
                        value={skills}
                        onChange={(e) =>
                          setSkills(e.target.value)
                        }
                        placeholder="e.g. Farming, Teaching, IT, Plumbing"
                      />
                    </div>

                  </div>

                </div>

                {/* VILLAGE INFORMATION */}

                <div className="form-section">

                  <h3>
                    Village information
                  </h3>

                  <div className="form-grid">

                    <div className="form-field">

                      <label htmlFor="villageArea">
                        Village Area
                      </label>

                      <input
                        id="villageArea"
                        type="text"
                        value={villageArea}
                        onChange={(e) =>
                          setVillageArea(e.target.value)
                        }
                        placeholder="Area / Colony / Ward"
                      />

                    </div>

                    <div className="form-field full">

                      <label htmlFor="address">
                        Address
                      </label>

                      <textarea
                        id="address"
                        value={address}
                        onChange={(e) =>
                          setAddress(e.target.value)
                        }
                        rows={4}
                        placeholder="Enter your village address"
                      />

                    </div>

                  </div>

                </div>

                {/* PRIVACY */}

                <div className="privacy-note">

                  <strong>
                    Privacy
                  </strong>

                  <p>
                    Your profile will remain pending until
                    approved by a community administrator.
                    Phone number, email and date of birth
                    are private by default.
                  </p>

                </div>

                <button
                  type="submit"
                  className="btn primary register-submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Creating account...'
                    : 'Register as a Member →'}
                </button>

              </form>
            )}

          </div>

        </div>

      </section>

    </main>
  )
}