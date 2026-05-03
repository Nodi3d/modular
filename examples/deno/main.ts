import init, { Modular } from "npm:nodi-modular@0.0.41";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";

await init();

const modular = Modular.new();

// load graph from .nodi (ZIP) bytes
const bytes = await Deno.readFile(new URL("./Attractor.nodi", import.meta.url));
modular.loadGraph(bytes);

const result = await modular.evaluate();
// Attractor.nodi was saved with `number of grid` = 20 → (20+1)^2 = 441
assertEquals(result.geometryIdentifiers.length, 441);

result.geometryIdentifiers.forEach((id) => {
  // get geometry by id
  const geometry = modular.findGeometryById(id);
  console.log(geometry);
});

// get nodes in the graph & extract the number of grid node
const nodes = modular.getNodes();
const numberOfGrid = nodes.find((n) => n.variant === "Number" && n.label === 'number of cells');

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
