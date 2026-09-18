const MOBILE_QUERY = "(max-width: 900px)";

export function initNav() {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("navMenu");
  if (!nav || !burger || !menu) return;

  const media = window.matchMedia(MOBILE_QUERY);
  const focusables = () => Array.from(menu.querySelectorAll("a[href]:not([hidden])"));
  const isOpen = () => nav.classList.contains("menu-open");

  const setOpen = (open, restoreFocus = false) => {
    nav.classList.toggle("menu-open", open);
    document.documentElement.classList.toggle("nav-lock", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    if (media.matches) menu.setAttribute("aria-hidden", String(!open));
    else menu.removeAttribute("aria-hidden");
    if (open) focusables()[0]?.focus();
    if (!open && restoreFocus) burger.focus();
  };

  burger.addEventListener("click", () => setOpen(!isOpen(), isOpen()));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a") && media.matches) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      setOpen(false, true);
      return;
    }
    if (event.key !== "Tab") return;
    const items = [...focusables(), burger];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  media.addEventListener("change", () => setOpen(false));
  setOpen(false);

  const links = Array.from(menu.querySelectorAll('.nav__link[href^="#"]'));
  const targets = new Map();
  links.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) targets.set(target, link);
  });
  if (!("IntersectionObserver" in window)) return;
  const spy = new IntersectionObserver((entries) => {
    const visible = entries.find((entry) => entry.isIntersecting);
    if (!visible) return;
    links.forEach((link) => link.classList.remove("is-current"));
    targets.get(visible.target)?.classList.add("is-current");
  }, { rootMargin: "-30% 0px -60% 0px" });
  targets.forEach((_, target) => spy.observe(target));
}
