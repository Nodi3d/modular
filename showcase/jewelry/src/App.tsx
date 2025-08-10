import { useEffect, memo } from "react"
import { RingType, useModularWorkerStore } from "@/stores/modularWorker"
import Canvas from "@/components/3d/Canvas"
import { PropertyPanel } from "@/components/ui/PropertyPanel"
import { Loader } from "./components/ui/Loader"
import { useParams, BrowserRouter,
  Routes,
  Route,
  } from "react-router-dom"

// ModularInitializer component - handles modular initialization
const ModularInitializer = memo(() => {
  const connect = useModularWorkerStore((state) => state.connect)
  const loadGraph = useModularWorkerStore((state) => state.loadGraph)
  const isConnected = useModularWorkerStore((state) => state.isConnected)
  const {setCurrentType} = useModularWorkerStore()
  const { slug } = useParams<{ slug: string }>()
  
  

  useEffect(() => {
    console.log("ModularInitializer mounted - connecting to SharedWorker")
    connect()
  }, [connect])

  useEffect(() => {
    if (isConnected) {
      loadGraph(slug as string)
    }
    setCurrentType(slug as RingType)
  }, [isConnected, loadGraph, slug])

  return null
})



function App() {
  const { isLoading } = useModularWorkerStore((state) => state)
  
  return (
    <div className="flex flex-col h-screen w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={(
            <><ModularInitializer /></>)} />
          <Route path="/:slug" element={(
            <><ModularInitializer /></>
          )} />
        </Routes>
        <Canvas/>
        <PropertyPanel />
        {isLoading && <Loader />}
      </BrowserRouter>

      
    </div>
  )
}

export default App