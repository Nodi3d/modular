import { OrbitControls, Sky, Stage, Line, Grid } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls, button } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import init, { Modular, NodeInterop } from "nodi-modular";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, DoubleSide, Euler, Matrix4 } from "three";
import foldingbox from "./foldingbox.json";
import Drawing from "dxf-writer";

function App() {
  const [modular, setModular] = useState<Modular | null>(null);
  const [nodes, setNodes] = useState<NodeInterop[]>([]);
  const [meshGeometries, setMeshGeometries] = useState<BufferGeometry[]>([]);
  const [curveGeometries, setCurveGeometries] = useState<BufferGeometry[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
      }).catch((error) => {
        console.error("Error evaluating modular:", error);
      });
    },
    []
  );

  // Keep evaluate function reference up to date
  evaluateRef.current = evaluate;

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

  const exportToDxf = useCallback(() => {
    if (curveGeometries.length === 0) {
      alert("No curves to export!");
      return;
    }

    const drawing = new Drawing();
    
    // Add each curve as a polyline to the DXF
    curveGeometries.forEach((geometry, index) => {
      const positions = geometry.attributes.position?.array;
      if (!positions) return;

      const points: [number, number][] = [];
      
      // Extract points from geometry (convert 3D to 2D by dropping Z coordinate)
      for (let i = 0; i < positions.length; i += 3) {
        points.push([positions[i], positions[i + 1]]);
      }

      // Add layer for this curve
      const layerName = `Curve_${index}`;
      drawing.addLayer(layerName, Drawing.ACI.CYAN, 'CONTINUOUS');
      drawing.setActiveLayer(layerName);

      // Add polyline to DXF
      if (points.length > 1) {
        drawing.drawPolyline(points, false); // false = not closed
      }
    });

    // Generate DXF content
    const dxfContent = drawing.toDxfString();
    
    // Create download link
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'curves.dxf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [curveGeometries]);

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

    // Add DXF export button
    return {
      ...nodeParams,
      "Export DXF": button(exportToDxf),
    };
  }, [nodes, handleChange, exportToDxf]);

  useControls(params, [params]);

  useEffect(() => {
    (async () => {
      await init();
      setModular(Modular.new());
    })();
  }, []);

  useEffect(() => {
    if (modular !== null) {
      modular.loadGraph(JSON.stringify(foldingbox.graph));
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
        camera={{ position: [4, -1, 8], fov: 35 }}
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
            
              {/* Render mesh geometries */}
              {meshGeometries.map((geometry, i) => (
                <mesh key={`mesh-${i}`} geometry={geometry}>
                  <meshStandardMaterial 
                    color="#dfd4c9"
                    roughness={0.2}
                    metalness={0.1}
                    envMapIntensity={1.8}
                    side={DoubleSide}
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
                
                return (
                  <Line
                    key={`curve-${i}`}
                    points={points}
                    color="#3c4c5c"
                    lineWidth={1}
                  />
                );
              })}
            </group>
          </Stage>
        )}
        <OrbitControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.9}
          makeDefault
        />
      </Canvas>
    </div>
  );
}

export default App;