/* tslint:disable */
/* eslint-disable */

/**
 * Type hint bitflags for IO parameters.
 * Serialized as a number in interop format.
 */
export type TypeHint = number;



/// Manually added types due to limitations in the `wasm-bindgen` & `tsify` crates.
export type ID<T = any> = string;
export type NodeId = ID;
export type InputId = ID;
export type OutputId = ID;
export type SubGraphId = ID;
export type SubGraphInstanceId = ID;

export type IndexMap<K, V> = Map<K, V>;

export type U1 = 1;
export type U2 = 2;
export type U3 = 3;

/// Define vector & point types with FixedLengthArray
type BuildTuple<L extends number, T, R extends any[] = []> = R['length'] extends L ? R : BuildTuple<L, T, [T, ...R]>;
type FixedLengthArray<T, L extends number> = BuildTuple<L, T>;
export type OPoint<T, D extends number> = FixedLengthArray<T, D>;
export type OVector<T, D extends number> = FixedLengthArray<T, D>;
export type Point<T, D extends number> = OPoint<T, D>;
export type SVector<T, D extends number> = OVector<T, D>;
export type Point2<T = number> = Point<T, 2>;
export type Vector2<T = number> = SVector<T, 2>;
export type Point3<T = number> = Point<T, 3>;
export type Vector3<T = number> = SVector<T, 3>;
export type Point4<T = number> = Point<T, 4>;
export type Vector4<T = number> = SVector<T, 4>;
export type Transform3<T = number> = FixedLengthArray<T, 16>;
export type Matrix4<T = number> = FixedLengthArray<FixedLengthArray<T, 4>, 4>;



export type BoundingBox3D = {
    min: Vector3;
    max: Vector3;
};


export type LineCurve3D = {
    a: Point3;
    b: Point3;
};


export type NurbsCurve3D<T = number> = {
    control_points: Point4<T>[];
    knots: T[];
    degree: T;
};


export type NurbsSurface3D<T = number> = {
    control_points: Point4<T>[][];
    u_knots: T[];
    v_knots: T[];
    u_degree: T;
    v_degree: T;
};


export type PolylineCurve2D = {
    points: Point2[];
};
export type PolylineCurve3D = {
    points: Point3[];
};


export type Triangle3D = {
    a: Point3;
    b: Point3;
    c: Point3;
};

/**
 * A NURBS surface container
 */
export type NurbsSurface = NurbsSurface3D<number>;

/**
 * A circle curve in 3D space
 */
export interface CircleCurve {
    /**
     * The base plane of the circle
     */
    plane: Plane;
    /**
     * The radius of the circle
     */
    radius: number;
}

/**
 * A circular surface
 */
export interface CircularSurface {
    /**
     * The base plane of the circle
     */
    plane: Plane;
    /**
     * The radius of the circle
     */
    radius: number;
}

/**
 * A collection of geometry objects
 */
export type Group = GeometryTransform[];

/**
 * A ellipse curve in 3D space
 */
export interface EllipseCurve {
    /**
     * The base plane of the ellipse
     */
    plane: Plane;
    /**
     * The x radius of the ellipse
     */
    xRadius: number;
    /**
     * The y radius of the ellipse
     */
    yRadius: number;
}

/**
 * A face of a mesh with three vertices
 */
export interface MeshTriangleFace {
    a: number;
    b: number;
    c: number;
}

/**
 * A geometry object with a transformation
 */
export interface GeometryTransform {
    /**
     * The handle to the geometry object
     */
    geometry: Handle<GeometryProxy>;
    /**
     * Transformation matrix of the geometry
     */
    transform: Transform3<number>;
}

/**
 * A parameter for an input or output of a node.
 */
export interface IOParameter<T, U> {
    id: T;
    name: string;
    access_type: AccessTypes;
    hint?: TypeHint;
    connections: U[];
}

/**
 * A rectangle curve in 3D space
 */
export interface RectangleCurve {
    /**
     * The base plane of the rectangle
     */
    plane: Plane;
    /**
     * The domain of the rectangle in the plane x axis
     */
    x: Domain;
    /**
     * The domain of the rectangle in the plane y axis
     */
    y: Domain;
}

/**
 * A set of node id and instance id
 */
export interface GraphNodeSet {
    subGraphIdSet: SubGraphIdSet | undefined;
    nodeId: NodeId;
}

/**
 * A sub graph is a graph that is a part of a larger graph
 */
export interface SubGraph<T, U> {
    /**
     * The id of the sub graph
     */
    id: SubGraphId;
    /**
     * The graph of the sub graph
     */
    graph: Graph<T, U>;
    /**
     * The instances of the sub graph
     */
    instances: SubGraphInstanceId[];
}

/**
 * A surface defined by a base surface and trimming curves
 *
 * The trimming curves are defined in the parameter space (2D) of the base surface.
 * - exterior: Optional outer boundary curve in parameter space
 * - interiors: Interior holes in parameter space
 */
export interface TrimmedSurface {
    baseSurface: SurfaceProxy;
    exterior: CompoundCurve2D<number> | undefined;
    interiors: CompoundCurve2D<number>[];
}

/**
 * A surface defined by a plane and two domains in x and y directions
 */
export interface PlaneSurface {
    /**
     * The base plane of the surface
     */
    plane: Plane;
    /**
     * The domain in x direction
     */
    x: Domain;
    /**
     * The domain in y direction
     */
    y: Domain;
}

/**
 * A surface defined by a plane and two domains in x and y directions
 */
export interface TorusSurface {
    /**
     * The base plane of the surface
     */
    plane: Plane;
    /**
     * The major radius of the torus
     */
    majorRadius: number;
    /**
     * The minor radius of the torus
     */
    minorRadius: number;
    /**
     * The domain in u direction
     */
    uDomain: Domain;
    /**
     * The domain in v direction
     */
    vDomain: Domain;
}

/**
 * A surface defined by three points
 */
export type TriangleSurface = Triangle3D;

/**
 * An arc curve in 3D space
 */
export interface ArcCurve {
    /**
     * The base plane of the arc
     */
    plane: Plane;
    /**
     * The start angle of the arc
     */
    startAngle: number;
    /**
     * The end angle of the arc
     */
    endAngle: number;
    /**
     * The radius of the arc
     */
    radius: number;
}

/**
 * An oriented box in 3D space
 */
export interface OrientedBox {
    /**
     * The plane that the box is aligned to
     */
    plane: Plane;
    /**
     * The bounding box in the local coordinate system
     */
    bounds: BoundingBox3D;
}

/**
 * Clip plane display handle for wasm interop
 * Used to display geometry clipped by a plane
 */
export interface ClipPlaneDisplayHandle {
    /**
     * Geometry ID for the geometry being clipped
     */
    geometryId: ID<GeometryProxy>;
    /**
     * Transform matrix for the geometry
     */
    transform: TransformInterop;
    /**
     * Plane origin [x, y, z]
     */
    planeOrigin: [number, number, number];
    /**
     * Plane normal [x, y, z]
     */
    planeNormal: [number, number, number];
}

/**
 * Color mode for Implicit slice visualization
 */
export type SliceColorMode = "HeatMap" | "Grayscale";

/**
 * Constraint marker handle for wasm interop
 */
export interface ConstraintMarkerHandle {
    /**
     * Position [x, y, z]
     */
    position: [number, number, number];
    /**
     * Fixed degrees of freedom [x, y, z]
     */
    fix: [boolean, boolean, boolean];
}

/**
 * Curve interop handle for wasm interop
 * stride = 3 (x, y, z)
 */
export interface CurveInteropHandle {
    count: number;
    vertices: number;
    transform: TransformInterop | undefined;
}

/**
 * Defines the dynamics of an IO parameter.
 */
export interface IOVariables {
    minCount: number;
    maxCount: number;
    defaultCount: number;
    offset: number;
    editable: boolean;
}

/**
 * Evaluation item interoperability type.
 */
export type Item = { variant: "Bool"; data: boolean } | { variant: "String"; data: string } | { variant: "Number"; data: number } | { variant: "Domain"; data: Domain } | { variant: "Vector3"; data: Vector3<number> } | { variant: "Matrix4"; data: Matrix4<number> } | { variant: "Complex"; data: Complex<number> } | { variant: "Point3"; data: Point3<number> } | { variant: "Plane"; data: Plane } | { variant: "GeometryTransform"; data: GeometryTransformInterop } | { variant: "MeshFace"; data: MeshTriangleFace };

/**
 * FEM display handle for wasm interop
 * Used to display FEM analysis results as colored surface mesh
 */
export interface FEMDisplayHandle {
    /**
     * Pointer to positions array [[f32; 3]; n]
     */
    positionsPtr: number;
    /**
     * Number of positions
     */
    positionsLen: number;
    /**
     * Pointer to colors array [[f32; 4]; n]
     */
    colorsPtr: number;
    /**
     * Number of colors
     */
    colorsLen: number;
    /**
     * Pointer to indices array [[u32; 3]; n]
     */
    indicesPtr: number;
    /**
     * Number of triangles
     */
    indicesLen: number;
    /**
     * Scalar value range [min, max]
     */
    scalarRange: [number, number];
    /**
     * Attribute name being visualized
     */
    attributeName: string;
    /**
     * Constraint markers for boundary condition visualization
     */
    constraintMarkers: ConstraintMarkerHandle[];
    /**
     * Load arrows for force visualization
     */
    loadArrows: LoadArrowHandle[];
}

/**
 * Geometry identifier
 */
export interface GeometryIdentifier {
    /**
     * Parent node ID
     */
    graphNodeSet?: GraphNodeSet;
    /**
     * Output ID that the geometry is belonged to
     */
    outputId: OutputId;
    /**
     * Geometry ID
     */
    geometryId: ID<GeometryProxy>;
    /**
     * Transform matrix in interop format
     */
    transform: TransformInterop;
}

/**
 * Geometry proxy for various geometry types
 */
export type GeometryProxy = { variant: "Curve"; data: CurveProxy } | { variant: "Surface"; data: SurfaceProxy } | { variant: "Brep"; data: Brep } | { variant: "Mesh"; data: Mesh } | { variant: "VolumeMesh"; data: VolumeMesh } | { variant: "BBox"; data: OrientedBox } | { variant: "Group"; data: Group };

/**
 * Graph structure
 */
export interface Graph<T, U> {
    /**
     * Nodes in the graph
     */
    nodes: IndexMap<NodeId, Node<T, U>>;
    /**
     * nested graphs
     */
    sub_graphs?: IndexMap<SubGraphId, SubGraph<T, U>>;
}

/**
 * Handle for VolumeMeshInterop data, providing pointers to the underlying data
 * for efficient transfer to JavaScript/WebGL
 */
export interface VolumeMeshInteropHandle {
    /**
     * Number of vertices
     */
    vertexCount: number;
    /**
     * Pointer to vertices array ([f32; 3])
     */
    vertices: number;
    /**
     * Number of cell indices
     */
    cellIndicesCount: number;
    /**
     * Pointer to cell indices array (usize)
     */
    cellIndices: number;
    /**
     * Number of cells
     */
    cellCount: number;
    /**
     * Pointer to cell offsets array (usize)
     */
    cellOffsets: number;
    /**
     * Pointer to cell types array (u8)
     */
    cellTypes: number;
    /**
     * Optional vertex attributes (e.g., scalar field values)
     */
    vertexAttributes: VolumeMeshAttributeHandle | undefined;
    /**
     * Optional cell attributes
     */
    cellAttributes: VolumeMeshAttributeHandle | undefined;
    /**
     * Optional transform matrix
     */
    transform: TransformInterop | undefined;
}

/**
 * Handle for attribute data
 */
export interface VolumeMeshAttributeHandle {
    /**
     * Number of attribute values
     */
    count: number;
    /**
     * Pointer to attribute values array (f32)
     */
    values: number;
}

/**
 * Implicit identifier for tracking Implicit changes across evaluations.
 * The hash changes when the Implicit content changes, allowing the frontend
 * to detect when a renderer needs to be recreated.
 */
export interface ImplicitIdentifier {
    /**
     * Parent node set (node ID + optional subgraph info)
     */
    graphNodeSet?: GraphNodeSet;
    /**
     * Output ID that the Implicit belongs to
     */
    outputId: OutputId;
    /**
     * Path within the DataTree
     */
    path: DataPath;
    /**
     * Index of item in the list
     */
    index: number;
    /**
     * Hash of the Implicit content - changes when Implicit changes.
     * Serialized as string to preserve full u64 precision in JavaScript.
     */
    hash: string;
    /**
     * Bounding box for selection (None for infinite/unbounded Implicit surfaces)
     */
    boundingBox?: BoundingBox;
}

/**
 * Interop proxy for various geometry types
 */
export type GeometryInterop = { variant: "Mesh"; data: MeshInterop } | { variant: "VolumeMesh"; data: VolumeMeshInterop } | { variant: "Curve"; data: CurveInterop } | { variant: "Point"; data: PointCloudInterop } | { variant: "Plane"; data: Plane } | { variant: "Group"; data: GeometryInterop[] };

/**
 * Interop struct for curve data
 */
export interface CurveInterop {
    /**
     * Vertices of the curve
     */
    vertices: [number, number, number][];
    /**
     * Transform matrix of the curve
     */
    transform: Transform3<number> | undefined;
}

/**
 * Interop struct for evaluation results
 */
export interface EvaluationInterop {
    /**
     * Processed nodes in the latest evaluation
     */
    processedNodes: GraphNodeSet[];
    /**
     * Geometry identifiers in the latest evaluation
     */
    geometryIdentifiers: GeometryIdentifier[];
    /**
     * Implicit identifiers in the latest evaluation (with hash for change detection)
     */
    implicitIdentifiers: ImplicitIdentifier[];
}

/**
 * Interop struct for mesh data
 */
export interface MeshInterop {
    /**
     * Vertices of the mesh
     */
    vertices: [number, number, number][];
    /**
     * Normals of the mesh
     */
    normals: [number, number, number][];
    /**
     * Colors of the mesh
     */
    colors?: [number, number, number][];
    /**
     * UV coordinates of the mesh
     */
    uv?: [number, number][];
    /**
     * Faces of the mesh
     */
    faces?: [number, number, number][];
    /**
     * Transform matrix of the mesh
     */
    transform?: Transform3<number>;
}

/**
 * Interop struct for node
 */
export interface NodeInterop {
    /**
     * Node variant
     */
    variant: string;
    /**
     * Node identifier
     */
    id: string;
    name: string;
    label: string | undefined;
    description: string;
    /**
     * Input parameters
     */
    inputs: IOInterop[];
    /**
     * Input variables
     */
    inputVariables: IOVariables | undefined;
    /**
     * Output parameters
     */
    outputs: IOInterop[];
    /**
     * Output variables
     */
    outputVariables: IOVariables | undefined;
    /**
     * Node properties
     */
    properties: NodePropertyInterop[];
    enabled: boolean;
    visible: boolean;
    meta: NodeMetaInterop;
}

/**
 * Interop struct for node meta
 */
export interface NodeMetaInterop {
    /**
     * Error message
     */
    error: string | undefined;
    /**
     * Node\' output has geometry or not
     */
    hasGeometry: boolean;
}

/**
 * Interop struct for node property
 */
export interface NodePropertyInterop {
    /**
     * Property name
     */
    name: string;
    /**
     * Property value
     */
    value: NodePropertyValue;
    /**
     * Whether the node has input connection and the property change is disabled
     */
    connected?: boolean;
    /**
     * Whether the property is disabled in node\' inspector
     */
    disabled?: boolean;
}

/**
 * Interop struct for point cloud data
 */
export interface PointCloudInterop {
    /**
     * Vertices of the point cloud
     */
    vertices: [number, number, number][];
    /**
     * Transform matrix of the point cloud
     */
    transform: Transform3<number>;
}

/**
 * Interop struct for transform
 * Represents a 4x4 matrix as a 16-element array
 */
export type TransformInterop = number[];

/**
 * Interop struct for volume mesh data
 * Used for transferring volumetric mesh data between WASM and JavaScript
 */
export interface VolumeMeshInterop {
    /**
     * Vertices of the mesh as flat array [x0, y0, z0, x1, y1, z1, ...]
     */
    vertices: [number, number, number][];
    /**
     * Cell connectivity - indices into vertices array
     */
    cell_indices: number[];
    /**
     * Cell offsets - end index of each cell in cell_indices
     */
    cell_offsets: number[];
    /**
     * Cell types (0=Tetrahedron, 1=Hexahedron, 2=Wedge, 3=Pyramid)
     */
    cell_types: number[];
    /**
     * Optional vertex attributes (e.g., scalar field values)
     */
    vertex_attributes?: number[];
    /**
     * Optional cell attributes
     */
    cell_attributes?: number[];
    /**
     * Transform matrix of the mesh
     */
    transform?: Transform3<number>;
}

/**
 * Lightweight IO interop for NodeEntityInterop
 */
export interface IOEntityInterop {
    id: string;
    hint: TypeHint;
}

/**
 * Load arrow handle for wasm interop
 */
export interface LoadArrowHandle {
    /**
     * Position [x, y, z]
     */
    position: [number, number, number];
    /**
     * Direction (normalized) [x, y, z]
     */
    direction: [number, number, number];
    /**
     * Force magnitude
     */
    magnitude: number;
}

/**
 * Mesh representation with vertices, normals, uv, and index
 */
export interface Mesh {
    /**
     * Vertices of the mesh
     */
    vertices: Point3<number>[];
    /**
     * Normals of the mesh
     */
    normals: Vector3<number>[] | undefined;
    /**
     * UV coordinates of the mesh
     */
    uv: Vector2<number>[] | undefined;
    /**
     * Colors of the mesh
     */
    colors: Vector3<number>[] | undefined;
    /**
     * Index of the mesh
     */
    index: [number, number, number][];
}

/**
 * Options for adaptive tessellation to create geometry interoperability
 */
export interface AdaptiveTessellationOptions {
    /**
     * Whether to enable adaptive tessellation
     */
    enabled: boolean;
    /**
     * Tolerance for the normal vector: if the L2 norm of the normal vectors is below this value, the edge is considered flat
     */
    normTolerance: number;
    /**
     * Minimum number of divisions in u direction
     */
    minDivsU: number;
    /**
     * Minimum number of divisions in v direction
     */
    minDivsV: number;
    /**
     * Minimum depth for division
     */
    minDepth: number;
    /**
     * Maximum depth for division
     */
    maxDepth: number;
}

/**
 * Plane representation with origin, normal, x axis, and y axis
 */
export interface Plane {
    /**
     * Origin coordinate of the plane
     */
    origin: Point3<number>;
    /**
     * Normal vector of the plane
     */
    normal: Vector3<number>;
    /**
     * X axis of the plane
     */
    xAxis: Vector3<number>;
    /**
     * Y axis of the plane
     */
    yAxis: Vector3<number>;
}

/**
 * Point display handle for wasm interop
 */
export interface PointListDisplayHandle {
    list: PointListHandleUnit[];
    pointSize: number;
}

/**
 * Proxy for various curve types
 */
export type CurveProxy = { variant: "Line"; data: LineCurve3D } | { variant: "Arc"; data: ArcCurve } | { variant: "Circle"; data: CircleCurve } | { variant: "Ellipse"; data: EllipseCurve } | { variant: "Rectangle"; data: RectangleCurve } | { variant: "Polyline"; data: PolylineCurve3D } | { variant: "NURBS"; data: NurbsCurve } | { variant: "Poly"; data: PolyCurve };

/**
 * Proxy for various surface types
 */
export type SurfaceProxy = { variant: "Circular"; data: CircularSurface } | { variant: "Triangle"; data: TriangleSurface } | { variant: "Plane"; data: PlaneSurface } | { variant: "Torus"; data: TorusSurface } | { variant: "NURBS"; data: NurbsSurface } | { variant: "Trimmed"; data: TrimmedSurface };

/**
 * SDF slice display handle for wasm interop
 */
export interface ImplicitSliceDisplayHandle {
    /**
     * Pointer to the f32 values array
     */
    valuesPtr: number;
    /**
     * Number of f32 values
     */
    valuesLen: number;
    /**
     * Resolution [width, height] of the 2D slice
     */
    resolution: [number, number];
    /**
     * Bounding box min [x, y, z]
     */
    bboxMin: [number, number, number];
    /**
     * Bounding box max [x, y, z]
     */
    bboxMax: [number, number, number];
    /**
     * Slice position (0.0 to 1.0)
     */
    slicePosition: number;
    /**
     * Slice axis
     */
    sliceAxis: SliceAxis;
    /**
     * Color mode
     */
    colorMode: SliceColorMode;
    /**
     * Whether this display has an implicit node for raymarching
     */
    hasImplicitNode: boolean;
    /**
     * Flip the clip direction for raymarching
     */
    flipDirection: boolean;
    /**
     * View mode (HeatmapAndImplicit, HeatmapOnly, or ImplicitOnly)
     */
    viewMode: SliceViewMode;
}

/**
 * Slice axis for Implicit field visualization
 */
export type SliceAxis = "X" | "Y" | "Z";

/**
 * Texture display handle for wasm interop
 */
export interface TextureDisplayHandle {
    /**
     * Pointer to RGBA bytes
     */
    rgbaPtr: number;
    /**
     * Length of RGBA bytes
     */
    rgbaLen: number;
    /**
     * Image width in pixels
     */
    imageWidth: number;
    /**
     * Image height in pixels
     */
    imageHeight: number;
    /**
     * Display width (in world units)
     */
    width: number;
    /**
     * Display height (in world units)
     */
    height: number;
    /**
     * Position X
     */
    positionX: number;
    /**
     * Position Y
     */
    positionY: number;
}

/**
 * Vector display handle for wasm interop
 * stride = 6 (3 for point, 3 for vector)
 */
export interface VectorDisplayHandle {
    count: number;
    vertices: number;
}

/**
 * View mode for controlling which visual elements are displayed
 */
export type SliceViewMode = "Both" | "HeatmapOnly" | "ImplicitOnly";

/**
 * Volume display handle for wasm interop
 * Used to display 3D volume data using Data3DTexture
 */
export interface FieldDisplayHandle {
    /**
     * Pointer to raw volume data [f32; width * height * depth]
     */
    dataPtr: number;
    /**
     * Number of data elements
     */
    dataLen: number;
    /**
     * Volume resolution [width, height, depth]
     */
    resolution: [number, number, number];
    /**
     * Scalar value range [min, max] (original range before normalization)
     */
    scalarRange: [number, number];
    /**
     * Bounding box min [x, y, z]
     */
    bboxMin: [number, number, number];
    /**
     * Bounding box max [x, y, z]
     */
    bboxMax: [number, number, number];
    /**
     * Color map type (0=Viridis, 1=Jet, 2=Heat)
     */
    colorMap: number;
}

export interface ConnectedComponentNode {
    sources: NodeId[];
    destinations: NodeId[];
}

export interface ConnectedComponents<T, U> {
    nodes: IndexMap<NodeId, ConnectedComponentNode<T, U>>;
}

export interface Connection {
    source: NodeParameter<OutputId>;
    destination: NodeParameter<InputId>;
}

export interface DataTreeFormatInterop {
    outputs: IndexMap<string, string>;
}

export interface DataTreeInterop {
    branches: IndexMap<string, string[]>;
}

export interface Domain {
    min: number;
    max: number;
}

export interface EdgeInterop {
    source: EdgeUnitInterop<OutputId>;
    destination: EdgeUnitInterop<InputId>;
    empty: boolean;
}

export interface EdgeUnitInterop<IO> {
    node: NodeId;
    io: IO;
}

export interface GeometrySpreadsheet {
    points: Point3<number>[];
    curves: CurveProxy[];
    surfaces: SurfaceProxy[];
    meshes: MeshInterop[];
}

export interface GeometryTransformInterop {
    geometry: GeometryProxy;
    transform: TransformInterop;
}

export interface GroupInteropHandle {
    objects: GeometryInteropHandleProxy[];
}

export interface IOInterop {
    id: string;
    name: string;
    accessType: AccessTypes;
    hint: TypeHint | undefined;
    connections: string[];
}

export interface IOManager<T, U> {
    parameters: IOParameter<T, U>[];
}

export interface IndicesInteropHandle {
    count: number;
    indices: number;
}

export interface MeshInteropHandle {
    count: number;
    vertices: number;
    normals: number;
    uv: number | undefined;
    indices: IndicesInteropHandle | undefined;
    transform: TransformInterop | undefined;
}

export interface Node<T> {
    id: NodeId;
    name: string;
    label: string | undefined;
    input: InputIOManager;
    output: OutputIOManager;
    entity: T;
    enabled: boolean;
    visible: boolean;
}

export interface NodeConnectionInterop {
    outputNodeId: string;
    outputIndex: number;
    inputNodeId: string;
    inputIndex: number;
    inputConnectionIndex: number | undefined;
}

export interface NodeCreationSetting {
    id: NodeId;
    variant: string;
    name?: string;
    label?: string;
    inputs?: number;
    outputs?: number;
    properties: NodePropertyInterop[];
    enabled?: boolean;
    visible?: boolean;
}

export interface NodeEntityInterop {
    variant: string;
    id: string;
    name: string;
    label: string | undefined;
    inputs: IOEntityInterop[];
    outputs: IOEntityInterop[];
    enabled: boolean;
    visible: boolean;
}

export interface NodeEvaluation {
    nodeId: NodeId;
    name: string;
    subGraphInstanceId: SubGraphInstanceId | undefined;
}

export interface NodeItemInterop {
    key: string;
    name: string;
}

export interface NodeMapInterop {
    folder: NodeFolderInterop;
}

export interface NodeParameter<T> {
    nodeId: NodeId;
    parameterId: T;
    parameterIndex: number;
}

export interface NodePropertyCategoryValue {
    candidates: IndexMap<string, number>;
    selected: number;
}

export interface NodePropertyRangeValue {
    value: number;
    min: number | undefined;
    max: number | undefined;
    step: number | undefined;
}

export interface PointListHandleUnit {
    count: number;
    points: number;
}

export interface Prune<T, U> {
    connectedComponents: ConnectedComponents<T, U>[];
    bypass: Connection[] | undefined;
}

export interface SubGraphIdSet {
    subGraphId: SubGraphId;
    instanceId: SubGraphInstanceId;
}

export type AccessTypes = "Item" | "List" | "Tree";

export type DisplayProxyHandle = { variant: "Vector"; data: VectorDisplayHandle } | { variant: "PointList"; data: PointListDisplayHandle } | { variant: "ImplicitSlice"; data: ImplicitSliceDisplayHandle } | { variant: "Texture"; data: TextureDisplayHandle } | { variant: "ClipPlane"; data: ClipPlaneDisplayHandle } | { variant: "FEM"; data: FEMDisplayHandle } | { variant: "Field"; data: FieldDisplayHandle };

export type EdgeInteropVec = EdgeInterop[];

export type EvaluatorEvent = ({ type: "nodeStart" } & NodeEvaluation) | ({ type: "nodeEnd" } & NodeEvaluation) | { type: "finished" };

export type GeometryInteropHandleProxy = { variant: "Mesh"; data: MeshInteropHandle } | { variant: "VolumeMesh"; data: VolumeMeshInteropHandle } | { variant: "Curve"; data: CurveInteropHandle } | { variant: "Group"; data: GroupInteropHandle };

export type GeometryInteropVec = GeometryInterop[];

export type GraphMappingTypes = "None" | "Bezier" | "Linear" | "Sine";

export type GraphVariant = "Root" | { SubGraph: SubGraphId };

export type InputIOManager = IOManager<InputId, OutputId>;

export type NodeConnectionInteropVec = NodeConnectionInterop[];

export type NodeFolderInterop = IndexMap<string, NodeSectionInterop>;

export type NodeInteropVec = NodeInterop[];

export type NodeOutput = (Map<string, Item[]> | undefined)[];

export type NodePropertyInteropVec = NodePropertyInterop[];

export type NodePropertyValue = { type: "Number"; content: number } | { type: "Range"; content: NodePropertyRangeValue } | { type: "Range2d"; content: [NodePropertyRangeValue, NodePropertyRangeValue] } | { type: "String"; content: string } | { type: "Bool"; content: boolean } | { type: "NumberVector"; content: number[] } | { type: "Category"; content: NodePropertyCategoryValue } | { type: "Vector2d"; content: [number, number] } | { type: "Vector3d"; content: [number, number, number] } | { type: "Point2d"; content: [number, number] } | { type: "Point3d"; content: [number, number, number] } | { type: "Points2d"; content: [number, number][] } | { type: "Buffer"; content: number[] };

export type NodeSectionInterop = { type: "section"; content: NodeFolderInterop } | { type: "item"; content: NodeItemInterop };

export type NurbsCurve = NurbsCurve3D<number>;

export type OutputIOManager = IOManager<OutputId, InputId>;

export type PolyCurve = CompoundCurve<number, U4>;


/**
 * Modular structure with a graph handle
 */
export class Modular {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Change a node property with node id and property
     */
    changeNodeProperty(node_id: string, prop: NodePropertyInterop, graph_id?: string | null): boolean;
    /**
     * Clear the graph
     */
    clearGraph(): void;
    /**
     * Evaluate the graph with latest state
     */
    evaluate(): Promise<EvaluationInterop>;
    /**
     * Export the graph in JSON format
     */
    exportGraph(): Graph;
    /**
     * Find a geometry by its identifier
     */
    findGeometryById(identifier: GeometryIdentifier): GeometryProxy | undefined;
    /**
     * Find a geometry interop by its identifier
     */
    findGeometryInteropById(identifier: GeometryIdentifier): GeometryInterop | undefined;
    /**
     * Get the outputs of a node
     */
    getNodeOutput(node_id: string): NodeOutput | undefined;
    /**
     * Get all nodes in the graph
     */
    getNodes(): NodeInterop[];
    /**
     * Load a graph from a JSON string
     */
    loadGraph(input: string): void;
    /**
     * Create a new modular instance
     */
    static new(): Modular;
    /**
     * Update the tessellation options to modify the tessellation quality for geometry interoperability
     */
    updateTessellationOptions(options?: AdaptiveTessellationOptions | null): void;
}

export function do_nothing_just_tell_wasm_bindgen_to_generate_types(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_modular_free: (a: number, b: number) => void;
    readonly modular_changeNodeProperty: (a: number, b: number, c: number, d: any, e: number, f: number) => number;
    readonly modular_clearGraph: (a: number) => void;
    readonly modular_evaluate: (a: number) => any;
    readonly modular_exportGraph: (a: number) => any;
    readonly modular_findGeometryById: (a: number, b: any) => any;
    readonly modular_findGeometryInteropById: (a: number, b: any) => any;
    readonly modular_getNodeOutput: (a: number, b: number, c: number) => any;
    readonly modular_getNodes: (a: number) => [number, number];
    readonly modular_loadGraph: (a: number, b: number, c: number) => [number, number];
    readonly modular_new: () => number;
    readonly modular_updateTessellationOptions: (a: number, b: number) => void;
    readonly do_nothing_just_tell_wasm_bindgen_to_generate_types: () => void;
    readonly wasm_bindgen__closure__destroy__h3fdafb665afa6310: (a: number, b: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h631ee502614521f5: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__hd6c6aa01338fb7aa: (a: number, b: number, c: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
