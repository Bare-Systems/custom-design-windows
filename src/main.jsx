import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BUSINESS, ROUTES, SERVICES, GALLERY, FAQ } from './data.js';
import './styles.css';

const BASE = import.meta.env.BASE_URL;
const phone = BUSINESS.phoneHref;
const emailHref = 'mailto:' + BUSINESS.email;
const linkTo = (path = '') => BASE + (path ? path + '/' : '');

function currentRoute(pathname = window.location.pathname) {
  const base = BASE.endsWith('/') ? BASE : BASE + '/';
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\/+/, '');
  const normalized = relative.replace(/\/index\.html$/, '').replace(/^\/+|\/+$/g, '');
  return ROUTES.some(route => route.path === normalized) ? normalized : 'not-found';
}

function Brand({ inverted = false }) {
  return <a className={'brand' + (inverted ? ' brand-inverted' : '')} href={linkTo()} aria-label="Custom Design Windows home">
    <svg className="brand-symbol" aria-hidden="true" viewBox="0 0 42 46" fill="none">
      <rect x="7" y="4" width="28" height="38" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M21 4v38M7 23h28" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 4c7 7 8 23 3 38H2V4m37 0c-7 7-8 23-3 38h4V4" fill="#b68f71"/>
    </svg>
    <span className="brand-lines"><strong>Custom Design</strong><span>W I N D O W S</span></span>
  </a>;
}

function Header({ path }) {
  const [isOpen, setOpen] = useState(false);
  return <>
    <div className="topbar">
      <div className="container topbar-content">
        <span>Fort Lauderdale, Florida <span className="topbar-separator">·</span> By appointment only</span>
        <div className="topbar-links"><a href={phone}>{BUSINESS.phone}</a><span className="topbar-separator">·</span><a href={emailHref}>Email us</a></div>
      </div>
    </div>
    <header className="site-header">
      <div className="container header-content">
        <Brand/>
        <button type="button" className="mobile-toggle" aria-expanded={isOpen}
          aria-controls="primary-navigation" onClick={() => setOpen(value => !value)}>
          <span aria-hidden="true">{isOpen ? '×' : '☰'}</span><span>{isOpen ? 'Close' : 'Menu'}</span>
        </button>
        <nav id="primary-navigation" className={'primary-nav' + (isOpen ? ' open' : '')} aria-label="Main navigation">
          {ROUTES.map(route => <a key={route.path} href={linkTo(route.path)}
            aria-current={path === route.path ? 'page' : undefined}>{route.label}</a>)}
          <a className="nav-consult" href={linkTo('contact')}>Free consultation <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  </>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Brand inverted/><p>Custom window fashions, designed around you. Proudly serving Broward County and South Florida.</p><span className="footer-year">Est. {BUSINESS.since}</span></div>
      <div><h3>Explore</h3><nav className="footer-links" aria-label="Footer navigation">
        {ROUTES.filter(route => route.path).map(route => <a key={route.path} href={linkTo(route.path)}>{route.label}</a>)}
      </nav></div>
      <div><h3>Visit & contact</h3><address>{BUSINESS.address.map((line, i) => <span key={i}>{line}</span>)}</address>
        <p className="footer-small">By appointment only</p>
        <a href={phone}>{BUSINESS.phone}</a><a href={emailHref}>{BUSINESS.email}</a>
      </div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Custom Design Windows</span><span>Made for thoughtful spaces.</span></div>
  </footer>;
}

function ButtonLink({ children, to = 'contact', outline = false }) {
  return <a className={'button-link' + (outline ? ' button-outline' : '')} href={linkTo(to)}>
    {children}<span aria-hidden="true">↗</span>
  </a>;
}

function SectionHeading({ eyebrow, title, copy, action, actionTo }) {
  return <div className="section-heading">
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{copy && <p className="heading-copy">{copy}</p>}</div>
    {action && <a className="text-link" href={linkTo(actionTo)}>{action} <span aria-hidden="true">↗</span></a>}
  </div>;
}

function Photo({ entry, className = '', eager = false }) {
  return <img className={className} src={entry.image} alt={entry.alt}
    loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer"/>;
}

function Home() {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Custom window fashions · Since 1984</p>
          <h1>Windows deserve a <em>personal touch.</em></h1>
          <p>Thoughtfully tailored draperies, shades, and interior details that feel right at home. Designed for your space, your light, and the way you live.</p>
          <div className="hero-actions"><ButtonLink>Schedule a consultation</ButtonLink><ButtonLink to="gallery" outline>Explore our work</ButtonLink></div>
          <div className="hero-note"><span className="note-line"/><span>Fort Lauderdale · Broward County · South Florida</span></div>
        </div>
        <div className="hero-image-wrap">
          <Photo entry={GALLERY[0]} className="hero-image" eager/>
          <div className="hero-image-caption"><span className="small-star">✳</span><span>Details make a room.</span></div>
        </div>
      </div>
    </section>
    <section className="statement-section">
      <div className="container statement-grid">
        <p className="eyebrow">What we believe</p>
        <p className="statement-text">The right window treatment does more than frame a view. It makes a room feel <em>complete.</em></p>
        <span className="statement-subtext">Personalized design. Quality workroom fabrication. Professional installation.</span>
      </div>
    </section>
    <section className="section-space services-section">
      <div className="container">
        <SectionHeading eyebrow="The collection" title="Designed for the way you live." copy="From subtle light filtering to beautiful statement drapery, every treatment starts with your space." action="See all treatments" actionTo="window-treatments"/>
        <div className="service-grid">
          {SERVICES.slice(0, 3).map((service, i) => <a key={service.title} className="service-card" href={linkTo('window-treatments')}>
            <div className={'service-art art-' + i} aria-hidden="true"><span className="art-window"><i/><i/></span></div>
            <div className="service-card-body"><span className="service-number">0{i+1} / Tailored design</span><h3>{service.title}</h3><p>{service.text}</p><span className="card-arrow">Explore <span aria-hidden="true">↗</span></span></div>
          </a>)}
        </div>
      </div>
    </section>
    <section className="about-teaser section-space">
      <div className="container about-teaser-grid">
        <div className="about-teaser-picture"><Photo entry={GALLERY[8]}/><span className="picture-tag">An eye for the details</span></div>
        <div className="about-teaser-copy"><p className="eyebrow">A little about us</p>
          <h2>Decades of experience. Always personal.</h2>
          <p>Since 1984, Dale Ellen Iarossi has brought an individual approach to custom window fashions. Working with professional workrooms and installers, she helps clients choose treatments that balance beauty with function.</p>
          <p>From a single room to a new home or a business interior, the process is shaped by your needs.</p>
          <ButtonLink to="about" outline>Meet Dale</ButtonLink>
        </div>
      </div>
    </section>
    <section className="section-space gallery-feature">
      <div className="container">
        <SectionHeading eyebrow="From the portfolio" title="A few favorite details." copy="A look at completed work from our original project gallery." action="Browse the gallery" actionTo="gallery"/>
        <div className="feature-gallery">
          {[GALLERY[1], GALLERY[4], GALLERY[6]].map((entry, index) => <a href={linkTo('gallery')} className="feature-photo" key={entry.image}>
            <Photo entry={entry}/><span>{String(index+1).padStart(2,'0')} &nbsp; {entry.title}</span>
          </a>)}
        </div>
      </div>
    </section>
    <ConsultBand/>
  </>;
}

function ConsultBand() {
  return <section className="consult-band"><div className="container consult-inner">
    <div><p className="eyebrow">Let's make something beautiful</p><h2>Every great space starts with a conversation.</h2>
      <p>Ask about a complimentary first-time, one-hour in-home consultation.</p></div>
    <ButtonLink>Get in touch</ButtonLink>
  </div></section>;
}

function PageIntro({eyebrow, title, text}) {
  return <section className="page-intro"><div className="container">
    <p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p>{text}</p>}
  </div></section>;
}

function About() {
  return <>
    <PageIntro eyebrow="The story" title="Good design is personal." text="A familiar face, decades of experience, and a passion for custom window fashions."/>
    <section className="section-space"><div className="container story-grid">
      <div className="story-image"><Photo entry={GALLERY[7]}/><span>Details shaped by experience.</span></div>
      <div className="story-copy"><p className="eyebrow">Meet the designer</p><h2>Dale Ellen Iarossi</h2>
        <p className="subtitle">{BUSINESS.credential}</p>
        <p>My work in custom window treatments began in Massachusetts, where I started my own studio in 1984. Now based in Fort Lauderdale, I continue to work closely with clients to create lasting window fashions for homes and businesses.</p>
        <p>Every project is an opportunity to understand a space: the quality of light, the materials, the finishes, and the way a room should feel. With access to professional fabrication and installation, I can bring those elements together in a practical, beautiful design.</p>
        <p>I value personal attention, careful workmanship, and relationships that last.</p>
        <ButtonLink>Discuss your project</ButtonLink>
      </div>
    </div></section>
    <section className="values-section"><div className="container values-grid">
      <div><span className="value-number">1984</span><p>In the window-treatment business since</p></div>
      <div><span className="value-number">1:1</span><p>Personal guidance throughout the process</p></div>
      <div><span className="value-number">WFCP</span><p>Window Fashion Certified Professional</p></div>
    </div></section>
    <ConsultBand/>
  </>;
}

function Treatments() {
  return <>
    <PageIntro eyebrow="What we do" title="Made for your windows. Made for you." text="Custom drapery, shades, top treatments, and finishing touches for residential and commercial spaces."/>
    <section className="section-space"><div className="container treatment-grid">
      {SERVICES.map((service, index) => <article className="treatment-row" key={service.title}>
        <div className="treatment-photo">
          <Photo entry={GALLERY[[4,9,5,8,3][index]]}/>
        </div>
        <div className="treatment-description"><span className="eyebrow">0{index + 1} / Our services</span>
          <h2>{service.title}</h2><h3>{service.subtitle}</h3>
          <p>{service.text}</p><p>{service.detail}</p>
          <a className="text-link" href={linkTo('contact')}>Ask about this service <span aria-hidden="true">↗</span></a>
        </div>
      </article>)}
    </div></section>
    <ConsultBand/>
  </>;
}

function Gallery() {
  const [filter,setFilter] = useState('All');
  const filters = ['All', ...new Set(GALLERY.map(item=>item.type))];
  const visible = filter === 'All' ? GALLERY : GALLERY.filter(item=>item.type === filter);
  return <>
    <PageIntro eyebrow="The portfolio" title="Every window tells a story." text="Selected photographs from our current project gallery, featuring different fabrics, rooms, and approaches to light."/>
    <section className="section-space gallery-page"><div className="container">
      <div className="gallery-filters" role="group" aria-label="Filter gallery photos">
        {filters.map(name => <button key={name} type="button" className={filter===name?'active':''} onClick={()=>setFilter(name)} aria-pressed={filter===name}>{name}</button>)}
      </div>
      <div className="gallery-grid">{visible.map(entry => <a key={entry.image} className="gallery-tile" href={entry.image} target="_blank" rel="noopener noreferrer" aria-label={'Open full-size photo: '+entry.title}>
        <Photo entry={entry}/>
        <div><span className="gallery-type">{entry.type}</span><h2>{entry.title}</h2><span aria-hidden="true">↗</span></div>
      </a>)}</div>
      <div className="gallery-note"><p>This starter imports a selection of the existing portfolio. The original website still hosts additional photographs, which should be copied into this repository before retiring its media service.</p>
        <a className="text-link" href="https://www.customdesignwindows.com/gallery" target="_blank" rel="noopener noreferrer">See the original gallery <span aria-hidden="true">↗</span></a>
      </div>
    </div></section>
    <ConsultBand/>
  </>;
}

function Reviews() {
  return <>
    <PageIntro eyebrow="Kind words" title="Relationships are part of the work." text="The trust behind a custom project matters as much as the final details."/>
    <section className="section-space"><div className="container reviews-layout">
      <div className="reviews-illustration"><span className="quote-symbol" aria-hidden="true">“</span><p>Thoughtful design. Personal attention. Quality work.</p></div>
      <div className="reviews-text"><h2>Client feedback</h2>
        <p>We are reviewing the testimonials from the original website before migrating them. No customer quotes are displayed here until their wording and attribution have been verified.</p>
        <a className="text-link" href="https://www.customdesignwindows.com/reviews" target="_blank" rel="noopener noreferrer">View feedback on the current site <span aria-hidden="true">↗</span></a>
        <p className="reviews-contact">Have a question about a project? <a href={linkTo('contact')}>Contact Dale directly.</a></p>
      </div>
    </div></section>
    <ConsultBand/>
  </>;
}

function FaqPage() {
  return <>
    <PageIntro eyebrow="A little guidance" title="Frequently asked questions." text="Answers to common questions about custom window treatments and getting started."/>
    <section className="section-space"><div className="container faq-layout">
      <div><p className="eyebrow">More questions?</p><h2>Happy to help.</h2>
        <p>Every home is different. A conversation is the best way to understand what will work for your space.</p>
        <ButtonLink>Talk with Dale</ButtonLink>
      </div>
      <div className="faq-list">{FAQ.map((item,i)=><details key={item.question} className="faq-item" open={i===0}>
        <summary><span>{String(i+1).padStart(2,'0')}</span>{item.question}<b aria-hidden="true">+</b></summary>
        <p>{item.answer}</p>
      </details>)}</div>
    </div></section>
    <ConsultBand/>
  </>;
}

function Contact() {
  const [prepared,setPrepared]=useState(false);
  function prepareEmail(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = 'Custom Design Windows — consultation request';
    const message = [
      'Hello Dale,',
      '',
      'I would like to discuss a window treatment project.',
      '',
      'Name: ' + form.get('name'),
      'Email: ' + form.get('email'),
      'Phone: ' + (form.get('phone') || 'Not provided'),
      '',
      'Project details:',
      form.get('message'),
    ].join('\n');
    setPrepared(true);
    window.location.href = emailHref + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);
  }
  return <>
    <PageIntro eyebrow="Say hello" title="Let's talk about your space." text="Request a consultation, ask a question, or tell us about a project you have in mind."/>
    <section className="section-space contact-section"><div className="container contact-grid">
      <div className="contact-info"><p className="eyebrow">Contact details</p><h2>We're here to help.</h2>
        <p>Personal design advice begins with understanding what you need. Call, email, or send a message from your email app.</p>
        <div className="contact-item"><span>Call</span><a href={phone}>{BUSINESS.phone}</a><small>{BUSINESS.phoneHours}</small></div>
        <div className="contact-item"><span>Email</span><a href={emailHref}>{BUSINESS.email}</a></div>
        <div className="contact-item"><span>Studio</span><address>{BUSINESS.address.map((line,i)=><span key={i}>{line}</span>)}</address><small>Visits by appointment only</small></div>
        <p className="contact-area">Proudly serving Broward County and the surrounding South Florida area.</p>
      </div>
      <div className="contact-card"><p className="eyebrow">Your next project</p><h2>Send an inquiry</h2>
        <p>Fill in the details below to compose a message in your email application.</p>
        <form onSubmit={prepareEmail}>
          <div className="contact-fields">
            <label>Name <input type="text" name="name" maxLength="100" autoComplete="name" required placeholder="Your name"/></label>
            <label>Email <input type="email" name="email" maxLength="150" autoComplete="email" required placeholder="you@example.com"/></label>
          </div>
          <label>Phone <input type="tel" name="phone" maxLength="50" autoComplete="tel" placeholder="Optional"/></label>
          <label>Tell us a little about your project <textarea name="message" maxLength="3000" rows="5" required placeholder="What space are you working on?"/></label>
          <button type="submit" className="button-link">Open email to send <span aria-hidden="true">↗</span></button>
          <p className="form-footnote">This starter has no form server. Your email app opens with the message filled in; you must press Send there. Nothing is stored on this site.</p>
          {prepared && <p role="status" className="form-status">Your email application should open. Please send the message there. If it doesn't, email {BUSINESS.email} directly.</p>}
        </form>
      </div>
    </div></section>
  </>;
}

function NotFound() {
  return <section className="notfound container"><p className="eyebrow">404 / Not found</p><h1>That page moved.</h1><p>Find your way back to Custom Design Windows.</p><ButtonLink to="">Return home</ButtonLink></section>;
}

function App() {
  const path=currentRoute();
  const views = {'':<Home/>,about:<About/>,'window-treatments':<Treatments/>,gallery:<Gallery/>,reviews:<Reviews/>,
    'custom-window-treatments-faq-fort-lauderdale-':<FaqPage/>,contact:<Contact/>};
  return <><a className="skip-link" href="#main-content">Skip to content</a>
    <Header path={path}/>
    <main id="main-content">{views[path] ?? <NotFound/>}</main>
    <Footer/>
    <a className="mobile-call" href={phone}>Call for a consultation <span aria-hidden="true">↗</span></a>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
