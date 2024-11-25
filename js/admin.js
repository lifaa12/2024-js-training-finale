const apiPath = "lifaa";
const apiKey = "LOjq3WvuYgMghMJ4az5t1WCcGYW2";

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
  orderInit();
});

// loadingSpinner
const loadingSpinner = document.querySelector(".spinner");
const loadingSpinnerOn = () => {
  loadingSpinner.style.display = "flex";
};
const loadingSpinnerOff = () => {
  loadingSpinner.style.display = "none";
};

// orderInit
const orderInit = () => {
  loadingSpinnerOn();
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, {
    headers: {
      "Authorization": apiKey
    }
  })
    .then(function (response) {
      chartDataProcess(response.data.orders)
      orderRender(response.data.orders);
      loadingSpinnerOff();
    })
    .catch(function (error) {
      Swal.fire({
        text: error.message,
        icon: "error"
      });
    })
};

// orderRender
const orderTable = document.querySelector(".orderPage-table");
const chartWrap = document.querySelector(".chartwrap");
const deleteOrderBtn = document.querySelector(".discardAllBtn");
const orderRender = (data) => {
  const header = `<thead>
          <tr>
            <th>訂單編號</th>
            <th>聯絡人</th>
            <th>聯絡地址</th>
            <th>電子郵件</th>
            <th>訂單品項</th>
            <th>訂單日期</th>
            <th>訂單狀態</th>
            <th>操作</th>
          </tr>
        </thead>`
  let str = "";
  data.forEach((item) => {
    let productStr = "";
    item.products.forEach((item) => {
      productStr += `<p>${item.title}x${item.quantity}組</p>`
    });
    let timeStamp = new Date(item.createdAt * 1000);
    let time = `${timeStamp.getFullYear()}/${timeStamp.getMonth()}/${timeStamp.getDate()}`
    str += `<tr>
          <td>${item.id}</td>
          <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
          </td>
          <td>${item.user.address}</td>
          <td>${item.user.email}</td>
          <td>
            ${productStr}
          </td>
          <td>${time}</td>
          <td class="orderStatus">
            <a href="#" data-id="${item.id}" data-status="${item.paid}" class="statusBtn">${item.paid ? "已處理" : "未處理"}</a>
          </td>
          <td>
            <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
          </td>
        </tr>`
  });
  if (data.length === 0) {
    noOrder();
  } else {
    orderTable.innerHTML = header + str;
    statusBtnListener();
    deleteOrderItemListener();
    deleteOrderListener();
  };
};

// noOrder
const noOrder = () => {
  orderTable.innerHTML = `<p style="text-align:center;font-size:48px">目前沒有訂單</p>`;
  orderTable.style.border = 0;
  chartWrap.style.display = "none";
  deleteOrderBtn.style.display = "none";
};

// statusBtnListener
const statusBtnListener = () => {
  const statusBtn = document.querySelectorAll(".statusBtn");
  statusBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      statusChange(e.target.dataset.id, JSON.parse(e.target.dataset.status))
    });
  });
}

// deleteOrderItemListener
const deleteOrderItemListener = () => {
  const deleteOrderItemBtn = document.querySelectorAll(".delSingleOrder-Btn");
  deleteOrderItemBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      deleteOrderItem(e.target.dataset.id);
    });
  });
};

// deleteOrderListener
const deleteOrderListener = () => {
  deleteOrderBtn.addEventListener("click", deleteOrder);
};

// chartDataProcess
const chartDataProcess = (data) => {
  let obj = {};
  data.forEach((item) => {
    item.products.forEach((item) => {
      if (obj[item.title]) {
        obj[item.title] += item.quantity;
      } else {
        obj[item.title] = item.quantity;
      };
    });
  });
  const arr = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  let idx = 0;
  idx = arr.findIndex((item) => item[1] === 1);
  if (idx > 3) {
    idx = 3;
  };
  const newData = arr.filter((item, index) => index < idx);
  let num = 0;
  arr.filter((item, index) => index > idx - 1).forEach((item) => num += item[1]);
  newData.push(["其他", num]);
  chartRender(newData);
};


//chartRender
const chartRender = (data) => {
  let chart = c3.generate({
    bindto: '#chart',
    data: {
      type: "pie",
      columns: data,
    },
  });
};

// statusChange
const statusChange = (id, status) => {
  loadingSpinnerOn();
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, {
    data: {
      "id": id,
      "paid": !status
    }
  }, {
    headers: {
      "Authorization": apiKey
    }
  })
    .then(function (response) {
      orderRender(response.data.orders);
      Toast.fire({
        text: "訂單狀態已變更",
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

// deleteOrderItem
const deleteOrderItem = (id) => {
  loadingSpinnerOn();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders/${id}`, {
    headers: {
      "Authorization": apiKey
    }
  })
    .then(function (response) {
      chartDataProcess(response.data.orders);
      orderRender(response.data.orders);
      Toast.fire({
        text: "已成功刪除訂單",
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


// deleteOrder
const deleteOrder = () => {
  Swal.fire({
    title: "確定要清除全部訂單嗎",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消"
  }).then((result) => {
    if (result.isConfirmed) {
      loadingSpinnerOn();
      axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, {
        headers: {
          "Authorization": apiKey
        }
      })
        .then(function (response) {
          chartDataProcess(response.data.orders);
          orderRender(response.data.orders);
          Swal.fire({
            text: "已清除全部訂單",
            icon: "success"
          });
          loadingSpinnerOff();
        })
        .catch(function (error) {
          Swal.fire({
            text: error.message,
            icon: "error"
          });
        });
    };
  });
};