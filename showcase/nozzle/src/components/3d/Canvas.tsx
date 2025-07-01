import { Canvas as ThreeCanvas } from "@react-three/fiber"
import { OrbitControls, GizmoViewport, GizmoHelper, Environment, ContactShadows, Stage } from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import Model from "./Model"

const Canvas = () => {
  
  const {  geometries } = useModularStore(
    (state) => state
  )
  
  return (
    <div className="flex-1 absolute top-0 left-0 w-full h-full">
      <ThreeCanvas
        camera={{
          position: [0, 50, 50],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        frameloop="demand">
        {/* 3点照明設定 */}
        <ambientLight intensity={0.2} />
        
        {/* キーライト（メイン照明） */}
        <directionalLight
          position={[10, 10, 10]}
          intensity={1.2}
          castShadow={false}
        />
        
        {/* フィルライト（影を和らげる） */}
        <directionalLight
          position={[-5, 5, 5]}
          intensity={0.6}
          castShadow={false}
        />
        
        {/* リムライト（輪郭を強調） */}
        <directionalLight
          position={[0, 5, -10]}
          intensity={0.8}
          castShadow={false}
        />

        <Environment 
          preset="warehouse" 
          background={false}
          blur={0.1}
        />
        <color attach="background" args={["#d9d9d9"]} />
        
        <GizmoHelper alignment="bottom-left" scale={0.5}>
          <GizmoViewport
            axisColors={["hotpink", "aquamarine", "#3498DB"]}
            labelColor="black"
          />
        </GizmoHelper>

        <OrbitControls
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          zoomSpeed={0.5}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          minAzimuthAngle={-Math.PI}
          maxAzimuthAngle={Math.PI}
          maxDistance={900} // カメラの最大ズームアウト距離を200に制限
        />
        <Stage
            intensity={0}
            preset="rembrandt"
            adjustCamera={false}
            scale={1}
            shadows={false}>

        <Model geometries={geometries} />
            </Stage>
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
