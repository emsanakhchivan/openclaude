import ReactDOM from "react-dom/client"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { App } from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)

// Remove splash screen after React mounts
const splash = document.getElementById("splash")
if (splash) {
  splash.classList.add("fade-out")
  setTimeout(() => splash.remove(), 500)
}
