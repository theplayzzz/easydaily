import { logger } from "./utils/logger";

function App() {
  logger.info("App", "EasyDaily initialized");

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary font-sans">
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-accent-primary">EasyDaily</h1>
      </div>
    </main>
  );
}

export default App;
