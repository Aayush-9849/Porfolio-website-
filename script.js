/**
 * RAUSHAN KUMAR — PORTFOLIO INTERACTION ENGINE
 * Rich animations, neural canvas, 3D tilt, audio synthesis, live AI lab
 */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
   * 1. AUDIO SYNTHESIZER (Subtle UI Sound Effects via Web Audio API)
   * ------------------------------------------------------------- */
  let audioCtx = null;
  let isSoundEnabled = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiClick(freq = 600, duration = 0.04) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio error suppressed gracefully
    }
  }

  const audioToggle = document.getElementById('audioToggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      document.body.classList.toggle('muted', !isSoundEnabled);
      if (isSoundEnabled) {
        playUiClick(880, 0.08);
      }
    });
    // Default muted until user opts in
    document.body.classList.add('muted');
  }

  /* -------------------------------------------------------------
   * 2. THEME SWITCHER (Light / Dark Theme)
   * ------------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved preference or default to light (matching Dribbble reference)
  const savedTheme = localStorage.getItem('ak_theme') || 'light';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', next);
      localStorage.setItem('ak_theme', next);
      playUiClick(520, 0.05);
    });
  }

  /* -------------------------------------------------------------
   * 3. MAGNETIC CUSTOM CURSOR WITH SMOOTH LERP
   * ------------------------------------------------------------- */
  const cursorRing = document.getElementById('customCursor');
  const cursorDot = document.getElementById('cursorDot');

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  if (cursorRing && cursorDot) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Interactive Hover States
    const interactiveEls = document.querySelectorAll('a, button, input, select, textarea, .tilt-card, .quick-view-btn');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('hovering');
        playUiClick(440, 0.02);
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('hovering');
      });
    });
  }

  /* -------------------------------------------------------------
   * 4. AMBIENT NEURAL NETWORK CANVAS (Reactive Particles)
   * ------------------------------------------------------------- */
  const canvas = document.getElementById('neuralCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    });

    const nodeCount = Math.floor(Math.min(width, 1440) / 36);
    let nodes = [];

    function initNodes() {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1.2
        });
      }
    }
    initNodes();

    function drawNeuralNetwork() {
      ctx.clearRect(0, 0, width, height);
      const isDark = htmlRoot.getAttribute('data-theme') === 'dark';
      const nodeColor = isDark ? 'rgba(190, 242, 100, 0.7)' : 'rgba(101, 163, 13, 0.5)';
      const lineColor = isDark ? 'rgba(190, 242, 100, ' : 'rgba(101, 163, 13, ';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        // Bounce on boundary
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * (isDark ? 0.25 : 0.15);
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = lineColor + alpha + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Connect to mouse pointer
        if (mouseX > 0 && mouseY > 0) {
          const mdx = n.x - mouseX;
          const mdy = n.y - mouseY;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 160) {
            const mAlpha = (1 - mDist / 160) * 0.35;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = lineColor + mAlpha + ')';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawNeuralNetwork);
    }
    requestAnimationFrame(drawNeuralNetwork);
  }

  /* -------------------------------------------------------------
   * 5. 3D CARD TILT EFFECT ON HOVER
   * ------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  });

  /* -------------------------------------------------------------
   * 6. STICKY HEADER & ACTIVE NAV SCROLL TRACKING
   * ------------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Tracking
    let currentId = '';
    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  /* -------------------------------------------------------------
   * 7. MOBILE MENU TOGGLE
   * ------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      playUiClick(500, 0.04);
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });
  }

  /* -------------------------------------------------------------
   * 8. PROJECT FILTER TABS
   * ------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      playUiClick(650, 0.03);

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const cats = card.getAttribute('data-category') || '';
        if (filter === 'all' || cats.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* -------------------------------------------------------------
   * 9. LIVE AI TERMINAL & ACTIVATION WAVEFORM VISUALIZER
   * ------------------------------------------------------------- */
  const waveformCanvas = document.getElementById('waveformCanvas');
  const modelSelect = document.getElementById('modelSelect');
  const runInferenceBtn = document.getElementById('runInferenceBtn');
  const clearTerminalBtn = document.getElementById('clearTerminalBtn');
  const consoleOutput = document.getElementById('consoleOutput');
  const telemLatency = document.getElementById('telemLatency');
  const telemVRAM = document.getElementById('telemVRAM');
  const telemThroughput = document.getElementById('telemThroughput');

  let waveOffset = 0;
  let waveSpeed = 0.05;
  let waveAmplitude = 18;

  if (waveformCanvas) {
    const wCtx = waveformCanvas.getContext('2d');
    function drawWaveform() {
      const w = waveformCanvas.width;
      const h = waveformCanvas.height;
      wCtx.clearRect(0, 0, w, h);

      // Grid background
      wCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      wCtx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        wCtx.beginPath();
        wCtx.moveTo(x, 0);
        wCtx.lineTo(x, h);
        wCtx.stroke();
      }

      // Sine Wave
      wCtx.beginPath();
      wCtx.lineWidth = 2;
      wCtx.strokeStyle = '#bef264';
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.03 + waveOffset) * waveAmplitude + Math.cos(x * 0.01 + waveOffset * 0.5) * (waveAmplitude * 0.4);
        if (x === 0) wCtx.moveTo(x, y);
        else wCtx.lineTo(x, y);
      }
      wCtx.stroke();

      waveOffset += waveSpeed;
      requestAnimationFrame(drawWaveform);
    }
    requestAnimationFrame(drawWaveform);
  }

  // Model Specs Database
  const modelSpecs = {
    neurovision: {
      latency: '18.4 ms',
      vram: '3.4 / 16 GB',
      throughput: '64 scans/s',
      log: '[NEUROVISION] 3D Attention UNet++ loaded. Input tensor: [1, 4, 128, 128, 128]. Dice loss: 0.034. Inference status: OK.'
    },
    nexusllm: {
      latency: '14.8 ms',
      vram: '2.1 / 16 GB',
      throughput: '184 tokens/s',
      log: '[NEXUS-LLM] Agentic RAG pipeline initialized. Vector search: Pinecone 1536-dim. Context retrieved: 4 chunks (0.94 relevance score).'
    },
    yolov9: {
      latency: '6.2 ms',
      vram: '1.2 / 16 GB',
      throughput: '161 FPS',
      log: '[YOLOV9-EDGE] TensorRT FP16 engine verified. Input stream 1080p60. 14 targets detected with 0.98 mAP.'
    }
  };

  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      const selected = modelSpecs[modelSelect.value];
      if (selected) {
        telemLatency.textContent = selected.latency;
        telemVRAM.textContent = selected.vram;
        telemThroughput.textContent = selected.throughput;
        appendLog(`[SWITCH] Active model set to "${modelSelect.options[modelSelect.selectedIndex].text}"`);
        playUiClick(700, 0.04);
      }
    });
  }

  function appendLog(text, className = 'text-info') {
    if (!consoleOutput) return;
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = `log-line ${className}`;
    div.textContent = `${time} ${text}`;
    consoleOutput.appendChild(div);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  if (runInferenceBtn) {
    runInferenceBtn.addEventListener('click', () => {
      playUiClick(950, 0.08);
      runInferenceBtn.disabled = true;
      runInferenceBtn.innerHTML = `<span>Simulating...</span>`;
      waveSpeed = 0.16;
      waveAmplitude = 28;

      appendLog(`[INFER] Triggering forward pass on device: CUDA:0 (NVIDIA RTX Orin)...`, 'text-accent');

      setTimeout(() => {
        const selected = modelSpecs[modelSelect.value];
        // Jitter metrics slightly for realism
        const jitterLatency = (parseFloat(selected.latency) + (Math.random() * 1.5 - 0.75)).toFixed(1) + ' ms';
        telemLatency.textContent = jitterLatency;
        appendLog(selected.log, 'text-accent');
        appendLog(`[COMPLETE] Benchmark execution finished with 0 errors.`, 'text-muted');

        waveSpeed = 0.05;
        waveAmplitude = 18;
        runInferenceBtn.disabled = false;
        runInferenceBtn.innerHTML = `<span>Run Inference Benchmark</span> <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      }, 700);
    });
  }

  if (clearTerminalBtn) {
    clearTerminalBtn.addEventListener('click', () => {
      playUiClick(400, 0.03);
      if (consoleOutput) {
        consoleOutput.innerHTML = `<div class="log-line text-muted">[SYSTEM] Console buffer cleared. Terminal ready.</div>`;
      }
    });
  }

  /* -------------------------------------------------------------
   * 10. ANIMATED NUMERICAL COUNTERS (Stats in About Section)
   * ------------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach(stat => {
          const target = parseFloat(stat.getAttribute('data-target'));
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const step = target / 40;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              stat.textContent = isDecimal ? target.toFixed(1) : Math.round(target);
              clearInterval(timer);
            } else {
              stat.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
            }
          }, 30);
        });
      }
    });
  }, { threshold: 0.4 });

  const statsRow = document.querySelector('.stats-row');
  if (statsRow) statsObserver.observe(statsRow);

  /* -------------------------------------------------------------
   * 11. QUICK-VIEW PROJECT DETAILS MODAL
   * ------------------------------------------------------------- */
  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  const projectDetails = {
    neurovision: {
      title: 'NeuroVision Diagnostic AI',
      subtitle: 'Clinical Brain MRI Segmentation & Oncology Telemetry',
      img: 'assets/neurovision_ui.jpg',
      tags: ['Computer Vision', 'Medical Imaging', 'UNet++', 'PyTorch', 'FastAPI'],
      desc: 'NeuroVision AI is a deep learning system engineered for automated high-precision segmentation of gliomas, meningiomas, and micro-metastases in brain MRI scans. Built using UNet++ with attention gates and deep supervision.',
      bullets: [
        'Achieved a peak Dice Similarity Coefficient of 96.5% across BraTS multi-parametric benchmark scans.',
        'Engineered an interactive sliced 3D volumetric slice visualizer running at 60 FPS in the browser.',
        'Integrated automated anomaly detection and radiology trend telemetry for diagnostic support.',
        'Deployed with FastAPI and TensorRT ONNX export for sub-20ms inference times.'
      ],
      github: 'https://github.com',
      demo: '#hero'
    },
    nexusllm: {
      title: 'NexusLLM Autonomous Agentic Engine',
      subtitle: 'Multi-Agent Workflow Orchestration & Sub-15ms RAG Canvas',
      img: 'assets/nexusllm_ui.jpg',
      tags: ['Generative AI', 'Agentic Workflows', 'RAG', 'Pinecone', 'TypeScript'],
      desc: 'NexusLLM is an extensible orchestration platform for autonomous LLM agents that dynamically synthesize tools, execute Python sandbox code, and query vectorized knowledge bases.',
      bullets: [
        'Interactive drag-and-drop node graph canvas built for building multi-step reasoning agents.',
        'Integrated sub-15ms hybrid keyword & vector retrieval via Pinecone and local embeddings.',
        'Sandboxed code execution block with real-time streaming output and intermediate variable inspection.',
        'Dynamic prompt evaluation and automated regression testing across multiple foundation models.'
      ],
      github: 'https://github.com',
      demo: '#hero'
    },
    synapseflow: {
      title: 'SynapseFlow Edge Analytics',
      subtitle: 'Real-Time Multi-Camera Object Tracking & Crowd Intelligence',
      img: 'assets/neurovision_ui.jpg',
      tags: ['Edge AI', 'YOLOv9', 'DeepSORT', 'TensorRT', 'CUDA'],
      desc: 'SynapseFlow is a high-throughput edge computer vision platform for real-time pedestrian tracking, vehicle velocity calculation, and anomaly detection in dense environments.',
      bullets: [
        'Processed 4 concurrent 1080p RTSP camera streams at 60 FPS on an embedded Jetson Orin compute module.',
        'Trained custom YOLOv9 detectors with TensorRT FP16 quantization, cutting latency down to 6.2ms.',
        'DeepSORT tracking algorithm tuned with custom Kalman filters to eliminate identity switching in occlusions.',
        'Built for smart campus safety monitoring and automated density heatmaps at SRM University AP.'
      ],
      github: 'https://github.com',
      demo: '#hero'
    },
    campusrover: {
      title: 'SRMAP CampusRover NavAI',
      subtitle: 'Autonomous LiDAR-Guided Campus Rover with ROS2',
      img: 'assets/nexusllm_ui.jpg',
      tags: ['Robotics', 'ROS2 Humble', 'SLAM', 'LiDAR', 'C++ / Python'],
      desc: 'Autonomous mobile robot platform built at SRM University AP capable of self-directed navigation, dynamic obstacle avoidance, and package delivery across campus pathways.',
      bullets: [
        '2D/3D LiDAR sensor fusion with wheel odometry and IMU using Extended Kalman Filtering (EKF).',
        'Implemented cartographer SLAM for real-time indoor and outdoor topological mapping.',
        'Custom local path planner utilizing Model Predictive Control (MPC) and dynamic window approach.',
        'Over 50 kilometers of successful autonomous test navigations conducted on SRM AP campus grounds.'
      ],
      github: 'https://github.com',
      demo: '#hero'
    }
  };

  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projKey = btn.getAttribute('data-project');
      const data = projectDetails[projKey];
      if (data && projectModal && modalBody) {
        modalBody.innerHTML = `
          <div class="resume-header">
            <h2>${data.title}</h2>
            <span class="resume-subtitle">${data.subtitle}</span>
          </div>
          <img src="${data.img}" alt="${data.title}" class="modal-img">
          <p style="margin-bottom: 16px; color: var(--text-secondary); line-height: 1.6;">${data.desc}</p>
          <div class="resume-section">
            <h3>Key Technical Highlights</h3>
            <ul class="resume-bullet-list">
              ${data.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
          <div class="resume-footer-actions" style="margin-top: 24px;">
            <a href="${data.github}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">GitHub Repository ↗</a>
            <button class="btn btn-secondary btn-sm" id="modalInnerCloseBtn">Back to Works</button>
          </div>
        `;
        projectModal.showModal();
        playUiClick(600, 0.05);

        document.getElementById('modalInnerCloseBtn').addEventListener('click', () => {
          projectModal.close();
        });
      }
    });
  });

  if (modalCloseBtn && projectModal) {
    modalCloseBtn.addEventListener('click', () => {
      projectModal.close();
      playUiClick(450, 0.03);
    });

    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        projectModal.close();
      }
    });
  }

  /* -------------------------------------------------------------
   * 12. RESUME BRIEF MODAL
   * ------------------------------------------------------------- */
  const resumeModal = document.getElementById('resumeModal');
  const openResumeBtn = document.getElementById('openResumeBtn');
  const resumeCloseBtn = document.getElementById('resumeCloseBtn');
  const closeResumeBottomBtn = document.getElementById('closeResumeBottomBtn');

  if (openResumeBtn && resumeModal) {
    openResumeBtn.addEventListener('click', () => {
      resumeModal.showModal();
      playUiClick(650, 0.05);
    });
  }

  [resumeCloseBtn, closeResumeBottomBtn].forEach(b => {
    if (b && resumeModal) {
      b.addEventListener('click', () => {
        resumeModal.close();
        playUiClick(450, 0.03);
      });
    }
  });

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) resumeModal.close();
    });
  }

  /* -------------------------------------------------------------
   * 13. COPY EMAIL TO CLIPBOARD WITH MICRO-FEEDBACK
   * ------------------------------------------------------------- */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailToCopy = document.getElementById('emailToCopy');
  const copyBtnText = document.getElementById('copyBtnText');

  if (copyEmailBtn && emailToCopy && copyBtnText) {
    copyEmailBtn.addEventListener('click', () => {
      const email = emailToCopy.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        copyBtnText.textContent = 'Copied! ✓';
        copyEmailBtn.style.backgroundColor = 'var(--accent)';
        copyEmailBtn.style.color = 'var(--accent-text)';
        playUiClick(880, 0.07);

        setTimeout(() => {
          copyBtnText.textContent = 'Copy';
          copyEmailBtn.style.backgroundColor = '';
          copyEmailBtn.style.color = '';
        }, 2400);
      }).catch(() => {
        copyBtnText.textContent = 'Copied!';
      });
    });
  }

  /* -------------------------------------------------------------
   * 14. CONTACT FORM VALIDATION & SUBMISSION SIMULATION
   * ------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const formSubmitBtn = document.getElementById('formSubmitBtn');

  if (contactForm && formStatus && formSubmitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('senderName');
      const emailInput = document.getElementById('senderEmail');
      const messageInput = document.getElementById('senderMessage');

      const nameGroup = nameInput.parentElement;
      const emailGroup = emailInput.parentElement;
      const messageGroup = messageInput.parentElement;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameGroup.classList.add('has-error');
        isValid = false;
      } else {
        nameGroup.classList.remove('has-error');
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailGroup.classList.add('has-error');
        isValid = false;
      } else {
        emailGroup.classList.remove('has-error');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageGroup.classList.add('has-error');
        isValid = false;
      } else {
        messageGroup.classList.remove('has-error');
      }

      if (!isValid) {
        playUiClick(300, 0.08);
        return;
      }

      // Submission simulation
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = `<span>Sending Message...</span>`;
      playUiClick(750, 0.06);

      setTimeout(() => {
        formStatus.className = 'form-status success';
        formStatus.textContent = '✓ Message received! Raushan will get back to you shortly.';
        contactForm.reset();
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = `<span>Send Message</span> <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>`;
        playUiClick(990, 0.1);
      }, 1000);
    });
  }

  // Update current year dynamically
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

});
