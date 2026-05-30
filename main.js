// Tilt script: smooth RAF-driven 3D tilt for .glass-card-hover
(function () {
  const maxTilt = 10; // degrees
  const scale = 1.02;

  function initTilt() {
    const cards = document.querySelectorAll(".glass-card-hover");
    if (!cards.length) return;

    cards.forEach((card) => {
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

      card.addEventListener("pointerenter", (e) => {
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
})();

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

// Console Easter Egg
console.log(
  "%c Hello Developer! 👋 \n%c If you're reading this, we should probably work together.",
  "color: #fff; background: #000; padding: 10px; font-size: 20px; border-radius: 5px;",
  "color: #aaa; font-size: 14px; padding: 5px;",
);

// Typewriter Effect
const roles = [
  "Full Stack Engineer",
  "Laravel Architect",
  "System Designer",
  "Optimizer",
];
const typewriterElement = document.getElementById("typewriter-text");
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

// Start typing
typeWriter();

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

  function updateActiveLink() {
    let currentSection = null;
    const viewportMiddle = window.innerHeight / 2;

    // Find which section is closest to the viewport middle
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionMiddle = rect.top + rect.height / 2;
      const distanceFromViewportMiddle = Math.abs(sectionMiddle - viewportMiddle);

      if (currentSection === null || distanceFromViewportMiddle < currentSection.distance) {
        currentSection = { section, distance: distanceFromViewportMiddle };
      }
    });

    // Update active state
    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");

      if (currentSection && href === `#${currentSection.section.id}`) {
        link.classList.add("active");
        link.style.color = "currentColor";
        link.style.fontWeight = "500";

        // Add underline effect
        const underline = link.querySelector("span");
        if (underline) {
          underline.style.width = "100%";
        }
      } else {
        link.style.fontWeight = "400";
        const underline = link.querySelector("span");
        if (underline) {
          underline.style.width = "0";
        }
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
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
