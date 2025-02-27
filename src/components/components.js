import React from 'react'
import { Helmet } from 'react-helmet'
import './all.sass'
import './early2000s.css'
import useSiteMetadata from './SiteMetadata'
import { Link } from 'gatsby'

const TemplateWrapper = ({ children }) => {
  const { title, description } = useSiteMetadata()
  return (
    <div>
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className="container">
        <h1>ART ARCHIVE</h1>
        <div className="subtitle">personal collection of works / updated irregularly</div>
        
        <div style={{ marginBottom: '20px' }}>
          <Link to="/">home</Link> | 
          <Link to="/art"> art</Link> | 
          <Link to="/photos"> photos</Link> | 
          <Link to="/journal"> journal</Link> | 
          <Link to="/cat"> cat</Link> | 
          <Link to="/about"> about</Link>
        </div>
        
        {children}
        
        <div className="guestbook-button">
          <Link to="/guestbook">Sign My Guestbook!</Link>
        </div>
        
        <div className="footer">
          last updated: {new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '.')} | no images loaded = faster browsing<br />
          visitors since 2024: {Math.floor(Math.random() * 1000) + 500}<br />
          <Link to="/guestbook">guestbook</Link> | 
          <Link to="/about">about</Link> | 
          <a href="mailto:artist@example.com">contact</a>
        </div>
      </div>
    </div>
  )
}

export default TemplateWrapper