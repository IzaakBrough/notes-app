import './Footer.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <p>&copy; {year} react-template</p>
    </footer>
  )
}

export default Footer
