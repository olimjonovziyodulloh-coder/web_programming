(function () {
  "use strict";

  if (!window.React || !window.ReactDOM) {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-demo]"),
      function (node) {
        node.innerHTML =
          '<p class="demo-fallback">This demo needs JavaScript. The component code is below.</p>';
      }
    );
    return;
  }

  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;

  function mount(name, Component) {
    var node = document.querySelector('[data-demo="' + name + '"]');
    if (node) {
      ReactDOM.createRoot(node).render(h(Component));
    }
  }

  function Meter(props) {
    return h(
      "p",
      { className: "meter" },
      h("span", { className: "meter-value" }, props.value),
      h("span", { className: "meter-label" }, props.label)
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Sample 01 — empty dependency array: runs once after mount             */
  /* ---------------------------------------------------------------------- */
  function MountEffect() {
    var runsState = useState(0);
    var runs = runsState[0];
    var setRuns = runsState[1];

    var rendersState = useState(0);
    var renders = rendersState[0];
    var setRenders = rendersState[1];

    useEffect(function () {
      setRuns(function (n) {
        return n + 1;
      });
    }, []);

    return h(
      "div",
      { className: "effect-demo" },
      h(
        "div",
        { className: "effect-meter" },
        h(Meter, { value: runs, label: "effect run" }),
        h(Meter, { value: renders, label: "re-render" })
      ),
      h(
        "div",
        { className: "btn-row" },
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: function () {
              setRenders(function (n) {
                return n + 1;
              });
            }
          },
          "Re-render the component"
        )
      ),
      h(
        "p",
        { className: "demo-hint" },
        "Click the button a few times: the re-render counter climbs, the effect counter stays at ",
        h("strong", null, "1"),
        "."
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Sample 02 — dependency array: runs again when the value changes       */
  /* ---------------------------------------------------------------------- */
  function WatchValue() {
    var nameState = useState("Nova");
    var callsign = nameState[0];
    var setCallsign = nameState[1];

    var runsState = useState(0);
    var runs = runsState[0];
    var setRuns = runsState[1];

    useEffect(
      function () {
        setRuns(function (n) {
          return n + 1;
        });
      },
      [callsign]
    );

    return h(
      "div",
      { className: "effect-demo" },
      h(
        "div",
        { className: "field-stack" },
        h(
          "label",
          { className: "field-label", htmlFor: "watch-callsign" },
          "Callsign"
        ),
        h("input", {
          className: "field-input",
          id: "watch-callsign",
          type: "text",
          value: callsign,
          onChange: function (event) {
            setCallsign(event.target.value);
          }
        })
      ),
      h(
        "div",
        { className: "effect-meter" },
        h(Meter, { value: runs, label: "effect run" })
      ),
      h(
        "p",
        { className: "demo-hint" },
        "Each new callsign adds one run. Changing the text back to a previous value also counts, because the effect compares with the last render."
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Sample 03 — interval with cleanup                                    */
  /* ---------------------------------------------------------------------- */
  function ClockCleanup() {
    var nowState = useState(new Date());
    var now = nowState[0];
    var setNow = nowState[1];

    useEffect(function () {
      var id = setInterval(function () {
        setNow(new Date());
      }, 1000);

      return function () {
        clearInterval(id);
      };
    }, []);

    return h(
      "div",
      { className: "effect-demo" },
      h(
        "div",
        { className: "clock" },
        h("span", { className: "clock-label" }, "Local time"),
        h(
          "span",
          { className: "clock-time", "aria-live": "off" },
          now.toLocaleTimeString([], { hour12: false })
        )
      ),
      h(
        "p",
        { className: "demo-hint" },
        "The effect opens one interval and its cleanup closes it. Without that returned function the timer would keep ticking in the background."
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Sample 04 — mirror a preference into localStorage                    */
  /* ---------------------------------------------------------------------- */
  function readDensity() {
    try {
      return window.localStorage.getItem("week12_2_density") === "compact"
        ? "compact"
        : "roomy";
    } catch (error) {
      return "roomy";
    }
  }

  function StoredPreference() {
    var modeState = useState(readDensity);
    var mode = modeState[0];
    var setMode = modeState[1];

    useEffect(
      function () {
        try {
          window.localStorage.setItem("week12_2_density", mode);
        } catch (error) {
          /* storage can be blocked; the demo still works in memory */
        }
      },
      [mode]
    );

    var compact = mode === "compact";

    return h(
      "div",
      { className: "effect-demo" },
      h(
        "div",
        { className: "pref-demo" + (compact ? " pref-demo--compact" : "") },
        h(
          "p",
          { className: "pref-line" },
          "Saved spacing: ",
          h("strong", null, compact ? "Compact" : "Roomy")
        ),
        h(
          "div",
          { className: "btn-row" },
          h(
            "button",
            {
              type: "button",
              className: "btn" + (compact ? "" : " btn-primary"),
              onClick: function () {
                setMode(compact ? "roomy" : "compact");
              }
            },
            compact ? "Switch to roomy" : "Switch to compact"
          )
        )
      ),
      h(
        "p",
        { className: "demo-hint" },
        "Reload the page: the effect wrote the choice to localStorage, so the same spacing comes back."
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* E1 — sync the document title with the unread count                   */
  /* ---------------------------------------------------------------------- */
  function TitleSync() {
    var unreadState = useState(3);
    var unread = unreadState[0];
    var setUnread = unreadState[1];

    var titleState = useState("");
    var title = titleState[0];
    var setTitle = titleState[1];

    useEffect(
      function () {
        var next = "Alerts \u2014 " + unread + " unread";
        document.title = next;
        setTitle(next);
      },
      [unread]
    );

    return h(
      "div",
      { className: "effect-demo" },
      h(
        "div",
        { className: "effect-meter" },
        h(Meter, { value: unread, label: "unread alerts" })
      ),
      h(
        "div",
        { className: "btn-row" },
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: function () {
              setUnread(function (n) {
                return n + 1;
              });
            }
          },
          "Receive an alert"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn",
            disabled: unread === 0,
            onClick: function () {
              setUnread(0);
            }
          },
          "Mark all as read"
        )
      ),
      h(
        "p",
        { className: "status-line" },
        "Current tab title: ",
        h("strong", null, title || "\u2026")
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* E2 — async fetch with loading, error and abort cleanup               */
  /* ---------------------------------------------------------------------- */
  function GithubProfile() {
    var inputState = useState("octocat");
    var input = inputState[0];
    var setInput = inputState[1];

    var queryState = useState("octocat");
    var query = queryState[0];
    var setQuery = queryState[1];

    var profileState = useState(null);
    var profile = profileState[0];
    var setProfile = profileState[1];

    var statusState = useState("loading");
    var status = statusState[0];
    var setStatus = statusState[1];

    var errorState = useState("");
    var error = errorState[0];
    var setError = errorState[1];

    useEffect(
      function () {
        if (!query) {
          setProfile(null);
          setError("");
          setStatus("idle");
          return undefined;
        }

        var controller = new AbortController();
        var active = true;

        setStatus("loading");
        setError("");

        fetch("https://api.github.com/users/" + encodeURIComponent(query), {
          signal: controller.signal,
          headers: { Accept: "application/vnd.github+json" }
        })
          .then(function (response) {
            if (!response.ok) {
              if (response.status === 404) {
                throw new Error("No GitHub account called @" + query + ".");
              }
              throw new Error("GitHub answered with status " + response.status + ".");
            }
            return response.json();
          })
          .then(function (data) {
            if (!active) {
              return;
            }
            setProfile(data);
            setStatus("success");
          })
          .catch(function (problem) {
            if (!active || problem.name === "AbortError") {
              return;
            }
            setError(problem.message || "The request failed.");
            setStatus("error");
          });

        return function () {
          active = false;
          controller.abort();
        };
      },
      [query]
    );

    function submit(event) {
      event.preventDefault();
      var next = input.trim();
      if (next && next === query) {
        /* search the same handle again: reset the effect by clearing first */
        setQuery("");
        window.setTimeout(function () {
          setQuery(next);
        }, 0);
        return;
      }
      setQuery(next);
    }

    var body;

    if (status === "loading") {
      body = h(
        "p",
        { className: "status-line", role: "status" },
        "Looking up @" + query + "\u2026"
      );
    } else if (status === "error") {
      body = h(
        "p",
        { className: "status-line status-line--error", role: "alert" },
        error
      );
    } else if (status === "success" && profile) {
      body = h(
        "div",
        { className: "profile" },
        h("img", {
          className: "profile-avatar",
          src: profile.avatar_url,
          alt: "Avatar of " + profile.login,
          width: 64,
          height: 64
        }),
        h(
          "div",
          { className: "profile-body" },
          h(
            "p",
            { className: "profile-name" },
            profile.name || profile.login
          ),
          h("p", { className: "profile-login" }, "@" + profile.login),
          h(
            "p",
            { className: "profile-bio" },
            profile.bio || "This account has no bio."
          ),
          h(
            "p",
            { className: "profile-stats" },
            h("span", null, h("strong", null, profile.followers), " followers"),
            h(
              "span",
              null,
              h("strong", null, profile.public_repos),
              " public repositories"
            )
          )
        )
      );
    } else {
      body = h(
        "p",
        { className: "status-line" },
        "Type a GitHub handle and press Search."
      );
    }

    return h(
      "div",
      { className: "effect-demo" },
      h(
        "form",
        { className: "task-form", onSubmit: submit },
        h(
          "label",
          { className: "visually-hidden", htmlFor: "github-handle" },
          "GitHub username"
        ),
        h("input", {
          className: "field-input",
          id: "github-handle",
          type: "text",
          placeholder: "octocat",
          autoComplete: "off",
          spellCheck: "false",
          value: input,
          onChange: function (event) {
            setInput(event.target.value);
          }
        }),
        h(
          "button",
          { className: "btn btn-primary", type: "submit" },
          "Search"
        )
      ),
      body
    );
  }

  /* ---------------------------------------------------------------------- */
  /* E3 — derived value, calculated during render                         */
  /* ---------------------------------------------------------------------- */
  function DerivedName() {
    var firstState = useState("Ada");
    var first = firstState[0];
    var setFirst = firstState[1];

    var lastState = useState("Lovelace");
    var last = lastState[0];
    var setLast = lastState[1];

    var fullName = (first + " " + last).trim();
    var initials =
      (first.charAt(0) + last.charAt(0)).toUpperCase() || "\u2014";

    return h(
      "div",
      { className: "derived" },
      h(
        "div",
        { className: "field-stack" },
        h(
          "label",
          { className: "field-label", htmlFor: "derived-first" },
          "First name"
        ),
        h("input", {
          className: "field-input",
          id: "derived-first",
          type: "text",
          value: first,
          onChange: function (event) {
            setFirst(event.target.value);
          }
        })
      ),
      h(
        "div",
        { className: "field-stack" },
        h(
          "label",
          { className: "field-label", htmlFor: "derived-last" },
          "Last name"
        ),
        h("input", {
          className: "field-input",
          id: "derived-last",
          type: "text",
          value: last,
          onChange: function (event) {
            setLast(event.target.value);
          }
        })
      ),
      h(
        "div",
        { className: "derived-out" },
        h("span", { className: "derived-badge", "aria-hidden": "true" }, initials),
        h(
          "p",
          { className: "derived-name", role: "status" },
          fullName || "Enter a name"
        )
      ),
      h(
        "p",
        { className: "demo-hint" },
        "Two state variables, zero effects: the full name and initials are rebuilt on every render."
      )
    );
  }

  mount("mount-effect", MountEffect);
  mount("watch-value", WatchValue);
  mount("clock-cleanup", ClockCleanup);
  mount("stored-preference", StoredPreference);
  mount("title-sync", TitleSync);
  mount("github-profile", GithubProfile);
  mount("derived-name", DerivedName);
})();
