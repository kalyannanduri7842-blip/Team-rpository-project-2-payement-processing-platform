import React, { useEffect, useRef } from 'react';

interface Particle3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
}

interface Polyhedron3D {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  scale: number;
  vertices: { x: number; y: number; z: number }[];
  edges: [number, number][];
}

export const ThreeDBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.0008;
      targetMouseY = (e.clientY - height / 2) * 0.0008;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 1. Create 3D undulating wave grid nodes
    const gridCols = 22;
    const gridRows = 16;
    const particles: Particle3D[] = [];
    const spacingX = 90;
    const spacingZ = 80;

    for (let i = 0; i < gridCols; i++) {
      for (let j = 0; j < gridRows; j++) {
        const x = (i - gridCols / 2) * spacingX;
        const z = (j - gridRows / 2) * spacingZ + 200;
        const y = Math.sin(i * 0.4) * 30 + Math.cos(j * 0.4) * 30;
        particles.push({
          x,
          y,
          z,
          baseX: x,
          baseY: y,
          baseZ: z,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          vz: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 2,
          color: i % 3 === 0 ? 'rgba(5, 150, 105, 0.4)' : i % 2 === 0 ? 'rgba(4, 120, 87, 0.35)' : 'rgba(16, 185, 129, 0.3)',
        });
      }
    }

    // 2. Create Floating 3D Geometric Wireframe Polyhedra (Octahedrons & Diamonds)
    const polyhedra: Polyhedron3D[] = [];
    const octahedronVertices = [
      { x: 0, y: -1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      { x: 0, y: 1, z: 0 },
    ];
    const octahedronEdges: [number, number][] = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
    ];

    for (let k = 0; k < 7; k++) {
      polyhedra.push({
        x: (Math.random() - 0.5) * (width * 0.8),
        y: (Math.random() - 0.5) * (height * 0.7),
        z: Math.random() * 300 + 100,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.008 + 0.003,
        vRotY: (Math.random() - 0.5) * 0.008 + 0.004,
        vRotZ: (Math.random() - 0.5) * 0.008 + 0.002,
        scale: Math.random() * 25 + 30,
        vertices: octahedronVertices,
        edges: octahedronEdges,
      });
    }

    let time = 0;
    const fov = 400;

    // 3D Projection Helper
    const project = (x: number, y: number, z: number) => {
      const scale = fov / (fov + z);
      const projX = x * scale + width / 2;
      const projY = y * scale + height / 2 + 40; // slight downward bias for floor perspective
      return { x: projX, y: projY, scale };
    };

    // 3D Rotation Matrix Helper
    const rotate3D = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      // Rotate Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // Rotate X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      // Rotate Z
      const cosZ = Math.cos(rz);
      const sinZ = Math.sin(rz);
      let x3 = x1 * cosZ - y2 * sinZ;
      let y3 = x1 * sinZ + y2 * cosZ;

      return { x: x3, y: y3, z: z2 };
    };

    const render = () => {
      time += 0.015;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Ambient radial soft gradients for subtle lighting depth
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 20, width * 0.2, height * 0.3, 400);
      grad1.addColorStop(0, 'rgba(5, 150, 105, 0.06)');
      grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 40, width * 0.8, height * 0.7, 500);
      grad2.addColorStop(0, 'rgba(4, 120, 87, 0.05)');
      grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Update & render 3D undulating grid
      const projectedNodes: { x: number; y: number; scale: number; origZ: number }[] = [];

      for (let i = 0; i < gridCols; i++) {
        for (let j = 0; j < gridRows; j++) {
          const index = i * gridRows + j;
          const p = particles[index];

          // 3D mathematical sinusoidal wave equation
          const wave = Math.sin(i * 0.35 + time) * 35 + Math.cos(j * 0.35 + time * 0.8) * 25;
          const curY = p.baseY + wave + (j * 12); // tilted plane
          const curZ = p.baseZ + Math.sin(time * 0.5 + i) * 15;

          // Apply mouse parallax rotation
          const rot = rotate3D(p.baseX, curY, curZ, mouseY * 0.5, mouseX * 0.5, 0);
          const proj = project(rot.x, rot.y, rot.z);

          projectedNodes.push({ x: proj.x, y: proj.y, scale: proj.scale, origZ: rot.z });

          // Render Particle Node
          const nodeAlpha = Math.max(0.1, Math.min(0.5, proj.scale * 0.45));
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(5, 150, 105, ${nodeAlpha})`;
          ctx.fill();
        }
      }

      // Draw 3D connecting grid lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < gridCols; i++) {
        for (let j = 0; j < gridRows; j++) {
          const currentIndex = i * gridRows + j;
          const current = projectedNodes[currentIndex];

          // Horizontal line
          if (i < gridCols - 1) {
            const nextXIndex = (i + 1) * gridRows + j;
            const nextX = projectedNodes[nextXIndex];
            const lineAlpha = Math.max(0.04, Math.min(0.25, ((current.scale + nextX.scale) / 2) * 0.22));
            ctx.strokeStyle = `rgba(5, 150, 105, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(nextX.x, nextX.y);
            ctx.stroke();
          }

          // Vertical line
          if (j < gridRows - 1) {
            const nextYIndex = i * gridRows + (j + 1);
            const nextY = projectedNodes[nextYIndex];
            const lineAlpha = Math.max(0.04, Math.min(0.25, ((current.scale + nextY.scale) / 2) * 0.22));
            ctx.strokeStyle = `rgba(4, 120, 87, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(nextY.x, nextY.y);
            ctx.stroke();
          }
        }
      }

      // Render Floating 3D Wireframe Polyhedra
      for (const poly of polyhedra) {
        poly.rotX += poly.vRotX;
        poly.rotY += poly.vRotY;
        poly.rotZ += poly.vRotZ;

        // Gentle floating motion
        const floatY = poly.y + Math.sin(time + poly.scale) * 20;

        const rotatedVertices = poly.vertices.map(v => {
          const scaledX = v.x * poly.scale;
          const scaledY = v.y * poly.scale;
          const scaledZ = v.z * poly.scale;

          const r = rotate3D(scaledX, scaledY, scaledZ, poly.rotX, poly.rotY, poly.rotZ);
          const worldPos = rotate3D(poly.x + r.x, floatY + r.y, poly.z + r.z, mouseY * 0.3, mouseX * 0.3, 0);
          return project(worldPos.x, worldPos.y, worldPos.z);
        });

        // Draw Edges
        for (const [startIdx, endIdx] of poly.edges) {
          const v1 = rotatedVertices[startIdx];
          const v2 = rotatedVertices[endIdx];

          const edgeAlpha = Math.max(0.08, Math.min(0.35, ((v1.scale + v2.scale) / 2) * 0.3));
          ctx.strokeStyle = `rgba(4, 120, 87, ${edgeAlpha})`;
          ctx.lineWidth = 1.2 * v1.scale;

          ctx.beginPath();
          ctx.moveTo(v1.x, v1.y);
          ctx.lineTo(v2.x, v2.y);
          ctx.stroke();
        }

        // Draw Vertices
        for (const v of rotatedVertices) {
          ctx.beginPath();
          ctx.arc(v.x, v.y, 2 * v.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${v.scale * 0.5})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ willChange: 'transform' }}
    />
  );
};
