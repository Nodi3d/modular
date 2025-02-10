import init, { Modular } from "npm:nodi-modular@0.0.9";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import file from "./attractor.json" with { type: "json" };

await init();

const modular = Modular.new();

// load graph from json
const { graph } = file;
const s = JSON.stringify(graph);
modular.loadGraph(s);

const result = await modular.evaluate();
assertEquals(result.geometryIdentifiers.length, 64);

result.geometryIdentifiers.forEach((id) => {
  // get geometry by id 
  const geometry = modular.findGeometryById(id);
  console.log(geometry);
});

// get nodes in the graph & extract the number of grid node
const nodes = modular.getNodes();
const numberOfGrid = nodes.find((n) => n.variant === "Number" && n.label === 'number of grid');

const gridCount = 30;
if (numberOfGrid !== undefined) {
  // change number of grid value to 30
  modular.changeNodeProperty(numberOfGrid.id, {
    name: "value",
    value: {
      type: "Number",
      content: gridCount
    }
  });
  // console.log(numberOfGrid?.properties);
}

// re-evaluate the graph after changing the number of grid
const result2 = await modular.evaluate();
assertEquals(result2.geometryIdentifiers.length, (gridCount + 1) * (gridCount + 1));

