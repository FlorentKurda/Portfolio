const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const backToTop = document.querySelector("[data-back-to-top]");
const year = document.querySelector("[data-year]");
const projectsGrid = document.querySelector("[data-projects-grid]");
const revealItems = document.querySelectorAll(".reveal");
let revealObserver;

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }
  });
}

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const updateChrome = () => {
  const hasScrolled = window.scrollY > 24;
  header?.classList.toggle("is-scrolled", hasScrolled);
  backToTop?.classList.toggle("is-visible", window.scrollY > 520);
};

window.addEventListener("scroll", updateChrome, { passive: true });
updateChrome();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const showOrObserveReveal = (element) => {
  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    element.classList.add("is-visible");
  }
};

const addText = (parent, tagName, text, className) => {
  if (!text) return null;
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
};

const createProjectLink = (href, label, className = "link-button") => {
  if (!href) return null;
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.textContent = label;
  link.target = "_blank";
  link.rel = "noreferrer";
  return link;
};

const createProjectCard = (project) => {
  const title = project.title?.trim() || "Projet sans titre";
  const article = document.createElement("article");
  article.className = "project-card reveal";

  if (project.image) {
    const imageLink = document.createElement("a");
    imageLink.className = "project-image";
    imageLink.href = project.demoUrl || project.image;
    imageLink.target = "_blank";
    imageLink.rel = "noreferrer";
    imageLink.setAttribute("aria-label", `Voir l'aperçu ${title}`);

    const image = document.createElement("img");
    image.src = project.image;
    image.alt = `Aperçu du projet ${title}`;
    image.loading = "lazy";
    imageLink.append(image);
    article.append(imageLink);
  }

  const content = document.createElement("div");
  content.className = "project-content";
  addText(content, "h3", title);
  addText(content, "p", project.description);

  const tags = [project.category, ...(Array.isArray(project.tags) ? project.tags : [])].filter(Boolean);
  if (tags.length > 0) {
    const tagList = document.createElement("div");
    tagList.className = "tag-list";
    tagList.setAttribute("aria-label", "Catégorie et technologies utilisées");
    tags.forEach((tag) => addText(tagList, "span", tag));
    content.append(tagList);
  }

  const actions = document.createElement("div");
  actions.className = "project-actions";
  const demoLink = createProjectLink(project.demoUrl, "Voir le site");
  const codeLink = createProjectLink(project.codeUrl, "Voir le code", "link-button ghost");
  if (demoLink) actions.append(demoLink);
  if (codeLink) actions.append(codeLink);
  if (actions.children.length > 0) content.append(actions);

  article.append(content);
  return article;
};

const renderProjectMessage = (title, message) => {
  if (!projectsGrid) return;
  const article = document.createElement("article");
  article.className = "project-card reveal";
  const content = document.createElement("div");
  content.className = "project-content";
  addText(content, "h3", title);
  addText(content, "p", message);
  article.append(content);
  projectsGrid.replaceChildren(article);
  showOrObserveReveal(article);
};

const loadProjects = async () => {
  if (!projectsGrid) return;

  try {
    const response = await fetch("assets/data/projects.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("projects-json-unavailable");

    const data = await response.json();
    const projects = Array.isArray(data) ? data : data.projects;
    if (!Array.isArray(projects) || projects.length === 0) {
      renderProjectMessage("Aucun projet pour le moment", "Ajoutez un projet dans assets/data/projects.json.");
      return;
    }

    const cards = projects.map(createProjectCard);
    projectsGrid.replaceChildren(...cards);
    cards.forEach(showOrObserveReveal);
  } catch {
    renderProjectMessage(
      "Projets indisponibles",
      "Impossible de charger assets/data/projects.json pour le moment.",
    );
  }
};

if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );

  revealItems.forEach(showOrObserveReveal);
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

loadProjects();
