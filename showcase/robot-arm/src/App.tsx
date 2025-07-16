import { OrbitControls, Stage, Line } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls, button } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import init, { Modular } from "nodi-modular";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, DoubleSide, Euler, Matrix4, Vector3 } from "three";
import polygonstool from "./polygonstool.json";
import { AnimationControls } from "./components/AnimationControls";
import { convertCurveToGcodeMoves } from "./utils/gcodeParser";
import { useModularStore } from "./stores/useModularStore";
import { useRobotAnimationStore } from "./stores/useRobotAnimationStore";
import { KukaArm } from "./components/KukaArm";
import { URDFRobotArm } from "./components/URDFRobotArm";

function App() {
  // Zustand stores
  const {
    modular,
    nodes,
    meshGeometries,
    curveGeometries,
    gcodeData,
    gcodeText,
    setModular,
    setNodes,
    setGeometries,
    setGcodeData,
    setGcodeText
  } = useModularStore();
  
  const {
    isAnimating,
    currentMoveIndex,
    animationSpeed,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    setAnimationSpeed,
    setCurrentMoveIndex,
    setAllPositions,
    setCurrentPosition
  } = useRobotAnimationStore();
  
  // Local state for manual control (避免循環依存)
  const [manualTarget, setManualTarget] = useState({ x: 0, y: 0, z: 0 });
  
  // 手動制御用の処理関数
  const updateManualTarget = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    const newTarget = { ...manualTarget, [axis]: value };
    setManualTarget(newTarget);
    setCurrentPosition(new Vector3(newTarget.x, newTarget.y, newTarget.z));
  }, [manualTarget, setCurrentPosition]);
  
  // Local refs
  const debounceTimeoutRef = useRef<number | null>(null);
  const evaluateRef = useRef<(m: Modular) => void>();

  const evaluate = useCallback(
    (m: Modular) => {
      m.evaluate().then((e) => {
        const { geometryIdentifiers } = e;

        const meshes: BufferGeometry[] = [];
        const curves: BufferGeometry[] = [];

        geometryIdentifiers.forEach((id) => {
          try {
            const interop = m.findGeometryInteropById(id);
            const { transform } = id;

            switch (interop?.variant) {
              case "Mesh": {
                const { data } = interop;
                const geometry = new BufferGeometry();

                const { vertices, normals, faces } = data;

                geometry.setAttribute(
                  "position",
                  new BufferAttribute(new Float32Array(vertices.flat(1)), 3)
                );
                geometry.setAttribute(
                  "normal",
                  new BufferAttribute(new Float32Array(normals.flat(1)), 3)
                );
                if (faces !== undefined) {
                  geometry.setIndex(
                    new BufferAttribute(new Uint32Array(faces.flat(1)), 1)
                  );
                }

                geometry.applyMatrix4(new Matrix4().fromArray(transform));
                
                // Ensure consistent normal vectors for uniform shading
                geometry.computeVertexNormals();
                
                meshes.push(geometry);
                break;
              }
              case "Curve": {
                const { data } = interop;
                const geometry = new BufferGeometry();

                const { vertices } = data;

                geometry.setAttribute(
                  "position",
                  new BufferAttribute(new Float32Array(vertices.flat(1)), 3)
                );

                geometry.applyMatrix4(new Matrix4().fromArray(transform));
                curves.push(geometry);
                break;
              }
              default: {
                // Handle other geometry types if needed
                break;
              }
            }
          } catch (error) {
            console.error("Error processing geometry:", error);
          }
        });
        
        setGeometries(meshes, curves);
        
        // Use curve-based gcode data for animation
        if (curves.length > 0) {
          const curveBasedGcode = convertCurveToGcodeMoves(curves);
          setGcodeData(curveBasedGcode);
          
          // Set all positions for robot arm
          const positions = curveBasedGcode.moves.map(move => new Vector3(move.x, move.y, move.z));
          setAllPositions(positions);
        }
        
        // Check for 'gcode' node and process its output (for export)
        try {
          const gcodeNode = m.getNodes().find(node => node.label === 'gcode');
          if (gcodeNode) {
            // Get the output of the gcode node
            const gcodeOutput = m.getNodeOutput(gcodeNode.id);
            const textGcode = gcodeOutput![0]!.get("0")![0]!.data;
            
            if (textGcode && typeof textGcode === 'string') {
              setGcodeText(textGcode);
            }
          }
        } catch (error) {
          console.error("Error processing gcode node:", error);
        }
      }).catch((error) => {
        console.error("Error evaluating modular:", error);
      });
    },
    []
  );

  // Keep evaluate function reference up to date
  evaluateRef.current = evaluate;


  // Animation control functions
  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
  }, [setAnimationSpeed]);

  const handleMoveChange = useCallback((moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
  }, [setCurrentMoveIndex]);

  // Export G-code function
  const exportGcode = useCallback(() => {
    if (!gcodeText) {
      alert("No G-code data to export!");
      return;
    }

    // Create download link for G-code
    const blob = new Blob([gcodeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.gcode`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [gcodeText]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      pauseAnimation();
    };
  }, [pauseAnimation]);

  // No longer needed - handled in unified store

  const handleChange = useCallback(
    (id: string, value: number) => {
      try {
        // Immediately update the property for responsive UI
        modular?.changeNodeProperty(id, {
          name: "value",
          value: {
            type: "Number",
            content: value,
          },
        });

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce the evaluation to prevent excessive calls
        debounceTimeoutRef.current = setTimeout(() => {
          if (modular !== null && evaluateRef.current) {
            evaluateRef.current(modular);
          }
        }, 150); // 150ms debounce delay

      } catch (error) {
        console.error("Error changing node property:", error);
      }
    },
    [modular]
  );


  const params = useMemo(() => {
    const nodeParams = nodes
      .map((node) => {
        const { properties } = node;
        const property = properties.find((prop) => prop.name === "value");
        if (property === undefined) {
          return null;
        }

        const { value } = property;
        if (node.label !== undefined && node.label.trim() !== "" && value.type === "Number") {
          const range = properties.find((prop) => prop.name === 'range');
          const step = properties.find((prop) => prop.name === 'step');

          const parameter = {
            id: node.id,
            name: node.label,
            value: value.content,
          };

          if(range?.value.type === 'Vector2d' && step?.value.type === 'Number') {
            return {
              min: range.value.content[0],
              max: range.value.content[1],
              step: step.value.content,
              ...parameter
            };
          }

          return parameter;
        }
        return null;
      })
      .reduce((acc, curr) => {
        if (curr !== null && curr.name && curr.name.trim() !== "") {
          if ('min' in curr) {
            acc[curr.name] = {
              value: curr.value,
              min: curr.min,
              max: curr.max,
              step: curr.step,
              onChange: (value: number) => {
                handleChange(curr.id, value);
              },
            };
          } else {
            acc[curr.name] = {
              value: curr.value,
              onChange: (value: number) => {
                handleChange(curr.id, value);
              },
            };
          }
        }
        return acc;
      }, {} as Schema);

    // Add Export G-code button and manual robot control
    return {
      ...nodeParams,
      "Export G-code": button(exportGcode),
      "Manual X": {
        value: manualTarget.x,
        min: -200,
        max: 200,
        step: 1,
        onChange: (value: number) => updateManualTarget('x', value),
      },
      "Manual Y": {
        value: manualTarget.y,
        min: -200,
        max: 200,
        step: 1,
        onChange: (value: number) => updateManualTarget('y', value),
      },
      "Manual Z": {
        value: manualTarget.z,
        min: -200,
        max: 200,
        step: 1,
        onChange: (value: number) => updateManualTarget('z', value),
      },
      "Reset Position": button(() => {
        setManualTarget({ x: 0, y: 0, z: 0 });
        setCurrentPosition(new Vector3(0, 0, 0));
      }),
    };
  }, [nodes, handleChange, exportGcode, manualTarget, updateManualTarget, setCurrentPosition]);

  useControls(params, [params]);

  // Robot arm animation controls
  const animationControlsProps = {
    isPlaying: isAnimating,
    currentMove: currentMoveIndex,
    totalMoves: gcodeData?.totalMoves || 0,
    animationSpeed,
    onPlay: startAnimation,
    onPause: pauseAnimation,
    onReset: resetAnimation,
    onSpeedChange: handleSpeedChange,
    onMoveChange: handleMoveChange,
    gcodeData: gcodeData?.moves
  };

  useEffect(() => {
    (async () => {
      await init();
      setModular(Modular.new());
    })();
  }, []);

  useEffect(() => {
    if (modular !== null) {
      modular.loadGraph(JSON.stringify(polygonstool.graph));
      // modular.loadGraph(JSON.stringify(brickWall.graph));
      const moduleNodes = modular.getNodes();
      const numberNodes = moduleNodes.filter((n) => n.variant === "Number" || n.variant === "NumberSlider");
      setNodes(numberNodes);
      
      evaluate(modular);
    }
  }, [modular, evaluate]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Canvas
        shadows
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [10, 5, 15], fov: 45 }}
      >
        <color attach="background" args={["#d0d0d0"]} />
        
        {/* <Sky distance={50000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} /> */}
        {(meshGeometries.length > 0 || curveGeometries.length > 0) && (
          <Stage
            intensity={0.5}
            preset="rembrandt"
            adjustCamera
            // shadows="contact"
            environment="city"
          >
            <group rotation={new Euler(-Math.PI * 0.5, 0, 0)}>
              {/* Note: This rotation rotates the entire scene by -90 degrees around X-axis */}
              {/* This transforms: Y -> -Z, Z -> Y */}
              
            
              {/* Render mesh geometries */}
              {meshGeometries.map((geometry, i) => (
                <mesh key={`mesh-${i}`} geometry={geometry}>
                  <meshStandardMaterial 
                    color="#a27f59"
                    roughness={0.4}
                    metalness={0.0}
                    envMapIntensity={0.5}
                    side={DoubleSide}
                    flatShading={true}
                    toneMapped={false}
                  />
                </mesh>
              ))}
              
              {/* Render curve geometries */}
              {curveGeometries.map((geometry, i) => {
                // Extract points from geometry
                const positions = geometry.attributes.position?.array;
                const points: [number, number, number][] = [];
                
                if (positions) {
                  for (let j = 0; j < positions.length; j += 3) {
                    points.push([positions[j], positions[j + 1], positions[j + 2]]);
                  }
                }
                
                // Show original curve only when not animating
                if (!isAnimating) {
                  return (
                    <Line
                      key={`curve-${i}`}
                      points={points}
                      color="#3c4c5c"
                      lineWidth={1}
                    />
                  );
                }
                
                // Progressive curve is now handled in KukaArm component
                return null;
              })}
              
              {/* KUKA Robot Arm */}
              <KukaArm />
              <URDFRobotArm />
            </group>
          </Stage>
        )}
        <OrbitControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.9}
          makeDefault
        />
      </Canvas>
      
      {/* Animation Controls */}
      <AnimationControls {...animationControlsProps} />
    </div>
  );
}

export default App;