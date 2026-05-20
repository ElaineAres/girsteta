const header = document.querySelector("[data-header]");
const modal = document.querySelector("[data-call-modal]");
const modalPanel = modal?.querySelector(".call-modal__panel");
const openCallButtons = document.querySelectorAll("[data-call-open]");
const closeCallButtons = document.querySelectorAll("[data-call-close]");
const cursor = document.querySelector(".cursor-house");
let lastFocusedElement = null;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 26);
}

function getFocusableElements() {
  if (!modalPanel) return [];
  return Array.from(modalPanel.querySelectorAll(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled") && element.offsetParent !== null,
  );
}

function openCallModal(event) {
  event?.preventDefault();
  if (!modal) return;

  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");

  const primaryAction = modal.querySelector(".call-modal__button");
  window.requestAnimationFrame(() => primaryAction?.focus());
}

function closeCallModal() {
  if (!modal || modal.hidden) return;

  modal.hidden = true;
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function keepFocusInsideModal(event) {
  if (modal?.hidden || event.key !== "Tab") return;

  const focusableElements = getFocusableElements();
  if (!focusableElements.length) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function initRevealAnimation() {
  const revealElements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initCustomCursor() {
  if (!cursor || !window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches) {
    return;
  }

  let cursorX = -40;
  let cursorY = -40;
  let targetX = -40;
  let targetY = -40;

  document.body.classList.add("cursor-enabled");

  function renderCursor() {
    cursorX += (targetX - cursorX) * 0.22;
    cursorY += (targetY - cursorY) * 0.22;
    cursor.style.transform = `translate3d(${cursorX - 12}px, ${cursorY - 12}px, 0)`;
    window.requestAnimationFrame(renderCursor);
  }

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursor.classList.add("is-visible");
  });

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button")) {
      cursor.classList.add("is-active");
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button")) {
      cursor.classList.remove("is-active");
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
  });

  renderCursor();
}

setHeaderState();
initRevealAnimation();
initCustomCursor();

window.addEventListener("scroll", setHeaderState, { passive: true });

openCallButtons.forEach((button) => {
  button.addEventListener("click", openCallModal);
});

closeCallButtons.forEach((button) => {
  button.addEventListener("click", closeCallModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCallModal();
  }

  keepFocusInsideModal(event);
});
