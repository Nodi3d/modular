import { useEffect, memo } from "react"
import { useModularStore } from "@/stores/modular"
import ReactGA from "react-ga4"
import { useSettingsStore } from "./stores/settings"
import Canvas from "@/components/3d/Canvas"
import { PropertyPanel } from "@/components/ui/PropertyPanel"

// ModularInitializer component - handles modular initialization
const ModularInitializer = memo(() => {
  const initializeModular = useModularStore((state) => state.initializeModular)
  const loadGraph = useModularStore((state) => state.loadGraph)
  const modular = useModularStore((state) => state.modular)

  useEffect(() => {
    console.log("ModularInitializer mounted")
    initializeModular()
  }, [initializeModular])

  useEffect(() => {
    if (modular) {
      loadGraph("braid")
    }
  }, [modular, loadGraph])

  return null
})



function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <ModularInitializer />
      
      <PropertyPanel />
      <Canvas />
    </div>
  )
}

export default App