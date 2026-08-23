(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotion.matches) return;

  const reveal = (element) => element.classList.add("is-revealed");

  document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => document.body.classList.add("motion-loaded"));

    document.querySelectorAll("[data-stagger]").forEach((group) => {
      const interval = Number(group.dataset.stagger) || 0;
      Array.from(group.children).forEach((item, index) => {
        item.style.setProperty("--motion-delay", `${index * interval}ms`);
      });
    });

    const observeReveal = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.dataset.reveal === "process") {
          runProcessProgress(entry.target);
        } else {
          reveal(entry.target);
        }
        observer.unobserve(entry.target);
      });
    };

    const revealObserver = new IntersectionObserver(observeReveal, { threshold: 0.16, rootMargin: "0px 0px -8%" });
    const processObserver = new IntersectionObserver(observeReveal, { threshold: 0.28, rootMargin: "0px 0px -4%" });

    document.querySelectorAll("[data-reveal]").forEach((element) => {
      (element.dataset.reveal === "process" ? processObserver : revealObserver).observe(element);
    });

    const metrics = document.querySelector(".metrics-grid");
    if (metrics) {
      const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll("[data-count]").forEach(runCountUp);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      countObserver.observe(metrics);
    }

    const header = document.querySelector("[data-motion-header]");
    if (header) {
      let scheduled = false;
      let lastScrollY = window.scrollY;
      const updateHeader = () => {
        const currentScrollY = window.scrollY;
        header.classList.toggle("is-scrolled", currentScrollY > 12);

        if (currentScrollY <= 12) {
          header.classList.remove("is-header-hidden");
        } else if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight + 12) {
          header.classList.add("is-header-hidden");
        } else if (currentScrollY < lastScrollY) {
          header.classList.remove("is-header-hidden");
        }

        lastScrollY = currentScrollY;
        scheduled = false;
      };
      updateHeader();
      window.addEventListener("scroll", () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(updateHeader);
      }, { passive: true });
    }
  }, { once: true });

  function runCountUp(element) {
    const target = Number(element.dataset.count);
    const prefix = element.dataset.countPrefix || "";
    const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
    if (!Number.isFinite(target) || !textNode) return;

    const duration = 950;
    const start = performance.now();
    const render = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      textNode.nodeValue = `${prefix}${Math.round(target * eased)} `;
      if (progress < 1) requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  function runProcessProgress(element) {
    reveal(element);
    const nodes = Array.from(element.querySelectorAll("li"));
    const duration = 2400;

    nodes.forEach((node, index) => {
      const progressPoint = nodes.length > 1 ? index / (nodes.length - 1) : 0;
      window.setTimeout(() => node.classList.add("is-active"), Math.round(progressPoint * duration));
    });
  }
})();
