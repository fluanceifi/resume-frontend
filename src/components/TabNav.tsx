import { NavLink } from 'react-router-dom'

export default function TabNav() {
  return (
    <nav className="tab-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        이력서
      </NavLink>
      <NavLink
        to="/smu-club"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        SMU-CLUB
      </NavLink>
      <NavLink
        to="/hybrid-rag"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        Hybrid RAG
      </NavLink>
    </nav>
  )
}
