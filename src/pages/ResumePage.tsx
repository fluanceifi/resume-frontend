import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Education from '../components/Education'
import Certifications from '../components/Certifications'
import Experience from '../components/Experience'
import Contact from '../components/Contact'

export default function ResumePage() {
  return (
    <div className="resume">
      <Hero />
      <About />
      <Projects />
      <Education />
      <Certifications />
      <Experience />
      <Contact />
    </div>
  )
}
