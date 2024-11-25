const apiPath = "lifaa";

// sweet alert
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

document.addEventListener('DOMContentLoaded', function () {
  productInit();
  cartsInit();
});

// loadingSpinner
const loadingSpinner = document.querySelector(".spinner");
const loadingSpinnerOn = () => {
  loadingSpinner.style.display = "flex";
};
const loadingSpinnerOff = () => {
  loadingSpinner.style.display = "none";
};

// productInit
const productInit = () => {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`)
    .then(function (response) {
      productFilter(response.data.products);
      productsRender(response.data.products);
    })
    .catch(function (error) {
      Swal.fire({
        text: error.message,
        icon: "error"
      });
    })
};


// productsRender
const productWrap = document.querySelector(".productWrap");
const productsRender = (data) => {
  let str = "";
  data.forEach((item) => {
    str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="">
        <a href="#" data-id="${item.id}" class="addCartBtn">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price.toLocaleString()}</del>
        <p class="nowPrice">NT$${item.price.toLocaleString()}</p>
      </li>`
  });
  productWrap.innerHTML = str;
  const cartAddBtn = document.querySelectorAll(".addCartBtn");
  cartAddBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      qtyCheck(e.target.dataset.id);
    });
  });
};

// productFilter
const filter = document.querySelector(".productSelect");
const productFilter = (data) => {
  let category = "";
  filter.addEventListener("change", (e) => {
    category = e.target.value;
    if (category === "全部") {
      productsRender(data);
    } else {
      productsRender(data.filter((item) => item.category === category));
    };
  });
};


// cartsInit
const cartsInit = () => {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(function (response) {
      cartsRender(response.data.carts, response.data.finalTotal);
    })
    .catch(function (error) {
      Swal.fire({
        text: error.message,
        icon: "error"
      });
    })
};

// cartsRender
const shoppingCartsTable = document.querySelector(".shoppingCart-table")
const cartsRender = (data, total) => {
  let str = "";
  data.forEach((item) => {
    str += `<tr> 
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="">
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$${item.product.price.toLocaleString()}</td>
        <td>${item.quantity}</td>
        <td>NT$${((item.product.price) * (item.quantity)).toLocaleString()}</td>
        <td class="discardBtn">
          <a href="#" data-id="${item.id}" class="material-icons">
            clear
          </a>
        </td>
        </tr>`
  });
  if (data.length === 0) {
    shoppingCartsTable.innerHTML = `<tr>購物車是空的，趕緊去選購！！</tr>`
  } else {
    const cartsHeader = `<tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
  </tr>`;
    const cartsFooter = `<tr>
    <td>
      <a href="#" class="discardAllBtn">刪除所有品項</a>
    </td>
    <td></td>
    <td></td>
    <td>
      <p>總金額</p>
    </td>
    <td>NT$${total.toLocaleString()}</td>
  </tr>`;
    shoppingCartsTable.innerHTML = cartsHeader + str + cartsFooter;
    deleteCartBtnListener();
    deleteItemBtnListener();
  };
};

// deleteCartBtnListener
const deleteCartBtnListener = () => {
  const deleteCartBtn = document.querySelector(".discardAllBtn");
  deleteCartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deleteCart();
  });
};

// deleteItemBtnListener
const deleteItemBtnListener = () => {
  const deleteItemBtn = document.querySelectorAll(".material-icons");
  deleteItemBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      deleteItem(e.target.dataset.id);
    });
  });
};

// qtyCheck
const qtyCheck = (id) => {
  loadingSpinnerOn();
  let qty = 1;
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(function (response) {
      if (response.data.carts.length != 0) {
        response.data.carts.forEach((item) => {
          if (item.product.id === id) {
            qty = (item.quantity) + 1;
          };
        });
      };
      addCartItem(id, qty);
    })
    .catch(function (error) {
      Swal.fire({
        text: error.message,
        icon: "error"
      });
    })
}

// addCartItem
const addCartItem = (id, qty) => {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`, {
    data: {
      productId: id,
      quantity: qty
    }
  })
    .then(function (response) {
      cartsRender(response.data.carts, response.data.finalTotal);
      Toast.fire({
        text: "已成功加入購物車",
        icon: "success"
      });
      loadingSpinnerOff();
    })
    .catch(function (error) {
      Swal.fire({
        text: error.message,
        icon: "error"
      });
    })
};



// deleteItem
const deleteItem = (id) => {
  loadingSpinnerOn();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${id}`)
    .then(function (response) {
      cartsRender(response.data.carts, response.data.finalTotal);
      Toast.fire({
        text: "已成功刪除",
        icon: "success"
      });
      loadingSpinnerOff();
    })
    .catch(function (error) {
      Swal.fire({
        text: error.message,
        icon: "error"
      });
    })
}

// deleteCart
const deleteCart = () => {
  Swal.fire({
    title: "確定要刪除所有品項嗎",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確認",
    cancelButtonText: "取消"
  }).then((result) => {
    if (result.isConfirmed) {
      loadingSpinnerOn();
      axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
        .then(function (response) {
          cartsRender(response.data.carts, response.data.finalTotal);
          Toast.fire({
            text: "已刪除所有品項",
            icon: "success"
          });
          loadingSpinnerOff();
        })
        .catch(function (error) {
          Swal.fire({
            text: error.message,
            icon: "error"
          });
        })
    };
  });
};

// sendOrderListener
const orderForm = document.querySelector(".orderInfo-form")
const orderFormInput = document.querySelectorAll(".orderInfo-form input,.orderInfo-input");
const sendBtn = document.querySelector(".orderInfo-btn")

sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (formCheck()) {
    return;
  };
  sendOrder();
});

// formCheck
const formCheck = () => {
  const constraints = {
    "姓名": {
      presence: {
        message: "^必填"
      }
    },
    "電話": {
      presence: {
        message: "^必填"
      },
      length: {
        minimum: 9,
        message: "^電話格式不正確"
      }
    },
    "Email": {
      presence: {
        message: "^必填"
      },
      email: {
        message: "^請輸入有效的 Email"
      }
    },
    "寄送地址": {
      presence: {
        message: "^必填"
      },
      length: {
        minimum: 10,
        message: "^地址格式不正確"
      }
    }
  };
  const content = validate(orderForm, constraints);
  const errorText = document.querySelectorAll(`[data-message`);
  errorText.forEach((item) => item.textContent = "");
  if (content) {
    const arr = Object.keys(content);
    arr.forEach((item) => {
      formErrorRender(item, content);
    });
  };
  return content;
};

// formErrorRender
const formErrorRender = (item, content) => {
  const errorText = document.querySelector(`[data-message="${item}"]`);
  errorText.textContent = content[item][0];
};

// sendOrder
const sendOrder = () => {
  loadingSpinnerOn();
  let user = {};
  orderFormInput.forEach((item) => {
    user[item.id] = item.value;
  });
  let data = {};
  data.user = user;
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`, { data })
    .then(function (response) {
      Swal.fire({
        text: "已成功送出訂單",
        icon: "success"
      });
      cartsInit();
      orderForm.reset();
      loadingSpinnerOff();
    })
    .catch(function (error) {
      Swal.fire({
        text: error.response.data.message,
        icon: "error"
      });
    })
};

