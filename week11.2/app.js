(function () {
  "use strict";

  if (!window.React || !window.ReactDOM) {
    document.querySelectorAll("[data-demo]").forEach(function (node) {
      node.textContent = "This demo could not load React. The component code is below.";
    });
    return;
  }

  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  function mount(name, Component) {
    var node = document.querySelector('[data-demo="' + name + '"]');
    if (node) {
      ReactDOM.createRoot(node).render(h(Component));
    }
  }

  /* E1 — counter with functional updates */
  function Counter() {
    var countState = useState(0);
    var count = countState[0];
    var setCount = countState[1];

    return h(
      "div",
      { className: "counter" },
      h("output", { className: "counter-value", "aria-live": "polite" }, count),
      h(
        "div",
        { className: "btn-row" },
        h(
          "button",
          {
            type: "button",
            className: "btn",
            onClick: function () {
              setCount(function (value) {
                return value - 1;
              });
            }
          },
          "Decrease"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: function () {
              setCount(function (value) {
                return value + 1;
              });
            }
          },
          "Add one"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn-text",
            onClick: function () {
              setCount(0);
            }
          },
          "Reset"
        )
      )
    );
  }

  /* E2 — controlled input with a live preview */
  function NamePreview() {
    var nameState = useState("");
    var name = nameState[0];
    var setName = nameState[1];

    return h(
      "div",
      { className: "field-stack" },
      h("label", { className: "field-label", htmlFor: "preview-name" }, "Your name"),
      h("input", {
        className: "field-input",
        id: "preview-name",
        type: "text",
        maxLength: 40,
        placeholder: "Type a name",
        value: name,
        onChange: function (event) {
          setName(event.target.value);
        }
      }),
      h(
        "p",
        { className: "preview", "aria-live": "polite" },
        "Hello, ",
        h("strong", null, name.trim() || "there"),
        "!"
      )
    );
  }

  /* E3 — add and remove list items */
  var initialTasks = [
    { id: 1, title: "Review component props" },
    { id: 2, title: "Practice state updates" },
    { id: 3, title: "Build something small" }
  ];

  function TaskList() {
    var tasksState = useState(initialTasks);
    var tasks = tasksState[0];
    var setTasks = tasksState[1];

    var draftState = useState("");
    var draft = draftState[0];
    var setDraft = draftState[1];

    var nextId = useRef(4);

    function addTask(event) {
      event.preventDefault();
      var title = draft.trim();
      if (!title) {
        return;
      }

      var id = nextId.current;
      nextId.current = id + 1;

      setTasks(function (current) {
        return current.concat({ id: id, title: title });
      });
      setDraft("");
    }

    function removeTask(id) {
      setTasks(function (current) {
        return current.filter(function (task) {
          return task.id !== id;
        });
      });
    }

    return h(
      "div",
      null,
      h(
        "form",
        { className: "task-form", onSubmit: addTask },
        h("label", { className: "visually-hidden", htmlFor: "new-task" }, "New task"),
        h("input", {
          className: "field-input",
          id: "new-task",
          type: "text",
          placeholder: "Add a practice task",
          value: draft,
          onChange: function (event) {
            setDraft(event.target.value);
          }
        }),
        h(
          "button",
          { className: "btn btn-primary", type: "submit", disabled: !draft.trim() },
          "Add"
        )
      ),
      tasks.length > 0
        ? h(
            "ul",
            { className: "task-list" },
            tasks.map(function (task) {
              return h(
                "li",
                { key: task.id, className: "task-item" },
                h("span", null, task.title),
                h(
                  "button",
                  {
                    type: "button",
                    className: "remove-btn",
                    "aria-label": "Remove " + task.title,
                    onClick: function () {
                      removeTask(task.id);
                    }
                  },
                  "Remove"
                )
              );
            })
          )
        : h("p", { className: "empty" }, "No tasks yet. Add one to get started.")
    );
  }

  /* E4 — show and hide content */
  function ToggleDetails() {
    var openState = useState(false);
    var open = openState[0];
    var setOpen = openState[1];

    return h(
      "div",
      null,
      h(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          "aria-expanded": open,
          "aria-controls": "extra-details",
          onClick: function () {
            setOpen(function (value) {
              return !value;
            });
          }
        },
        open ? "Hide details" : "Show details"
      ),
      h(
        "div",
        { id: "extra-details", hidden: !open },
        open
          ? h(
              "p",
              { className: "details-panel" },
              "State lets React update just the part of the page that changed, without reloading anything."
            )
          : null
      )
    );
  }

  /* E5 — complete and filter tasks */
  var initialCompleted = [
    { id: 1, title: "Read the React lesson", completed: true },
    { id: 2, title: "Try the counter", completed: false },
    { id: 3, title: "Update the task list", completed: false }
  ];

  function CompletedTasks() {
    var tasksState = useState(initialCompleted);
    var tasks = tasksState[0];
    var setTasks = tasksState[1];

    var filterState = useState("all");
    var filter = filterState[0];
    var setFilter = filterState[1];

    function toggleTask(id) {
      setTasks(function (current) {
        return current.map(function (task) {
          return task.id === id
            ? { id: task.id, title: task.title, completed: !task.completed }
            : task;
        });
      });
    }

    function clearCompleted() {
      setTasks(function (current) {
        return current.filter(function (task) {
          return !task.completed;
        });
      });
    }

    var visible = tasks.filter(function (task) {
      if (filter === "active") {
        return !task.completed;
      }
      if (filter === "done") {
        return task.completed;
      }
      return true;
    });

    var filters = [
      ["all", "All"],
      ["active", "Active"],
      ["done", "Done"]
    ];

    return h(
      "div",
      null,
      h(
        "div",
        { className: "chip-row", role: "group", "aria-label": "Filter tasks" },
        filters.map(function (pair) {
          return h(
            "button",
            {
              key: pair[0],
              type: "button",
              className: "chip",
              "aria-pressed": filter === pair[0],
              onClick: function () {
                setFilter(pair[0]);
              }
            },
            pair[1]
          );
        })
      ),
      h(
        "ul",
        { className: "check-list" },
        visible.map(function (task) {
          return h(
            "li",
            { key: task.id },
            h(
              "label",
              null,
              h("input", {
                type: "checkbox",
                checked: task.completed,
                onChange: function () {
                  toggleTask(task.id);
                }
              }),
              h("span", { className: task.completed ? "task-done" : "" }, task.title)
            )
          );
        })
      ),
      visible.length === 0
        ? h("p", { className: "empty" }, "No tasks match this filter.")
        : null,
      h(
        "button",
        {
          type: "button",
          className: "btn-text",
          onClick: clearCompleted,
          disabled: !tasks.some(function (task) {
            return task.completed;
          })
        },
        "Clear completed"
      )
    );
  }

  /* E6 — validate a controlled form */
  function ProfileForm() {
    var profileState = useState({ name: "", email: "" });
    var profile = profileState[0];
    var setProfile = profileState[1];

    var messageState = useState("");
    var message = messageState[0];
    var setMessage = messageState[1];

    function updateField(event) {
      var field = event.target.name;
      var value = event.target.value;

      setProfile(function (current) {
        var next = { name: current.name, email: current.email };
        next[field] = value;
        return next;
      });
    }

    function saveProfile(event) {
      event.preventDefault();

      if (!profile.name.trim() || !profile.email.trim()) {
        setMessage("Add both a name and an email.");
        return;
      }

      if (profile.email.indexOf("@") === -1) {
        setMessage("The email needs an @ sign.");
        return;
      }

      setMessage("Saved " + profile.name.trim() + "'s profile.");
    }

    return h(
      "form",
      { className: "field-stack", onSubmit: saveProfile, noValidate: true },
      h("label", { className: "field-label", htmlFor: "profile-name" }, "Name"),
      h("input", {
        className: "field-input",
        id: "profile-name",
        name: "name",
        type: "text",
        placeholder: "Your name",
        value: profile.name,
        onChange: updateField
      }),
      h("label", { className: "field-label", htmlFor: "profile-email" }, "Email"),
      h("input", {
        className: "field-input",
        id: "profile-email",
        name: "email",
        type: "email",
        placeholder: "you@example.com",
        value: profile.email,
        onChange: updateField
      }),
      h(
        "button",
        { className: "btn btn-primary", type: "submit" },
        "Save profile"
      ),
      message
        ? h("p", { className: "form-message", role: "status" }, message)
        : null
    );
  }

  /* E7 — save a note with useEffect */
  function SavedNote() {
    var noteState = useState(function () {
      try {
        return localStorage.getItem("week11-note") || "";
      } catch (error) {
        return "";
      }
    });
    var note = noteState[0];
    var setNote = noteState[1];

    useEffect(
      function () {
        try {
          localStorage.setItem("week11-note", note);
        } catch (error) {
          /* storage can be unavailable in private mode */
        }
      },
      [note]
    );

    return h(
      "div",
      { className: "field-stack" },
      h("label", { className: "field-label", htmlFor: "note-input" }, "Quick note"),
      h("textarea", {
        className: "field-area",
        id: "note-input",
        rows: 4,
        placeholder: "Type something...",
        value: note,
        onChange: function (event) {
          setNote(event.target.value);
        }
      }),
      h(
        "div",
        { className: "note-foot" },
        h(
          "p",
          { className: "note-status", "aria-live": "polite" },
          note ? "Saved in this browser" : "Nothing saved yet"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn-text",
            onClick: function () {
              setNote("");
            },
            disabled: !note
          },
          "Clear"
        )
      )
    );
  }

  mount("counter", Counter);
  mount("name-preview", NamePreview);
  mount("task-list", TaskList);
  mount("toggle-details", ToggleDetails);
  mount("completed-tasks", CompletedTasks);
  mount("profile-form", ProfileForm);
  mount("saved-note", SavedNote);
})();
