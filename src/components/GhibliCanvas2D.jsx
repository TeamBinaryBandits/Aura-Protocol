import React, { useEffect, useRef } from 'react';

export default function GhibliCanvas2D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Sakura Petals
    const petalsCount = 35;
    const petals = [];

    // Water Ripples
    const ripples = [];

    for (let i = 0; i < petalsCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 5 + 4,
        speedX: Math.random() * 1.4 - 0.5,
        speedY: Math.random() * 0.7 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.7 + 0.3,
        color: Math.random() > 0.4 ? '#f472b6' : '#fb7185' // Sunlit sakura pinks
      });
    }

    const handleMouseMove = (e) => {
      if (Math.random() < 0.25) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2,
          maxRadius: Math.random() * 25 + 15,
          opacity: 0.6
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;
    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // 1. Ghibli Sunlit Morning Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#e0f2fe'); // Morning sky blue
      skyGrad.addColorStop(0.35, '#bae6fd'); // Sunlit cyan horizon
      skyGrad.addColorStop(0.7, '#fef3c7'); // Soft sun warmth
      skyGrad.addColorStop(1, '#f7f4ef'); // Washi paper cream base
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Morning Sun Glow
      const sunGrad = ctx.createRadialGradient(
        width * 0.8, height * 0.2, 10,
        width * 0.8, height * 0.2, 220
      );
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
      sunGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.25)');
      sunGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, 220, 0, Math.PI * 2);
      ctx.fill();

      // 3. Layer 1: Distant Misty Mountains
      ctx.fillStyle = 'rgba(74, 124, 89, 0.25)'; // Sage mountain mist
      ctx.beginPath();
      ctx.moveTo(0, height * 0.6);
      for (let x = 0; x <= width; x += 100) {
        const y = height * 0.42 + Math.sin(x * 0.003 + 1) * 70 + Math.cos(x * 0.007) * 40;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Layer 2: Midground Ghibli Alpine Mountains
      ctx.fillStyle = 'rgba(45, 90, 63, 0.35)'; // Deep forest green
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      for (let x = 0; x <= width; x += 80) {
        const y = height * 0.48 + Math.sin(x * 0.005 + 2) * 55 + Math.sin(x * 0.01) * 30;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Layer 3: Foreground Sunlit Hills
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; // Fresh emerald hill
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      for (let x = 0; x <= width; x += 60) {
        const y = height * 0.58 + Math.sin(x * 0.008 + time * 0.2) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // 4. Flowing Ghibli Winding River at Bottom
      const riverTopY = height * 0.75;
      const riverGrad = ctx.createLinearGradient(0, riverTopY, 0, height);
      riverGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)'); // Ghibli turquoise
      riverGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.5)'); // Clear river blue
      riverGrad.addColorStop(1, 'rgba(3, 105, 161, 0.6)');
      
      ctx.fillStyle = riverGrad;
      ctx.beginPath();
      ctx.moveTo(0, riverTopY);
      for (let x = 0; x <= width; x += 40) {
        const y = riverTopY + Math.sin(x * 0.008 + time * 1.5) * 12 + Math.cos(x * 0.004) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Animated Glistening Water Lines on River
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)';
      ctx.lineWidth = 1.5;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        const lineY = riverTopY + 30 + j * 35;
        for (let x = 0; x <= width; x += 60) {
          const y = lineY + Math.sin(x * 0.012 + time * 2.0 + j) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 5. Draw Water Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.5;
        r.opacity -= 0.01;

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(2, 132, 199, ${r.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Draw Sunlit Floating Sakura Petals
      petals.forEach((p) => {
        p.x += p.speedX + Math.sin(time + p.y * 0.01) * 0.6;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size, -p.size, p.size * 1.5, p.size, 0, p.size * 1.8);
        ctx.bezierCurveTo(-p.size * 1.5, p.size, -p.size, -p.size, 0, 0);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
}
