import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { graphql, Link } from 'gatsby'
import Layout from '../components/Layout'
import Content, { HTMLContent } from '../components/Content'
import PreviewCompatibleImage from '../components/PreviewCompatibleImage'

export const ArtPostTemplate = ({
  content,
  contentComponent,
  description,
  title,
  helmet,
  date,
  featuredimage,
}) => {
  const PostContent = contentComponent || Content

  return (
    <div>
      {helmet || ''}
      <div>
        <Link to="/art">← back to art archive</Link>
      </div>
      <h1>{title}</h1>
      <div className="date">created: {date}</div>
      
      {featuredimage && (
        <div className="artwork" style={{ margin: '20px 0', textAlign: 'center' }}>
          <PreviewCompatibleImage
            imageInfo={{
              image: featuredimage,
              alt: `artwork for ${title}`,
              style: { border: '1px solid #000', maxWidth: '100%' }
            }}
          />
        </div>
      )}
      
      <div className="info" style={{ margin: '20px 0', lineHeight: 1.5 }}>
        <p>{description}</p>
        <PostContent content={content} />
      </div>
    </div>
  )
}

ArtPostTemplate.propTypes = {
  content: PropTypes.node.isRequired,
  contentComponent: PropTypes.func,
  description: PropTypes.string,
  title: PropTypes.string,
  helmet: PropTypes.object,
}

const ArtPost = ({ data }) => {
  const { markdownRemark: post } = data

  return (
    <Layout>
      <ArtPostTemplate
        content={post.html}
        contentComponent={HTMLContent}
        description={post.frontmatter.description}
        helmet={
          <Helmet titleTemplate="%s | Art Archive">
            <title>{`${post.frontmatter.title}`}</title>
            <meta
              name="description"
              content={`${post.frontmatter.description}`}
            />
          </Helmet>
        }
        title={post.frontmatter.title}
        date={post.frontmatter.date}
        featuredimage={post.frontmatter.featuredimage}
      />
    </Layout>
  )
}

ArtPost.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.object,
  }),
}

export default ArtPost

export const pageQuery = graphql`
  query ArtPostByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      frontmatter {
        date(formatString: "DD.MM.YYYY")
        title
        description
        featuredimage {
          childImageSharp {
            fluid(maxWidth: 800, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`