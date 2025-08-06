import React, { useMemo, useCallback } from "react";
import { useModularWorkerStore } from "@/stores/modularWorker";
import { useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";



export const PropertyPanel: React.FC = () => {
  const {nodes, updateNodeProperty} = useModularWorkerStore();
  
  console.log('PropertyPanel render, nodes:', nodes.length);

  const handleChange = useCallback(
    (id: string, value: number) => {
      // 現在の値と同じ場合は更新しない
      const node = nodes.find(n => n.id === id);
      const currentValue = node?.properties.find(p => p.name === "value")?.value.content;
      if (currentValue !== value) {
        updateNodeProperty(id, value);
      }
    },
    [nodes, updateNodeProperty]
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

    // Add DXF export button
    return {
      ...nodeParams
    };
  }, [nodes, handleChange]);

  
  useControls(params, [params]);

  return null;
};
