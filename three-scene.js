// Three.js Immersive 3D Viewport Setup
// Inspired by DogStudio
// Dynamically loads Anany's 'hero-model/model.glb' with premium metallic look,
// and falls back to a monochrome DNA particle sphere if empty.

class ThreeWebGLCore {
  constructor() {
    this.container = document.getElementById('three-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.modelGroup = null; // Container for either GLB or particles
    this.loadedModel = null; // Stored loaded GLB model
    this.particles = null; // Stored fallback particle sphere
    
    // Fallback Particles Parameters
    this.particleCount = 1800;
    this.geometry = null;
    this.material = null;
    this.time = 0;
    this.baseRadius = 2.2;
    this.morphSpeed = 0.8;
    this.noiseStrength = 0.45;
    
    // Animation targets for scroll tracking
    this.scrollProgress = 0;
    this.targetPosition = { x: 0, y: 0.2, z: 0 };
    this.currentPosition = { x: 0, y: 0.2, z: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    this.targetScale = 1;
    this.currentScale = 1;
    
    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    
    // Pristine Monochrome Theme Colors
    this.colors = {
      dark: {
        bg: 0x08090c,
        primary: 0xffffff,   // Pure White
        secondary: 0x8e909a, // Muted Silver
        ambient: 0x111116
      },
      light: {
        bg: 0xedeeec,
        primary: 0x090a0f,   // Obsidian Black
        secondary: 0x71717a, // Muted Charcoal
        ambient: 0xdddddf
      }
    };
    
    this.currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    
    this.init();
  }

  init() {
    // 1. Create Scene
    this.scene = new THREE.Scene();
    
    // 2. Camera Setup
    const fov = 45;
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    this.camera.position.z = 8;
    
    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    
    // 4. Model Group (holds whatever 3D content we render)
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);
    
    // 5. Setup Lights (Cinematic gallery setups to showcase metallic surfaces)
    this.setupLighting();
    
    // 6. Load Custom GLB Model or Fallback to Particles
    this.loadInteractive3DContent();

    // 7. Bind Events
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));
    
    // Listen for theme switch events
    document.addEventListener('themeChanged', (e) => {
      this.transitionTheme(e.detail.theme);
    });
    
    // 8. Start Loop
    this.animate();
  }

  setupLighting() {
    const themeColors = this.colors[this.currentTheme];
    
    // Soft Ambient Light
    this.ambientLight = new THREE.AmbientLight(themeColors.ambient, 0.85);
    this.scene.add(this.ambientLight);
    
    // Primary Key Spotlight (draws beautiful sharp glints on metallic surfaces)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.keyLight.position.set(5, 8, 5);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);
    
    // Backlight for edge rim lighting (DogStudio rim highlight effect)
    this.rimLight = new THREE.DirectionalLight(themeColors.secondary, 2.0);
    this.rimLight.position.set(-6, 2, -6);
    this.scene.add(this.rimLight);
    
    // Soft fill light
    this.fillLight = new THREE.PointLight(themeColors.secondary, 0.5, 30);
    this.fillLight.position.set(-4, -4, 4);
    this.scene.add(this.fillLight);
  }
  
  loadInteractive3DContent() {
    const glbPath = 'hero-model/model.glb';
    
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.warn("THREE.GLTFLoader not loaded. Falling back to particle sphere.");
      this.createFallbackParticleSystem();
      return;
    }
    
    const loader = new THREE.GLTFLoader();
    console.log(`[Three.js] Attempting to load user 3D product from: ${glbPath}...`);
    
    loader.load(
      glbPath,
      (gltf) => {
        // SUCCESS: Load user model
        console.log("[Three.js] Custom GLB loaded successfully!");
        this.loadedModel = gltf.scene;
        
        // Apply premium monochrome metallic/glass shader look to their model meshes
        const isDark = this.currentTheme === 'dark';
        this.loadedModel.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Premium metallic lookdev (cold chrome/glass vibe)
            node.material = new THREE.MeshStandardMaterial({
              color: isDark ? 0xdfdfe5 : 0x27272a,
              metalness: isDark ? 0.95 : 0.8,
              roughness: isDark ? 0.15 : 0.3,
              transparent: true,
              opacity: 0.95,
              envMapIntensity: 1.5,
              flatShading: false
            });
          }
        });
        
        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(this.loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Shift geometry center
        this.loadedModel.position.x -= center.x;
        this.loadedModel.position.y -= center.y;
        this.loadedModel.position.z -= center.z;
        
        // Scale to standard height
        const maxDim = Math.max(size.x, size.y, size.z);
        const normScale = this.baseRadius * 1.1 / maxDim;
        this.loadedModel.scale.setScalar(normScale);
        
        // Add to main group
        this.modelGroup.add(this.loadedModel);
      },
      (xhr) => {
        // Progress (optional)
      },
      (error) => {
        // FAIL: Fallback silently to our beautiful particle sphere
        console.log("[Three.js] No model.glb found in 'hero-model/'. Loading fallback morphing DNA particles.");
        this.createFallbackParticleSystem();
      }
    );
  }
  
  createFallbackParticleSystem() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const initialPositions = [];
    
    const color1 = new THREE.Color(this.colors[this.currentTheme].primary);
    const color2 = new THREE.Color(this.colors[this.currentTheme].secondary);
    
    for (let i = 0; i < this.particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);
      
      initialPositions.push(new THREE.Vector3(x, y, z));
      
      const r = this.baseRadius;
      positions[i * 3] = x * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = z * r;
      
      // Interpolate colors along vertical Z heights (creates silver-to-charcoal gradient)
      const mixedColor = color1.clone().lerp(color2, (z + 1) / 2);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.initialPositions = initialPositions;
    
    // Glowing particle texture
    const particleTexture = this.createParticleTexture();
    
    const isDark = this.currentTheme === 'dark';
    this.material = new THREE.PointsMaterial({
      size: isDark ? 0.12 : 0.14,
      map: particleTexture,
      transparent: true,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      vertexColors: true,
      opacity: isDark ? 1.0 : 0.8
    });
    
    this.particles = new THREE.Points(this.geometry, this.material);
    this.modelGroup.add(this.particles);
  }
  
  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
  }
  
  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  
  onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;
    this.scrollProgress = maxScroll > 0 ? currentScroll / maxScroll : 0;
    
    // Map viewports based on scroll heights (Hero -> About -> Projects -> Experience -> Contact)
    if (this.scrollProgress < 0.2) {
      this.targetPosition.x = 0;
      this.targetPosition.y = 0.2;
      this.targetScale = 1.0;
    } else if (this.scrollProgress >= 0.2 && this.scrollProgress < 0.45) {
      this.targetPosition.x = 2.0;
      this.targetPosition.y = -0.2;
      this.targetScale = 0.85;
    } else if (this.scrollProgress >= 0.45 && this.scrollProgress < 0.7) {
      this.targetPosition.x = -2.0;
      this.targetPosition.y = 0.1;
      this.targetScale = 0.95;
    } else if (this.scrollProgress >= 0.7 && this.scrollProgress < 0.9) {
      this.targetPosition.x = 1.8;
      this.targetPosition.y = -0.3;
      this.targetScale = 0.75;
    } else {
      this.targetPosition.x = 0;
      this.targetPosition.y = -0.4;
      this.targetScale = 1.15;
    }
  }
  
  transitionTheme(theme) {
    this.currentTheme = theme;
    const themeColors = this.colors[theme];
    
    // 1. Transition Lights
    if (this.ambientLight) this.ambientLight.color.setHex(themeColors.ambient);
    if (this.rimLight) this.rimLight.color.setHex(themeColors.secondary);
    if (this.fillLight) this.fillLight.color.setHex(themeColors.secondary);
    
    // 2. Transition Loaded GLB materials
    if (this.loadedModel) {
      const isDark = theme === 'dark';
      this.loadedModel.traverse((node) => {
        if (node.isMesh) {
          node.material.color.setHex(isDark ? 0xdfdfe5 : 0x27272a);
          node.material.metalness = isDark ? 0.95 : 0.8;
          node.material.roughness = isDark ? 0.15 : 0.3;
          node.material.needsUpdate = true;
        }
      });
    }
    
    // 3. Transition Fallback Particle Colors
    if (this.particles && this.geometry) {
      const colorsAttr = this.geometry.attributes.color;
      const color1 = new THREE.Color(themeColors.primary);
      const color2 = new THREE.Color(themeColors.secondary);
      
      for (let i = 0; i < this.particleCount; i++) {
        const z = this.initialPositions[i].z;
        const mixedColor = color1.clone().lerp(color2, (z + 1) / 2);
        colorsAttr.setXYZ(i, mixedColor.r, mixedColor.g, mixedColor.b);
      }
      colorsAttr.needsUpdate = true;
      
      const isDark = theme === 'dark';
      this.material.size = isDark ? 0.12 : 0.14;
      this.material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      this.material.opacity = isDark ? 1.0 : 0.8;
      this.material.needsUpdate = true;
    }
  }
  
  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    this.time += 0.01 * this.morphSpeed;
    
    // 1. Mouse tracking interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    
    // 2. Scroll transitions interpolation
    this.currentPosition.x += (this.targetPosition.x - this.currentPosition.x) * 0.06;
    this.currentPosition.y += (this.targetPosition.y - this.currentPosition.y) * 0.06;
    this.currentPosition.z += (this.targetPosition.z - this.currentPosition.z) * 0.06;
    this.currentScale += (this.targetScale - this.currentScale) * 0.06;
    
    if (this.modelGroup) {
      this.modelGroup.position.set(
        this.currentPosition.x,
        this.currentPosition.y,
        this.currentPosition.z
      );
      this.modelGroup.scale.setScalar(this.currentScale);
      
      // Auto-rotation + mouse track feedback
      this.modelGroup.rotation.y = this.time * 0.35 + this.mouseX * 0.3;
      this.modelGroup.rotation.x = Math.sin(this.time * 0.1) * 0.15 + this.mouseY * 0.3;
    }
    
    // 3. Mathematical morphing wave for particle sphere (only if active fallback)
    if (this.particles && this.geometry) {
      const positions = this.geometry.attributes.position.array;
      
      for (let i = 0; i < this.particleCount; i++) {
        const unitVec = this.initialPositions[i];
        
        const wave1 = Math.sin(unitVec.x * 3.5 + this.time) * Math.cos(unitVec.y * 3.5 + this.time);
        const wave2 = Math.cos(unitVec.z * 5.0 - this.time * 1.5) * 0.5;
        const wave3 = Math.sin(unitVec.y * 2.0 + this.time * 2.0) * 0.25;
        
        const finalRadius = this.baseRadius + (wave1 + wave2 + wave3) * this.noiseStrength;
        
        positions[i * 3] = unitVec.x * finalRadius;
        positions[i * 3 + 1] = unitVec.y * finalRadius;
        positions[i * 3 + 2] = unitVec.z * finalRadius;
      }
      
      this.geometry.attributes.position.needsUpdate = true;
    }
    
    // 4. Render
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialise core WebGL viewport once DOM loads
window.addEventListener('DOMContentLoaded', () => {
  window.threeCore = new ThreeWebGLCore();
});
