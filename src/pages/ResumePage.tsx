import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Education from '../components/Education'
import Experience from '../components/Experience'
import Contact from '../components/Contact'

export default function ResumePage() {
  return (
    <div className="resume">
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Education />
      <Experience />
      <Contact />
    </div>
  )
}
