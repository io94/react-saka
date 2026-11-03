import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components = {
  // A paragraph that is just an image will render the figure directly.
  p({ node, children }) {
    if (node?.children?.length === 1 && node.children[0].tagName === 'img') {
      return <>{children}</>
    }
    return <p className="text-bark-600 text-lg leading-relaxed mb-5">{children}</p>
  },
  // Placement rides in the image title, set by the sync from the Doc:
  //   "group"       → side-by-side (from a 1-row table of images)
  //   "float-right" / "float-left" → text wraps around it (Docs "Wrap text")
  //   (none)        → full-width block
  img({ src, alt, title }) {
    const t = title || ''
    const cls = t.includes('group')
      ? 'inline-block w-[31%] align-top mx-[1%] mb-4'
      : t.includes('float-right')
        ? 'sm:float-right sm:w-2/5 sm:ml-6 mb-4'
        : t.includes('float-left')
          ? 'sm:float-left sm:w-2/5 sm:mr-6 mb-4'
          : 'my-6'
    return (
      <figure className={`${cls} border border-sand-200 bg-sand-50`}>
        <img src={src} alt={alt || ''} className="w-full object-contain bg-white" />
        {alt && (
          <figcaption className="text-bark-400 text-xs italic text-center leading-snug px-3 py-2 border-t border-sand-200">
            {alt}
          </figcaption>
        )}
      </figure>
    )
  },
  h1: ({ children }) => <h2 className="text-forest-800 font-bold text-2xl mt-8 mb-4">{children}</h2>,
  h2: ({ children }) => <h3 className="text-forest-800 font-bold text-xl mt-8 mb-3">{children}</h3>,
  h3: ({ children }) => <h4 className="text-forest-700 font-bold text-lg mt-6 mb-2">{children}</h4>,
  a: ({ href, children }) => (
    <a href={href} className="text-forest-600 hover:text-forest-800 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 mb-5 text-bark-600 text-lg leading-relaxed flex flex-col gap-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 text-bark-600 text-lg leading-relaxed flex flex-col gap-1">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-sand-300 pl-4 italic text-bark-500 my-5">{children}</blockquote>
  ),
}

export default function Markdown({ children }) {
  if (!children) return null
  return (
    <div className="saka-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
      <div className="clear-both" />
    </div>
  )
}
