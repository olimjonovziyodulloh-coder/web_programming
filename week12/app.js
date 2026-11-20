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
  var useMemo = React.useMemo;
  var useRef = React.useRef;

  function mount(name, Component) {
    var node = document.querySelector('[data-demo="' + name + '"]');
    if (node) {
      ReactDOM.createRoot(node).render(h(Component));
    }
  }

  /* 01 — a plain variable never tells React to re-render */
  function CounterBug() {
    var logRef = useRef(null);
    var count = 0; // lives in this render only

    function handleClick() {
      count = count + 1;
      if (logRef.current) {
        var item = document.createElement("li");
        item.textContent = count;
        logRef.current.appendChild(item);
      }
    }

    return h(
      "div",
      { className: "counter-bug" },
      h("p", { className: "bug-count" }, "Count: ", count),
      h(
        "div",
        { className: "btn-row" },
        h(
          "button",
          { type: "button", className: "btn btn-primary", onClick: handleClick },
          "+1 (plain variable)"
        )
      ),
      h(
        "p",
        { className: "bug-note" },
        "The log grows on every click, but without a setter React never re-renders \u2014 the count above stays at 0."
      ),
      h("ul", {
        className: "bug-log",
        ref: logRef,
        "aria-label": "Values logged by the click handler"
      })
    );
  }

  /* 02 — useState with functional updates */
  function CounterState() {
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
              setCount(function (prev) {
                return prev - 1;
              });
            }
          },
          "\u22121"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: function () {
              setCount(function (prev) {
                return prev + 1;
              });
            }
          },
          "+1"
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
      ),
      h(
        "p",
        { className: "bug-note" },
        "Functional updates read the latest value, so quick clicks all count."
      )
    );
  }

  /* 03 — one useState per independent field */
  function UserForm() {
    var nameState = useState("");
    var name = nameState[0];
    var setName = nameState[1];

    var emailState = useState("");
    var email = emailState[0];
    var setEmail = emailState[1];

    var ageState = useState("");
    var age = ageState[0];
    var setAge = ageState[1];

    var submittedState = useState(false);
    var submitted = submittedState[0];
    var setSubmitted = submittedState[1];

    function handleSubmit(event) {
      event.preventDefault();
      setSubmitted(true);
    }

    if (submitted) {
      return h(
        "div",
        { className: "field-stack" },
        h(
          "p",
          { className: "form-message", role: "status" },
          "Thanks, ",
          h("strong", null, name.trim() || "friend"),
          "! Email: ",
          email.trim() || "\u2014",
          age.trim() ? ", age " + age.trim() : "",
          "."
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn",
            onClick: function () {
              setSubmitted(false);
            }
          },
          "Edit details"
        )
      );
    }

    return h(
      "form",
      { className: "field-stack", onSubmit: handleSubmit },
      h("label", { className: "field-label", htmlFor: "user-name" }, "Name"),
      h("input", {
        className: "field-input",
        id: "user-name",
        type: "text",
        placeholder: "Kim",
        value: name,
        onChange: function (event) {
          setName(event.target.value);
        }
      }),
      h("label", { className: "field-label", htmlFor: "user-email" }, "Email"),
      h("input", {
        className: "field-input",
        id: "user-email",
        type: "email",
        placeholder: "kim@uni.kr",
        value: email,
        onChange: function (event) {
          setEmail(event.target.value);
        }
      }),
      h("label", { className: "field-label", htmlFor: "user-age" }, "Age"),
      h("input", {
        className: "field-input",
        id: "user-age",
        type: "number",
        min: 1,
        max: 120,
        placeholder: "21",
        value: age,
        onChange: function (event) {
          setAge(event.target.value);
        }
      }),
      h(
        "button",
        { className: "btn btn-primary", type: "submit", disabled: !name.trim() },
        "Submit"
      )
    );
  }

  /* 04 — one object, updated with the spread operator */
  function ProfileForm() {
    var userState = useState({ name: "", email: "", bio: "" });
    var user = userState[0];
    var setUser = userState[1];

    function handleChange(field, value) {
      setUser(function (prev) {
        var next = { name: prev.name, email: prev.email, bio: prev.bio };
        next[field] = value;
        return next;
      });
    }

    return h(
      "div",
      { className: "field-stack" },
      h("label", { className: "field-label", htmlFor: "profile-name" }, "Name"),
      h("input", {
        className: "field-input",
        id: "profile-name",
        type: "text",
        placeholder: "Kim Minho",
        value: user.name,
        onChange: function (event) {
          handleChange("name", event.target.value);
        }
      }),
      h("label", { className: "field-label", htmlFor: "profile-email" }, "Email"),
      h("input", {
        className: "field-input",
        id: "profile-email",
        type: "email",
        placeholder: "kim@uni.kr",
        value: user.email,
        onChange: function (event) {
          handleChange("email", event.target.value);
        }
      }),
      h("label", { className: "field-label", htmlFor: "profile-bio" }, "Bio"),
      h("textarea", {
        className: "field-area",
        id: "profile-bio",
        rows: 3,
        placeholder: "A short bio",
        value: user.bio,
        onChange: function (event) {
          handleChange("bio", event.target.value);
        }
      }),
      h(
        "p",
        { className: "preview", "aria-live": "polite" },
        h("strong", null, user.name.trim() || "No name yet"),
        user.email.trim() ? " \u00b7 " + user.email.trim() : "",
        user.bio.trim() ? " \u00b7 " + user.bio.trim() : ""
      )
    );
  }

  /* 05 — arrays: add with spread, remove with filter, toggle with map */
  function TodoList() {
    var todosState = useState([]);
    var todos = todosState[0];
    var setTodos = todosState[1];

    var inputState = useState("");
    var input = inputState[0];
    var setInput = inputState[1];

    function addTodo(event) {
      event.preventDefault();
      var text = input.trim();
      if (!text) {
        return;
      }

      setTodos(function (prev) {
        return prev.concat({
          id: Date.now(),
          text: text,
          done: false
        });
      });
      setInput("");
    }

    function removeTodo(id) {
      setTodos(function (prev) {
        return prev.filter(function (todo) {
          return todo.id !== id;
        });
      });
    }

    function toggleTodo(id) {
      setTodos(function (prev) {
        return prev.map(function (todo) {
          return todo.id === id
            ? { id: todo.id, text: todo.text, done: !todo.done }
            : todo;
        });
      });
    }

    return h(
      "div",
      null,
      h(
        "form",
        { className: "task-form", onSubmit: addTodo },
        h(
          "label",
          { className: "visually-hidden", htmlFor: "todo-input" },
          "New to-do"
        ),
        h("input", {
          className: "field-input",
          id: "todo-input",
          type: "text",
          placeholder: "Add a to-do",
          value: input,
          onChange: function (event) {
            setInput(event.target.value);
          }
        }),
        h(
          "button",
          {
            className: "btn btn-primary",
            type: "submit",
            disabled: !input.trim()
          },
          "Add"
        )
      ),
      todos.length === 0
        ? h("p", { className: "empty" }, "No to-dos yet. Add one above.")
        : h(
            "ul",
            { className: "todo-list" },
            todos.map(function (todo) {
              return h(
                "li",
                { key: todo.id, className: "todo-row" },
                h(
                  "label",
                  { className: "todo-check" },
                  h("input", {
                    type: "checkbox",
                    checked: todo.done,
                    onChange: function () {
                      toggleTodo(todo.id);
                    }
                  }),
                  h(
                    "span",
                    { className: todo.done ? "task-done" : "" },
                    todo.text
                  )
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "remove-btn",
                    "aria-label": "Remove " + todo.text,
                    onClick: function () {
                      removeTodo(todo.id);
                    }
                  },
                  "Remove"
                )
              );
            })
          )
    );
  }

  /* 06 — lifting state up to the nearest common parent */
  var fruits = [
    "Apple",
    "Apricot",
    "Banana",
    "Blueberry",
    "Cherry",
    "Grape",
    "Kiwi",
    "Lemon",
    "Mango",
    "Orange",
    "Peach",
    "Pear",
    "Plum",
    "Strawberry"
  ];

  function SearchBar(props) {
    var inputState = useState("");
    var input = inputState[0];
    var setInput = inputState[1];

    return h(
      "div",
      { className: "field-stack" },
      h("label", { className: "field-label", htmlFor: "search-input" }, "Search fruit"),
      h("input", {
        className: "field-input",
        id: "search-input",
        type: "search",
        placeholder: "Try \u201cberry\u201d",
        value: input,
        onChange: function (event) {
          setInput(event.target.value);
          props.onSearch(event.target.value);
        }
      })
    );
  }

  function ResultList(props) {
    var query = props.query.trim().toLowerCase();
    var results = fruits.filter(function (fruit) {
      return fruit.toLowerCase().indexOf(query) !== -1;
    });

    return h(
      "div",
      null,
      h(
        "p",
        { className: "result-count", "aria-live": "polite" },
        results.length,
        results.length === 1 ? " result" : " results",
        query ? ' for "' + props.query.trim() + '"' : ""
      ),
      results.length
        ? h(
            "ul",
            { className: "fruit-list" },
            results.map(function (fruit) {
              return h("li", { key: fruit }, fruit);
            })
          )
        : h("p", { className: "empty" }, "No fruit matches that search.")
    );
  }

  function SearchPage() {
    var queryState = useState("");
    var query = queryState[0];
    var setQuery = queryState[1];

    return h(
      "div",
      { className: "search-demo" },
      h(SearchBar, { onSearch: setQuery }),
      h(ResultList, { query: query })
    );
  }

  /* 07 — code challenge: counter with history */
  function CounterWithHistory() {
    var statePair = useState({ count: 0, history: [0] });
    var state = statePair[0];
    var setState = statePair[1];

    var count = state.count;
    var history = state.history;

    function change(delta) {
      setState(function (prev) {
        var next = prev.count + delta;
        return {
          count: next,
          history: prev.history.concat(next).slice(-5)
        };
      });
    }

    function reset() {
      setState(function (prev) {
        return {
          count: 0,
          history: prev.history.concat(0).slice(-5)
        };
      });
    }

    function undo() {
      setState(function (prev) {
        if (prev.history.length < 2) {
          return prev;
        }
        var history = prev.history.slice(0, -1);
        return {
          count: history[history.length - 1],
          history: history
        };
      });
    }

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
              change(-1);
            }
          },
          "\u22121"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: function () {
              change(1);
            }
          },
          "+1"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn",
            onClick: reset
          },
          "Reset"
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn",
            disabled: history.length < 2,
            onClick: undo
          },
          "Undo"
        )
      ),
      h(
        "div",
        { className: "history-block" },
        h("p", { className: "field-label" }, "History (last five)"),
        h(
          "ul",
          { className: "history", "aria-label": "Count history" },
          history.map(function (value, index) {
            return h("li", { key: index }, value);
          })
        )
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Homework — interactive shopping cart                                   */
  /* ---------------------------------------------------------------------- */

  var MAX_QTY = 9;

  var products = [
    {
      id: 1,
      name: "Field Tote",
      price: 26,
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85"
    },
    {
      id: 2,
      name: "Studio Headphones",
      price: 89,
      category: "Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85"
    },
    {
      id: 3,
      name: "Ceramic Mug",
      price: 19,
      category: "Home",
      image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=85"
    },
    {
      id: 4,
      name: "Field Watch",
      price: 124,
      category: "Wearables",
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=85"
    },
    {
      id: 5,
      name: "Task Lamp",
      price: 52,
      category: "Workspace",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85"
    },
    {
      id: 6,
      name: "Desk Notebook",
      price: 16,
      category: "Stationery",
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=85"
    }
  ];

  function formatPrice(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  /* Task 1 — one card per product, all rendered from the array. */
  function ProductCard(props) {
    var product = props.product;
    var onAdd = props.onAdd;

    return h(
      "article",
      { className: "product-card" },
      h(
        "div",
        { className: "product-media" },
        h("img", { src: product.image, alt: "", loading: "lazy" })
      ),
      h(
        "div",
        { className: "product-body" },
        h("p", { className: "product-cat" }, product.category),
        h("h4", { className: "product-name" }, product.name),
        h(
          "div",
          { className: "product-foot" },
          h("span", { className: "product-price" }, formatPrice(product.price)),
          h(
            "button",
            {
              type: "button",
              className: "btn btn-primary btn-sm",
              onClick: function () {
                onAdd(product);
              },
              "aria-label": "Add " + product.name + " to cart"
            },
            "Add"
          )
        )
      )
    );
  }

  function ProductList(props) {
    return h(
      "div",
      { className: "product-grid" },
      props.products.map(function (product) {
        return h(ProductCard, {
          key: product.id,
          product: product,
          onAdd: props.onAdd
        });
      })
    );
  }

  /* Task 2 and 4 — quantity controls and remove inside each cart row. */
  function CartItem(props) {
    var item = props.item;

    return h(
      "li",
      { className: "cart-item" },
      h("img", { className: "cart-thumb", src: item.image, alt: "" }),
      h(
        "div",
        { className: "cart-item-copy" },
        h("h4", { className: "cart-item-name" }, item.name),
        h("p", { className: "cart-item-price" }, formatPrice(item.price)),
        h(
          "div",
          {
            className: "qty",
            role: "group",
            "aria-label": "Quantity for " + item.name
          },
          h(
            "button",
            {
              type: "button",
              className: "qty-btn",
              onClick: function () {
                props.onQuantity(item.id, -1);
              },
              "aria-label": "Decrease " + item.name + " quantity"
            },
            "\u2212"
          ),
          h("output", { "aria-live": "polite" }, item.quantity),
          h(
            "button",
            {
              type: "button",
              className: "qty-btn",
              disabled: item.quantity >= MAX_QTY,
              onClick: function () {
                props.onQuantity(item.id, 1);
              },
              "aria-label":
                item.quantity >= MAX_QTY
                  ? "Maximum quantity for " + item.name
                  : "Increase " + item.name + " quantity"
            },
            "+"
          )
        )
      ),
      h(
        "button",
        {
          type: "button",
          className: "cart-remove",
          onClick: function () {
            props.onRemove(item.id);
          },
          "aria-label": "Remove " + item.name + " from cart"
        },
        "\u00d7"
      )
    );
  }

  /* Task 3 — totals are derived from the cart on every render. */
  function CartSidebar(props) {
    var items = props.items;
    var lastOrder = props.lastOrder;

    var count = useMemo(
      function () {
        return items.reduce(function (sum, item) {
          return sum + item.quantity;
        }, 0);
      },
      [items]
    );

    var subtotal = useMemo(
      function () {
        return items.reduce(function (sum, item) {
          return sum + item.price * item.quantity;
        }, 0);
      },
      [items]
    );

    return h(
      "aside",
      { className: "cart", "aria-labelledby": "cart-title" },
      h(
        "div",
        { className: "cart-head" },
        h(
          "div",
          null,
          h("p", { className: "eyebrow" }, "Your selection"),
          h(
            "h3",
            { id: "cart-title" },
            "Cart ",
            h(
              "span",
              { className: "cart-count", "aria-live": "polite" },
              count
            )
          )
        ),
        items.length > 0
          ? h(
              "button",
              {
                type: "button",
                className: "btn-text",
                onClick: props.onClear
              },
              "Clear"
            )
          : null
      ),

      items.length === 0
        ? h(
            "div",
            { className: "cart-empty" },
            h("span", { className: "cart-empty-mark", "aria-hidden": "true" }, "\u25cb"),
            h("p", null, "Your cart is empty."),
            h("small", null, "Add something from the collection.")
          )
        : h(
            "ul",
            { className: "cart-items", "aria-label": "Items in your cart" },
            items.map(function (item) {
              return h(CartItem, {
                key: item.id,
                item: item,
                onQuantity: props.onQuantity,
                onRemove: props.onRemove
              });
            })
          ),

      h(
        "div",
        { className: "cart-summary" },
        h(
          "div",
          { className: "subtotal-row" },
          h("span", null, "Subtotal"),
          h(
            "strong",
            { "aria-live": "polite" },
            formatPrice(subtotal)
          )
        ),
        h("p", { className: "cart-hint" }, "Shipping is calculated at checkout."),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary checkout",
            disabled: items.length === 0,
            onClick: function () {
              props.onCheckout({ count: count, total: subtotal });
            }
          },
          "Checkout"
        )
      ),

      lastOrder
        ? h(
            "p",
            { className: "order-note", role: "status" },
            "Order confirmed: ",
            h("strong", null, lastOrder.count),
            lastOrder.count === 1 ? " item" : " items",
            " \u00b7 ",
            h("strong", null, formatPrice(lastOrder.total)),
            ". Add something new to start another order."
          )
        : null
    );
  }

  /* Task 5 — the composite component owns all cart state. */
  function ShoppingCart() {
    var cartState = useState([]);
    var cart = cartState[0];
    var setCart = cartState[1];

    var orderState = useState(null);
    var lastOrder = orderState[0];
    var setLastOrder = orderState[1];

    function addToCart(product) {
      setLastOrder(null);
      setCart(function (current) {
        var existing = current.filter(function (item) {
          return item.id === product.id;
        })[0];

        if (existing) {
          return current.map(function (item) {
            return item.id === product.id
              ? {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  category: item.category,
                  image: item.image,
                  quantity: Math.min(item.quantity + 1, MAX_QTY)
                }
              : item;
          });
        }

        return current.concat({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
          quantity: 1
        });
      });
    }

    function changeQuantity(id, amount) {
      setCart(function (current) {
        return current
          .map(function (item) {
            return item.id === id
              ? {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  category: item.category,
                  image: item.image,
                  quantity: Math.min(item.quantity + amount, MAX_QTY)
                }
              : item;
          })
          .filter(function (item) {
            return item.quantity > 0;
          });
      });
    }

    function removeFromCart(id) {
      setCart(function (current) {
        return current.filter(function (item) {
          return item.id !== id;
        });
      });
    }

    function clearCart() {
      setCart([]);
      setLastOrder(null);
    }

    function checkout(order) {
      setCart([]);
      setLastOrder(order);
    }

    return h(
      "div",
      { className: "shop" },
      h(
        "section",
        { className: "catalog", "aria-labelledby": "catalog-title" },
        h(
          "div",
          { className: "catalog-head" },
          h(
            "div",
            null,
            h("p", { className: "eyebrow" }, "Week 12 \u00b7 React state"),
            h("h3", { id: "catalog-title" }, "Six pieces for the desk")
          ),
          h("p", { className: "catalog-count" }, products.length + " products")
        ),
        h(ProductList, { products: products, onAdd: addToCart })
      ),
      h(CartSidebar, {
        items: cart,
        lastOrder: lastOrder,
        onQuantity: changeQuantity,
        onRemove: removeFromCart,
        onClear: clearCart,
        onCheckout: checkout
      })
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Quizzes from the lecture (interactive demos)                          */
  /* ---------------------------------------------------------------------- */

  var quizzes = [
    {
      id: "quiz-01",
      title: "Quiz 1 · State vs Props",
      question: "Which statement most accurately distinguishes state from props in React?",
      options: [
        "A. Props are mutable by the child; state is immutable and passed down.",
        "B. State is received from a parent; props are a component's private memory.",
        "C. Props are read-only inputs from a parent; state is component-owned data whose setter schedules a re-render.",
        "D. A local variable declared with let persists across renders like state.",
        "E. State can only hold numbers and strings."
      ],
      answer: 2,
      reason: "Ownership is the decisive criterion: a parent supplies props, while the component itself owns state and updates it only through the setter, which triggers a re-render."
    },
    {
      id: "quiz-02",
      title: "Quiz 2 · The useState Return Value",
      question: "What does the call useState(0) return?",
      options: [
        "A. The number 0",
        "B. An object { value, setValue }",
        "C. An array: [currentValue, setterFunction]",
        "D. Only a setter function",
        "E. A Promise that resolves to the state"
      ],
      answer: 2,
      reason: "React returns an array, not an object. Position gives each element its meaning: first the current state value, second the function that schedules an update."
    },
    {
      id: "quiz-03",
      title: "Quiz 3 · Rules of Hooks",
      question: "Which of the following violates the Rules of Hooks?",
      options: [
        "A. const [n, setN] = useState(0); // top of component",
        'B. if (open) { const [t, setT] = useState(""); }',
        "C. function useCounter() { useState(0); ... }",
        "D. Two useState calls, one after the other, at the top",
        "E. An arrow-function component calling useState at its top"
      ],
      answer: 1,
      reason: "React matches Hook calls by their order on each render. A conditional call alters that order, so later Hooks receive the wrong state."
    },
    {
      id: "quiz-04",
      title: "Quiz 4 · Stale State and Batching",
      question: "A handler runs setCount(count + 1) three times in a row, and count is 0 in the current render. What is count after the update?",
      options: [
        "A. 0",
        "B. 1",
        "C. 2",
        "D. 3",
        "E. It depends on timing (a race condition)"
      ],
      answer: 1,
      reason: "Within one render, count is a constant snapshot (0). All three calls enqueue the value 1 and React batches them, so the final state is 1. Use setCount(prev => prev + 1) to get 3."
    },
    {
      id: "quiz-05",
      title: "Quiz 5 · Designing State Variables",
      question: "A form has three independent fields: name, email and subscribed (a boolean). Which design best follows the guidance of this lecture?",
      options: [
        "A. Three separate useState calls, one per field",
        "B. One useState holding all fields, always, for performance",
        "C. A module-level variable shared by the component",
        "D. useState called inside a loop over the field names",
        "E. Props, because the user can edit them by typing"
      ],
      answer: 0,
      reason: "Independent values with independent update logic are clearest as separate state variables; each setter changes only its own piece, with no spread needed."
    },
    {
      id: "quiz-06",
      title: "Quiz 6 · Immutable Updates to Arrays",
      question: "Which statement adds an item x to the array state todos without mutating it, so that React re-renders?",
      options: [
        "A. todos.push(x); setTodos(todos);",
        "B. setTodos(todos.push(x));",
        "C. setTodos(prev => [...prev, x]);",
        "D. todos.unshift(x); setTodos(todos);",
        "E. setTodos(prev => { prev.push(x); return prev; });"
      ],
      answer: 2,
      reason: "The spread creates a new array holding the old items plus x. The new reference triggers a re-render, and the updater reads the latest state."
    },
    {
      id: "quiz-07",
      title: "Quiz 7 · Sharing State Between Siblings",
      question: "Sibling components A and B must display and edit the same value. Which design is idiomatic in React?",
      options: [
        "A. Keep a copy in each sibling and synchronise them manually",
        "B. Lift the state to the nearest common parent; pass the value down as props and the setter as a callback",
        "C. Let A call B's internal state setter directly",
        "D. Store the value in a global mutable variable",
        "E. Pass the value as a prop and let A modify its own props"
      ],
      answer: 1,
      reason: "One owner holds the state (single source of truth); data flows down through props and events flow up through callbacks."
    }
  ];

  function Quiz(props) {
    var quiz = props.quiz;
    var selectedState = useState(null);
    var selected = selectedState[0];
    var setSelected = selectedState[1];

    var revealedState = useState(false);
    var revealed = revealedState[0];
    var setRevealed = revealedState[1];

    function choose(index) {
      if (revealed) return;
      setSelected(index);
      setRevealed(true);
    }

    function reset() {
      setSelected(null);
      setRevealed(false);
    }

    return h(
      "div",
      { className: "quiz" },
      h("p", { className: "quiz-q" }, quiz.question),
      h(
        "ul",
        { className: "quiz-options", role: "list" },
        quiz.options.map(function (option, index) {
          var isCorrect = index === quiz.answer;
          var isSelected = index === selected;
          var className = "quiz-option";
          if (revealed) {
            if (isCorrect) className += " quiz-option--correct";
            else if (isSelected) className += " quiz-option--wrong";
          }
          return h(
            "li",
            { key: index },
            h(
              "button",
              {
                type: "button",
                className: className,
                disabled: revealed,
                onClick: function () {
                  choose(index);
                }
              },
              option
            )
          );
        })
      ),
      revealed
        ? h(
            "div",
            { className: "quiz-feedback", role: "status" },
            h(
              "p",
              { className: selected === quiz.answer ? "quiz-ok" : "quiz-bad" },
              selected === quiz.answer ? "Correct." : "Incorrect."
            ),
            h("p", { className: "quiz-reason" }, quiz.reason),
            h(
              "button",
              { type: "button", className: "btn btn-text", onClick: reset },
              "Try again"
            )
          )
        : h("p", { className: "quiz-hint" }, "Pick an option to check your answer.")
    );
  }

  function QuizList() {
    return h(
      "div",
      { className: "quiz-grid" },
      quizzes.map(function (quiz) {
        return h(Quiz, { key: quiz.id, quiz: quiz });
      })
    );
  }

  mount("counter-bug", CounterBug);
  mount("counter-state", CounterState);
  mount("user-form", UserForm);
  mount("profile-form", ProfileForm);
  mount("todo-list", TodoList);
  mount("search-page", SearchPage);
  mount("counter-history", CounterWithHistory);
  mount("shop", ShoppingCart);
  mount("quizzes", QuizList);
})();
