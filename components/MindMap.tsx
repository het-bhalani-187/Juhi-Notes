import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { generateMindMapData, generateSubTopics } from '../services/geminiService';
import { MindMapNode, Note } from '../types';
import { Button } from './UI';

interface MindMapProps {
  note: Note;
  onClose: () => void;
}

// Extend d3 node type to include our specific properties
interface D3Node extends d3.SimulationNodeDatum {
  id?: string;
  name: string;
  children?: D3Node[];
  _children?: D3Node[]; 
  depth?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  data: MindMapNode; // Link back to original data
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: D3Node;
  target: D3Node;
}

export const MindMap: React.FC<MindMapProps> = ({ note, onClose }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rawData, setRawData] = useState<MindMapNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingNode, setProcessingNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!note.content.trim()) {
           setRawData({ name: "Empty Note", children: [] });
        } else {
           const mapData = await generateMindMapData(note.content);
           setRawData(mapData);
        }
      } catch (err) {
        setError("Failed to generate mind map.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [note.id]);

  // --- Expand Node Logic ---
  const handleExpandNode = async (d: D3Node) => {
      if (processingNode) return; // Prevent concurrent requests
      
      setProcessingNode(d.id || d.data.name);
      try {
          // Fetch new children from AI
          const newChildren = await generateSubTopics(d.data.name, note.content.substring(0, 500)); // Pass context
          
          if (newChildren && newChildren.length > 0) {
              // We need to update the rawData state deeply
              const updateTree = (node: MindMapNode): MindMapNode => {
                  if (node === d.data) {
                      return {
                          ...node,
                          children: [...(node.children || []), ...newChildren]
                      };
                  }
                  if (node.children) {
                      return {
                          ...node,
                          children: node.children.map(updateTree)
                      };
                  }
                  return node;
              };

              setRawData(prev => prev ? updateTree(prev) : prev);
          }
      } catch (e) {
          console.error("Failed to expand node", e);
      } finally {
          setProcessingNode(null);
      }
  };

  // --- D3 Rendering ---
  useEffect(() => {
    if (!rawData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Clear previous SVG content to full rebuild (simplest for data updates)
    d3.select(svgRef.current).selectAll("*").remove();

    // 1. Setup SVG and Zoom
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("cursor", "grab");

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom).on("dblclick.zoom", null); // Disable double click zoom

    // Initial transform
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    // 2. Process Data
    const root = d3.hierarchy<MindMapNode>(rawData);
    const nodes = root.descendants() as D3Node[];
    const links = root.links() as unknown as D3Link[];

    // Assign IDs
    nodes.forEach((d, i) => { 
        d.id = `node-${d.data.name}-${i}`; // Stable ID based on name if possible
    });

    // 3. Setup Simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force("link", d3.forceLink<D3Node, D3Link>(links)
          .id(d => d.id!)
          .distance(d => (d.target.depth || 1) * 90) 
          .strength(0.6)
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("collide", d3.forceCollide().radius(70).strength(0.5))
      .force("center", d3.forceCenter(0, 0).strength(0.05));

    // 4. Draw Elements
    
    // Links
    const link = g.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.5)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.max(1, 4 - (d.target.depth || 0)));

    // Nodes
    const node = g.append("g")
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, D3Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

    // Node Shapes
    node.append("circle")
      .attr("r", d => d.depth === 0 ? 35 : Math.max(15, 25 - (d.depth || 0) * 2))
      .attr("fill", d => {
          if (d.id?.includes(processingNode || "###")) return "#fbbf24"; // Amber loading state
          if (d.depth === 0) return "#4f46e5"; 
          if (d.depth === 1) return "#6366f1"; 
          if (d.depth === 2) return "#818cf8"; 
          return "#a5b4fc"; 
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))")
      .transition().duration(500)
      .attr("r", d => d.depth === 0 ? 35 : Math.max(15, 25 - (d.depth || 0) * 2));

    // Labels
    node.append("text")
      .attr("dy", d => (d.depth === 0 ? 50 : 35))
      .attr("text-anchor", "middle")
      .text(d => d.data.name)
      .attr("font-size", d => Math.max(10, 16 - (d.depth || 0) * 2))
      .attr("font-weight", d => d.depth === 0 ? "bold" : "500")
      .attr("fill", "#1e293b")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(255,255,255,0.9)");

    // Double Click Event
    node.on("dblclick", (event, d) => {
        event.stopPropagation();
        handleExpandNode(d);
    });

    // Tooltip for interaction hint
    node.append("title").text("Double-click to branch out thoughts");

    // 6. Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x!)
        .attr("y1", d => d.source.y!)
        .attr("x2", d => d.target.x!)
        .attr("y2", d => d.target.y!);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag Handlers
    function dragstarted(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      svg.style("cursor", "grabbing");
    }

    function dragged(event: any, d: D3Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      svg.style("cursor", "grab");
    }

    return () => {
      simulation.stop();
    };

  }, [rawData, processingNode]); // Re-render when data or loading state changes

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-in fade-in">
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
         <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center text-xs text-slate-500 mr-2 px-3 font-medium">
             <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded mr-2">Tip</span>
             Double-click any node to branch out
         </div>
        <Button variant="secondary" onClick={onClose} className="bg-white/90 backdrop-blur shadow-sm">
          Close Map
        </Button>
      </div>
      
      <div ref={containerRef} className="w-full h-full relative">
         <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
              style={{ 
                  backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
              }} 
         />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="font-medium">Thinking...</p>
            </div>
          </div>
        )}
        
        {error && (
           <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="bg-white p-6 rounded-xl shadow-xl text-center border border-red-100">
               <p className="text-red-500 mb-4">{error}</p>
               <Button onClick={onClose} variant="secondary">Back</Button>
             </div>
           </div>
        )}

        <svg ref={svgRef} className="w-full h-full touch-none" />
      </div>
    </div>
  );
};