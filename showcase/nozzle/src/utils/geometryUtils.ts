
import {
    BufferAttribute,
    BufferGeometry,
    Matrix4,
    
  } from "three";
  
  // Modularの幾何学インターフェイスをThree.jsのBufferGeometryに変換
  const convertGeometryInterop = (interop: any, transform: number[]): BufferGeometry | null => {
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
      
      default:
        return null;
    }
  };

  function mesh2geometry(mesh: any) {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(mesh.vertProperties, 3))
  geometry.setIndex(new BufferAttribute(mesh.triVerts, 1))
  return geometry
}

// Convert Three.js BufferGeometry to Manifold Mesh
function geometry2mesh(geometry: BufferGeometry) {
  const positions = geometry.getAttribute("position")
  const indices = geometry.getIndex()

  const vertProperties = new Float32Array(
    (positions.array as Float32Array).slice()
  )
  const triVerts = new Uint32Array(
    indices ? (indices.array as Uint32Array).slice() : []
  )

  return { vertProperties, triVerts }
}

  export {convertGeometryInterop,mesh2geometry,geometry2mesh}