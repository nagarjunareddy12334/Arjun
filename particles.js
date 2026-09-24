/* ==========================================================
   ROMANTIC CINEMATIC PARTICLES ENGINE
   - Fluttering 3D Rose Petals
   - Warm Glowing Golden Bokeh & Fairy Lights
   - Diamond Prismatic Sparkles
   - Joyful Heart Fireworks & Confetti Burst
   ========================================================== */

class CinematicParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.petals = [];
    this.bokeh = [];
    this.sparkles = [];
    this.confetti = [];

    this.wind = 0.3;
    this.intensity = 1.0;
    this.isCelebrating = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate initial Rose Petals
    const petalCount = Math.floor(Math.min(this.width / 40, 36));
    for (let i = 0; i < petalCount; i++) {
      this.petals.push(this.createPetal(true));
    }

    // Generate Warm Golden Bokeh / Fairy Lights
    const bokehCount = Math.floor(Math.min(this.width / 35, 45));
    for (let i = 0; i < bokehCount; i++) {
      this.bokeh.push(this.createBokeh(true));
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createPetal(randomY = false) {
    const colors = [
      { fill: 'rgba(215, 25, 60, 0.85)', shade: 'rgba(140, 15, 35, 0.9)' }, // Crimson Red
      { fill: 'rgba(180, 20, 50, 0.88)', shade: 'rgba(110, 10, 25, 0.95)' }, // Deep Velvet Red
      { fill: 'rgba(244, 114, 140, 0.82)', shade: 'rgba(190, 60, 90, 0.85)' }, // Blush Pink
      { fill: 'rgba(255, 180, 195, 0.85)', shade: 'rgba(215, 120, 140, 0.88)' } // Soft Peach Rose
    ];
    const palette = colors[Math.floor(Math.random() * colors.length)];

    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -30,
      size: 14 + Math.random() * 16,
      vx: (Math.random() - 0.5) * 0.8 + this.wind,
      vy: 1.0 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() - 0.5) * 0.04,
      flip: Math.random() * Math.PI,
      flipSpeed: 0.02 + Math.random() * 0.03,
      oscillation: Math.random() * Math.PI * 2,
      oscillationSpeed: 0.02 + Math.random() * 0.02,
      palette: palette,
      opacity: 0.65 + Math.random() * 0.35
    };
  }

  createBokeh(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 20,
      radius: 3 + Math.random() * 14,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 0.7),
      baseAlpha: 0.15 + Math.random() * 0.4,
      alpha: 0.2,
      pulseSpeed: 0.015 + Math.random() * 0.025,
      pulsePhase: Math.random() * Math.PI * 2,
      hue: 38 + (Math.random() - 0.5) * 16 // Warm golden amber to soft rose
    };
  }

  createSparkle(x, y) {
    return {
      x: x || Math.random() * this.width,
      y: y || Math.random() * this.height,
      size: 4 + Math.random() * 12,
      alpha: 0.1,
      maxAlpha: 0.8 + Math.random() * 0.2,
      phase: 0,
      speed: 0.04 + Math.random() * 0.04,
      color: Math.random() > 0.3 ? '#fae4aa' : '#ffffff'
    };
  }

  // Trigger celebration explosion
  triggerCelebration() {
    this.isCelebrating = true;
    this.intensity = 2.0;

    // Burst 120 golden & rose hearts and glitter confetti
    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 12;
      this.confetti.push({
        x: this.width * 0.5,
        y: this.height * 0.55,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 10 + Math.random() * 14,
        color: ['#e5c158', '#f6df94', '#e11d48', '#fda4af', '#ffffff'][Math.floor(Math.random() * 5)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        alpha: 1,
        life: 1.0,
        decay: 0.004 + Math.random() * 0.005,
        isHeart: Math.random() > 0.4
      });
    }

    // Add extra petals
    for (let i = 0; i < 40; i++) {
      this.petals.push(this.createPetal(false));
    }
  }

  // Draw romantic heart shape
  drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 15, size / 15);
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.bezierCurveTo(-7, -14, -15, -4, -15, 4);
    ctx.bezierCurveTo(-15, 12, 0, 20, 0, 25);
    ctx.bezierCurveTo(0, 20, 15, 12, 15, 4);
    ctx.bezierCurveTo(15, -4, 7, -14, 0, -5);
    ctx.fill();
    ctx.restore();
  }

  // Draw 4-point diamond sparkle glint
  drawSparkleStar(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0);
      ctx.lineTo(size * 0.18, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.18, 0);
      ctx.closePath();
    }
    ctx.fill();

    // Small center glow
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  // Draw 3D fluttering realistic rose petal
  drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.scale(Math.cos(p.flip), 1);
    ctx.globalAlpha = p.opacity;

    // Petal gradient
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.size);
    grad.addColorStop(0, p.palette.fill);
    grad.addColorStop(0.7, p.palette.shade);
    grad.addColorStop(1, 'rgba(60, 5, 15, 0.95)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.7);
    ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.6, p.size * 0.8, p.size * 0.4, 0, p.size * 0.9);
    ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.4, -p.size * 0.7, -p.size * 0.6, 0, -p.size * 0.7);
    ctx.fill();

    // Delicate petal vein highlight
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.6);
    ctx.quadraticCurveTo(p.size * 0.1, 0, 0, p.size * 0.75);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. UPDATE & DRAW BOKEH / FAIRY LIGHTS
    for (let i = 0; i < this.bokeh.length; i++) {
      const b = this.bokeh[i];
      b.y += b.vy;
      b.x += b.vx;
      b.pulsePhase += b.pulseSpeed;
      b.alpha = b.baseAlpha * (0.65 + 0.35 * Math.sin(b.pulsePhase));

      // Draw soft glowing orb
      const grad = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, `hsla(${b.hue}, 90%, 75%, ${b.alpha})`);
      grad.addColorStop(0.5, `hsla(${b.hue}, 85%, 60%, ${b.alpha * 0.45})`);
      grad.addColorStop(1, `hsla(${b.hue}, 80%, 50%, 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Reset when floating out
      if (b.y < -30) {
        this.bokeh[i] = this.createBokeh(false);
      }
    }

    // 2. UPDATE & DRAW ROSE PETALS
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.oscillation += p.oscillationSpeed;
      p.x += p.vx + Math.sin(p.oscillation) * 1.2;
      p.y += p.vy;
      p.angle += p.angularVelocity;
      p.flip += p.flipSpeed;

      this.drawPetal(this.ctx, p);

      // Reset when petal reaches bottom or right
      if (p.y > this.height + 40 || p.x > this.width + 50) {
        this.petals[i] = this.createPetal(false);
      }
    }

    // 3. UPDATE & DRAW DIAMOND SPARKLES
    // Random sparkle appearance
    if (Math.random() < 0.12) {
      this.sparkles.push(this.createSparkle());
    }

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.phase += s.speed;
      const progress = Math.sin(s.phase);

      if (s.phase >= Math.PI) {
        this.sparkles.splice(i, 1);
        continue;
      }

      s.alpha = s.maxAlpha * progress;
      this.drawSparkleStar(this.ctx, s.x, s.y, s.size, s.color, s.alpha);
    }

    // 4. UPDATE & DRAW CELEBRATION CONFETTI & HEARTS
    if (this.confetti.length > 0) {
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.22; // gravity
        c.vx *= 0.985; // air drag
        c.rotation += c.rotSpeed;
        c.life -= c.decay;

        if (c.life <= 0 || c.y > this.height + 50) {
          this.confetti.splice(i, 1);
          continue;
        }

        if (c.isHeart) {
          this.drawHeart(this.ctx, c.x, c.y, c.size, c.color, c.life);
        } else {
          // Shimmering gold foil strip
          this.ctx.save();
          this.ctx.translate(c.x, c.y);
          this.ctx.rotate(c.rotation);
          this.ctx.fillStyle = c.color;
          this.ctx.globalAlpha = c.life;
          this.ctx.fillRect(-c.size * 0.5, -c.size * 0.25, c.size, c.size * 0.5);
          this.ctx.restore();
        }
      }
    }

    requestAnimationFrame(this.animate);
  }
}

// Global instance
window.particleEngine = new CinematicParticleEngine('particle-canvas');
