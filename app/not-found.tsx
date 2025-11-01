
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>404 - Page Not Found</h1>
      <p style={{ margin: '1rem 0' }}>Oops! The page you are looking for does not exist.</p>
      <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go back to the homepage
      </Link>
    </div>
  );
}
