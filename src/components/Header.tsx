import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="site-title">
        react-template
      </Link>
    </header>
  )
}

export default Header
