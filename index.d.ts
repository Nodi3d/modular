/* tslint:disable */
/* eslint-disable */
export function do_nothing_just_tell_wasm_bindgen_to_generate_types(): void;
/**
 * Evaluation item interoperability type.
 */
export type Item = { variant: "Bool"; data: boolean } | { variant: "String"; data: string } | { variant: "Number"; data: number } | { variant: "Domain"; data: Domain } | { variant: "Vector3"; data: Vector3<number> } | { variant: "Matrix4"; data: Matrix4<number> } | { variant: "Complex"; data: Complex<number> } | { variant: "Point3"; data: Point3<number> } | { variant: "Plane"; data: Plane } | { variant: "GeometryTransform"; data: GeometryTransformInterop } | { variant: "MeshFace"; data: MeshTriangleFace };

export interface GeometryTransformInterop {
    geometry: GeometryProxy;
    transform: TransformInterop;
}

export type NodeOutput = (Map<string, Item[]> | undefined)[];

export interface GroupInteropHandle {
    objects: GeometryInteropHandleProxy[];
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

export interface IndicesInteropHandle {
    count: number;
    indices: number;
}

export type GeometryInteropHandleProxy = { variant: "Mesh"; data: MeshInteropHandle } | { variant: "Curve"; data: CurveInteropHandle } | { variant: "Group"; data: GroupInteropHandle };

export interface DataTreeInterop {
    branches: IndexMap<string, string[]>;
}

export interface DataTreeFormatInterop {
    outputs: IndexMap<string, string>;
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

export interface MeshInteropHandle {
    count: number;
    vertices: number;
    normals: number;
    indices: IndicesInteropHandle | undefined;
    transform: TransformInterop | undefined;
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

export interface NodeEntityInterop {
    variant: string;
    id: string;
    name: string;
    label: string | undefined;
    inputs: string[];
    outputs: string[];
    enabled: boolean;
    visible: boolean;
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

export interface NodeConnectionInterop {
    outputNodeId: string;
    outputIndex: number;
    inputNodeId: string;
    inputIndex: number;
    inputConnectionIndex: number | undefined;
}

export interface PointListHandleUnit {
    count: number;
    points: number;
}

/**
 * Point display handle for wasm interop
 */
export interface PointListDisplayHandle {
    list: PointListHandleUnit[];
    pointSize: number;
}

/**
 * Vector display handle for wasm interop
 * stride = 6 (3 for point, 3 for vector)
 */
export interface VectorDisplayHandle {
    count: number;
    vertices: number;
}

export type DisplayProxyHandle = { variant: "Vector"; data: VectorDisplayHandle } | { variant: "PointList"; data: PointListDisplayHandle };

export interface GeometrySpreadsheet {
    points: Point3<number>[];
    curves: CurveProxy[];
    surfaces: SurfaceProxy[];
    meshes: MeshInterop[];
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
 * Interop struct for transform
 * Represents a 4x4 matrix as a 16-element array
 */
export type TransformInterop = number[];

export type GeometryInteropVec = GeometryInterop[];

export type NodeConnectionInteropVec = NodeConnectionInterop[];

export type NodePropertyInteropVec = NodePropertyInterop[];

export type NodeInteropVec = NodeInterop[];

export type EdgeInteropVec = EdgeInterop[];

export interface IOInterop {
    id: string;
    name: string;
    accessType: AccessTypes;
    hint: TypeHint | undefined;
    connections: string[];
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

export type NodeSectionInterop = { type: "section"; content: NodeFolderInterop } | { type: "item"; content: NodeItemInterop };

export interface NodeItemInterop {
    key: string;
    name: string;
}

export type NodeFolderInterop = IndexMap<string, NodeSectionInterop>;

export interface NodeMapInterop {
    folder: NodeFolderInterop;
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

export interface SubGraphIdSet {
    subGraphId: SubGraphId;
    instanceId: SubGraphInstanceId;
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

export type NodePropertyValue = { type: "Number"; content: number } | { type: "Range"; content: NodePropertyRangeValue } | { type: "Range2d"; content: [NodePropertyRangeValue, NodePropertyRangeValue] } | { type: "String"; content: string } | { type: "Bool"; content: boolean } | { type: "NumberVector"; content: number[] } | { type: "Category"; content: NodePropertyCategoryValue } | { type: "Vector2d"; content: [number, number] } | { type: "Vector3d"; content: [number, number, number] } | { type: "Point2d"; content: [number, number] } | { type: "Point3d"; content: [number, number, number] } | { type: "Points2d"; content: [number, number][] } | { type: "Buffer"; content: number[] };

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
 * A set of node id and instance id
 */
export interface GraphNodeSet {
    subGraphIdSet: SubGraphIdSet | undefined;
    nodeId: NodeId;
}

export type AccessTypes = "Item" | "List" | "Tree";

export interface Connection {
    source: NodeParameter<OutputId>;
    destination: NodeParameter<InputId>;
}

export interface NodeParameter<T> {
    nodeId: NodeId;
    parameterId: T;
    parameterIndex: number;
}

export interface ConnectedComponentNode {
    sources: NodeId[];
    destinations: NodeId[];
}

export interface ConnectedComponents<T, U> {
    nodes: IndexMap<NodeId, ConnectedComponentNode<T, U>>;
}

export type TypeHint = Internal;

export type GraphMappingTypes = "None" | "Bezier" | "Linear" | "Sine";

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

export type OutputIOManager = IOManager<OutputId, InputId>;

export type InputIOManager = IOManager<InputId, OutputId>;

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

export type GraphVariant = "Root" | { SubGraph: SubGraphId };

export interface IOManager<T, U> {
    parameters: IOParameter<T, U>[];
}

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

export interface Prune<T, U> {
    connectedComponents: ConnectedComponents<T, U>[];
    bypass: Connection[] | undefined;
}


export type LineCurve3D = {
    a: Point3;
    b: Point3;
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
 * A collection of geometry objects
 */
export type Group = GeometryTransform[];

/**
 * Proxy for various surface types
 */
export type SurfaceProxy = { variant: "Circular"; data: CircularSurface } | { variant: "Triangle"; data: TriangleSurface } | { variant: "Plane"; data: PlaneSurface } | { variant: "NURBS"; data: NurbsSurface } | { variant: "Trimmed"; data: TrimmedSurface };

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
 * Interop proxy for various geometry types
 */
export type GeometryInterop = { variant: "Mesh"; data: MeshInterop } | { variant: "Curve"; data: CurveInterop } | { variant: "Point"; data: PointCloudInterop } | { variant: "Plane"; data: Plane } | { variant: "Group"; data: GeometryInterop[] };

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
 * Geometry proxy for various geometry types
 */
export type GeometryProxy = { variant: "Curve"; data: CurveProxy } | { variant: "Surface"; data: SurfaceProxy } | { variant: "Brep"; data: Brep } | { variant: "Mesh"; data: Mesh } | { variant: "BBox"; data: OrientedBox } | { variant: "Group"; data: Group };

export type PolyCurve = CompoundCurve<number, U4>;

/**
 * Proxy for various curve types
 */
export type CurveProxy = { variant: "Line"; data: LineCurve3D } | { variant: "Arc"; data: ArcCurve } | { variant: "Circle"; data: CircleCurve } | { variant: "Ellipse"; data: EllipseCurve } | { variant: "Rectangle"; data: RectangleCurve } | { variant: "Polyline"; data: PolylineCurve3D } | { variant: "NURBS"; data: NurbsCurve } | { variant: "Poly"; data: PolyCurve };


export type NurbsSurface3D<T = number> = {
    control_points: Point4<T>[][];
    u_knots: T[];
    v_knots: T[];
    u_degree: T;
    v_degree: T;
};

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
 * A NURBS surface container
 */
export type NurbsSurface = NurbsSurface3D<number>;

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


export type BoundingBox3D = {
    min: Vector3;
    max: Vector3;
};

export interface Domain {
    min: number;
    max: number;
}

/**
 * A face of a mesh with three vertices
 */
export interface MeshTriangleFace {
    a: number;
    b: number;
    c: number;
}


export type NurbsCurve3D<T = number> = {
    control_points: Point4<T>[];
    knots: T[];
    degree: T;
};

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
 * A surface defined by three points
 */
export type TriangleSurface = Triangle3D;

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

export type NurbsCurve = NurbsCurve3D<number>;

/**
 * Modular structure with a graph handle
 */
export class Modular {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a new modular instance
   */
  static new(): Modular;
  /**
   * Load a graph from a JSON string
   */
  loadGraph(input: string): void;
  /**
   * Export the graph in JSON format
   */
  exportGraph(): Graph;
  /**
   * Clear the graph
   */
  clearGraph(): void;
  /**
   * Evaluate the graph with latest state
   */
  evaluate(): Promise<EvaluationInterop>;
  /**
   * Get all nodes in the graph
   */
  getNodes(): NodeInterop[];
  /**
   * Change a node property with node id and property
   */
  changeNodeProperty(node_id: string, prop: NodePropertyInterop, graph_id?: string | null): boolean;
  /**
   * Get the outputs of a node
   */
  getNodeOutput(node_id: string): NodeOutput | undefined;
  /**
   * Find a geometry by its identifier
   */
  findGeometryById(identifier: GeometryIdentifier): GeometryProxy | undefined;
  /**
   * Find a geometry interop by its identifier
   */
  findGeometryInteropById(identifier: GeometryIdentifier): GeometryInterop | undefined;
  /**
   * Update the tessellation options to modify the tessellation quality for geometry interoperability
   */
  updateTessellationOptions(options?: AdaptiveTessellationOptions | null): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_modular_free: (a: number, b: number) => void;
  readonly modular_new: () => number;
  readonly modular_loadGraph: (a: number, b: number, c: number) => [number, number];
  readonly modular_exportGraph: (a: number) => any;
  readonly modular_clearGraph: (a: number) => void;
  readonly modular_evaluate: (a: number) => any;
  readonly modular_getNodes: (a: number) => [number, number];
  readonly modular_changeNodeProperty: (a: number, b: number, c: number, d: any, e: number, f: number) => number;
  readonly modular_getNodeOutput: (a: number, b: number, c: number) => any;
  readonly modular_findGeometryById: (a: number, b: any) => any;
  readonly modular_findGeometryInteropById: (a: number, b: any) => any;
  readonly modular_updateTessellationOptions: (a: number, b: number) => void;
  readonly do_nothing_just_tell_wasm_bindgen_to_generate_types: () => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __wbindgen_export_5: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly closure964_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure3977_externref_shim: (a: number, b: number, c: any, d: any) => void;
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
