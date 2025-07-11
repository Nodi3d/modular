import { OrbitControls, Sky, Stage, Line, Grid } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls, button } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import init, { Modular, NodeInterop } from "nodi-modular";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, DoubleSide, Euler, Matrix4, Vector3 } from "three";
import polygonstool from "./polygonstool.json";
import { KukaArm } from "./components/KukaArm";
import { AnimationControls } from "./components/AnimationControls";
import { loadGcodeFile, parseGcode, ParsedGcode } from "./utils/gcodeParser";

function App() {
  const [modular, setModular] = useState<Modular | null>(null);
  const [nodes, setNodes] = useState<NodeInterop[]>([]);
  const [meshGeometries, setMeshGeometries] = useState<BufferGeometry[]>([]);
  const [curveGeometries, setCurveGeometries] = useState<BufferGeometry[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const evaluateRef = useRef<(m: Modular) => void>();

  // Robot arm animation states
  const [gcodeData, setGcodeData] = useState<ParsedGcode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const animationRef = useRef<number | null>(null);
  const gcodeTextRef = useRef<string>("");

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
        
        setMeshGeometries(meshes);
        setCurveGeometries(curves);
        
        // Check for 'gcode' node and process its output
        try {
          const gcodeNode = m.getNodes().find(node => node.label === 'gcode');
          if (gcodeNode) {
            console.log('Found gcode node:', gcodeNode);
            
            // Get the output of the gcode node
            const gcodeOutput = m.getNodeOutput(gcodeNode.id);
            const textGcode = gcodeOutput![0]!.get("0")![0]!.data;
            
            
            
                  if (textGcode && typeof textGcode === 'string') {
                    
                    const parsedGcode = parseGcode(textGcode);
                    setGcodeData(parsedGcode);
                    gcodeTextRef.current = textGcode;
                    console.log('Gcode data updated from node:', parsedGcode.totalMoves, 'moves');
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

  // Load Gcode data
  useEffect(() => {
    const loadGcode = async () => {
      try {
        const data = await loadGcodeFile('/polygonstool.gcode');
        setGcodeData(data);
        console.log('Gcode loaded:', data.totalMoves, 'moves');
      } catch (error) {
        console.error('Failed to load Gcode:', error);
      }
    };
    
    loadGcode();
  }, []);

  // Animation control functions
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const pauseAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setCurrentMoveIndex(0);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
  }, []);

  const handleMoveChange = useCallback((moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
  }, []);

  // Export G-code function
  const exportGcode = useCallback(() => {
    if (!gcodeTextRef.current) {
      alert("No G-code data to export!");
      return;
    }

    // Create download link for G-code
    const blob = new Blob([gcodeTextRef.current], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.gcode`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Animation loop
  useEffect(() => {
    if (isAnimating && gcodeData && currentMoveIndex < gcodeData.totalMoves - 1) {
      const timeout = setTimeout(() => {
        setCurrentMoveIndex(prev => prev + 1);
      }, (1000 / animationSpeed)); // Speed in moves per second
      
      animationRef.current = timeout;
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    } else if (currentMoveIndex >= (gcodeData?.totalMoves || 0) - 1) {
      setIsAnimating(false);
    }
  }, [isAnimating, currentMoveIndex, animationSpeed, gcodeData]);

  // Get current target position for robot arm
  const currentTargetPosition = useMemo(() => {
    if (!gcodeData || !gcodeData.moves[currentMoveIndex]) {
      return new Vector3(0, 0, 0);
    }
    
    const move = gcodeData.moves[currentMoveIndex];
    // Since the parent group is rotated by -90 degrees around X axis,
    // we don't need to apply the rotation here - the KukaArm is inside the rotated group
    // and will use local coordinates
    const targetPos = new Vector3(move.x, move.y, move.z);
    
    // Debug: Log G-code position
    console.log(`[G-code Move ${currentMoveIndex}] Raw G-code position:`, move);
    console.log(`[G-code Move ${currentMoveIndex}] Target position (local to rotated group):`, targetPos);
    
    return targetPos;
  }, [gcodeData, currentMoveIndex]);

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
        console.log("Node ID:", id, "Value:", value);
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

    // Add Export G-code button
    return {
      ...nodeParams,
      "Export G-code": button(exportGcode),
    };
  }, [nodes, handleChange, exportGcode]);

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
      const nodes = modular.getNodes();
      const numberNodes = nodes.filter((n) => n.variant === "Number" || n.variant === "NumberSlider");
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
                  
                  // Debug: Log first few points of each curve
                  if (i === 0 && points.length > 0) {
                    console.log(`[Curve ${i}] First 5 points:`, points.slice(0, 5));
                    console.log(`[Curve ${i}] Total points:`, points.length);
                  }
                }
                
                return (
                  <Line
                    key={`curve-${i}`}
                    points={points}
                    color="#3c4c5c"
                    lineWidth={1}
                  />
                );
              })}
              
              {/* KUKA Robot Arm */}
              <KukaArm 
                targetPosition={currentTargetPosition}
                isAnimating={isAnimating}
              />
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