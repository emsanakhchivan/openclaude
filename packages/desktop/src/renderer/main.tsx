import ReactDOM from "react-dom/client"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { App } from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)

// Remove splash screen after a delay so user sees it
const splash = document.getElementById("splash")
if (splash) {
  setTimeout(() => {
    splash.classList.add("fade-out")
    setTimeout(() => splash.remove(), 600)
  }, 1500)
}
