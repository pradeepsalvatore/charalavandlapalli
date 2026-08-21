'use client'

import { useState } from 'react'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="container nav">
          <a href="#home" className="brand">
            <span className="brand-mark">C</span>

            <span>
              <strong>Charalavandlapalli</strong>
              <small>Village Community</small>
            </span>
          </a>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <nav className={menuOpen ? 'open' : ''}>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="/events">Events</a>
            <a href="#gallery">Gallery</a>
            <a href="#updates">Updates</a>
            <a href="#community">Community</a>

            <a href="/register" className="nav-cta">
              Join Community
            </a>
          </nav>
        </div>
      </header>

      <main id="home">

        {/* HERO */}
        <section className="hero">
          <div className="hero-content container">
            <span className="eyebrow">
              OUR VILLAGE • OUR PEOPLE • OUR FUTURE
            </span>

            <h1>
              Welcome to
              <br />
              <span>Charalavandlapalli</span>
            </h1>

            <p>
              A digital home for our village — bringing people,
              memories, events and community opportunities together.
            </p>

            <div className="hero-actions">
              <a href="/register" className="btn primary">
                Join Our Community
              </a>

              <a href="/events" className="btn ghost">
                Explore Events
              </a>
            </div>
          </div>

          <div className="hero-scroll">
            Scroll to explore ↓
          </div>
        </section>

        {/* COMMUNITY STRIP */}
        <section className="stats">
          <div className="container stats-grid">
            <div>
              <strong>Community</strong>
              <span>Connecting our people</span>
            </div>

            <div>
              <strong>Events</strong>
              <span>Celebrating together</span>
            </div>

            <div>
              <strong>Memories</strong>
              <span>Preserving our moments</span>
            </div>

            <div>
              <strong>Support</strong>
              <span>Helping one another</span>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section" id="about">
          <div className="container two-col">

            <div>
              <span className="section-label">
                ABOUT OUR VILLAGE
              </span>

              <h2>
                A place we proudly call home.
              </h2>

              <p>
                Charalavandlapalli is more than a place on the map.
                It is our families, traditions, festivals,
                friendships and shared memories.
              </p>

              <p>
                This community portal is being created to keep
                our village connected — today and for future
                generations.
              </p>

              <a href="/register" className="text-link">
                Become a registered member →
              </a>
            </div>

            <div className="about-card">
              <div className="card-icon">⌂</div>

              <h3>Our Community</h3>

              <p>
                One place for village news, events, members,
                photographs, opportunities and community support.
              </p>

              <div className="mini-list">
                <span>✓ Village updates</span>
                <span>✓ Event calendar</span>
                <span>✓ Member directory</span>
                <span>✓ Community help</span>
              </div>
            </div>

          </div>
        </section>

        {/* EVENTS */}
        <section className="section soft" id="events">
          <div className="container">

            <div className="section-head">
              <div>
                <span className="section-label">
                  WHAT'S HAPPENING
                </span>

                <h2>Upcoming events</h2>
              </div>

              <a href="/events" className="text-link">
                View calendar →
              </a>
            </div>

            <div className="cards three">

              <article className="event-card">
                <div className="date">
                  <b>28</b>
                  <span>AUG</span>
                </div>

                <div>
                  <span className="tag festival">
                    FESTIVAL
                  </span>

                  <h3>Village Festival</h3>

                  <p>
                    Community celebration and cultural activities.
                  </p>

                  <small>
                    📍 Village Community Grounds
                  </small>
                </div>
              </article>

              <article className="event-card">
                <div className="date">
                  <b>30</b>
                  <span>AUG</span>
                </div>

                <div>
                  <span className="tag community">
                    COMMUNITY
                  </span>

                  <h3>Village Clean-up Drive</h3>

                  <p>
                    Let's work together to keep our village clean.
                  </p>

                  <small>
                    🕖 7:00 AM • Main Road
                  </small>
                </div>
              </article>

              <article className="event-card">
                <div className="date">
                  <b>05</b>
                  <span>SEP</span>
                </div>

                <div>
                  <span className="tag sports">
                    ACTIVITY
                  </span>

                  <h3>Community Sports Day</h3>

                  <p>
                    Games and activities for children and adults.
                  </p>

                  <small>
                    📍 Village Ground
                  </small>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="section" id="gallery">
          <div className="container">

            <div className="section-head">
              <div>
                <span className="section-label">
                  OUR MEMORIES
                </span>

                <h2>Village gallery</h2>
              </div>

              <a href="/gallery" className="text-link">
                View all albums →
              </a>
            </div>

            <div className="gallery-grid">

              <div className="photo p1">
                <span>Village Festival</span>
              </div>

              <div className="photo p2">
                <span>Community Celebration</span>
              </div>

              <div className="photo p3">
                <span>Village Life</span>
              </div>

              <div className="photo p4">
                <span>Temple Event</span>
              </div>

              <div className="photo p5">
                <span>Sports Day</span>
              </div>

            </div>

            <p className="gallery-note">
              Community photographs will be organized by event
              and album.
            </p>

          </div>
        </section>

        {/* UPDATES */}
        <section className="section soft" id="updates">
          <div className="container two-col">

            <div>
              <span className="section-label">
                VILLAGE NEWS
              </span>

              <h2>Latest updates</h2>

              <div className="updates">

                <article>
                  <span>21 AUG 2026</span>

                  <h3>
                    Welcome to the new village community portal
                  </h3>

                  <p>
                    We are building a digital space to keep
                    Charalavandlapalli connected.
                  </p>
                </article>

                <article>
                  <span>20 AUG 2026</span>

                  <h3>
                    Community participation
                  </h3>

                  <p>
                    Register as a member and help us build a
                    useful village directory.
                  </p>
                </article>

                <article>
                  <span>18 AUG 2026</span>

                  <h3>
                    Share village events
                  </h3>

                  <p>
                    Future events and announcements will be
                    published here.
                  </p>
                </article>

              </div>
            </div>

            {/* BIRTHDAYS */}
            <div>
              <span className="section-label">
                COMMUNITY MOMENTS
              </span>

              <h2>Birthdays & celebrations</h2>

              <div className="birthday-box">
                <div className="cake">🎂</div>

                <div>
                  <strong>Today's birthdays</strong>

                  <p>
                    Member birthdays will appear here
                    automatically.
                  </p>
                </div>
              </div>

              <div className="birthday-box">
                <div className="cake">🎉</div>

                <div>
                  <strong>Festivals & special days</strong>

                  <p>
                    Keep track of village celebrations
                    throughout the year.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* COMMUNITY */}
        <section className="section" id="community">
          <div className="container">

            <div className="center-head">
              <span className="section-label">
                COMMUNITY FIRST
              </span>

              <h2>
                How we can help each other
              </h2>

              <p>
                Use the portal to find opportunities, request
                help and contribute your skills.
              </p>
            </div>

            <div className="cards three">

              <article className="feature">
                <div className="feature-icon">🤝</div>

                <h3>Community Help</h3>

                <p>
                  Ask for or offer help with local needs,
                  services and support.
                </p>

                <a href="/community">
                  Submit a request →
                </a>
              </article>

              <article className="feature">
                <div className="feature-icon">💼</div>

                <h3>Jobs & Opportunities</h3>

                <p>
                  Share local job openings, recruitment needs
                  and useful opportunities.
                </p>

                <a href="/opportunities">
                  View opportunities →
                </a>
              </article>

              <article className="feature">
                <div className="feature-icon">🌱</div>

                <h3>Volunteer</h3>

                <p>
                  Join village activities, education and
                  community initiatives.
                </p>

                <a href="/opportunities">
                  Become a volunteer →
                </a>
              </article>

            </div>
          </div>
        </section>

        {/* REGISTER CTA */}
        <section className="register-section">
          <div className="container register-box">

            <div>
              <span className="section-label">
                JOIN US
              </span>

              <h2>
                Become part of the community.
              </h2>

              <p>
                Register your profile so we can build a trusted
                directory of Charalavandlapalli residents and
                well-wishers.
              </p>
            </div>

            <div>
              <a href="/register" className="btn dark">
                Register as a Member →
              </a>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer>
        <div className="container footer-grid">

          <div>
            <div className="brand footer-brand">
              <span className="brand-mark">C</span>

              <span>
                <strong>Charalavandlapalli</strong>
                <small>Village Community</small>
              </span>
            </div>

            <p>
              Connecting our village, preserving our memories
              and building our future together.
            </p>
          </div>

          <div>
            <strong>Explore</strong>
            <a href="#about">About</a>
            <a href="/events">Events</a>
            <a href="#gallery">Gallery</a>
          </div>

          <div>
            <strong>Community</strong>
            <a href="/register">Register</a>
            <a href="/community">Community Help</a>
            <a href="/contact">Contact</a>
          </div>

        </div>

        <div className="copyright">
          © 2026 Charalavandlapalli Village Community.
          Built for the community.
        </div>
      </footer>
    </>
  )
}