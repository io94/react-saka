import { useParams, Link, Navigate } from 'react-router-dom'
import { getTopicBySlug, getTreesForTopic } from '../data/topics.js'

// Vary tag font size by index to mimic a word cloud feel
const TAG_SIZES = ['text-2xl', 'text-lg', 'text-base', 'text-xl', 'text-sm', 'text-lg', 'text-2xl', 'text-base', 'text-xl', 'text-sm']

function TreeCard({ tree }) {
  const photo = tree.image || tree.images?.[0] || null
  return (
    <Link to={`/tree/${tree.id}`} className="group block">
      <div className="relative overflow-hidden bg-forest-900 mb-2" style={{ aspectRatio: '4/3' }}>
        {photo ? (
          <img
            src={photo}
            alt={tree.vernacular}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/saka-logo.svg" alt="Sacred Canopy" className="w-24 opacity-30" />
          </div>
        )}
        {/* Bottom label overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 px-3 py-2">
          <p className="text-white font-medium text-sm leading-tight">{tree.vernacular}</p>
          <p className="text-white/70 text-xs italic mt-0.5">{tree.species}</p>
        </div>
      </div>
    </Link>
  )
}

export default function TopicDetail() {
  const { slug } = useParams()
  const topic = getTopicBySlug(slug)

  if (!topic) return <Navigate to="/topics" replace />

  const matchedTrees = getTreesForTopic(topic)

  return (
    <div className="min-h-screen bg-white font-sans">

      <div
        className="w-full relative bg-center bg-cover"
        style={{ backgroundImage: `url(${topic.bannerImage})`, paddingTop: '4rem', paddingBottom: '4rem' }}
      >
        <div style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="bg-black/75 text-center px-4 py-4 mx-auto max-w-3xl">
            <h1 className="text-white font-bold leading-tight" style={{ fontSize: '3.5rem' }}>{topic.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6">
        <Link to="/topics" className="text-bark-400 hover:text-forest-700 text-sm flex items-center gap-1.5 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          All Topics
        </Link>
      </div>

      <div className="text-center my-6 border rounded p-4 mx-6 bg-sand-50">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
          {topic.tags.map((tag, i) => (
            <span
              key={tag}
              className={`${TAG_SIZES[i % TAG_SIZES.length]} font-medium text-forest-700 hover:text-forest-500 cursor-default leading-tight`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>


      {/* Gallery grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <p className="text-bark-400 text-sm mb-4">{matchedTrees.length} {matchedTrees.length === 1 ? 'tree' : 'trees'} in this topic</p>
        {matchedTrees.length === 0 ? (
          <p className="text-bark-400">No trees found for this topic.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {matchedTrees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
