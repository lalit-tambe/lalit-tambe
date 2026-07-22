// main.js - Minimal Typography Theme

async function loadContent() {
    let data;
    try {
        const res = await fetch("./data/content.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (err) {
        console.error("Failed to load content.json", err);
        return;
    }

    // Current Year for Footer
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    // Hero
    const heroSubEl = document.getElementById("hero-sub");
    if (heroSubEl && data.hero?.subheading) {
        heroSubEl.innerHTML = data.hero.subheading;
    }

    // Hero Pills
    const heroPillsEl = document.getElementById("hero-pills");
    if (heroPillsEl && data.hero?.pills) {
        heroPillsEl.innerHTML = data.hero.pills.map(pill => `
            <span class="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 rounded">${pill}</span>
        `).join("");
    }

    // Typewriter
    const typewriterTextEl = document.getElementById("typewriter-text");
    if (typewriterTextEl && data.typewriter?.words) {
        const words = data.typewriter.words;
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typewriterTextEl.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterTextEl.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }
        
        type();
    }

    // Hero Links (Contact)
    const heroLinksEl = document.getElementById("hero-links");
    const footerContactEl = document.getElementById("footer-contact");
    if (data.contact) {
        const linksHtml = `
            <a href="#contact" class="text-black dark:text-white border-b border-black dark:border-white pb-0.5 hover:opacity-70 transition-opacity">Contact</a>
            <a href="https://www.linkedin.com/in/lalittambe/" target="_blank" class="text-black dark:text-white border-b border-black dark:border-white pb-0.5 hover:opacity-70 transition-opacity">LinkedIn <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-1"></i></a>
            <a href="https://github.com/lalit-tambe" target="_blank" class="text-black dark:text-white border-b border-black dark:border-white pb-0.5 hover:opacity-70 transition-opacity">GitHub <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-1"></i></a>
            <a href="https://stackknight.hashnode.dev/" target="_blank" class="text-black dark:text-white border-b border-black dark:border-white pb-0.5 hover:opacity-70 transition-opacity">Blog <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-1"></i></a>
        `;
        if (heroLinksEl) heroLinksEl.innerHTML = linksHtml;
        if (footerContactEl) footerContactEl.innerHTML = `
             <a href="mailto:${data.contact.email}" class="hover:text-black dark:hover:text-white transition-colors">Email</a>
             <a href="https://github.com/lalit-tambe" target="_blank" class="hover:text-black dark:hover:text-white transition-colors">GitHub</a>
             <a href="https://www.linkedin.com/in/lalittambe/" target="_blank" class="hover:text-black dark:hover:text-white transition-colors">LinkedIn</a>
        `;
    }

    // About
    const aboutContentEl = document.getElementById("about-content");
    if (aboutContentEl && Array.isArray(data.about?.paragraphs)) {
        aboutContentEl.innerHTML = data.about.paragraphs.map(p => `<p>${p}</p>`).join("");
    }

    // Skills (Arsenal)
    const skillsContentEl = document.getElementById("skills-content");
    if (skillsContentEl && data.skills) {
        skillsContentEl.className = ""; // Remove default spacing classes
        skillsContentEl.innerHTML = `
            <div class="rounded-xl border border-neutral-800 bg-[#0d1117] overflow-hidden shadow-xl font-mono text-sm md:text-[14px]">
                <!-- Terminal Header -->
                <div class="flex items-center px-4 py-3 border-b border-neutral-800 bg-[#161b22]">
                    <div class="flex gap-2 group">
                        <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div class="ml-4 text-xs font-mono text-neutral-500 font-medium select-none flex-1 text-center pr-10">
                        bash - skills
                    </div>
                </div>
                <!-- Authentic yet readable Terminal Body (Neofetch Style) -->
                <div class="p-5 md:p-6 space-y-4">
                    <div class="flex items-center flex-wrap gap-2">
                        <span class="text-emerald-400 font-bold">lalit@tambe</span><span class="text-neutral-500">:</span><span class="text-blue-400 font-bold">~/portfolio</span><span class="text-neutral-500">$</span>
                        <span class="text-neutral-200">skills --fetch</span>
                    </div>
                    
                    <div class="pt-2 pl-2 md:pl-4">
                        <div class="text-emerald-400 font-bold mb-1">lalit<span class="text-neutral-500">@</span>tambe</div>
                        <div class="text-neutral-600 mb-4 tracking-widest">---------------</div>
                        
                        <div class="space-y-3">
                            ${Object.entries(data.skills).map(([category, items]) => `
                                <div class="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                                    <span class="text-[#58a6ff] font-bold min-w-[120px]">${category}</span>
                                    <span class="text-neutral-300 leading-relaxed flex-1">
                                        ${items.join("<span class='text-neutral-600 mx-1.5'>•</span>")}
                                    </span>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                    
                    <div class="flex items-center pt-4">
                        <span class="text-emerald-400 font-bold">lalit@tambe</span><span class="text-neutral-500">:</span><span class="text-blue-400 font-bold">~/portfolio</span><span class="text-neutral-500">$</span>
                        <span class="ml-2 animate-[pulse_1s_step-end_infinite] w-2 h-4 bg-neutral-200 inline-block"></span>
                    </div>
                </div>
            </div>
        `;
    }

    // Competencies
    const compContentEl = document.getElementById("competencies-content");
    if (compContentEl && data.competencies?.categories) {
        compContentEl.innerHTML = data.competencies.categories.map(cat => `
            <div>
                <h3 class="font-bold text-black dark:text-white mb-3 flex items-center"><i class="${cat.icon} mr-3 text-neutral-400"></i>${cat.title}</h3>
                <ul class="list-disc list-inside space-y-1.5 ml-1">
                    ${cat.items.map(item => `<li>${item}</li>`).join("")}
                </ul>
            </div>
        `).join("");
    }

    // Experience
    const expContentEl = document.getElementById("experience-content");
    if (expContentEl && Array.isArray(data.experience?.jobs)) {
        expContentEl.innerHTML = data.experience.jobs.map(job => `
            <div class="border-l border-neutral-300 dark:border-neutral-700 pl-6 md:pl-8 relative">
                <div class="absolute w-2 h-2 bg-black dark:bg-white rounded-full -left-[4.5px] top-1.5"></div>
                <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 gap-2">
                    <div>
                        <h3 class="text-base font-bold text-black dark:text-white">${job.title}</h3>
                        <p class="font-medium text-neutral-800 dark:text-neutral-300 mt-1">${job.company}</p>
                    </div>
                    <span class="text-xs text-neutral-500 uppercase tracking-widest">${job.period}</span>
                </div>
                <p class="mb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">${job.summary}</p>
                <ul class="list-disc list-inside space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    ${job.bullets.map(b => {
                        // Bold the first part before the colon for readability
                        const parts = b.split(':');
                        if (parts.length > 1) {
                            return `<li><span class="text-black dark:text-white font-medium">${parts[0]}</span>:${parts.slice(1).join(':')}</li>`;
                        }
                        return `<li>${b}</li>`;
                    }).join("")}
                </ul>
            </div>
        `).join("");
    }

    // Projects
    const projectsContentEl = document.getElementById("projects-content");
    if (projectsContentEl && Array.isArray(data.projects)) {
        projectsContentEl.innerHTML = data.projects.map(proj => `
            <div class="group">
                <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 gap-2">
                    <h3 class="text-base font-bold text-black dark:text-white flex items-center gap-3">
                        <i class="${proj.icon} text-neutral-400"></i> ${proj.title}
                    </h3>
                    <div class="flex gap-4">
                        ${proj.links?.github ? `<a href="${proj.links.github}" target="_blank" class="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">Source <i class="fa-brands fa-github ml-1"></i></a>` : ''}
                        ${proj.links?.npm ? `<a href="${proj.links.npm}" target="_blank" class="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">NPM <i class="fa-brands fa-npm ml-1"></i></a>` : ''}
                    </div>
                </div>
                <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 mb-5">${proj.description}</p>
                <div class="flex flex-wrap gap-3">
                    ${proj.tags.map(tag => `<span class="px-2 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-xs font-medium text-neutral-500">${tag}</span>`).join("")}
                </div>
            </div>
        `).join("");
    }

    // Writing
    const writingContentEl = document.getElementById("writing-content");
    if (writingContentEl && Array.isArray(data.writing)) {
        writingContentEl.innerHTML = data.writing.map(article => `
            <div class="group border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col hover:border-black dark:hover:border-white transition-colors">
                <h3 class="text-base font-bold text-black dark:text-white mb-2 leading-snug">
                    <a href="${article.link}" target="_blank" class="hover:underline">${article.title}</a>
                </h3>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-6 flex-grow line-clamp-3 leading-relaxed">${article.excerpt}</p>
                <a href="${article.link}" target="_blank" class="text-sm font-medium text-black dark:text-white group-hover:underline w-fit">Read Article <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-1"></i></a>
            </div>
        `).join("");
    }

    // Contact Form AJAX Handler
    const contactForm = document.getElementById("contact-form");
    const contactSuccess = document.getElementById("contact-success");
    const contactSubmitBtn = document.getElementById("contact-submit");

    if (contactForm && contactSuccess && contactSubmitBtn) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            const originalBtnContent = contactSubmitBtn.innerHTML;
            contactSubmitBtn.innerHTML = `Sending...`;
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.classList.add("opacity-50", "cursor-not-allowed");

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    contactForm.reset();
                    contactSuccess.classList.remove("hidden");
                    contactSuccess.classList.add("flex");
                    setTimeout(() => {
                        contactSuccess.classList.remove("opacity-0");
                        contactSuccess.classList.add("opacity-100");
                    }, 10);
                } else {
                    alert("Oops! There was a problem submitting your form.");
                }
            } catch (error) {
                alert("Oops! There was a problem submitting your form.");
            } finally {
                contactSubmitBtn.innerHTML = originalBtnContent;
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.classList.remove("opacity-50", "cursor-not-allowed");
            }
        });
    }
}

// Theme Toggle Logic
function setupThemeToggle() {
    const themeToggleBtns = document.querySelectorAll(".theme-toggle");
    const htmlElement = document.documentElement;

    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
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
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    setupThemeToggle();
});
