(function () {
  "use strict";

  var root = document.getElementById("shop-root");
  if (!root) {
    return;
  }

  if (!window.React || !window.ReactDOM) {
    root.innerHTML =
      '<p class="demo-fallback">This shop needs JavaScript to run. The component code is below.</p>';
    return;
  }

  var h = React.createElement;
  var useState = React.useState;
  var useMemo = React.useMemo;

  var MAX_QTY = 9;

  /* Line-art product images, drawn inline so the page needs no image files. */
  function icon(inner) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<g fill="none" stroke="#b8924f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
      inner +
      "</g></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  var products = [
    {
      id: 1,
      name: "Field Tote",
      price: 26,
      category: "Accessories",
      image: icon(
        '<path d="M120 120H280L266 270H134Z"/>' +
          '<path d="M165 120V96a35 35 0 0 1 70 0v24"/>'
      )
    },
    {
      id: 2,
      name: "Studio Headphones",
      price: 89,
      category: "Audio",
      image: icon(
        '<path d="M118 190v-18a82 82 0 0 1 164 0v18"/>' +
          '<rect x="100" y="182" width="38" height="68" rx="12"/>' +
          '<rect x="262" y="182" width="38" height="68" rx="12"/>'
      )
    },
    {
      id: 3,
      name: "Ceramic Mug",
      price: 19,
      category: "Home",
      image: icon(
        '<path d="M128 128h124v108a34 34 0 0 1-34 34h-56a34 34 0 0 1-34-34Z"/>' +
          '<path d="M252 158h22a28 28 0 0 1 0 56h-22"/>' +
          '<path d="M172 96q10-14 0-28M206 96q10-14 0-28"/>'
      )
    },
    {
      id: 4,
      name: "Field Watch",
      price: 124,
      category: "Wearables",
      image: icon(
        '<circle cx="200" cy="150" r="54"/>' +
          '<path d="M178 102l6-36h32l6 36M178 198l6 36h32l6-36"/>' +
          '<path d="M200 150v-30M200 150l22 14"/>'
      )
    },
    {
      id: 5,
      name: "Task Lamp",
      price: 52,
      category: "Workspace",
      image: icon(
        '<path d="M148 128h104l34 72H114Z"/>' +
          '<path d="M200 200v52M156 252h88"/>'
      )
    },
    {
      id: 6,
      name: "Desk Notebook",
      price: 16,
      category: "Stationery",
      image: icon(
        '<rect x="128" y="96" width="144" height="168" rx="10"/>' +
          '<path d="M160 96v168"/>' +
          '<path d="M186 140h56M186 170h56M186 200h40"/>'
      )
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

  ReactDOM.createRoot(root).render(h(ShoppingCart));
})();
