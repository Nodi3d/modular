import React, { useMemo, useCallback, useEffect } from "react";
import { useModularWorkerStore } from "@/stores/modularWorker";
import { useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import { useNavigate } from "react-router-dom";
import { useRingStore } from "@/stores/ring";
import sizes from "@/assets/jsons/size.json";
import Icon from "./Icon";
import { Tooltip } from "react-tooltip";



export const PropertyPanel: React.FC = () => {
  const {nodes, updateNodeProperty, nodeIds} = useModularWorkerStore();
  const navigate = useNavigate();
  const {sizeLabel, size} = useRingStore()
  const types = ["braid","bypass", "twist"]
  
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
    [nodes,updateNodeProperty]
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

  useEffect(()=>{
    console.log("params",params)
  },[params])
  

  const handleChangeGraph = useCallback((graph: string) => {
    navigate(`/${graph}`)
  }, [navigate]);

  

  return (
    <div className="absolute bottom-8 inset-x-0 mx-auto z-10 flex gap-2 justify-center">
      <div className="t-dropdown">

      <p>{sizeLabel}</p>
      <ul className="t-dropdown-contents origin-bottom-left bottom-[calc(-100%-32px)] border-1">
        {sizes.sizes.map((size) => (
          <li key={size.value} className="cursor-pointer" onClick={() => handleChange(nodeIds.innerDiameter,size.value)}>
            
            <span className="text-xs text-content-dark-m-b-a mr-1">{size.jp}</span>
            <span className="text-sm text-content-dark-m-b-a">{size.us}</span>
            <span className="text-sm text-content-dark-m-b-a">{size.eu}</span>
          </li>
        ))}
      </ul>
      </div>
      <ul className="bg-content-dark-l-a rounded-full w-fit flex gap-2">
        {types.map((type)=>(
          <li className="cursor-pointer text-center p-4" onClick={() => handleChangeGraph(type)}
            data-tooltip-content={type}
            data-tooltip-id="hint-tooltip"
          >
            <Icon name={type} className="size-10"/>
            
          </li>
        ))}
      </ul>
      
      <Tooltip
          id="hint-tooltip"
          place="bottom"
          className="text-xs"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#ffffff",
            fontSize: "12px",
            padding: "2px 4px 2px 4px",
            borderRadius: "4px",
            userSelect: "none",
          }}
          noArrow
        />
    </div>
  )
};
