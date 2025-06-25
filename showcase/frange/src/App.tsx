import { OrbitControls, Sky, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import init, { Modular, NodeInterop } from "nodi-modular";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BufferAttribute, BufferGeometry, DoubleSide, Euler, Matrix4 } from "three";
import shell from "./shell.json";

function App() {
  const [modular, setModular] = useState<Modular | null>(null);
  const [nodes, setNodes] = useState<NodeInterop[]>([]);
  const [geometries, setGeometries] = useState<BufferGeometry[]>([]);

  const evaluate = useCallback(
    (m: Modular) => {
      m.evaluate().then((e) => {
        const { geometryIdentifiers } = e;

        const gs = geometryIdentifiers
          .map((id) => {
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

                  return geometry;
                }
                default: {
                  return null;
                }
              }
            } catch (error) {
              console.error("Error processing geometry:", error);
              return null;
            }
          })
          .filter((g): g is BufferGeometry => g !== null);
        setGeometries(gs);
      }).catch((error) => {
        console.error("Error evaluating modular:", error);
      });
    },
    []
  );

  const handleChange = useCallback(
    (id: string, value: number) => {
      try {
        modular?.changeNodeProperty(id, {
          name: "value",
          value: {
            type: "Number",
            content: value,
          },
        });
        if (modular !== null) {
          evaluate(modular);
        }
      } catch (error) {
        console.error("Error changing node property:", error);
        console.log("Node ID:", id, "Value:", value);
      }
    },
    [modular, evaluate]
  );

  const params = useMemo(() => {
    return nodes
      .map((node) => {
        const { properties } = node;
        const property = properties.find((prop) => prop.name === "value");
        if (property === undefined) {
          return null;
        }

        const { value } = property;
        if (node.label !== undefined && value.type === "Number") {
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
        if (curr !== null) {
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
  }, [nodes, handleChange]);

  useControls(params, [params]);

  useEffect(() => {
    (async () => {
      await init();
      setModular(Modular.new());
    })();
  }, []);

  useEffect(() => {
    if (modular !== null) {
      modular.loadGraph(JSON.stringify(shell.graph));
      // modular.loadGraph(JSON.stringify(brickWall.graph));
      const nodes = modular.getNodes();
      const numberNodes = nodes.filter((n) => n.variant === "Number" || n.variant === "NumberSlider");
      setNodes(numberNodes);
      evaluate(modular);
    }
  }, [modular, evaluate]);

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
        <Sky distance={50000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
        {geometries.length > 0 && (
          <Stage
            intensity={0.5}
            preset="rembrandt"
            adjustCamera
            shadows="contact"
            environment="city"
          >
            <group rotation={new Euler(-Math.PI * 0.5, 0, 0)}>
              {geometries.map((geometry, i) => (
                <mesh key={i} geometry={geometry} castShadow>
                  <meshStandardMaterial
                    color="white"
                    roughness={0.25}
                    metalness={0.25}
                    side={DoubleSide}
                  />
                </mesh>
              ))}
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