import { useState } from 'react'
import { Link } from 'react-router-dom'

const heroImages = [
  '/images/hero/carousel-01.jpg',
  '/images/hero/carousel-03.jpg',
  '/images/hero/carousel-05.jpg',
  '/images/hero/carousel-06.jpg',
]


const ctaCards = [
  {
    label: 'Map',
    to: '/map',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    label: 'Trees',
    to: '/trees',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-5m0 0a5 5 0 003.03-8.98A4 4 0 007.5 6.2 3.5 3.5 0 006 13h.5A4.5 4.5 0 0012 16z" />
      </svg>
    ),
  },
  {
    label: 'Topics',
    to: '/topics',
    desc: 'Discover lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
]

export default function Home() {
  const [slide, setSlide] = useState(0)
  const goTo = (i) => setSlide((i + heroImages.length) % heroImages.length)
  const prev = () => goTo(slide - 1)
  const next = () => goTo(slide + 1)

  return (
    <div className="flex flex-col">
      <section className="relative min-h-screen flex flex-col items-center justify-end pb-28 overflow-hidden">
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="Sacred trees in Bali"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60" />
        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-white text-5xl sm:text-7xl font-bold leading-tight mb-6 drop-shadow-lg">
            Sacred Canopy
          </h1>
          <p className="font-medium text-sand-100 text-lg sm:text-xl leading-relaxed mb-10 drop-shadow">
          Bali’s trees stand as witness of local worldviews’ impact on environmental
          conservation. Sacred Canopy brings together their stories, images, and
          ecological data to explore how culture‑ and nature‑based approaches can protect
          urban canopies and help address climate change.
          </p>

          <div className="flex items-center justify-center gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      <section className="bg-white pt-20 pb-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
  
            <div className="text-center">
              <h1 className="text-forest-800 text-3xl font-bold mb-4">About</h1>
              <p className="text-bark-600 leading-relaxed">
                Explore the interactive <Link className="text-forest-600 hover:underline" to="/map">map</Link> of the trees we have documented and their <Link className="text-forest-600 hover:underline" to="/gallery">visual representations</Link>. 
                Find out more about <Link className="text-forest-600 hover:underline" to="/trees">each tree</Link> and <Link className="text-forest-600 hover:underline" to="/topics">learn more</Link> about
                the windows they open on the intersection of religion, nature, and urbanization.
              </p>

              <div className="flex items-center justify-center gap-8 sm:gap-10 mt-6">
                {ctaCards.map(({ label, to, icon }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group flex flex-col items-center gap-2 text-forest-600 hover:text-forest-500 transition-colors"
                  >
                    <span className="flex items-center justify-center w-14 h-14 rounded-full bg-sand-50 border border-sand-200 group-hover:border-forest-400 group-hover:shadow-md transition-all duration-300">
                      {icon}
                    </span>
                    <span className="text-forest-800 text-sm font-semibold">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-forest-800 text-3xl font-bold mb-2">Funded by</h1>
              <p className="text-bark-600 mb-4">Sacred Canopy is a project funded by <Link className="text-forest-600 hover:underline" to="https://atkinson.cornell.edu/">Cornell University’s Atkinson Center for Sustainability</Link> and <Link className="text-forest-600 hover:underline" to="https://societyhumanities.as.cornell.edu/">the Society for the Humanities</Link>. </p>
              <h1 className="text-forest-800 text-3xl font-bold mb-2">In collaboration with</h1>
              <p className="text-bark-600 mb-4">Spearheaded by <Link className="text-forest-600 hover:underline" to="https://asianstudies.cornell.edu/chiara-formichi">Prof. Chiara Formichi (Asian Studies, Cornell University)</Link>, the project is a collaboration with <Link className="text-forest-600 hover:underline" to="https://www.unud.ac.id/iab-member/prof-dr-i-nyoman-darma-putra-m-litt-indonesia/">Prof. Darma Putra of Humanities (Fakultas Ilmu Budaya)</Link> and <Link className="text-forest-600 hover:underline" to="https://id.linkedin.com/in/ni-made-pertiwi-jaya-035bb5b2/in">Dr. Ni Made Pertiwi Jaya of Environmental Sciences (Fakultas Teknik Lingkungan)</Link>, at
                Udayana University, Bali. Read here the <Link className="text-forest-600 hover:underline" to="/team">bios</Link> of all those contributing.</p>
              <p className="text-bark-600 mb-3">Share this page:</p>
              {/* Social icons */}
              <div className="flex items-center justify-center h-[50px] w-[200px] mx-auto">
                {/* YouTube */}
                <a href="#" className="flex items-center justify-center w-1/4 h-full hover:bg-sand-100 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 461.001 461.001" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#F61C0D" d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href="#" className="flex items-center justify-center w-1/4 h-full hover:bg-sand-100 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M412.19,118.66a109.27,109.27,0,0,1-9.45-5.5,132.87,132.87,0,0,1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14,23.9,350,16,350.13,16H267.69V334.78c0,4.28,0,8.51-.18,12.69,0,.52-.05,1-.08,1.56,0,.23,0,.47-.05.71,0,.06,0,.12,0,.18a70,70,0,0,1-35.22,55.56,68.8,68.8,0,0,1-34.11,9c-38.41,0-69.54-31.32-69.54-70s31.13-70,69.54-70a68.9,68.9,0,0,1,21.41,3.39l.1-83.94a153.14,153.14,0,0,0-118,34.52,161.79,161.79,0,0,0-35.3,43.53c-3.48,6-16.61,30.11-18.2,69.24-1,22.21,5.67,45.22,8.85,54.73v.2c2,5.6,9.75,24.71,22.38,40.82A167.53,167.53,0,0,0,115,470.66v-.2l.2.2C155.11,497.78,199.36,496,199.36,496c7.66-.31,33.32,0,62.46-13.81,32.32-15.31,50.72-38.12,50.72-38.12a158.46,158.46,0,0,0,27.64-45.93c7.46-19.61,9.95-43.13,9.95-52.53V176.49c1,.6,14.32,9.41,14.32,9.41s19.19,12.3,49.13,20.31c21.48,5.7,50.42,6.9,50.42,6.9V131.27C453.86,132.37,433.27,129.17,412.19,118.66Z"/>
                  </svg>
                </a>
                {/* Discord */}
                <a href="#" className="flex items-center justify-center w-1/4 h-full hover:bg-sand-100 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 -28.5 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#5865F2" d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"/>
                  </svg>
                </a>
                {/* Email/Newsletter */}
                <a href="#" className="flex items-center justify-center w-1/4 h-full hover:bg-sand-100 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M488.1 414.7V303.4L300.9 428l83.6 55.8zm254.1 137.7v-79.8l-59.8 39.9zM512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm278 533c0 1.1-.1 2.1-.2 3.1 0 .4-.1.7-.2 1a14.16 14.16 0 0 1-.8 3.2c-.2.6-.4 1.2-.6 1.7-.2.4-.4.8-.5 1.2-.3.5-.5 1.1-.8 1.6-.2.4-.4.7-.7 1.1-.3.5-.7 1-1 1.5-.3.4-.5.7-.8 1-.4.4-.8.9-1.2 1.3-.3.3-.6.6-1 .9-.4.4-.9.8-1.4 1.1-.4.3-.7.6-1.1.8-.1.1-.3.2-.4.3L525.2 786c-4 2.7-8.6 4-13.2 4-4.7 0-9.3-1.4-13.3-4L244.6 616.9c-.1-.1-.3-.2-.4-.3l-1.1-.8c-.5-.4-.9-.7-1.3-1.1-.3-.3-.6-.6-1-.9-.4-.4-.8-.8-1.2-1.3a7 7 0 0 1-.8-1c-.4-.5-.7-1-1-1.5-.2-.4-.5-.7-.7-1.1-.3-.5-.6-1.1-.8-1.6-.2-.4-.4-.8-.5-1.2-.2-.6-.4-1.2-.6-1.7-.1-.4-.3-.8-.4-1.2-.2-.7-.3-1.3-.4-2-.1-.3-.1-.7-.2-1-.1-1-.2-2.1-.2-3.1V427.9c0-1 .1-2.1.2-3.1.1-.3.1-.7.2-1a14.16 14.16 0 0 1 .8-3.2c.2-.6.4-1.2.6-1.7.2-.4.4-.8.5-1.2.2-.5.5-1.1.8-1.6.2-.4.4-.7.7-1.1.6-.9 1.2-1.7 1.8-2.5.4-.4.8-.9 1.2-1.3.3-.3.6-.6 1-.9.4-.4.9-.8 1.3-1.1.4-.3.7-.6 1.1-.8.1-.1.3-.2.4-.3L498.7 239c8-5.3 18.5-5.3 26.5 0l254.1 169.1c.1.1.3.2.4.3l1.1.8 1.4 1.1c.3.3.6.6 1 .9.4.4.8.8 1.2 1.3.7.8 1.3 1.6 1.8 2.5.2.4.5.7.7 1.1.3.5.6 1 .8 1.6.2.4.4.8.5 1.2.2.6.4 1.2.6 1.7.1.4.3.8.4 1.2.2.7.3 1.3.4 2 .1.3.1.7.2 1 .1 1 .2 2.1.2 3.1V597zm-254.1 13.3v111.3L723.1 597l-83.6-55.8zM281.8 472.6v79.8l59.8-39.9zM512 456.1l-84.5 56.4 84.5 56.4 84.5-56.4zM723.1 428L535.9 303.4v111.3l103.6 69.1zM384.5 541.2L300.9 597l187.2 124.6V610.3l-103.6-69.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
