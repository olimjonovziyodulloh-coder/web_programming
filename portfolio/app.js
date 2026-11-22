/* React islands for the portfolio.
 *
 * The page stays a static HTML site: React 18 (UMD) mounts into three places
 * and takes over only the interactive parts. No build step is required, so the
 * site keeps deploying to GitHub Pages exactly as before.
 *
 *   #projects-root      searchable, filterable project grid + detail dialog
 *   #theme-toggle-root  light/dark switch backed by localStorage
 *
 * Hooks used: useState, useMemo, useEffect, useRef, useCallback, and a portal.
 */

(function () {
  "use strict";

  if (!window.React || !window.ReactDOM) {
    return;
  }

  var h = React.createElement;
  var Fragment = React.Fragment;
  var useState = React.useState;
  var useMemo = React.useMemo;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var useCallback = React.useCallback;

  /* ------------------------------------------------------------------ data */

  var projects = [
    {
      id: "mebel",
      title: "MEBEL",
      status: "Live",
      visual: "gold",
      label: "Group project · React storefront",
      summary:
        "A calm furniture storefront: catalogue, product details, wishlist, cart with currency switching, weather-based picks, a room planner and a style quiz.",
      detail:
        "Group project with Sultonov Behruz and Abdukholikov Muhammadsodik. React 18 with no build step (Babel Standalone in the browser), Tailwind from a CDN, localStorage for cart, wishlist and theme. My part was the catalogue, cart and checkout flow.",
      tech: ["React", "Tailwind CSS", "localStorage", "GitHub Pages"],
      links: [
        {
          label: "Project page",
          href: "https://olimjonovziyodulloh-coder.github.io/web_programming/group-project/"
        },
        {
          label: "Open the store",
          href: "https://olimjonovziyodulloh-coder.github.io/web_programming/group-project/mebel.html"
        },
        {
          label: "Source",
          href: "https://github.com/olimjonovziyodulloh-coder/web_programming/tree/main/group-project"
        }
      ]
    },
    {
      id: "book-search",
      title: "Book Search",
      status: "Live",
      visual: "",
      label: "Book Search App · JavaScript",
      summary:
        "My first API project. Search Open Library by title or author, with loading, empty and error states and lazy-loaded covers.",
      detail:
        "Calls the Open Library search endpoint and renders covers, authors and publish years. The useful lesson was handling the three unhappy paths: a slow request, an empty result and a failed network call each get their own message instead of a blank screen.",
      tech: ["JavaScript", "Fetch API", "Open Library"],
      links: [
        {
          label: "Open the app",
          href: "https://olimjonovziyodulloh-coder.github.io/webpro-book-search/"
        },
        {
          label: "Source",
          href: "https://github.com/olimjonovziyodulloh-coder/webpro-book-search"
        }
      ]
    },
    {
      id: "student-directory",
      title: "Student Directory",
      status: "React",
      visual: "blue",
      label: "Task 11-A · Components & props",
      summary:
        "One StudentProfileCard component, five props, three students. Adding a student is one more object in the array.",
      detail:
        "Week 11 task. The point was to stop copy-pasting markup and let the data drive the UI. Built with Vite and deployed to GitHub Pages.",
      tech: ["React", "Props", "Vite"],
      links: [
        {
          label: "Live demo",
          href: "https://olimjonovziyodulloh-coder.github.io/task11/"
        },
        {
          label: "Source",
          href: "https://github.com/olimjonovziyodulloh-coder/task11"
        }
      ]
    },
    {
      id: "portfolio-gallery",
      title: "Portfolio Gallery",
      status: "React",
      visual: "gold",
      label: "Week 11 homework · Hooks",
      summary:
        "Six real repositories in a searchable gallery with technology filters, a detail dialog and a remembered filter.",
      detail:
        "Built as the Week 11 homework, then extended: useState for the filter, the search text and the selected project, useMemo for the visible list, useEffect to save the filter in localStorage, and useRef to focus the dialog close button.",
      tech: ["React", "Hooks", "localStorage"],
      links: [
        {
          label: "Live demo",
          href: "https://olimjonovziyodulloh-coder.github.io/portfolio-gallery/"
        },
        {
          label: "Source",
          href: "https://github.com/olimjonovziyodulloh-coder/portfolio-gallery"
        }
      ]
    },
    {
      id: "react-lab",
      title: "React Lab",
      status: "React",
      visual: "",
      label: "Week 11 class exercises · 8 components",
      summary:
        "The eight Week 11 class exercises, each one a small component in its own file.",
      detail:
        "Greeting, StudentCard, ProfileCard, NotificationList, Card, ProductCard, StudentList and ConditionalDemo on one page — props, children, lists with keys and conditional rendering, plus useState for the login toggle.",
      tech: ["React", "Hooks", "Components"],
      links: [
        {
          label: "Live demo",
          href: "https://olimjonovziyodulloh-coder.github.io/react-lab/"
        },
        {
          label: "Source",
          href: "https://github.com/olimjonovziyodulloh-coder/react-lab"
        }
      ]
    },
    {
      id: "archive",
      title: "Web Programming Archive",
      status: "Live",
      visual: "blue",
      label: "Course archive · GitHub Pages",
      summary:
        "Every weekly exercise, report and project from the course, on one static site with a consistent theme.",
      detail:
        "I add to it each week: themed task pages, the accessibility and performance audits, and links to every deployed project. Plain HTML, CSS and small amounts of JavaScript.",
      tech: ["HTML", "CSS", "GitHub Pages"],
      links: [
        {
          label: "Browse the archive",
          href: "https://olimjonovziyodulloh-coder.github.io/web_programming/"
        }
      ]
    },
    {
      id: "accessibility",
      title: "Accessibility Audit",
      status: "Report",
      visual: "gold",
      label: "Accessibility Audit · Report",
      summary:
        "A before-and-after audit that fixed landmarks, heading order, contrast, focus styles and form labels.",
      detail:
        "Started from a deliberately broken page, listed every WCAG failure with Lighthouse and manual keyboard testing, then fixed them and re-measured until Accessibility, Best Practices and SEO reached 100.",
      tech: ["WCAG", "ARIA", "Lighthouse"],
      links: [
        {
          label: "Read the report",
          href: "https://olimjonovziyodulloh-coder.github.io/web_programming/week9/accessibility-task.html"
        }
      ]
    },
    {
      id: "performance",
      title: "Performance Optimization",
      status: "Report",
      visual: "",
      label: "Performance · Lighthouse",
      summary:
        "Measured a page with Lighthouse, then cut image weight, deferred scripts and removed render-blocking resources.",
      detail:
        "Compared the original and optimized builds with Lighthouse, WebPageTest and DevTools network throttling, and documented what each change did to LCP, CLS and total bytes.",
      tech: ["Lighthouse", "Web Vitals", "Images"],
      links: [
        {
          label: "Read the report",
          href: "https://olimjonovziyodulloh-coder.github.io/web_programming/week9.2/performance-task.html"
        }
      ]
    }
  ];

  /* ----------------------------------------------------------- project card */

  function ProjectCard(props) {
    var project = props.project;

    return h(
      "article",
      { className: "project" },
      h(
        "div",
        { className: "project-visual " + project.visual },
        h("span", { className: "visual-mark", "aria-hidden": "true" }, props.index),
        h("span", { className: "visual-label" }, project.label)
      ),
      h(
        "div",
        { className: "project-body" },
        h(
          "div",
          { className: "project-top" },
          h("h3", null, project.title),
          h("span", { className: "status" }, project.status)
        ),
        h("p", null, project.summary),
        h(
          "div",
          { className: "tags" },
          project.tech.map(function (item) {
            return h("span", { key: item }, item);
          })
        ),
        h(
          "div",
          { className: "project-actions" },
          h(
            "a",
            {
              className: "project-link",
              href: project.links[0].href,
              target: "_blank",
              rel: "noopener noreferrer"
            },
            project.links[0].label,
            " \u2197"
          ),
          h(
            "button",
            {
              type: "button",
              className: "details-btn",
              "aria-label": "Details for " + project.title,
              onClick: function (event) {
                props.onOpen(project, event.currentTarget);
              }
            },
            "Details"
          )
        )
      )
    );
  }

  /* --------------------------------------------------------------- toolbar */

  function Toolbar(props) {
    return h(
      "div",
      { className: "projects-toolbar" },
      h(
        "div",
        { className: "search-field" },
        h(
          "label",
          { className: "search-label", htmlFor: "project-search" },
          "Search projects"
        ),
        h("input", {
          id: "project-search",
          type: "search",
          className: "search-input",
          placeholder: "Title, description or technology",
          value: props.query,
          onChange: function (event) {
            props.onQuery(event.target.value);
          }
        })
      ),
      h(
        "div",
        {
          className: "filter-chips",
          role: "group",
          "aria-label": "Filter projects by technology"
        },
        props.techs.map(function (tech) {
          return h(
            "button",
            {
              key: tech,
              type: "button",
              className: "chip",
              "aria-pressed": props.active === tech,
              onClick: function () {
                props.onActive(tech);
              }
            },
            tech
          );
        })
      ),
      h(
        "button",
        {
          type: "button",
          className: "surprise-btn",
          onClick: props.onSurprise
        },
        "Surprise me ↗"
      ),
      h(
        "p",
        { className: "result-count", role: "status", "aria-live": "polite" },
        props.count + (props.count === 1 ? " project" : " projects") + " shown"
      )
    );
  }

  /* ----------------------------------------------------------------- dialog */

  function ProjectDialog(props) {
    var closeRef = useRef(null);
    var project = props.project;

    useEffect(
      function () {
        if (!project) {
          return undefined;
        }

        var previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        if (closeRef.current) {
          closeRef.current.focus();
        }

        function onKeyDown(event) {
          if (event.key === "Escape") {
            props.onClose();
          }
        }

        document.addEventListener("keydown", onKeyDown);

        return function () {
          document.removeEventListener("keydown", onKeyDown);
          document.body.style.overflow = previous;
        };
      },
      [project, props.onClose]
    );

    if (!project) {
      return null;
    }

    return ReactDOM.createPortal(
      h(
        "div",
        {
          className: "dialog-backdrop",
          onClick: function (event) {
            if (event.target === event.currentTarget) {
              props.onClose();
            }
          }
        },
        h(
          "div",
          {
            className: "dialog",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "dialog-title"
          },
          h(
            "div",
            { className: "dialog-head" },
            h("h3", { id: "dialog-title" }, project.title),
            h(
              "button",
              {
                type: "button",
                className: "dialog-close",
                ref: closeRef,
                "aria-label": "Close project details",
                onClick: props.onClose
              },
              "\u00D7"
            )
          ),
          h("p", { className: "dialog-meta" }, project.status + " \u00B7 " + project.label),
          h("p", { className: "dialog-text" }, project.detail),
          h(
            "div",
            { className: "tags" },
            project.tech.map(function (item) {
              return h("span", { key: item }, item);
            })
          ),
          h(
            "div",
            { className: "dialog-links" },
            project.links.map(function (link) {
              return h(
                "a",
                {
                  key: link.href,
                  href: link.href,
                  target: "_blank",
                  rel: "noopener noreferrer"
                },
                link.label,
                " \u2197"
              );
            })
          )
        )
      ),
      document.body
    );
  }

  /* --------------------------------------------------------- projects app */

  function ProjectsApp() {
    var queryState = useState("");
    var query = queryState[0];
    var setQuery = queryState[1];

    var activeState = useState(function () {
      try {
        return localStorage.getItem("portfolio-filter") || "All";
      } catch (error) {
        return "All";
      }
    });
    var active = activeState[0];
    var setActive = activeState[1];

    var selectedState = useState(null);
    var selected = selectedState[0];
    var setSelected = selectedState[1];

    var openerRef = useRef(null);

    var techs = useMemo(function () {
      var seen = {};
      var list = ["All"];

      projects.forEach(function (project) {
        project.tech.forEach(function (item) {
          if (!seen[item]) {
            seen[item] = true;
            list.push(item);
          }
        });
      });

      return list;
    }, []);

    var visible = useMemo(
      function () {
        var term = query.trim().toLowerCase();

        return projects.filter(function (project) {
          var byTech = active === "All" || project.tech.indexOf(active) !== -1;
          var haystack = (
            project.title +
            " " +
            project.summary +
            " " +
            project.tech.join(" ")
          ).toLowerCase();

          return byTech && (term === "" || haystack.indexOf(term) !== -1);
        });
      },
      [query, active]
    );

    useEffect(
      function () {
        try {
          localStorage.setItem("portfolio-filter", active);
        } catch (error) {
          /* storage can be unavailable in private mode */
        }
      },
      [active]
    );

    var close = useCallback(function () {
      setSelected(null);
      if (openerRef.current) {
        openerRef.current.focus();
      }
    }, []);

    function open(project, opener) {
      openerRef.current = opener;
      setSelected(project);
    }

    function reset() {
      setActive("All");
      setQuery("");
    }

    function surprise() {
      var pool = visible.length > 0 ? visible : projects;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) {
        open(pick, null);
      }
    }

    var body =
      visible.length === 0
        ? h(
            "div",
            { className: "projects-empty" },
            h("p", null, "No project matches that search and filter."),
            h(
              "button",
              { type: "button", className: "details-btn", onClick: reset },
              "Clear search and filter"
            )
          )
        : visible.map(function (project, index) {
            return h(ProjectCard, {
              key: project.id,
              project: project,
              index: String(index + 1).padStart(2, "0"),
              onOpen: open
            });
          });

    return h(
      Fragment,
      null,
      h(Toolbar, {
        query: query,
        onQuery: setQuery,
        techs: techs,
        active: active,
        onActive: setActive,
        count: visible.length,
        onSurprise: surprise
      }),
      body,
      h(ProjectDialog, { project: selected, onClose: close })
    );
  }

  /* ----------------------------------------------------------- theme toggle */

  function ThemeToggle() {
    var themeState = useState(function () {
      return document.documentElement.dataset.theme === "light" ? "light" : "dark";
    });
    var theme = themeState[0];
    var setTheme = themeState[1];

    useEffect(
      function () {
        document.documentElement.dataset.theme = theme;
        try {
          localStorage.setItem("portfolio-theme", theme);
        } catch (error) {
          /* storage can be unavailable in private mode */
        }
      },
      [theme]
    );

    var isDark = theme === "dark";

    return h(
      "button",
      {
        type: "button",
        className: "theme-toggle",
        "aria-pressed": isDark,
        onClick: function () {
          setTheme(isDark ? "light" : "dark");
        }
      },
      isDark ? "Light mode" : "Dark mode"
    );
  }

  /* ---------------------------------------------------------------- mounts */

  var projectsRoot = document.getElementById("projects-root");
  if (projectsRoot) {
    ReactDOM.createRoot(projectsRoot).render(h(ProjectsApp));
  }

  var toggleRoot = document.getElementById("theme-toggle-root");
  if (toggleRoot) {
    ReactDOM.createRoot(toggleRoot).render(h(ThemeToggle));
  }
})();
