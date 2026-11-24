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
  var useMemo = React.useMemo;
  var useRef = React.useRef;
  var useCallback = React.useCallback;

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

  var WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Rain showers", 82: "Heavy showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm"
  };

  /* ------------------------------------------------------------------ */
  /* Sample 01 — empty dependency array: runs once after mount           */
  /* ------------------------------------------------------------------ */
  function MountEffect() {
    var runsState = useState(0);
    var runs = runsState[0];
    var setRuns = runsState[1];
    var rendersState = useState(0);
    var renders = rendersState[0];
    var setRenders = rendersState[1];

    useEffect(function () {
      setRuns(function (n) { return n + 1; });
    }, []);

    return h(
      "div",
      { className: "effect-demo" },
      h("div", { className: "effect-meter" },
        h(Meter, { value: runs, label: "effect run" }),
        h(Meter, { value: renders, label: "re-render" })),
      h("div", { className: "btn-row" },
        h("button", { type: "button", className: "btn btn-primary",
          onClick: function () { setRenders(function (n) { return n + 1; }); } },
          "Re-render the component")),
      h("p", { className: "demo-hint" }, "Click as often as you like — the effect counter stays at ", h("strong", null, "1"), ".")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Sample 02 — dependency array: runs again when the value changes     */
  /* ------------------------------------------------------------------ */
  function WatchValue() {
    var nameState = useState("Nova");
    var callsign = nameState[0];
    var setCallsign = nameState[1];
    var runsState = useState(0);
    var runs = runsState[0];
    var setRuns = runsState[1];

    useEffect(function () {
      setRuns(function (n) { return n + 1; });
    }, [callsign]);

    return h(
      "div",
      { className: "effect-demo" },
      h("div", { className: "field-stack" },
        h("label", { className: "field-label", htmlFor: "watch-callsign" }, "Callsign"),
        h("input", { className: "field-input", id: "watch-callsign", type: "text",
          value: callsign, onChange: function (e) { setCallsign(e.target.value); } })),
      h("div", { className: "effect-meter" }, h(Meter, { value: runs, label: "effect run" })),
      h("p", { className: "demo-hint" }, "Each new callsign adds one run. Changing the text back to a previous value also counts.")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Sample 03 — interval with cleanup                                  */
  /* ------------------------------------------------------------------ */
  function ClockCleanup() {
    var nowState = useState(new Date());
    var now = nowState[0];
    var setNow = nowState[1];

    useEffect(function () {
      var id = setInterval(function () { setNow(new Date()); }, 1000);
      return function () { clearInterval(id); };
    }, []);

    return h(
      "div",
      { className: "effect-demo" },
      h("div", { className: "clock" },
        h("span", { className: "clock-label" }, "Local time"),
        h("span", { className: "clock-time", "aria-live": "off" }, now.toLocaleTimeString([], { hour12: false }))),
      h("p", { className: "demo-hint" }, "The effect opens one interval and its cleanup closes it. Without the returned function the timer keeps ticking.")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Sample 04 — mirror a preference into localStorage                  */
  /* ------------------------------------------------------------------ */
  function readDensity() {
    try { return window.localStorage.getItem("week12_2_density") === "compact" ? "compact" : "roomy"; }
    catch (e) { return "roomy"; }
  }
  function StoredPreference() {
    var modeState = useState(readDensity);
    var mode = modeState[0];
    var setMode = modeState[1];

    useEffect(function () {
      try { window.localStorage.setItem("week12_2_density", mode); } catch (e) { }
    }, [mode]);

    var compact = mode === "compact";
    return h(
      "div",
      { className: "effect-demo" },
      h("div", { className: "pref-demo" + (compact ? " pref-demo--compact" : "") },
        h("p", { className: "pref-line" }, "Saved spacing: ", h("strong", null, compact ? "Compact" : "Roomy")),
        h("div", { className: "btn-row" },
          h("button", { type: "button", className: "btn" + (compact ? "" : " btn-primary"),
            onClick: function () { setMode(compact ? "roomy" : "compact"); } },
            compact ? "Switch to roomy" : "Switch to compact"))),
      h("p", { className: "demo-hint" }, "Reload the page: the effect wrote the choice to localStorage, so the same spacing comes back.")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Homework — Weather Dashboard (Open-Meteo)                          */
  /* ------------------------------------------------------------------ */
  function WeatherDashboard() {
    var cityState = useState("");
    var city = cityState[0]; var setCity = cityState[1];
    var latState = useState(""); var lat = latState[0]; var setLat = latState[1];
    var lonState = useState(""); var lon = lonState[0]; var setLon = lonState[1];
    var qLatState = useState(null); var qLat = qLatState[0]; var setQLat = qLatState[1];
    var qLonState = useState(null); var qLon = qLonState[0]; var setQLon = qLonState[1];
    var nameState = useState(""); var placeName = nameState[0]; var setPlaceName = nameState[1];
    var weatherState = useState(null); var weather = weatherState[0]; var setWeather = weatherState[1];
    var statusState = useState("idle"); var status = statusState[0]; var setStatus = statusState[1];
    var errorState = useState(""); var error = errorState[0]; var setError = errorState[1];

    useEffect(function () {
      if (qLat === null || qLon === null) { return undefined; }
      var controller = new AbortController();
      var active = true;
      setStatus("loading"); setError("");
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + qLat + "&longitude=" + qLon +
        "&current=temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m&timezone=auto";
      fetch(url, { signal: controller.signal })
        .then(function (r) {
          if (!r.ok) { throw new Error("Weather service answered with status " + r.status + "."); }
          return r.json();
        })
        .then(function (data) {
          if (!active) return;
          setWeather(data);
          setStatus("success");
        })
        .catch(function (p) {
          if (!active || p.name === "AbortError") return;
          setError(p.message || "The request failed.");
          setStatus("error");
        });
      return function () { active = false; controller.abort(); };
    }, [qLat, qLon]);

    function searchCity(event) {
      event.preventDefault();
      var term = city.trim();
      if (!term) { return; }
      var controller = new AbortController();
      setStatus("loading"); setError("");
      fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(term) + "&count=1&language=en&format=json", { signal: controller.signal })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.results && data.results.length) {
            var r = data.results[0];
            setQLat(r.latitude); setQLon(r.longitude);
            setPlaceName(r.name + (r.country ? ", " + r.country : ""));
          } else {
            setError('No place found for "' + term + '".');
            setStatus("error");
          }
        })
        .catch(function (p) {
          if (p.name === "AbortError") return;
          setError(p.message || "Geocoding failed.");
          setStatus("error");
        });
    }

    function useManual(event) {
      event.preventDefault();
      var la = parseFloat(lat); var lo = parseFloat(lon);
      if (!isFinite(la) || !isFinite(lo)) { setError("Enter valid latitude and longitude."); setStatus("error"); return; }
      setPlaceName("Manual location");
      setQLat(la); setQLon(lo);
    }

    function useGeo() {
      if (!navigator.geolocation) { setError("Geolocation is not supported by this browser."); setStatus("error"); return; }
      setStatus("loading");
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          setPlaceName("Your location");
          setQLat(pos.coords.latitude);
          setQLon(pos.coords.longitude);
        },
        function () { setError("Could not read your location."); setStatus("error"); }
      );
    }

    var body;
    if (status === "loading") {
      body = h("p", { className: "status-line", role: "status" }, "Loading weather\u2026");
    } else if (status === "error") {
      body = h("p", { className: "status-line status-line--error", role: "alert" }, error);
    } else if (status === "success" && weather && weather.current) {
      var c = weather.current;
      var code = c.weather_code;
      var desc = WEATHER_CODES[code] || "Unknown conditions";
      body = h("div", { className: "weather" },
        h("p", { className: "weather-place" }, placeName || (qLat + ", " + qLon)),
        h("p", { className: "weather-temp" }, Math.round(c.temperature_2m), h("span", { className: "weather-unit" }, " \u00b0C")),
        h("p", { className: "weather-desc" }, desc),
        h("p", { className: "weather-stats" },
          h("span", null, h("strong", null, c.wind_speed_10m), " km/h wind"),
          h("span", null, h("strong", null, c.relative_humidity_2m), " % humidity")));
    } else {
      body = h("p", { className: "status-line" }, "Search for a city or enter coordinates.");
    }

    return h(
      "div",
      { className: "effect-demo" },
      h("form", { className: "task-form", onSubmit: searchCity },
        h("label", { className: "visually-hidden", htmlFor: "weather-city" }, "City name"),
        h("input", { className: "field-input", id: "weather-city", type: "text", placeholder: "Seoul",
          value: city, onChange: function (e) { setCity(e.target.value); } }),
        h("button", { className: "btn btn-primary", type: "submit" }, "Search city")),
      h("form", { className: "task-form", onSubmit: useManual, style: { marginTop: "8px" } },
        h("label", { className: "visually-hidden", htmlFor: "weather-lat" }, "Latitude"),
        h("input", { className: "field-input", id: "weather-lat", type: "text", placeholder: "Latitude (e.g. 37.5665)",
          value: lat, onChange: function (e) { setLat(e.target.value); } }),
        h("label", { className: "visually-hidden", htmlFor: "weather-lon" }, "Longitude"),
        h("input", { className: "field-input", id: "weather-lon", type: "text", placeholder: "Longitude (e.g. 126.9780)",
          value: lon, onChange: function (e) { setLon(e.target.value); } }),
        h("button", { className: "btn", type: "submit" }, "Use coordinates")),
      h("div", { className: "btn-row", style: { marginTop: "8px" } },
        h("button", { type: "button", className: "btn btn-text", onClick: useGeo }, "Use my location")),
      body
    );
  }

  /* ------------------------------------------------------------------ */
  /* Code Challenge — GitHub User Lookup (debounce + AbortController)    */
  /* ------------------------------------------------------------------ */
  function GithubLookup() {
    var inputState = useState("");
    var input = inputState[0]; var setInput = inputState[1];
    var queryState = useState(""); var query = queryState[0]; var setQuery = queryState[1];
    var profileState = useState(null); var profile = profileState[0]; var setProfile = profileState[1];
    var statusState = useState("idle"); var status = statusState[0]; var setStatus = statusState[1];
    var errorState = useState(""); var error = errorState[0]; var setError = errorState[1];

    // debounce typing into a query
    useEffect(function () {
      var id = setTimeout(function () { setQuery(input.trim()); }, 500);
      return function () { clearTimeout(id); };
    }, [input]);

    useEffect(function () {
      if (!query) { setProfile(null); setStatus("idle"); return undefined; }
      var controller = new AbortController();
      var active = true;
      setStatus("loading"); setError("");
      fetch("https://api.github.com/users/" + encodeURIComponent(query), {
        signal: controller.signal, headers: { Accept: "application/vnd.github+json" }
      })
        .then(function (r) {
          if (!r.ok) {
            if (r.status === 404) throw new Error('No GitHub account named "' + query + '".');
            throw new Error("GitHub answered with status " + r.status + ".");
          }
          return r.json();
        })
        .then(function (data) {
          if (!active) return;
          setProfile(data); setStatus("success");
        })
        .catch(function (p) {
          if (!active || p.name === "AbortError") return;
          setError(p.message || "The request failed."); setStatus("error");
        });
      return function () { active = false; controller.abort(); };
    }, [query]);

    function submit(event) {
      event.preventDefault();
      setQuery(input.trim());
    }

    var body;
    if (status === "loading") {
      body = h("p", { className: "status-line", role: "status" }, "Looking up @" + query + "\u2026");
    } else if (status === "error") {
      body = h("p", { className: "status-line status-line--error", role: "alert" }, error);
    } else if (status === "success" && profile) {
      body = h("div", { className: "poke" },
        h("img", { className: "poke-sprite", src: profile.avatar_url, alt: "Avatar of " + profile.login, width: 96, height: 96, loading: "lazy" }),
        h("div", { className: "poke-body" },
          h("p", { className: "poke-name" }, profile.name || profile.login),
          h("p", { className: "poke-dex" }, "@" + profile.login),
          h("p", { className: "profile-bio" }, profile.bio || "This account has no bio."),
          h("p", { className: "profile-stats" },
            h("span", null, h("strong", null, profile.followers), " followers"),
            h("span", null, h("strong", null, profile.public_repos), " public repos"))));
    } else {
      body = h("p", { className: "status-line" }, "Type a GitHub handle and press Search (or wait 500 ms).");
    }

    return h(
      "div",
      { className: "effect-demo" },
      h("form", { className: "task-form", onSubmit: submit },
        h("label", { className: "visually-hidden", htmlFor: "gh-handle" }, "GitHub username"),
        h("input", { className: "field-input", id: "gh-handle", type: "text", placeholder: "octocat",
          autoComplete: "off", spellCheck: "false", value: input,
          onChange: function (e) { setInput(e.target.value); } }),
        h("button", { className: "btn btn-primary", type: "submit" }, "Search")),
      body
    );
  }

  /* ------------------------------------------------------------------ */
  /* Study Guide E1 — Document title sync with cleanup on unmount        */
  /* ------------------------------------------------------------------ */
  function TitleSyncChild() {
    var textState = useState("WebPro");
    var text = textState[0]; var setText = textState[1];

    useEffect(function () {
      document.title = text || "WebPro";
      return function () { document.title = "WebPro"; };
    }, [text]);

    return h(
      "div",
      { className: "effect-demo" },
      h("div", { className: "field-stack" },
        h("label", { className: "field-label", htmlFor: "title-sync-input" }, "Tab title text"),
        h("input", { className: "field-input", id: "title-sync-input", type: "text", value: text,
          onChange: function (e) { setText(e.target.value); } })),
      h("p", { className: "status-line" }, "Current document.title: ", h("strong", null, text || "WebPro")),
      h("p", { className: "demo-hint" }, "Unmount this component (toggle below) and the cleanup restores the title to ", h("strong", null, "WebPro"), ".")
    );
  }

  function TitleSyncUnmount() {
    var showState = useState(true);
    var show = showState[0]; var setShow = showState[1];
    return h(
      "div",
      { className: "effect-demo" },
      h("div", { className: "btn-row" },
        h("button", { type: "button", className: "btn" + (show ? "" : " btn-primary"),
          onClick: function () { setShow(!show); } },
          show ? "Unmount the sync component" : "Mount the sync component")),
      show ? h(TitleSyncChild) : h("p", { className: "status-line" }, "Component unmounted \u2014 cleanup restored the title."),
      h("p", { className: "demo-hint" }, "While mounted, typing changes the tab title. Unmounting runs the cleanup and resets it.")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Study Guide E2 — Fetch a user from JSONPlaceholder                 */
  /* ------------------------------------------------------------------ */
  function JsonUser() {
    var userState = useState(null); var user = userState[0]; var setUser = userState[1];
    var statusState = useState("loading"); var status = statusState[0]; var setStatus = statusState[1];
    var errorState = useState(""); var error = errorState[0]; var setError = errorState[1];

    useEffect(function () {
      var controller = new AbortController();
      var active = true;
      setStatus("loading"); setError("");
      fetch("https://jsonplaceholder.typicode.com/users/1", { signal: controller.signal })
        .then(function (r) {
          if (!r.ok) throw new Error("Status " + r.status);
          return r.json();
        })
        .then(function (data) { if (!active) return; setUser(data); setStatus("success"); })
        .catch(function (p) { if (!active || p.name === "AbortError") return; setError(p.message); setStatus("error"); });
      return function () { active = false; controller.abort(); };
    }, []);

    if (status === "loading") return h("p", { className: "status-line", role: "status" }, "Loading user\u2026");
    if (status === "error") return h("p", { className: "status-line status-line--error", role: "alert" }, error || "Failed to load.");
    return h("div", { className: "effect-demo" },
      h("p", { className: "profile-name" }, user.name),
      h("p", { className: "profile-login" }, user.email),
      h("p", { className: "profile-bio" }, user.company && user.company.name ? "Works at " + user.company.name : ""),
      h("p", { className: "demo-hint" }, "Fetched once on mount with an empty dependency array. Cleanup aborts if the component unmounts mid-request."));
  }

  /* ------------------------------------------------------------------ */
  /* Study Guide E3 — Stopwatch with cleanup                            */
  /* ------------------------------------------------------------------ */
  function Stopwatch() {
    var runningState = useState(false); var running = runningState[0]; var setRunning = runningState[1];
    var elapsedState = useState(0); var elapsed = elapsedState[0]; var setElapsed = elapsedState[1];

    useEffect(function () {
      if (!running) return undefined;
      var id = setInterval(function () { setElapsed(function (n) { return n + 10; }); }, 10);
      return function () { clearInterval(id); };
    }, [running]);

    function fmt(ms) {
      var s = Math.floor(ms / 1000);
      var m = Math.floor(s / 60);
      var sec = s % 60;
      var tenth = Math.floor((ms % 1000) / 100);
      return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec + "." + tenth;
    }

    return h(
      "div",
      { className: "effect-demo" },
      h("p", { className: "clock-time", "aria-live": "off" }, fmt(elapsed)),
      h("div", { className: "btn-row" },
        h("button", { type: "button", className: "btn btn-primary", disabled: running,
          onClick: function () { setRunning(true); } }, "Start"),
        h("button", { type: "button", className: "btn", disabled: !running,
          onClick: function () { setRunning(false); } }, "Stop"),
        h("button", { type: "button", className: "btn", disabled: running && elapsed === 0 ? false : false,
          onClick: function () { setRunning(false); setElapsed(0); } }, "Reset")),
      h("p", { className: "demo-hint" }, "setInterval lives inside useEffect and is cleared on stop, reset and unmount.")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Lab — dependency patterns, memory leak, race condition, derived     */
  /* ------------------------------------------------------------------ */
  function LifecycleLab() {
    var valueState = useState("React");
    var value = valueState[0]; var setValue = valueState[1];
    var rendersState = useState(0); var renders = rendersState[0]; var setRenders = rendersState[1];
    var emptyRunsState = useState(0); var emptyRuns = emptyRunsState[0]; var setEmptyRuns = emptyRunsState[1];
    var valueRunsState = useState(0); var valueRuns = valueRunsState[0]; var setValueRuns = valueRunsState[1];
    var everyRunsRef = useRef(0);

    useEffect(function () { setEmptyRuns(function (n) { return n + 1; }); }, []);
    useEffect(function () { setValueRuns(function (n) { return n + 1; }); }, [value]);
    useEffect(function () { everyRunsRef.current += 1; });

    // derived value
    var upper = value.toUpperCase();

    return h(
      "div",
      { className: "effect-demo" },
      h("div", { className: "field-stack" },
        h("label", { className: "field-label", htmlFor: "lab-value" }, "Watched value"),
        h("input", { className: "field-input", id: "lab-value", type: "text", value: value,
          onChange: function (e) { setValue(e.target.value); } })),
      h("div", { className: "btn-row" },
        h("button", { type: "button", className: "btn", onClick: function () { setRenders(function (n) { return n + 1; }); } }, "Trigger re-render")),
      h("div", { className: "effect-meter" },
        h(Meter, { value: emptyRuns, label: "[] runs" }),
        h(Meter, { value: valueRuns, label: "[value] runs" }),
        h(Meter, { value: everyRunsRef.current, label: "no array runs" }),
        h(Meter, { value: renders, label: "re-renders" })),
      h("p", { className: "demo-hint" }, "Derived value (computed during render): ", h("strong", null, upper || "\u2014"), ". No extra state, no effect."),
      h("p", { className: "demo-hint" }, "The [] and [value] counters update on their own. The no-array counter increments after every render, so click Trigger re-render to refresh it \u2014 that lag is exactly why running an effect on every render is usually a bug."),
      h("p", { className: "demo-hint" }, "Memory leak prevention: clear intervals/timeouts in the cleanup. Race conditions: abort stale fetches with AbortController. Infinite loops: never put a state setter's value in its own dependency array without a guard.")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Sprint Quiz — 12 questions                                         */
  /* ------------------------------------------------------------------ */
  var sprintQuestions = [
    { q: "When does useEffect run relative to rendering?", o: ["Before render", "During render", "After the paint", "Only on unmount"], a: 2, r: "Effects run after React has painted the screen, which is why they are the right place for timers, storage and requests." },
    { q: "What does an empty dependency array [] mean?", o: ["The effect never runs", "It runs once after mount", "It runs on every render", "It runs only on unmount"], a: 1, r: "With nothing to watch, React runs the effect once after the first paint and not again." },
    { q: "What does [count] in the dependency array mean?", o: ["Run only on mount", "Run whenever count changes", "Run on every render", "Run only when count is zero"], a: 1, r: "React re-runs the effect whenever a listed value changes between renders." },
    { q: "How do you clean up a setInterval created in an effect?", o: ["Call clearInterval in the component body", "Return a function that calls clearInterval", "Use useEffect twice", "It cleans up automatically"], a: 1, r: "The effect returns a cleanup function; React calls it before the next run and on unmount." },
    { q: "Where should an async fetch live?", o: ["In the component body", "Inside the effect callback", "In a setInterval", "In the dependency array"], a: 1, r: "Put the async work inside the effect so it runs after paint and can be cancelled by cleanup." },
    { q: "What is AbortController used for in effects?", o: ["To speed up requests", "To cancel stale requests and avoid race conditions", "To retry failed requests", "To cache responses"], a: 1, r: "Aborting the previous request prevents a slow, stale response from overwriting a newer one." },
    { q: "What happens if you omit the dependency array entirely?", o: ["The effect runs once", "The effect never runs", "The effect runs after every render", "React throws an error"], a: 2, r: "No array means React cannot skip runs, so the effect runs after every render." },
    { q: "Why must every value the effect reads be in the dependency array?", o: ["For performance", "To avoid stale closures", "To enable cleanup", "It is optional"], a: 1, r: "Missing a value can make the effect use an old value from a previous render." },
    { q: "Can you call hooks conditionally or inside loops?", o: ["Yes, always", "Only in development", "No, hooks must be called at the top level", "Only inside effects"], a: 2, r: "Hooks rely on call order; conditional calls break that order." },
    { q: "When does the cleanup function run?", o: ["Only on unmount", "Before the next effect run and on unmount", "After the next render", "Never automatically"], a: 1, r: "Cleanup runs before re-running the effect and when the component unmounts." },
    { q: "Where should a value that can be calculated from state be computed?", o: ["In useState", "In useEffect", "During render", "In a ref"], a: 2, r: "Derive it during render. Storing it in state or an effect creates a second source of truth." },
    { q: "What is a race condition in an effect?", o: ["Two effects run at once", "A slow response overwrites a newer one", "An infinite loop", "A memory leak"], a: 1, r: "When an older request resolves after a newer one, it can overwrite the correct data." }
  ];

  function SprintQuiz() {
    var idxState = useState(0); var idx = idxState[0]; var setIdx = idxState[1];
    var scoreState = useState(0); var score = scoreState[0]; var setScore = scoreState[1];
    var chosenState = useState(null); var chosen = chosenState[0]; var setChosen = chosenState[1];
    var doneState = useState(false); var done = doneState[0]; var setDone = doneState[1];

    var q = sprintQuestions[idx];

    function pick(i) {
      if (chosen !== null) return;
      setChosen(i);
      if (i === q.a) setScore(function (n) { return n + 1; });
    }

    function next() {
      if (idx + 1 >= sprintQuestions.length) { setDone(true); return; }
      setIdx(function (n) { return n + 1; });
      setChosen(null);
    }

    function restart() {
      setIdx(0); setScore(0); setChosen(null); setDone(false);
    }

    if (done) {
      return h(
        "div",
        { className: "effect-demo" },
        h("p", { className: "quiz-q" }, "Finished. Score: ", h("strong", null, score + " / " + sprintQuestions.length)),
        h("div", { className: "btn-row" },
          h("button", { type: "button", className: "btn btn-primary", onClick: restart }, "Try again"))
      );
    }

    return h(
      "div",
      { className: "effect-demo" },
      h("p", { className: "quiz-q" }, (idx + 1) + ". " + q.q),
      h("ul", { className: "quiz-options" },
        q.o.map(function (opt, i) {
          var cls = "quiz-option";
          if (chosen !== null) {
            if (i === q.a) cls += " quiz-option--correct";
            else if (i === chosen) cls += " quiz-option--wrong";
          }
          return h("li", { key: i },
            h("button", { type: "button", className: cls, disabled: chosen !== null, onClick: function () { pick(i); } }, opt));
        })),
      chosen !== null ? h("div", { className: "quiz-feedback" },
        h("p", { className: chosen === q.a ? "quiz-ok" : "quiz-bad" }, chosen === q.a ? "Correct" : "Not quite"),
        h("p", { className: "quiz-reason" }, q.r)) : null,
      chosen !== null ? h("div", { className: "btn-row" },
        h("button", { type: "button", className: "btn btn-primary", onClick: next },
          idx + 1 >= sprintQuestions.length ? "See score" : "Next question")) : null
    );
  }

  mount("mount-effect", MountEffect);
  mount("watch-value", WatchValue);
  mount("clock-cleanup", ClockCleanup);
  mount("stored-preference", StoredPreference);
  mount("weather-dashboard", WeatherDashboard);
  mount("github-lookup", GithubLookup);
  mount("title-sync-unmount", TitleSyncUnmount);
  mount("json-user", JsonUser);
  mount("stopwatch", Stopwatch);
  mount("lifecycle-lab", LifecycleLab);
  mount("sprint-quiz", SprintQuiz);
})();
