/**
 * Shayan Khan Portfolio — lean interactions
 * Subtle reveals · GitHub feed · contact form
 */

(() => {
  "use strict";

  const GH_USER = "ShynCode";
  const PINNED_REPOS = [
    "Final-year-project",
    "CodeAlpha_Chatbot-for-FAQs1",
    "CodeAlpha_LanguageTranslationTool",
  ];
  const DEMO_BY_REPO = {
    "CodeAlpha_Chatbot-for-FAQs1": "https://shyncode.github.io/CodeAlpha_Chatbot-for-FAQs1/",
    "CodeAlpha_LanguageTranslationTool": "https://shyncode.github.io/CodeAlpha_LanguageTranslationTool/",
  };
  const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/shayansk425@gmail.com";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const debounce = (fn, wait = 120) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  function showToast(message, type = "success") {
    const host = document.getElementById("toast-host");
    if (!host) return;
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.setAttribute("role", "status");
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  fetch("assets/resume/resume.pdf", { method: "HEAD" })
    .then((res) => {
      if (!res.ok) console.warn("[portfolio] Resume PDF missing at assets/resume/resume.pdf");
    })
    .catch(() => console.warn("[portfolio] Could not verify resume PDF."));

  /* Scroll progress + sticky nav border + active section */
  const progressBar = document.querySelector(".scroll-progress");
  const nav = document.getElementById("nav");
  const sectionIds = ["about", "experience", "projects", "skills", "ai", "github", "education", "certifications", "contact"];

  function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${pct}%`;
      progressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
    }
    if (nav) nav.classList.toggle("is-scrolled", scrollTop > 8);

    let active = null;
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.35) active = id;
    }
    document.querySelectorAll(".nav__link").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === active);
    });
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  /* Mobile menu */
  const toggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function setMenuOpen(open) {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenuOpen(false));
    });
  }

  /* Subtle reveal */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* GitHub */
  const feed = document.getElementById("github-feed");
  const cacheKey = `gh-cache-${GH_USER}-v4`;
  const cacheTTL = 60 * 60 * 1000;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  }

  function sortRepos(repos) {
    const pinned = new Set(PINNED_REPOS.map((n) => n.toLowerCase()));
    return [...repos].sort((a, b) => {
      const ap = pinned.has(a.name.toLowerCase()) ? 0 : 1;
      const bp = pinned.has(b.name.toLowerCase()) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
  }

  function renderRepos(repos) {
    if (!feed) return;
    if (!repos.length) {
      feed.innerHTML = `<p class="gh-empty">No public repositories found.</p>`;
      return;
    }

    feed.innerHTML = repos
      .slice(0, 9)
      .map((repo) => {
        const homepage = (repo.homepage || "").trim();
        const mapped = DEMO_BY_REPO[repo.name];
        let demoUrl = homepage || mapped || "";
        if (demoUrl && /github\.com/i.test(demoUrl) && !/githubusercontent\.com/i.test(demoUrl)) {
          demoUrl = mapped || "";
        }
        const demo = demoUrl
          ? `<a href="${escapeAttr(demoUrl)}" class="btn btn--sm btn--primary" target="_blank" rel="noopener noreferrer">Live Demo</a>`
          : "";
        const lang = repo.language ? `<span>${escapeHtml(repo.language)}</span>` : "";
        return `
          <article class="repo-card">
            <h3>${escapeHtml(repo.name)}</h3>
            <p>${escapeHtml(repo.description || "No description provided.")}</p>
            <div class="repo-meta">
              ${lang}
              <span>★ ${repo.stargazers_count ?? 0}</span>
              <span>Updated ${formatDate(repo.updated_at)}</span>
            </div>
            <div class="repo-actions">
              ${demo}
              <a href="${escapeAttr(repo.html_url)}" class="btn btn--sm btn--secondary" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function applyGitHubData(user, repos) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("gh-repos", String(user.public_repos ?? "—"));
    set("gh-followers", String(user.followers ?? "—"));
    set("gh-following", String(user.following ?? "—"));
    set(
      "gh-joined",
      user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })
        : "—"
    );
    renderRepos(repos);
  }

  async function loadGitHub() {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < cacheTTL) {
          applyGitHubData(parsed.user, parsed.repos);
          return;
        }
      }

      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GH_USER}`),
        fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`),
      ]);

      if (!userRes.ok || !reposRes.ok) throw new Error("api-error");

      const user = await userRes.json();
      const repos = sortRepos((await reposRes.json()).filter((r) => !r.fork));

      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), user, repos }));
      } catch (_) {}

      applyGitHubData(user, repos);
    } catch (err) {
      console.warn("[portfolio] GitHub fetch failed:", err);
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          applyGitHubData(parsed.user, parsed.repos);
          return;
        }
      } catch (_) {}
      if (feed) {
        feed.innerHTML = `<p class="gh-empty">Couldn't load GitHub data. Visit <a href="https://github.com/${GH_USER}" target="_blank" rel="noopener noreferrer">github.com/${GH_USER}</a>.</p>`;
      }
    }
  }

  loadGitHub();

  /* Contact form */
  const form = document.getElementById("contact-form");

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setFieldError(id, message) {
    const field = document.getElementById(id)?.closest(".form-field");
    const err = document.getElementById(`${id}-error`);
    if (field) field.classList.toggle("has-error", Boolean(message));
    if (err) err.textContent = message || "";
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      let valid = true;
      if (!name) {
        setFieldError("name", "Name is required.");
        valid = false;
      } else setFieldError("name", "");

      if (!email) {
        setFieldError("email", "Email is required.");
        valid = false;
      } else if (!validateEmail(email)) {
        setFieldError("email", "Enter a valid email address.");
        valid = false;
      } else setFieldError("email", "");

      if (!message) {
        setFieldError("message", "Message is required.");
        valid = false;
      } else setFieldError("message", "");

      if (!valid) {
        showToast("Please fix the highlighted fields.", "error");
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            message,
            _subject: `Portfolio inquiry from ${name}`,
            _template: "table",
            _captcha: "false",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === "false") throw new Error("send-failed");
        form.reset();
        showToast("Message sent — thank you.", "success");
      } catch (err) {
        console.error(err);
        showToast("Couldn't send. Please email shayansk425@gmail.com.", "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    ["name", "email", "message"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.addEventListener("input", debounce(() => setFieldError(id, ""), 150));
    });
  }
})();
