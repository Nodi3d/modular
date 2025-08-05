import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { useModularStore } from "@/stores/modular";
import { useControls } from "leva";
import { Modular } from "nodi-modular";
import { Schema } from "leva/dist/declarations/src/types";



export const PropertyPanel: React.FC = () => {
  const {nodes, modular, evaluateGraph} = useModularStore();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const evaluateRef = useRef<((modular: Modular) => void) | undefined>(undefined);

  // Keep evaluate function reference up to date
  evaluateRef.current = evaluateGraph;

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
        }, 0); // 150ms debounce delay

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

    // Add DXF export button
    return {
      ...nodeParams
    };
  }, [nodes, handleChange]);

  useControls(params, [params]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
    };
  }, []);

  return (
    <></>
  );
};
