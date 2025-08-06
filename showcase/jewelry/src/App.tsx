import { useEffect, memo } from "react"
import { useModularWorkerStore } from "@/stores/modularWorker"
import Canvas from "@/components/3d/Canvas"
import { PropertyPanel } from "@/components/ui/PropertyPanel"
import { Loader } from "./components/ui/Loader"

// ModularInitializer component - handles modular initialization
const ModularInitializer = memo(() => {
  const connect = useModularWorkerStore((state) => state.connect)
  const loadGraph = useModularWorkerStore((state) => state.loadGraph)
  const isConnected = useModularWorkerStore((state) => state.isConnected)
  
  

  useEffect(() => {
    console.log("ModularInitializer mounted - connecting to SharedWorker")
    connect()
  }, [connect])

  useEffect(() => {
    if (isConnected) {
      loadGraph("braid")
    }
  }, [isConnected, loadGraph])

  return null
})



function App() {
  const { isLoading } = useModularWorkerStore((state) => state)
  return (
    <div className="flex flex-col h-screen w-screen">
      <ModularInitializer />
      {isLoading && <Loader />}
      

      <PropertyPanel />
      <Canvas />
    </div>
  )
}

export default App