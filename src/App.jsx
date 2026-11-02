import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Gallery from './pages/Gallery.jsx'
import Species from './pages/Species.jsx'
import SpeciesDetail from './pages/SpeciesDetail.jsx'
import Topics from './pages/Topics.jsx'
import TopicDetail from './pages/TopicDetail.jsx'
import Trees from './pages/Trees.jsx'
import TreeDetail from './pages/TreeDetail.jsx'
import MapPage from './pages/MapPage.jsx'
import About from './pages/About.jsx'
import Team from './pages/Team.jsx'
import Resources from './pages/Resources.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

// Pages where the footer should not appear (full-screen map)
const NO_FOOTER_ROUTES = ['/map']

export default function App() {
  const { pathname } = useLocation()
  const showFooter = !NO_FOOTER_ROUTES.includes(pathname)

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trees" element={<Trees />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/species" element={<Species />} />
          <Route path="/species/:slug" element={<SpeciesDetail />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:slug" element={<TopicDetail />} />
          <Route path="/tree/:id" element={<TreeDetail />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </>
  )
}
