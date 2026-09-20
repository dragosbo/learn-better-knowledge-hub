import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Orbit, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink, 
  BrainCircuit, 
  BookOpen, 
  Compass, 
  Waypoints, 
  Navigation, 
  Film, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Eye, 
  ListOrdered, 
  Bookmark, 
  ChevronRight, 
  X, 
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Playlist, CosmosVideoNode, CosmosTrajectoryStep, CosmosTrajectoryVoyage } from '../types';
import { 
  buildVideoCosmosGraph, 
  CATEGORY_COLORS, 
  CATEGORY_GLOWS, 
  CURATED_VOYAGES 
} from '../data/videoCosmosData';

// Helper to safely convert hex or any color to rgba for canvas gradients
function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(56, 189, 248, ${alpha})`;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(56, 189, 248, ${alpha})`;
}

interface VideoCosmosGraphProps {
  playlists: Playlist[];
  onSelectClipForGemini?: (clipId: string, title: string, cluster: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const VideoCosmosGraph: React.FC<VideoCosmosGraphProps> = ({
  playlists,
  onSelectClipForGemini,
  onNavigateToTab
}) => {
  // 1. Build or memoize the cosmic graph structure
  const { nodes: initialNodes, categoryClusters } = useMemo(() => {
    return buildVideoCosmosGraph(playlists);
  }, [playlists]);

  const [nodes, setNodes] = useState<CosmosVideoNode[]>(initialNodes);
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Canvas Viewport Transformation (Pan & Zoom)
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
    y: typeof window !== 'undefined' ? (window.innerHeight - 100) / 2 : 400,
    k: 0.7
  });
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const isInitialCenteredRef = useRef<boolean>(false);

  // Selected Star & Inspection Dossier
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Physics Simulation state
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);

  // Trajectory Flight Recorder state
  const [isRecordingTrajectory, setIsRecordingTrajectory] = useState<boolean>(false);
  const [currentTrajectory, setCurrentTrajectory] = useState<CosmosTrajectoryStep[]>([]);
  const [savedVoyages, setSavedVoyages] = useState<CosmosTrajectoryVoyage[]>(() => {
    try {
      const saved = localStorage.getItem('learn_better_cosmos_voyages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return CURATED_VOYAGES;
  });

  // Trajectory Playback / Tour mode
  const [playbackVoyage, setPlaybackVoyage] = useState<CosmosTrajectoryVoyage | null>(null);
  const [playbackStepIndex, setPlaybackStepIndex] = useState<number>(0);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);

  // Animation & Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const draggedNodeRef = useRef<CosmosVideoNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const cameraAnimRef = useRef<number | null>(null);

  // Background Starfield particles
  const starfieldRef = useRef<Array<{ x: number; y: number; radius: number; alpha: number; speed: number }>>([]);
  if (starfieldRef.current.length === 0) {
    for (let i = 0; i < 280; i++) {
      starfieldRef.current.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.02 + 0.005
      });
    }
  }

  // Selected node lookup
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Closest related nodes
  const relatedNodes = useMemo(() => {
    if (!selectedNode) return [];
    return selectedNode.relatedVideoIds
      .map(id => nodes.find(n => n.id === id))
      .filter((n): n is CosmosVideoNode => !!n);
  }, [selectedNode, nodes]);

  // Trajectory path nodes
  const activeTrajectoryNodes = useMemo(() => {
    const steps = playbackVoyage ? playbackVoyage.steps : currentTrajectory;
    return steps
      .map(step => ({
        step,
        node: nodes.find(n => n.id === step.videoId)
      }))
      .filter((item): item is { step: CosmosTrajectoryStep; node: CosmosVideoNode } => !!item.node);
  }, [playbackVoyage, currentTrajectory, nodes]);

  // Smooth Camera Pan & Zoom to target coordinate
  const flyCameraTo = useCallback((targetX: number, targetY: number, targetZoom = 1.25, duration = 650) => {
    if (cameraAnimRef.current) {
      cancelAnimationFrame(cameraAnimRef.current);
    }

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const startX = transformRef.current.x;
    const startY = transformRef.current.y;
    const startK = transformRef.current.k;

    const endK = targetZoom;
    const endX = width / 2 - targetX * endK;
    const endY = height / 2 - targetY * endK;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      const newX = startX + (endX - startX) * ease;
      const newY = startY + (endY - startY) * ease;
      const newK = startK + (endK - startK) * ease;

      setTransform({ x: newX, y: newY, k: newK });

      if (progress < 1) {
        cameraAnimRef.current = requestAnimationFrame(animate);
      } else {
        cameraAnimRef.current = null;
      }
    };

    cameraAnimRef.current = requestAnimationFrame(animate);
  }, []);

  // Center on node and record trajectory step if recording
  const handleSelectNode = useCallback((node: CosmosVideoNode) => {
    setSelectedNodeId(node.id);
    flyCameraTo(node.x, node.y, 1.35);

    // If recording trajectory, record this step
    if (isRecordingTrajectory) {
      setCurrentTrajectory(prev => {
        // Prevent immediate consecutive duplicates
        if (prev.length > 0 && prev[prev.length - 1].videoId === node.id) {
          return prev;
        }
        return [
          ...prev,
          {
            stepIndex: prev.length + 1,
            videoId: node.id,
            videoTitle: node.title,
            clusterTitle: node.clusterTitle,
            timestamp: Date.now()
          }
        ];
      });
    }
  }, [flyCameraTo, isRecordingTrajectory]);

  // Save current trajectory to voyages
  const handleSaveTrajectory = () => {
    if (currentTrajectory.length < 2) return;
    const newVoyage: CosmosTrajectoryVoyage = {
      id: 'voyage-' + Date.now(),
      name: `Custom Voyage: ${currentTrajectory[0].clusterTitle.split(' ')[0]} ➔ ${currentTrajectory[currentTrajectory.length - 1].clusterTitle.split(' ')[0]}`,
      description: `${currentTrajectory.length} celestial steps across knowledge domains.`,
      createdAt: new Date().toISOString(),
      steps: [...currentTrajectory],
      color: '#38bdf8'
    };

    const updated = [newVoyage, ...savedVoyages];
    setSavedVoyages(updated);
    try {
      localStorage.setItem('learn_better_cosmos_voyages', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setIsRecordingTrajectory(false);
  };

  // Playback step navigation
  const handleStepVoyage = useCallback((stepIdx: number) => {
    if (!playbackVoyage) return;
    const targetStep = playbackVoyage.steps[stepIdx];
    if (!targetStep) return;

    setPlaybackStepIndex(stepIdx);
    const targetNode = nodes.find(n => n.id === targetStep.videoId);
    if (targetNode) {
      setSelectedNodeId(targetNode.id);
      flyCameraTo(targetNode.x, targetNode.y, 1.4);
    }
  }, [playbackVoyage, nodes, flyCameraTo]);

  // Automated Tour Playback interval
  useEffect(() => {
    if (!isPlayingTour || !playbackVoyage) return;

    const interval = setInterval(() => {
      setPlaybackStepIndex(prev => {
        const next = prev + 1;
        if (next >= playbackVoyage.steps.length) {
          setIsPlayingTour(false);
          return prev;
        }
        handleStepVoyage(next);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlayingTour, playbackVoyage, handleStepVoyage]);

  // Physics Simulation Step (Gentle orbital settling)
  useEffect(() => {
    if (!isPhysicsRunning) return;

    let animId: number;
    let ticks = 0;

    const simulate = () => {
      setNodes(prevNodes => {
        const updated = [...prevNodes];
        const n = updated.length;

        // Force parameters
        const damping = 0.88;
        const centerAttraction = 0.0003;
        const repulseStrength = 320;

        for (let i = 0; i < n; i++) {
          const a = updated[i];
          if (draggedNodeRef.current && draggedNodeRef.current.id === a.id) continue;

          // Subtle pull toward category center
          const catAngle = a.category ? (a.category.length * 0.7) : 0;
          const targetDist = 520;
          const targetX = Math.cos(catAngle) * targetDist;
          const targetY = Math.sin(catAngle) * targetDist;

          a.vx += (targetX - a.x) * centerAttraction;
          a.vy += (targetY - a.y) * centerAttraction;

          // Local repulsion against nearby nodes
          for (let j = i + 1; j < n; j++) {
            const b = updated[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy || 1;
            const minDist = (a.radius + b.radius) * 3.5;

            if (distSq < minDist * minDist) {
              const dist = Math.sqrt(distSq);
              const force = (repulseStrength / (distSq + 10)) * (a.category === b.category ? 0.6 : 1.2);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              a.vx -= fx;
              a.vy -= fy;
              b.vx += fx;
              b.vy += fy;
            }
          }

          // Apply velocity and damping
          a.vx *= damping;
          a.vy *= damping;
          a.x += a.vx;
          a.y += a.vy;
        }

        return updated;
      });

      ticks++;
      if (ticks < 120 && isPhysicsRunning) {
        animId = requestAnimationFrame(simulate);
      }
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [isPhysicsRunning]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      try {
        const width = canvas.width || 1200;
        const height = canvas.height || 800;

        // 1. Deep Space Canvas Background with dark cosmic gradient
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, width, height);

        // Subtle Galactic Glow in center
        const centerGrad = ctx.createRadialGradient(
          transform.x, transform.y, 10,
          transform.x, transform.y, Math.max(width, height) * 0.9
        );
        centerGrad.addColorStop(0, 'rgba(30, 41, 79, 0.45)');
        centerGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.2)');
        centerGrad.addColorStop(1, 'rgba(6, 9, 19, 0)');
        ctx.fillStyle = centerGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Starfield twinkling dust
        const time = performance.now();
        ctx.save();
        for (const star of starfieldRef.current) {
          const starAlpha = star.alpha * (0.6 + 0.4 * Math.sin(time * star.speed));
          ctx.fillStyle = `rgba(226, 232, 240, ${starAlpha})`;
          const screenX = star.x * transform.k * 0.4 + transform.x;
          const screenY = star.y * transform.k * 0.4 + transform.y;
          if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, star.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // Transform world space
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        // 3. Category Galactic Quadrant Sectors
        for (const cat of categoryClusters) {
          const catColor = cat.color;
          const angle = cat.angle;
          const cx = Math.cos(angle) * 580;
          const cy = Math.sin(angle) * 580;

          const radial = ctx.createRadialGradient(cx, cy, 30, cx, cy, 460);
          radial.addColorStop(0, hexToRgba(catColor, 0.12));
          radial.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(cx, cy, 460, 0, Math.PI * 2);
          ctx.fill();

          // Quadrant Label
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.font = '600 13px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${cat.category.toUpperCase()} • ${cat.count} STARS`, cx, cy - 390);
        }

      // 4. Draw Interstellar Trajectory Paths (Active Voyage or Recording Flight Path)
      if (activeTrajectoryNodes.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3 / transform.k;
        ctx.setLineDash([8 / transform.k, 6 / transform.k]);
        ctx.lineDashOffset = -(time * 0.02);

        // Path glow
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        activeTrajectoryNodes.forEach((item, idx) => {
          if (idx === 0) {
            ctx.moveTo(item.node.x, item.node.y);
          } else {
            ctx.lineTo(item.node.x, item.node.y);
          }
        });
        ctx.stroke();
        ctx.restore();

        // Traveling Photon Comet on trajectory path
        const totalSegments = activeTrajectoryNodes.length - 1;
        const loopT = (time * 0.0004) % totalSegments;
        const currentSegment = Math.floor(loopT);
        const segmentProgress = loopT - currentSegment;

        const pA = activeTrajectoryNodes[currentSegment]?.node;
        const pB = activeTrajectoryNodes[currentSegment + 1]?.node;
        if (pA && pB) {
          const px = pA.x + (pB.x - pA.x) * segmentProgress;
          const py = pA.y + (pB.y - pA.y) * segmentProgress;

          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(px, py, 6 / transform.k, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw Waypoint Step numbers (①, ②, ③...)
        activeTrajectoryNodes.forEach((item, idx) => {
          ctx.save();
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2 / transform.k;
          ctx.beginPath();
          ctx.arc(item.node.x, item.node.y - 18, 12 / transform.k, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${10 / transform.k}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${idx + 1}`, item.node.x, item.node.y - 18);
          ctx.restore();
        });
      }

      // 5. Draw Constellation Links from Selected Star to Closest Related Stars
      if (selectedNode) {
        relatedNodes.forEach(related => {
          ctx.save();
          ctx.strokeStyle = selectedNode.categoryColor;
          ctx.lineWidth = 2 / transform.k;
          ctx.setLineDash([4 / transform.k, 4 / transform.k]);
          ctx.lineDashOffset = -(time * 0.015);
          ctx.shadowColor = selectedNode.categoryColor;
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.moveTo(selectedNode.x, selectedNode.y);
          ctx.lineTo(related.x, related.y);
          ctx.stroke();
          ctx.restore();
        });
      }

      // 6. Draw All Celestial Video Star Nodes
      nodes.forEach(node => {
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isRelated = selectedNode?.relatedVideoIds.includes(node.id);
        const matchesCategory = activeCategoryFilter === 'All' || node.category === activeCategoryFilter;
        const matchesSearch = !searchQuery || 
          node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          node.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.clusterTitle.toLowerCase().includes(searchQuery.toLowerCase());

        let alpha = 0.9;
        if (!matchesCategory || !matchesSearch) {
          alpha = 0.12;
        } else if (selectedNodeId && !isSelected && !isRelated) {
          alpha = 0.35;
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        // Node Glow Halo
        if (isSelected || isHovered || isRelated) {
          ctx.shadowColor = node.categoryColor;
          ctx.shadowBlur = isSelected ? 24 : 12;

          const haloRadius = (node.radius + (isSelected ? 10 : 4));
          ctx.strokeStyle = node.categoryColor;
          ctx.lineWidth = 1.5 / transform.k;
          ctx.beginPath();
          ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Inner Core Star Circle
        ctx.fillStyle = isSelected ? '#ffffff' : node.categoryColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? node.radius + 3 : node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radar ring for selected star
        if (isSelected) {
          const pulseR = node.radius + 12 + Math.sin(time * 0.005) * 4;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.5 / transform.k;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Star Labels: Shown when zoomed in or when selected/hovered/related
        const shouldShowLabel = transform.k > 0.9 || isSelected || isHovered || isRelated;
        if (shouldShowLabel && alpha > 0.3) {
          ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
          ctx.font = isSelected ? `600 ${12 / transform.k}px sans-serif` : `400 ${10 / transform.k}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;

          const truncated = node.title.length > 32 && !isSelected ? node.title.slice(0, 30) + '…' : node.title;
          ctx.fillText(truncated, node.x, node.y + node.radius + (14 / transform.k));
        }

        ctx.restore();
      });

      ctx.restore();
      } catch (err) {
        console.error("Cosmos canvas render error:", err);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    transform,
    nodes,
    selectedNodeId,
    hoveredNodeId,
    activeCategoryFilter,
    searchQuery,
    selectedNode,
    relatedNodes,
    activeTrajectoryNodes,
    categoryClusters
  ]);

  // Handle Resize & Canvas Sizing with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateDimensions = () => {
      const w = container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const h = container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight - 80 : 750);
      
      if (w > 0 && h > 0) {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }

        // Center on the first real dimension measurement
        if (!isInitialCenteredRef.current) {
          isInitialCenteredRef.current = true;
          setTransform({
            x: w / 2,
            y: h / 2,
            k: 0.7
          });
        }
      }
    };

    updateDimensions();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateDimensions();
      });
      ro.observe(container);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Mouse / Touch Interaction (Pan, Zoom, Drag, Click)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse to world coordinates
    const worldX = (mouseX - transform.x) / transform.k;
    const worldY = (mouseY - transform.y) / transform.k;

    // Hit test nodes
    let clickedNode: CosmosVideoNode | null = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = worldX - n.x;
      const dy = worldY - n.y;
      if (dx * dx + dy * dy < (n.radius + 12) * (n.radius + 12)) {
        clickedNode = n;
        break;
      }
    }

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      handleSelectNode(clickedNode);
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: mouseX - transform.x, y: mouseY - transform.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggedNodeRef.current) {
      // Reposition dragged node in world space
      draggedNodeRef.current.x = (mouseX - transform.x) / transform.k;
      draggedNodeRef.current.y = (mouseY - transform.y) / transform.k;
      return;
    }

    if (isDraggingRef.current) {
      setTransform(prev => ({
        ...prev,
        x: mouseX - dragStartRef.current.x,
        y: mouseY - dragStartRef.current.y
      }));
      return;
    }

    // Hover hit test
    const worldX = (mouseX - transform.x) / transform.k;
    const worldY = (mouseY - transform.y) / transform.k;
    let foundHover: string | null = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = worldX - n.x;
      const dy = worldY - n.y;
      if (dx * dx + dy * dy < (n.radius + 10) * (n.radius + 10)) {
        foundHover = n.id;
        break;
      }
    }
    setHoveredNodeId(foundHover);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
  };

  // Touch gesture support (iPad / mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = touch.clientX - rect.left;
      const mouseY = touch.clientY - rect.top;
      const worldX = (mouseX - transform.x) / transform.k;
      const worldY = (mouseY - transform.y) / transform.k;

      let clickedNode: CosmosVideoNode | null = null;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = worldX - n.x;
        const dy = worldY - n.y;
        if (dx * dx + dy * dy < (n.radius + 16) * (n.radius + 16)) {
          clickedNode = n;
          break;
        }
      }

      if (clickedNode) {
        handleSelectNode(clickedNode);
      } else {
        isDraggingRef.current = true;
        dragStartRef.current = { x: mouseX - transform.x, y: mouseY - transform.y };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = touch.clientX - rect.left;
      const mouseY = touch.clientY - rect.top;
      setTransform(prev => ({
        ...prev,
        x: mouseX - dragStartRef.current.x,
        y: mouseY - dragStartRef.current.y
      }));
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    const newK = Math.min(Math.max(transform.k * zoomFactor, 0.25), 3.8);

    // Zoom around mouse point
    const newX = mouseX - (mouseX - transform.x) * (newK / transform.k);
    const newY = mouseY - (mouseY - transform.y) * (newK / transform.k);

    setTransform({ x: newX, y: newY, k: newK });
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.3 : 0.75;
    const container = containerRef.current;
    if (!container) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const newK = Math.min(Math.max(transform.k * factor, 0.25), 3.8);
    const newX = cx - (cx - transform.x) * (newK / transform.k);
    const newY = cy - (cy - transform.y) * (newK / transform.k);
    setTransform({ x: newX, y: newY, k: newK });
  };

  const handleResetView = () => {
    const container = containerRef.current;
    if (container) {
      setTransform({
        x: container.clientWidth / 2,
        y: container.clientHeight / 2,
        k: 0.65
      });
      setSelectedNodeId(null);
    }
  };

  // Search filtered results for quick jumps
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return nodes
      .filter(n => n.title.toLowerCase().includes(q) || n.channel.toLowerCase().includes(q) || n.clusterTitle.toLowerCase().includes(q))
      .slice(0, 6);
  }, [nodes, searchQuery]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden flex flex-col select-none">
      
      {/* Top Cosmic Header & Command Bar */}
      <div className="z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Title & Stats */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Orbit className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                Video Cosmos Graph
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-mono">
                  {nodes.length} Stars
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Interactive celestial constellation map with closest-neighbor links & trajectory flight recording
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl py-0.5">
          <button
            onClick={() => setActiveCategoryFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeCategoryFilter === 'All'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Galaxies
          </button>
          {categoryClusters.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategoryFilter(cat.category)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                activeCategoryFilter === cat.category
                  ? 'bg-slate-800 text-white border-slate-600 shadow'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: cat.color }} 
              />
              <span className="truncate max-w-[120px]">{cat.category.split('&')[0].trim()}</span>
              <span className="text-[10px] text-slate-500 font-mono">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Flight Recorder & Trajectory Controls */}
        <div className="flex items-center gap-2">
          {/* Recording Toggle */}
          <button
            onClick={() => {
              if (isRecordingTrajectory) {
                // If stopping, offer to save
                if (currentTrajectory.length >= 2) {
                  handleSaveTrajectory();
                } else {
                  setIsRecordingTrajectory(false);
                }
              } else {
                // Start recording
                setCurrentTrajectory([]);
                setPlaybackVoyage(null);
                setIsRecordingTrajectory(true);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              isRecordingTrajectory
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRecordingTrajectory ? 'bg-white' : 'bg-rose-400'}`} />
            {isRecordingTrajectory 
              ? `Recording Trajectory (${currentTrajectory.length} steps)` 
              : 'Record Flight Path'
            }
          </button>

          {/* Curated / Saved Voyages Selector */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5">
              <Waypoints className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voyages ({savedVoyages.length})</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Saved & Curated Trajectories
              </div>
              <div className="space-y-1 mt-1 max-h-64 overflow-y-auto">
                {savedVoyages.map(voyage => (
                  <button
                    key={voyage.id}
                    onClick={() => {
                      setPlaybackVoyage(voyage);
                      setPlaybackStepIndex(0);
                      setIsPlayingTour(false);
                      handleStepVoyage(0);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 transition-colors flex flex-col gap-0.5 ${
                      playbackVoyage?.id === voyage.id ? 'bg-cyan-950/60 border border-cyan-700/50' : ''
                    }`}
                  >
                    <div className="font-medium text-slate-200 flex items-center justify-between">
                      <span className="truncate">{voyage.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                        {voyage.steps.length} steps
                      </span>
                    </div>
                    {voyage.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{voyage.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div ref={containerRef} className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={1600}
          height={900}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="w-full h-full block touch-none"
        />

        {/* Floating Quick Search Bar & Jump */}
        <div className="absolute top-4 left-4 z-10 w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search star by title, channel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick jump autocomplete list */}
          {searchResults.length > 0 && (
            <div className="mt-1.5 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-1 max-h-60 overflow-y-auto">
              {searchResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => {
                    handleSelectNode(result);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 transition-colors flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-slate-200 truncate group-hover:text-cyan-300">
                      {result.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{result.channel} • {result.clusterTitle}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating Canvas Controls (Zoom & Physics) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-1 shadow-xl">
          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Reset Galactic View"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 my-0.5" />
          <button
            onClick={() => setIsPhysicsRunning(prev => !prev)}
            title={isPhysicsRunning ? 'Pause Orbital Drift' : 'Resume Orbital Drift'}
            className={`p-2 rounded-lg transition-colors ${
              isPhysicsRunning ? 'text-cyan-400 hover:bg-cyan-950/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {isPhysicsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Active Trajectory Playback Overlay Controller */}
        {playbackVoyage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur border border-cyan-500/40 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 max-w-xl w-full">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPlayingTour(prev => !prev)}
                className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isPlayingTour ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <Waypoints className="w-3.5 h-3.5 text-cyan-400" />
                  {playbackVoyage.name}
                </h4>
                <p className="text-[10px] text-slate-400">
                  Step {playbackStepIndex + 1} of {playbackVoyage.steps.length}
                </p>
              </div>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="flex-1 flex items-center gap-1">
              {playbackVoyage.steps.map((s, idx) => (
                <button
                  key={s.videoId + idx}
                  onClick={() => handleStepVoyage(idx)}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    idx === playbackStepIndex
                      ? 'bg-cyan-400 shadow-md shadow-cyan-400/50'
                      : idx < playbackStepIndex
                      ? 'bg-cyan-700/60'
                      : 'bg-slate-800'
                  }`}
                  title={`Step ${idx + 1}: ${s.videoTitle}`}
                />
              ))}
            </div>

            {/* Close voyage view */}
            <button
              onClick={() => {
                setPlaybackVoyage(null);
                setIsPlayingTour(false);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Related Videos Quick-Hop Dock (when a star is selected) */}
        {selectedNode && relatedNodes.length > 0 && (
          <div className="absolute bottom-6 left-6 z-10 max-w-lg bg-slate-900/90 backdrop-blur border border-slate-800/90 rounded-2xl p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Closest Related Constellation Stars ({relatedNodes.length})
              </span>
              <span className="text-[10px] text-slate-400">Click to fly camera</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {relatedNodes.slice(0, 4).map(rel => (
                <button
                  key={rel.id}
                  onClick={() => handleSelectNode(rel)}
                  className="text-left p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 transition-all flex flex-col gap-1 group"
                >
                  <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                    {rel.title}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">{rel.channel}</span>
                    <span className="font-mono text-cyan-400">{rel.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Legend Overlay at Bottom-Right */}
        <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-xl px-3 py-2 text-[11px] text-slate-400 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>AI & ML</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Code</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Science</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Lifestyle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Notes</span>
          </div>
        </div>
      </div>

      {/* Slide-over Star Dossier: Key Insights & References Inspector */}
      {selectedNode && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[480px] z-30 bg-slate-900/98 backdrop-blur-md border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Dossier Header */}
          <div className="p-5 border-b border-slate-800 relative bg-slate-900/60">
            <button
              onClick={() => setSelectedNodeId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2.5 py-0.5 rounded-md text-[11px] font-medium border"
                style={{
                  backgroundColor: `${selectedNode.categoryColor}15`,
                  borderColor: `${selectedNode.categoryColor}40`,
                  color: selectedNode.categoryColor
                }}
              >
                {selectedNode.category}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                {selectedNode.duration}
              </span>
              {selectedNode.status === 'synthesized' && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-700/50 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>

            <h2 className="text-base font-semibold text-white leading-snug tracking-tight pr-6">
              {selectedNode.title}
            </h2>

            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="text-slate-200 font-medium">{selectedNode.channel}</span>
              <span>•</span>
              <span className="text-slate-400 truncate">{selectedNode.clusterTitle}</span>
            </div>

            {/* Quick Action Hop Bar */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
              <a
                href={`https://www.youtube.com/watch?v=${selectedNode.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {onSelectClipForGemini && (
                <button
                  onClick={() => {
                    onSelectClipForGemini(selectedNode.id, selectedNode.title, selectedNode.clusterTitle);
                    if (onNavigateToTab) onNavigateToTab('gemini');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow transition-colors"
                  title="Synthesize deeper inside Gemini AI Studio"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini Studio</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentTrajectory(prev => [
                    ...prev,
                    {
                      stepIndex: prev.length + 1,
                      videoId: selectedNode.id,
                      videoTitle: selectedNode.title,
                      clusterTitle: selectedNode.clusterTitle,
                      timestamp: Date.now()
                    }
                  ]);
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                title="Add star as waypoint in active flight path"
              >
                <Waypoints className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dossier Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* 1. Key Insights Section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                Key Insights & Distillations
              </h3>
              <div className="space-y-2">
                {selectedNode.keyInsights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Key References Mentioned Section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Key References Mentioned
              </h3>
              {selectedNode.keyReferences.length > 0 ? (
                <div className="space-y-2">
                  {selectedNode.keyReferences.map((ref, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/90 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{ref.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                          {ref.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{ref.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-500 italic">
                  Domain foundations referenced in cluster "{selectedNode.clusterTitle}".
                </div>
              )}
            </div>

            {/* 3. Closest Related Videos */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Orbit className="w-4 h-4" />
                Constellation Neighbors ({relatedNodes.length})
              </h3>
              <div className="space-y-1.5">
                {relatedNodes.map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => handleSelectNode(rel)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="pr-2 truncate">
                      <p className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                        {rel.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{rel.channel} • {rel.clusterTitle}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {selectedNode.tags.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                  <Tag className="w-3 h-3" />
                  <span>Tags & Topics</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.tags.slice(0, 10).map((tag, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] border border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
