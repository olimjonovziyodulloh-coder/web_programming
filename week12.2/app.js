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
  function PokemonLookup() {
    var inputState = useState("pikachu");
    var input = inputState[0];
    var setInput = inputState[1];

    var queryState = useState("pikachu");
    var query = queryState[0];
    var setQuery = queryState[1];

    var pokemonState = useState(null);
    var pokemon = pokemonState[0];
    var setPokemon = pokemonState[1];

    var statusState = useState("loading");
    var status = statusState[0];
    var setStatus = statusState[1];

    var errorState = useState("");
    var error = errorState[0];
    var setError = errorState[1];

    useEffect(
      function () {
        if (!query) {
          setPokemon(null);
          setError("");
          setStatus("idle");
          return undefined;
        }

        var controller = new AbortController();
        var active = true;

        setStatus("loading");
        setError("");

        fetch("https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(query), {
          signal: controller.signal,
          headers: { Accept: "application/json" }
        })
          .then(function (response) {
            if (!response.ok) {
              if (response.status === 404) {
                throw new Error('No Pok\u00e9mon is called "' + query + '".');
              }
              throw new Error(
                "The Pok\u00e9dex answered with status " + response.status + "."
              );
            }
            return response.json();
          })
          .then(function (data) {
            if (!active) {
              return;
            }
            setPokemon(data);
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
      var next = input.trim().toLowerCase();
      if (next && next === query) {
        /* look the same name up again: reset the effect, then refetch */
        setQuery("");
        window.setTimeout(function () {
          setQuery(next);
        }, 0);
        return;
      }
      setQuery(next);
    }

    function titleCase(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    var body;

    if (status === "loading") {
      body = h(
        "p",
        { className: "status-line", role: "status" },
        "Searching the Pok\u00e9dex for " + query + "\u2026"
      );
    } else if (status === "error") {
      body = h(
        "p",
        { className: "status-line status-line--error", role: "alert" },
        error
      );
    } else if (status === "success" && pokemon) {
      var sprites = pokemon.sprites || {};
      var artwork = sprites.other && sprites.other["official-artwork"];
      var image = (artwork && artwork.front_default) || sprites.front_default;
      var types = (pokemon.types || []).map(function (slot) {
        return slot.type.name;
      });

      body = h(
        "div",
        { className: "poke" },
        image
          ? h("img", {
              className: "poke-sprite",
              src: image,
              alt: "Official artwork of " + pokemon.name,
              width: 96,
              height: 96,
              loading: "lazy"
            })
          : null,
        h(
          "div",
          { className: "poke-body" },
          h("p", { className: "poke-name" }, titleCase(pokemon.name)),
          h(
            "p",
            { className: "poke-dex" },
            "National Dex #" + String(pokemon.id).padStart(3, "0")
          ),
          h(
            "ul",
            { className: "poke-types" },
            types.map(function (type) {
              return h(
                "li",
                { key: type, className: "poke-type" },
                type
              );
            })
          ),
          h(
            "p",
            { className: "poke-stats" },
            h(
              "span",
              null,
              h("strong", null, (pokemon.height / 10).toFixed(1)),
              " m tall"
            ),
            h(
              "span",
              null,
              h("strong", null, (pokemon.weight / 10).toFixed(1)),
              " kg"
            )
          )
        )
      );
    } else {
      body = h(
        "p",
        { className: "status-line" },
        "Type a Pok\u00e9mon name and press Search."
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
          { className: "visually-hidden", htmlFor: "pokemon-name" },
          "Pok\u00e9mon name"
        ),
        h("input", {
          className: "field-input",
          id: "pokemon-name",
          type: "text",
          placeholder: "pikachu",
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
  /* E3 — derived values, calculated during render                        */
  /* ---------------------------------------------------------------------- */
  function RectangleMetrics() {
    var widthState = useState("6");
    var width = widthState[0];
    var setWidth = widthState[1];

    var heightState = useState("4");
    var height = heightState[0];
    var setHeight = heightState[1];

    var w = parseFloat(width);
    var hgt = parseFloat(height);
    var valid = isFinite(w) && isFinite(hgt) && w >= 0 && hgt >= 0;

    var area = valid ? w * hgt : 0;
    var perimeter = valid ? 2 * (w + hgt) : 0;
    var square = valid && w > 0 && w === hgt;

    function tidy(value) {
      return String(Math.round(value * 100) / 100);
    }

    return h(
      "div",
      { className: "metrics" },
      h(
        "div",
        { className: "metric-inputs" },
        h(
          "div",
          { className: "field-stack" },
          h(
            "label",
            { className: "field-label", htmlFor: "metric-width" },
            "Width (m)"
          ),
          h("input", {
            className: "field-input",
            id: "metric-width",
            type: "number",
            min: "0",
            step: "any",
            inputMode: "decimal",
            value: width,
            onChange: function (event) {
              setWidth(event.target.value);
            }
          })
        ),
        h(
          "div",
          { className: "field-stack" },
          h(
            "label",
            { className: "field-label", htmlFor: "metric-height" },
            "Height (m)"
          ),
          h("input", {
            className: "field-input",
            id: "metric-height",
            type: "number",
            min: "0",
            step: "any",
            inputMode: "decimal",
            value: height,
            onChange: function (event) {
              setHeight(event.target.value);
            }
          })
        )
      ),
      h(
        "div",
        { className: "metric-out" },
        h(
          "p",
          { className: "metric" },
          h(
            "span",
            { className: "metric-value", role: "status" },
            valid ? tidy(area) : "\u2014"
          ),
          h("span", { className: "metric-label" }, "area (m\u00b2)")
        ),
        h(
          "p",
          { className: "metric" },
          h(
            "span",
            { className: "metric-value" },
            valid ? tidy(perimeter) : "\u2014"
          ),
          h("span", { className: "metric-label" }, "perimeter (m)")
        ),
        h(
          "p",
          { className: "metric" },
          h(
            "span",
            { className: "metric-value" },
            valid ? (square ? "Yes" : "No") : "\u2014"
          ),
          h("span", { className: "metric-label" }, "square?")
        )
      ),
      h(
        "p",
        { className: "demo-hint" },
        "Two state variables, zero effects: the area, the perimeter and the square check are recalculated on every render."
      )
    );
  }

  mount("mount-effect", MountEffect);
  mount("watch-value", WatchValue);
  mount("clock-cleanup", ClockCleanup);
  mount("stored-preference", StoredPreference);
  mount("title-sync", TitleSync);
  mount("pokemon-lookup", PokemonLookup);
  mount("rectangle-metrics", RectangleMetrics);
})();
