import { type ReactElement } from 'react';

function App(): ReactElement {
  return (
    <main className="app">
      <section className="welcome-card">
        <div className="brand-icon">
          VPN
        </div>

        <span className="app-label">
          CONNECTION MANAGER
        </span>

        <h1>Smart VPN</h1>

        <p>
          Your connection. Your rules.
        </p>

        <div className="status">
          <span className="status-indicator" />
          <span>Application initialized</span>
        </div>

        <span className="app-description">
          Automatic VPN management for macOS and Windows.
        </span>
      </section>
    </main>
  );
}

export default App;
