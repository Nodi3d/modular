# Nodi modular

[![npm version](https://img.shields.io/npm/v/nodi-modular.svg?style=flat)](https://www.npmjs.com/package/nodi-modular)
[![License](https://img.shields.io/npm/l/nodi-modular.svg?style=flat)](https://www.npmjs.com/package/nodi-modular)

Modular is a module project designed to import node graphs created in Nodi in JSON format, enabling the extraction of geometric data generated based on the node graph structure.

It is provided in WebAssembly format, making it usable not only in web frontend applications but also in various applications that support WebAssembly.

## Installation

```bash
npm install nodi-modular
```

or yarn

```bash
yarn add nodi-modular
```

## Example

We provide examples of how to use the Modular module in the `examples` directory with following environments:

- [deno](https://github.com/Nodi3d/modular/tree/main/examples/deno)
- [react](https://github.com/Nodi3d/modular/tree/main/examples/react)

## Usage

```javascript

import init, { Modular } from "nodi-modular";

// Initialize the WebAssembly module
await init();

// Create a new instance of the Modular
const modular = Modular.new();

// Load a node graph in JSON format as a string
modular.loadGraph(JSON.stringify({
  nodes: { ... },
}));

// Evaluate the node graph to get the result
const result = modular.evaluate();

// Geometry identifiers are the keys of the geometries in the result
const { geometryIdentifiers } = result;

geometryIdentifiers.forEach((identifier) => {
  // Get the geometry variant by identifier
  // variants are curve, surface, mesh, and etc.
  const geometry = modular.findGeometryById(identifier);

  // Get the geometry interop by identifier
  // geometry interop has the data that can be rendered as a polygonalized data (polyline or triangle mesh)
  const interop = modular.findGeometryInteropById(identifier);
});

// Get the nodes of the node graph
const nodes = modular.getNodes();

// Find the node by the variant and label
const numberOfGrid = nodes.find((n) => n.variant === "Number" && n.label === 'number of grid');

// Each nodes have the properties that can be changed
// What properties can be changed depends on the node variant, so you need to check the node variant's properties (numberGrid["properties"])
modular.changeNodeProperty(numberOfGrid.id, {
  name: "value",
  value: {
    type: "Number",
    content: 30,
  }
});

// re-evaluate the node graph to get the result after the property change
const resultAfterPropertyChange = await modular.evaluate();

```
