import { Link } from 'react-router-dom'
import { topics } from '../data/topics.js'

const PLACEHOLDER = '/saka-logo.svg'

export default function Topics() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <div className="pt-28 pb-8 px-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-bark-900 mb-3">Topics</h1>
      </div>

      <div className="px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/topics/${topic.slug}`}
              className="group relative overflow-hidden block"
              style={{ aspectRatio: '4/3', backgroundColor: topic.color }}
            >
              <img
                src={topic.bannerImage}
                alt={topic.title}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER
                  e.currentTarget.className = 'absolute inset-0 m-auto w-1/3 opacity-30'
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/85 via-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 px-4 py-3">
                <p className="text-white font-medium text-xl leading-snug">{topic.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
