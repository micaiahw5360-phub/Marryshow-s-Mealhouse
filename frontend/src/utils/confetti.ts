export function showConfetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const colors = ['#FF6B35', '#FF4757', '#00D25B', '#6C5CE7', '#FF69B4'];
  let particles: any[] = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 6 + 3,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 15 - 7.5
    });
  }
  
  let start = Date.now();
  function animate() {
    if (Date.now() - start > 1500) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.remove();
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speed;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
      if (p.y > canvas.height) p.y = -p.size;
    });
    requestAnimationFrame(animate);
  }
  animate();
}