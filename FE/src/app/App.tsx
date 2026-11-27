import { Link, Route, Routes } from 'react-router';

export function App() {
  return (
    <main>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>FRIDAY</h1>
              <p>The independent React application is ready.</p>
              <p>
                Authentication and business features will follow in later
                phases.
              </p>
            </>
          }
        />
        <Route
          path="*"
          element={
            <>
              <h1>Page not found</h1>
              <Link to="/">Return home</Link>
            </>
          }
        />
      </Routes>
    </main>
  );
}
