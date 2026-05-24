// Portfolio Core Interaction Controller (v3 with FormSubmit & Light Mode Default)
// Coordinates dynamic cards, tab tools, B&W theme, and Marmoset / lookdev slideshow modals

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. DUAL THEME STATE CONTROLLER (LIGHT MODE DEFAULT)
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // Set Light Mode as the default unless previously saved
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme ? savedTheme : 'light';
  
  setTheme(initialTheme);
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.documentElement.classList.contains('light');
      const newTheme = isCurrentlyLight ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }
  
  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    
    localStorage.setItem('theme', theme);
    
    // Dispatch event to update monochrome Three.js viewport
    const event = new CustomEvent('themeChanged', { detail: { theme: theme } });
    document.dispatchEvent(event);
  }

  // ==========================================
  // 2. INTERACTIVE ABOUT/SKILLS TABS
  // ==========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  // ==========================================
  // 3. DYNAMIC DATABASE PROJECTS LOADER & VIEW CLICKS
  // ==========================================
  const projectsGrid = document.getElementById('projects-grid');
  let projectsDatabase = [];
  
  async function loadProjects() {
    try {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error('Failed to fetch projects list');
      
      projectsDatabase = await response.json();
      renderProjects(projectsDatabase);
    } catch (err) {
      console.error('Error loading portfolio projects database:', err);
      renderFallbackGrid();
    }
  }
  
  function renderProjects(projects) {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
      renderFallbackGrid("No active projects found in database. Drop project folders and run 'sync.py' to update.");
      return;
    }
    
    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card tactile-card';
      
      const toolsHtml = project.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('');
      
      card.innerHTML = `
        <div class="project-thumbnail-wrapper">
          <img src="${project.thumbnail}" alt="${project.title} Render" class="project-img" loading="lazy">
        </div>
        <div class="project-info">
          <span class="project-cat">${project.category}</span>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
          <div class="project-tools">
            ${toolsHtml}
          </div>
          <div class="project-cta-group">
            <button class="tactile-btn secondary-flat small-btn wide-btn view-project-btn" data-id="${project.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              View Work / Lookdev
            </button>
          </div>
        </div>
      `;
      
      projectsGrid.appendChild(card);
    });
    
    // Bind click events on custom project view buttons
    const viewButtons = document.querySelectorAll('.view-project-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const projectId = btn.getAttribute('data-id');
        const projectObj = projectsDatabase.find(p => p.id === projectId);
        if (projectObj) {
          openLookdevStudio(projectObj);
        }
      });
    });
  }
  
  function renderFallbackGrid(message = "Could not connect to project index file projects.json. Make sure to generate it using 'sync.py'.") {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = `
      <div class="fallback-card">
        <p>${message}</p>
      </div>
    `;
  }
  
  loadProjects();

  // ==========================================
  // 4. INTERACTIVE LOOKDEV STUDIO MODAL CONTROLLER
  // ==========================================
  const lookdevModal = document.getElementById('lookdev-modal');
  const closeModalBtn = document.getElementById('close-modal');
  
  // Modal Elements
  const mTitle = document.getElementById('modal-project-title');
  const mCat = document.getElementById('modal-project-cat');
  const mDesc = document.getElementById('modal-project-desc');
  const mTools = document.getElementById('modal-project-tools');
  const mDemoLink = document.getElementById('modal-project-demolink');
  const sliderContainer = document.getElementById('lookdev-slider-container');
  const mapSelectorsContainer = document.getElementById('lookdev-map-selectors');
  const marmosetContainer = document.getElementById('marmoset-viewport-container');
  const marmosetLaunchContainer = document.getElementById('marmoset-launch-section');
  const loadingIndicator = document.getElementById('lookdev-loading');
  
  function openLookdevStudio(project) {
    if (!lookdevModal) return;
    
    console.log(`[Lookdev Studio] Inspecting project: ${project.title}`);
    
    // 1. Reset Modal view states
    sliderContainer.innerHTML = '';
    mapSelectorsContainer.innerHTML = '';
    marmosetContainer.innerHTML = '';
    marmosetContainer.classList.remove('active');
    marmosetLaunchContainer.innerHTML = '';
    loadingIndicator.classList.remove('active');
    
    // 2. Set Text contents
    mTitle.innerText = project.title;
    mCat.innerText = project.category;
    mDesc.innerText = project.description;
    
    // Inject tools
    mTools.innerHTML = project.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('');
    
    // Inject walkthough demo link
    if (project.demoUrl && project.demoUrl !== '#') {
      mDemoLink.style.display = 'inline-flex';
      mDemoLink.setAttribute('href', project.demoUrl);
    } else {
      mDemoLink.style.display = 'none';
    }
    
    // 3. Render WebP Lookdev map slide showcase
    const hasSlides = project.slides && Object.keys(project.slides).length > 0;
    if (hasSlides) {
      console.log(`[Lookdev Studio] Building slide layers: ${Object.keys(project.slides)}`);
      
      Object.entries(project.slides).forEach(([mapType, path]) => {
        // Create Lookdev layer image
        const img = document.createElement('img');
        img.className = 'lookdev-layer-img';
        img.src = path;
        img.alt = `${project.title} - ${mapType} Pass`;
        img.id = `slide-layer-${mapType}`;
        sliderContainer.appendChild(img);
        
        // Create matching B&W tab selector button
        const btn = document.createElement('button');
        btn.className = 'map-selector-btn';
        btn.setAttribute('data-target-map', mapType);
        
        // Clean display name (e.g. basecolor -> Albedo Map)
        let displayLabel = mapType.toUpperCase();
        if (mapType === 'render') displayLabel = 'Final Render';
        if (mapType === 'wireframe') displayLabel = 'Wireframe Topology';
        if (mapType === 'ao') displayLabel = 'Ambient Occlusion (AO)';
        if (mapType === 'basecolor') displayLabel = 'Albedo Map';
        if (mapType === 'normals') displayLabel = 'Normal Map';
        
        btn.innerHTML = `<span class="btn-dot"></span> ${displayLabel}`;
        
        // Tab click event handles lookdev cross-fading
        btn.addEventListener('click', () => {
          // Deactivate Marmoset if loaded
          marmosetContainer.classList.remove('active');
          const activeMarmosetBtn = marmosetLaunchContainer.querySelector('.map-selector-btn');
          if (activeMarmosetBtn) activeMarmosetBtn.classList.remove('active');
          
          // Clear active map selector buttons & images
          document.querySelectorAll('.map-selector-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.lookdev-layer-img').forEach(i => i.classList.remove('active'));
          
          // Activate clicked
          btn.classList.add('active');
          const targetImg = document.getElementById(`slide-layer-${mapType}`);
          if (targetImg) targetImg.classList.add('active');
        });
        
        mapSelectorsContainer.appendChild(btn);
      });
      
      // Auto-trigger click on the first map button to load viewport
      const firstSelector = mapSelectorsContainer.querySelector('.map-selector-btn');
      if (firstSelector) firstSelector.click();
    }
    
    // 4. Render Marmoset Viewport Option
    const hasMview = project.mview || project.mviewHtml;
    if (hasMview) {
      console.log("[Lookdev Studio] Building Marmoset Toolbag dynamic viewport...");
      
      const marmosetBtn = document.createElement('button');
      marmosetBtn.className = 'map-selector-btn';
      marmosetBtn.innerHTML = `<span class="btn-dot"></span> 🔮 Interactive 3D (Marmoset)`;
      
      marmosetBtn.addEventListener('click', () => {
        // Deactivate Lookdev image slides
        document.querySelectorAll('.map-selector-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.lookdev-layer-img').forEach(i => i.classList.remove('active'));
        
        // Active this button
        marmosetBtn.classList.add('active');
        
        // Show loading spinner
        loadingIndicator.classList.add('active');
        marmosetContainer.classList.add('active');
        marmosetContainer.innerHTML = ''; // Reset container
        
        setTimeout(() => {
          loadingIndicator.classList.remove('active');
          
          if (project.mviewHtml) {
            // Load exported Marmoset HTML wrapper inside frame
            marmosetContainer.innerHTML = `<iframe src="${project.mviewHtml}" class="marmoset-iframe"></iframe>`;
          } else if (project.mview && typeof marmoset !== 'undefined') {
            // Embed .mview using official CDN library
            marmoset.embed(project.mview, {
              width: '100%',
              height: '100%',
              autoStart: true,
              theme: 'dark'
            });
          } else {
            marmosetContainer.innerHTML = `
              <div class="fallback-card">
                <p>Marmoset viewer library or scene model failed to load. Ensure 'marmoset.js' script is active.</p>
              </div>
            `;
          }
        }, 1200);
      });
      
      marmosetLaunchContainer.appendChild(marmosetBtn);
      
      // If project has ONLY Marmoset (no lookdev WebP slides), click it automatically
      if (!hasSlides) {
        marmosetBtn.click();
      }
    }
    
    // 5. Open Modal Overlay
    lookdevModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Stop body scrolling
  }
  
  function closeLookdevStudio() {
    if (!lookdevModal) return;
    
    lookdevModal.classList.remove('open');
    document.body.style.overflow = ''; // Restore body scrolling
    
    setTimeout(() => {
      marmosetContainer.innerHTML = '';
      sliderContainer.innerHTML = '';
    }, 500);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeLookdevStudio);
  }
  
  // Close modal when clicking outside content wrapper
  if (lookdevModal) {
    lookdevModal.addEventListener('click', (e) => {
      if (e.target === lookdevModal) {
        closeLookdevStudio();
      }
    });
  }
  
  // Escape key support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lookdevModal && lookdevModal.classList.contains('open')) {
      closeLookdevStudio();
    }
  });


  // ==========================================
  // 6. SCROLL PARALLAX ACTIVE NAV ELEMENT
  // ==========================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    let currentActiveSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      
      if (window.scrollY >= sectionTop - 150) {
        currentActiveSectionId = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentActiveSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 5. MOBILE HAMBURGER MENU DRAWER CONTROLLER
  // ==========================================
  const menuToggle = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');
  
  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('open');
      navbar.classList.toggle('open');
    });
    
    // Close menu when clicking any nav link
    const navLinks = navbar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navbar.classList.remove('open');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('open');
        navbar.classList.remove('open');
      }
    });
  }
});
