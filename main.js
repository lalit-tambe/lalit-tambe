// Tilt script: smooth RAF-driven 3D tilt for .glass-card-hover
// initTilt is defined at module scope so loadContent() can re-call it
// after dynamically injecting new .glass-card-hover cards.
function initTilt() {
  const maxTilt = 10; // degrees
  const scale = 1.02;
  const cards = document.querySelectorAll(".glass-card-hover");
  if (!cards.length) return;

  cards.forEach((card) => {
    // Skip cards that already have tilt initialised
    if (card._tiltInitialised) return;
    card._tiltInitialised = true;

    let rect = null;
    let halfW = 0,
      halfH = 0;
    let targetY = 0,
      targetX = 0; // target rotations (deg)
    let currentY = 0,
      currentX = 0; // current rotations (deg)
    let rafId = null;

    const lerp = (a, b, n) => a + (b - a) * n;

    function updateRect() {
      rect = card.getBoundingClientRect();
      halfW = rect.width / 2;
      halfH = rect.height / 2;
    }

    function apply() {
      // smooth towards target
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);
      card.style.transform = `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg) translateZ(8px) scale(${scale})`;
      rafId = requestAnimationFrame(apply);
    }

    function startLoop() {
      if (!rafId) rafId = requestAnimationFrame(apply);
    }

    function stopLoop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    card.addEventListener("pointerenter", () => {
      card.style.willChange = "transform";
      card.style.transition = "transform 180ms cubic-bezier(0.2,0.8,0.2,1)";
      updateRect();
      startLoop();
    });

    card.addEventListener(
      "pointermove",
      (e) => {
        if (!rect) updateRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x - halfW) / halfW) * maxTilt * -1; // yaw
        const rotateX = ((y - halfH) / halfH) * maxTilt; // pitch
        targetX = rotateY;
        targetY = rotateX;
      },
      { passive: true },
    );

    card.addEventListener("pointerleave", () => {
      card.style.transition = "transform 480ms cubic-bezier(0.2,0.8,0.2,1)";
      targetX = 0;
      targetY = 0;
      // let the lerp settle back to zero, then stop RAF
      setTimeout(() => {
        stopLoop();
        card.style.willChange = "";
        card.style.transform = "";
      }, 500);
    });

    // improve touch responsiveness without blocking vertical scroll
    card.style.touchAction = "pan-y";
  });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initTilt);
} else {
  initTilt();
}

// Navbar scroll progress script (uses CSS variable --nav-progress-scale on #navbar)
(function () {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  let ticking = false;

  function update() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - window.innerHeight;
    const scale = height > 0 ? scrollTop / height : 1;
    // clamp 0..1
    const s = Math.max(0, Math.min(1, scale));
    navbar.style.setProperty("--nav-progress-scale", s);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // initialize
  update();
})();

// Icons are handled via Font Awesome CSS/classes only — no JS initialization required.

// Icons are handled via Font Awesome CSS/classes only — no JS initialization required.

// ─── Content Loader ────────────────────────────────────────────────────────
// Fetches content.json and injects all dynamic content into the DOM.
// To update portfolio content, edit content.json — no HTML changes needed.

async function loadContent() {
  let data;
  try {
    const res = await fetch("/content.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.warn("content.json could not be loaded:", err);
    return;
  }

  // ── 1. Typewriter words ────────────────────────────────────────────────
  const roles = data.typewriter?.words ?? ["Full Stack Engineer"];

  // ── 2. Hero sub-heading & pills ────────────────────────────────────────
  const heroSubEl = document.getElementById("hero-subheading");
  if (heroSubEl && data.hero?.subheading) {
    heroSubEl.innerHTML = data.hero.subheading;
  }

  const heroPillsEl = document.getElementById("hero-pills");
  if (heroPillsEl && Array.isArray(data.hero?.pills)) {
    heroPillsEl.innerHTML = data.hero.pills
      .map(
        (pill) =>
          `<span class="px-4 py-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-neutral-800/40 text-xs font-medium text-neutral-600 dark:text-neutral-300 font-mono tracking-wide backdrop-blur-md">${pill}</span>`,
      )
      .join("");
  }

  // ── 3. About section ───────────────────────────────────────────────────
  const aboutLabelEl = document.getElementById("about-label");
  if (aboutLabelEl && data.about?.label) {
    aboutLabelEl.textContent = data.about.label;
  }

  const aboutHeadingEl = document.getElementById("about-heading");
  if (aboutHeadingEl && data.about?.heading) {
    aboutHeadingEl.innerHTML = data.about.heading;
  }

  const aboutParasEl = document.getElementById("about-paragraphs");
  if (aboutParasEl && Array.isArray(data.about?.paragraphs)) {
    aboutParasEl.innerHTML = data.about.paragraphs
      .map((p) => `<p>${p}</p>`)
      .join("");
  }

  // ── 4. Competencies ────────────────────────────────────────────────────
  const compLabelEl = document.getElementById("competencies-label");
  if (compLabelEl && data.competencies?.label)
    compLabelEl.textContent = data.competencies.label;

  const compHeadingEl = document.getElementById("competencies-heading");
  if (compHeadingEl && data.competencies?.heading)
    compHeadingEl.textContent = data.competencies.heading;

  const compSubEl = document.getElementById("competencies-subheading");
  if (compSubEl && data.competencies?.subheading)
    compSubEl.textContent = data.competencies.subheading;

  const compContainer = document.getElementById("competencies-container");
  if (compContainer && Array.isArray(data.competencies?.categories)) {
    // Generate Left Sidebar (Categories + Mobile Accordion)
    const categoriesHtml = data.competencies.categories
      .map(
        (cat, i) => `
      <div class="comp-accordion-group">
        <button class="comp-cat-btn group flex items-center justify-between w-full py-6 px-4 cursor-pointer relative text-left transition-all duration-300 hover:bg-neutral-100/50 dark:hover:bg-white/[0.02]" data-index="${i}">
          <!-- active line indicator -->
          <div class="absolute inset-y-0 left-0 w-0 bg-gradient-to-r from-neutral-200/50 dark:from-white/5 to-transparent opacity-0 transition-all duration-300 comp-cat-bg pointer-events-none"></div>
          <div class="w-1 h-0 bg-neutral-900 dark:bg-white absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 comp-cat-line rounded-r-md pointer-events-none"></div>
          
          <div class="flex items-center gap-4 relative z-10 pointer-events-none">
            <span class="font-mono text-sm text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors comp-cat-num">0${i + 1}</span>
            <h3 class="text-xl md:text-2xl font-bold text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors comp-cat-title">${cat.title}</h3>
          </div>

          <!-- Mobile arrow indicator -->
          <i class="fa-solid fa-chevron-down text-neutral-400 transition-transform duration-300 lg:hidden comp-cat-arrow pointer-events-none"></i>
        </button>
        
        <!-- Mobile Panel (Accordion) -->
        <div class="lg:hidden overflow-hidden transition-all duration-500 max-h-0 comp-mobile-panel" data-index="${i}">
          <div class="px-4 pb-8 pt-2">
            <div class="flex flex-wrap gap-2">
              ${cat.items
                .map(
                  (item) => `
                <span class="px-4 py-2 rounded-full border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-neutral-900/50 text-xs font-medium text-neutral-600 dark:text-neutral-300 shadow-sm">
                  ${item}
                </span>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    // Generate Right Panel (Desktop Items)
    const panelsHtml = data.competencies.categories
      .map(
        (cat, i) => `
      <div class="comp-panel absolute inset-0 p-8 md:p-12 transition-all duration-700 opacity-0 pointer-events-none translate-y-8 flex flex-col justify-center" data-index="${i}">
        <i class="${cat.icon} absolute -bottom-12 -right-12 text-[15rem] text-neutral-900/[0.03] dark:text-white/[0.03] rotate-12 transition-transform duration-1000 comp-panel-icon"></i>
        
        <div class="relative z-10">
            <div class="flex items-center gap-4 mb-8">
               <div class="p-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-neutral-100 dark:border-white/10">
                 <i class="${cat.icon} text-2xl text-neutral-900 dark:text-white"></i>
               </div>
               <h4 class="text-3xl font-bold text-neutral-900 dark:text-white">${cat.title}</h4>
            </div>
            <div class="flex flex-wrap gap-3">
              ${cat.items
                .map(
                  (item, j) => `
                <span class="comp-item px-5 py-2.5 rounded-full border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 text-sm font-medium text-neutral-700 dark:text-neutral-300 backdrop-blur-md shadow-sm transition-all duration-500 hover:scale-105 hover:bg-neutral-100 dark:hover:bg-white/10 hover:shadow-md cursor-default" style="transition-delay: ${j * 50}ms; opacity: 0; transform: translateY(15px)">
                  ${item}
                </span>
              `,
                )
                .join("")}
            </div>
        </div>
      </div>
    `,
      )
      .join("");

    compContainer.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div class="w-full lg:w-2/5 flex flex-col relative z-10 border-l border-neutral-200 dark:border-white/10">
          ${categoriesHtml}
        </div>
        <div class="hidden lg:block w-full lg:w-3/5 min-h-[450px]">
          <div class="glass-panel rounded-[2.5rem] w-full h-full min-h-[450px] relative overflow-hidden group border border-neutral-200 dark:border-white/10 bg-white/30 dark:bg-neutral-900/30 shadow-lg">
            ${panelsHtml}
          </div>
        </div>
      </div>
    `;

    const btns = compContainer.querySelectorAll(".comp-cat-btn");
    const panels = compContainer.querySelectorAll(".comp-panel");
    const mobilePanels = compContainer.querySelectorAll(".comp-mobile-panel");
    let activeIndex = -1;

    function activateCategory(index) {
      const isMobile = window.innerWidth < 1024;

      // Allow toggling off on mobile
      if (activeIndex === index && isMobile) {
        index = -1;
      }

      activeIndex = index;

      btns.forEach((btn, i) => {
        const line = btn.querySelector(".comp-cat-line");
        const bg = btn.querySelector(".comp-cat-bg");
        const title = btn.querySelector(".comp-cat-title");
        const num = btn.querySelector(".comp-cat-num");
        const arrow = btn.querySelector(".comp-cat-arrow");

        if (i === index) {
          line.style.height = "60%";
          bg.style.opacity = "1";
          bg.style.width = "100%";
          title.classList.remove("text-neutral-500", "dark:text-neutral-500");
          title.classList.add("text-neutral-900", "dark:text-white");
          num.classList.remove("text-neutral-400");
          num.classList.add("text-neutral-900", "dark:text-white");
          if (arrow) arrow.style.transform = "rotate(180deg)";
        } else {
          line.style.height = "0";
          bg.style.opacity = "0";
          bg.style.width = "0";
          title.classList.add("text-neutral-500", "dark:text-neutral-500");
          title.classList.remove("text-neutral-900", "dark:text-white");
          num.classList.add("text-neutral-400");
          num.classList.remove("text-neutral-900", "dark:text-white");
          if (arrow) arrow.style.transform = "rotate(0deg)";
        }
      });

      // Update Mobile Panels
      mobilePanels.forEach((mPanel, i) => {
        if (i === index) {
          mPanel.style.maxHeight = mPanel.scrollHeight + "px";
        } else {
          mPanel.style.maxHeight = "0px";
        }
      });

      // Update Desktop Panels
      panels.forEach((panel, i) => {
        const items = panel.querySelectorAll(".comp-item");
        const icon = panel.querySelector(".comp-panel-icon");

        if (i === index) {
          panel.classList.remove(
            "opacity-0",
            "pointer-events-none",
            "translate-y-8",
          );
          panel.classList.add("opacity-100", "translate-y-0");

          if (icon) {
            icon.style.transform = "rotate(-12deg) scale(1.1)";
          }

          items.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          });
        } else {
          panel.classList.add(
            "opacity-0",
            "pointer-events-none",
            "translate-y-8",
          );
          panel.classList.remove("opacity-100", "translate-y-0");

          if (icon) {
            icon.style.transform = "rotate(12deg) scale(1)";
          }

          items.forEach((item) => {
            item.style.opacity = "0";
            item.style.transform = "translateY(15px)";
          });
        }
      });
    }

    btns.forEach((btn, i) => {
      btn.addEventListener("click", () => activateCategory(i));
      // Hover only activates on desktop to avoid interfering with mobile tapping
      btn.addEventListener("mouseenter", () => {
        if (window.innerWidth >= 1024) {
          activateCategory(i);
        }
      });
    });

    // Initialize first category open
    setTimeout(() => activateCategory(0), 100);

    // Adjust max-height on resize for fluid mobile behavior
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1024 && activeIndex !== -1) {
        const activePanel = mobilePanels[activeIndex];
        if (activePanel) {
          activePanel.style.maxHeight = activePanel.scrollHeight + "px";
        }
      }
    });
  }

  // ── 4. Experience heading & subheading ─────────────────────────────────
  const expHeadingEl = document.getElementById("experience-heading");
  if (expHeadingEl && data.experience?.heading) {
    expHeadingEl.textContent = data.experience.heading;
  }

  const expSubEl = document.getElementById("experience-subheading");
  if (expSubEl && data.experience?.subheading) {
    expSubEl.textContent = data.experience.subheading;
  }

  // ── 5. Experience jobs ─────────────────────────────────────────────────
  const expJobsEl = document.getElementById("experience-jobs");
  if (expJobsEl && Array.isArray(data.experience?.jobs)) {
    expJobsEl.innerHTML = data.experience.jobs
      .map(
        (job) => `
      <div class="relative group">
        <!-- Dot -->
        <div class="absolute -left-6 md:-left-12 top-10 w-4 h-4 -translate-x-1/2 bg-neutral-800 dark:bg-white border-2 border-neutral-100 dark:border-white/20 rounded-full z-10 shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:scale-125 transition-transform"></div>
        <!-- Horizontal Connector -->
        <div class="absolute -left-6 md:-left-12 top-12 w-6 md:w-12 h-[2px] bg-gradient-to-r from-neutral-200 to-transparent dark:from-white dark:to-transparent"></div>
        <!-- Card -->
        <div class="glass-panel p-8 md:p-10 rounded-2xl border-l-2 border-l-neutral-300 dark:border-l-white/30 hover:border-l-neutral-900 dark:hover:border-l-white transition-colors relative">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
            <div>
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white">${job.title}</h3>
              <p class="text-sm font-medium text-neutral-600 dark:text-neutral-300 mt-1">${job.company}</p>
            </div>
            <span class="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-neutral-700 dark:text-white uppercase bg-neutral-100 dark:bg-white/10 rounded-full border border-neutral-200 dark:border-white/5 whitespace-nowrap">
              ${job.period}
            </span>
          </div>
          <p class="text-neutral-600 dark:text-neutral-300 text-sm mb-6">${job.summary}</p>
          <ul class="space-y-3">
            ${job.bullets
              .map(
                (b) => `
              <li class="flex items-start gap-3 text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">
                <span class="w-1.5 h-1.5 bg-neutral-400 dark:bg-white/40 rounded-full mt-2 shrink-0"></span>
                ${b}
              </li>`,
              )
              .join("")}
          </ul>
        </div>
      </div>`,
      )
      .join("");
  }

  // ── 6. Featured project cards ──────────────────────────────────────────
  const projectsGridEl = document.getElementById("projects-grid");
  if (projectsGridEl && Array.isArray(data.projects)) {
    const projectCards = data.projects
      .map(
        (proj) => `
      <div class="glass-panel p-8 rounded-3xl flex flex-col glass-card-hover group relative overflow-hidden">
        <!-- Gradient Overlay on Hover -->
        <div class="absolute inset-0 bg-gradient-to-br from-neutral-100 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div class="flex justify-between items-start mb-6 relative z-10">
          <div class="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl group-hover:border-neutral-300 dark:group-hover:border-white/30 transition-all duration-300">
            <i class="${proj.icon} text-lg"></i>
          </div>
          <div class="flex gap-3">
            ${
              proj.links?.npm
                ? `<a href="${proj.links.npm}" class="p-2 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full transition-colors group/npm group-hover:bg-white/80 dark:group-hover:bg-white/10" title="View NPM Package">
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover/npm:text-red-500 transition-colors">
                  <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.129z" fill="currentColor"/>
                </svg>
              </a>`
                : ""
            }
            ${
              proj.links?.github
                ? `<a href="${proj.links.github}" class="p-2 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full transition-colors group-hover:bg-white/80 dark:group-hover:bg-white/10">
                <i class="fa-brands fa-github"></i>
              </a>`
                : ""
            }
          </div>
        </div>

        <h3 class="text-2xl font-bold text-neutral-900 dark:text-white mb-3 relative z-10">${proj.title}</h3>
        <p class="text-neutral-600 dark:text-neutral-300 text-sm mb-8 leading-relaxed flex-grow relative z-10">${proj.description}</p>

        <div class="flex flex-wrap gap-2 relative z-10">
          ${proj.tags
            .map(
              (tag) =>
                `<span class="px-3 py-1 bg-white/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-white/5 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-200">${tag}</span>`,
            )
            .join("")}
        </div>
      </div>`,
      )
      .join("");

    // Always append the static "More Coming Soon" placeholder card last
    const placeholderCard = `
      <div class="glass-panel p-8 rounded-3xl flex flex-col justify-center items-center glass-card-hover group relative overflow-hidden border-dashed border-neutral-300 dark:border-white/10">
        <div class="p-4 bg-neutral-100 dark:bg-neutral-900/50 rounded-full border border-neutral-200 dark:border-white/5 text-neutral-400 dark:text-neutral-500 mb-4 group-hover:scale-110 transition-transform">
          <i class="fa-solid fa-folder-plus text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold text-neutral-600 dark:text-neutral-300 mb-2">More Projects Coming Soon</h3>
        <p class="text-neutral-500 text-sm text-center">Currently working on some exciting SaaS platforms.</p>
      </div>`;

    projectsGridEl.innerHTML = projectCards + placeholderCard;

    // Re-initialise tilt on newly created cards
    initTilt();
  }

  // ── 6.5. Writing articles ──────────────────────────────────────────────
  const writingGridEl = document.getElementById("writing-grid");
  if (writingGridEl && Array.isArray(data.writing)) {
    writingGridEl.innerHTML = data.writing
      .map(
        (article) => `
      <div class="glass-panel rounded-3xl overflow-hidden glass-card-hover group flex flex-col border border-neutral-200 dark:border-white/10 relative transition-colors duration-500 hover:border-neutral-300 dark:hover:border-white/30">
          <a href="${article.link}" target="_blank" class="absolute inset-0 z-30"><span class="sr-only">Read ${article.title}</span></a>
          
          <div class="h-48 overflow-hidden relative border-b border-neutral-200 dark:border-white/5">
             <div class="absolute inset-0 bg-neutral-900/10 dark:bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
             <img src="${article.coverImage}" alt="${article.title}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
          </div>
          
          <div class="p-6 md:p-8 flex flex-col flex-grow relative z-20 bg-transparent">
             <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${article.title}</h3>
             <p class="text-neutral-600 dark:text-neutral-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">${article.excerpt}</p>
             
             <div class="flex flex-wrap gap-2 mb-6">
                ${(article.tags || []).map((tag) => `<span class="px-2 py-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-300">${tag}</span>`).join("")}
             </div>
             
             <div class="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-auto">
                 Read Article
                 <i class="fa-solid fa-arrow-right transform group-hover:translate-x-1 transition-transform"></i>
             </div>
          </div>
      </div>
      `,
      )
      .join("");

    initTilt();
  }

  // ── 7. Contact card ────────────────────────────────────────────────────
  const contactHeadingEl = document.getElementById("contact-heading");
  if (contactHeadingEl && data.contact?.heading) {
    contactHeadingEl.textContent = data.contact.heading;
  }

  const contactSubEl = document.getElementById("contact-subheading");
  if (contactSubEl && data.contact?.subheading) {
    contactSubEl.textContent = data.contact.subheading;
  }

  const contactActionsEl = document.getElementById("contact-actions");
  if (contactActionsEl && data.contact) {
    const { email, phone, phoneHref } = data.contact;
    contactActionsEl.innerHTML = `
      <a href="mailto:${email}"
        class="px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1">
        <i class="fa-solid fa-envelope text-base"></i>
        Say Hello
      </a>
      <a href="${phoneHref}"
        class="px-8 py-4 bg-transparent border border-neutral-400 dark:border-white/20 text-neutral-900 dark:text-white font-medium rounded-full hover:bg-neutral-200 dark:hover:bg-white/5 transition-all flex items-center gap-2 backdrop-blur-sm">
        <i class="fa-solid fa-phone text-base"></i>
        ${phone}
      </a>`;
  }

  // ── Start Typewriter (after content is ready) ──────────────────────────
  startTypewriter(roles);
}

// ─── Typewriter Effect ─────────────────────────────────────────────────────
const typewriterElement = document.getElementById("typewriter-text");

function startTypewriter(roles) {
  // State is scoped here so it's fresh every time (safe for async load)
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function typeWriter() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50; // Faster when deleting
    } else {
      typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100; // Normal typing speed
    }

    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500; // Pause before new word
    }

    setTimeout(typeWriter, typeSpeed);
  }

  typeWriter();
}

// Kick off the content load (typewriter starts inside after fetch resolves)
loadContent();

// Mobile Menu Toggle Logic (robust + touch-friendly)
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.style.touchAction = "manipulation";
  mobileMenuBtn.style.cursor = "pointer";
  mobileMenuBtn.style.zIndex = "9999";
  mobileMenu.style.zIndex = "9998";

  let lastToggle = 0;
  const toggleMobileMenu = (e) => {
    const now = Date.now();
    if (now - lastToggle < 300) return; // debounce rapid events
    lastToggle = now;
    const isHidden = mobileMenu.classList.toggle("hidden");
    // aria and visual feedback
    try {
      mobileMenuBtn.setAttribute("aria-expanded", (!isHidden).toString());
    } catch (e) {}
    const icon = mobileMenuBtn.querySelector("i");
    if (icon) {
      if (mobileMenu.classList.contains("hidden")) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      } else {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      }
      // quick flash for touch devices
      icon.style.transform = "scale(0.95)";
      setTimeout(() => {
        icon.style.transform = "";
      }, 120);
    }
    try {
      console.debug(
        "mobileMenu: toggled",
        mobileMenu.classList.contains("hidden"),
      );
    } catch (e) {}
  };

  // Use click + pointerup/touchend which are reliable for taps
  mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  mobileMenuBtn.addEventListener("pointerup", toggleMobileMenu);
  mobileMenuBtn.addEventListener("touchend", toggleMobileMenu, {
    passive: true,
  });

  // Some browsers require a non-passive touchstart to register tap reliably
  mobileMenuBtn.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
      toggleMobileMenu();
    },
    { passive: false },
  );

  // Close mobile menu when clicking a link and restore icon/aria
  function closeMobileMenu() {
    mobileMenu.classList.add("hidden");
    try {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    } catch (e) {}
    const icon = mobileMenuBtn.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    }
  }

  const mobileLinks = mobileMenu.querySelectorAll("a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });
}

// Theme Toggle Logic
const themeToggleBtns = document.querySelectorAll(".theme-toggle");
const htmlElement = document.documentElement;

// Check for saved theme preference or system preference
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  htmlElement.classList.add("dark");
} else {
  htmlElement.classList.remove("dark");
}

themeToggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (htmlElement.classList.contains("dark")) {
      htmlElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      htmlElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    // Refresh orbs for theme change
    initOrbs();
  });
});

// Sticky Nav visual change on scroll
const nav = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    // Add stronger shadow/border on scroll
    nav.classList.add("shadow-lg");
    nav.classList.add("border-neutral-200");
    nav.classList.add("dark:border-white/10");
  } else {
    nav.classList.remove("shadow-lg");
    nav.classList.remove("border-neutral-200");
    nav.classList.remove("dark:border-white/10");
  }
});

// Active Navbar Link Styling
(function () {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  function updateActiveLink(targetHref = null) {
    let activeHref = targetHref;

    // If no target href provided, find based on scroll position
    if (!activeHref) {
      let currentSection = null;
      const viewportMiddle = window.innerHeight / 2;

      // Find which section is closest to the viewport middle
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionMiddle = rect.top + rect.height / 2;
        const distanceFromViewportMiddle = Math.abs(
          sectionMiddle - viewportMiddle,
        );

        if (
          currentSection === null ||
          distanceFromViewportMiddle < currentSection.distance
        ) {
          currentSection = { section, distance: distanceFromViewportMiddle };
        }
      });

      activeHref = currentSection ? `#${currentSection.section.id}` : null;
    }

    // Update active state for all nav links
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === activeHref;

      if (isActive) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Update on scroll
  window.addEventListener("scroll", () => updateActiveLink(), { passive: true });

  // Update immediately when a nav link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      updateActiveLink(href);
    });
  });

  updateActiveLink(); // Call on initial load
})();

// Scroll Reveal Animation
const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;
  const elementVisible = 150;

  revealElements.forEach((reveal) => {
    const elementTop = reveal.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      reveal.classList.add("active");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
// Trigger once on load
revealOnScroll();

// Floating Orbs Animation Engine with Collision Detection
const canvas = document.getElementById("orb-canvas");
let orbs = [];
let animationFrameId;

// Orb Logic using Inline Styles for guaranteed visibility
function initOrbs() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  canvas.innerHTML = ""; // Clear existing
  orbs = [];
  const isDark = htmlElement.classList.contains("dark");

  // Calculate number of orbs based on screen area to prevent overcrowding
  const area = window.innerWidth * window.innerHeight;
  const densityDivisor = 50000; // Increased density (lower divisor for more orbs)
  const numOrbs = Math.min(Math.max(Math.floor(area / densityDivisor), 8), 25); // Min 8, Max 25

  // Colors
  const darkColors = [
    "hsla(0, 0%, 30%, 0.15)",
    "hsla(0, 0%, 50%, 0.15)",
    "hsla(220, 15%, 40%, 0.15)",
    "hsla(220, 20%, 25%, 0.15)",
  ];
  const lightColors = [
    "hsla(0, 0%, 80%, 0.45)",
    "hsla(0, 0%, 60%, 0.45)",
    "hsla(220, 15%, 70%, 0.45)",
    "hsla(220, 15%, 85%, 0.45)",
  ];

  const colors = isDark ? darkColors : lightColors;

  for (let i = 0; i < numOrbs; i++) {
    let attempts = 0;
    let validPosition = false;
    let x, y, size;

    // Try to find a non-overlapping position
    // Increased attempts to handle higher density
    while (!validPosition && attempts < 100) {
      attempts++;
      // Random Size - slightly smaller on average to fit more
      size = Math.random() * 180 + 80; // 80px - 260px
      // Initial Position
      x = Math.random() * (window.innerWidth - size);
      y = Math.random() * (window.innerHeight - size);

      // Check collision with existing orbs
      let overlap = false;
      for (const existingOrb of orbs) {
        const r1 = size / 2;
        const r2 = existingOrb.size / 2;
        const c1x = x + r1;
        const c1y = y + r1;
        const c2x = existingOrb.x + r2;
        const c2y = existingOrb.y + r2;
        const distance = Math.sqrt((c1x - c2x) ** 2 + (c1y - c2y) ** 2);

        // Strict collision check for initial placement
        if (distance < r1 + r2) {
          overlap = true;
          break;
        }
      }
      if (!overlap) validPosition = true;
    }

    if (validPosition) {
      const orb = document.createElement("div");
      orb.style.width = `${size}px`;
      orb.style.height = `${size}px`;
      orb.style.position = "absolute";
      orb.style.borderRadius = "50%";
      orb.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      orb.style.filter = "blur(10px)";
      orb.style.willChange = "transform";
      orb.style.top = "0";
      orb.style.left = "0";

      // Velocity
      let vx = (Math.random() - 0.5) * 0.8;
      let vy = (Math.random() - 0.5) * 0.8;

      canvas.appendChild(orb);
      orbs.push({ element: orb, x, y, vx, vy, size });
    }
  }
  updateOrbs();
}

// Animation Loop with Collision Physics
function updateOrbs() {
  // 1. Move
  orbs.forEach((orb) => {
    orb.x += orb.vx;
    orb.y += orb.vy;
  });

  // 2. Collision Resolution
  for (let i = 0; i < orbs.length; i++) {
    let orb = orbs[i];
    let r1 = orb.size / 2;

    // Wall Collisions
    if (orb.x <= 0) {
      orb.x = 0;
      orb.vx *= -1;
    }
    if (orb.x >= window.innerWidth - orb.size) {
      orb.x = window.innerWidth - orb.size;
      orb.vx *= -1;
    }
    if (orb.y <= 0) {
      orb.y = 0;
      orb.vy *= -1;
    }
    if (orb.y >= window.innerHeight - orb.size) {
      orb.y = window.innerHeight - orb.size;
      orb.vy *= -1;
    }

    // Orb-Orb Collisions
    for (let j = i + 1; j < orbs.length; j++) {
      let other = orbs[j];
      let r2 = other.size / 2;

      let cx1 = orb.x + r1;
      let cy1 = orb.y + r1;
      let cx2 = other.x + r2;
      let cy2 = other.y + r2;

      let dx = cx2 - cx1;
      let dy = cy2 - cy1;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let minDistance = r1 + r2;

      if (distance < minDistance) {
        // Resolve Overlap
        let overlap = minDistance - distance;
        let nx = dx / distance;
        let ny = dy / distance;

        // Separate
        orb.x -= nx * overlap * 0.5;
        orb.y -= ny * overlap * 0.5;
        other.x += nx * overlap * 0.5;
        other.y += ny * overlap * 0.5;

        // Bounce (Simple elastic)
        // Just swap velocity components along normal for visual simplicity
        let v1n = orb.vx * nx + orb.vy * ny;
        let v2n = other.vx * nx + other.vy * ny;

        // Apply impulse
        let dv = v1n - v2n;
        orb.vx -= dv * nx;
        orb.vy -= dv * ny;
        other.vx += dv * nx;
        other.vy += dv * ny;
      }
    }
  }

  // 3. Render
  orbs.forEach((orb) => {
    orb.element.style.transform = `translate(${orb.x}px, ${orb.y}px)`;
  });

  animationFrameId = requestAnimationFrame(updateOrbs);
}

// Initialize
initOrbs();

// Handle Resize
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(initOrbs, 200);
});
