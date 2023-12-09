const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const API = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`

let productData = [];
let cartData = [];


function init(){
    getPrductList();
    getCartList();

}

init()
//商品列表axios資料
function getPrductList(){
    axios.get(`${API}/products`)
    .then(function(response){
        productData = response.data.products;
        renderProductList()
    })
}
//組合HTML商品列表內容
function combineProductTHMLItem(item){
    return`<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src=${item.images}>
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price) }</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`
}
//商品列表forEach
function renderProductList(){
    let str = "";
    productData.forEach(function(item){
            
        str += combineProductTHMLItem(item);
    }) 
    productList.innerHTML = str;

          
}
// 商品分類監聽
productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if(category=="全部"){
        renderProduceList();
        return;
    }
// 函式消除重複
    let str = "";
    productData.forEach(function(item){
        if(item.category ==category){
            str += combineProductTHMLItem(item)
        }

    })
    productList.innerHTML = str;
})
//購物車監聽
productList.addEventListener('click',function(e){
    e.preventDefault()
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass !== "addCardBtn"){
        return;
    }
    let productId=e.target.getAttribute("data-id");

    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity+=1;
        }
    })
    axios.post(`${API}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
          }

    }).then(function(response){
        Swal.fire({
            position: "top",
            icon: "success",
            title: "已加入購物車",
            showConfirmButton: false,
            timer: 1500
          });
        getCartList()
    })
});

//購物車列表
function getCartList(){
    axios.get(`${API}/carts`)
    .then(function(response){
        document.querySelector(".js-total").textContent =toThousands(response.data.finalTotal);
        cartData = response.data.carts;
        let str ="";
        cartData.forEach(function(item){
            str +=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}" data-title="${item.product.title}">
                    clear
                </a>
            </td>
        </tr>` 
        });
        
        cartList.innerHTML = str;
    })
    
}
//刪除單筆購物車
cartList.addEventListener("click",function(e){
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    const cartTitle = e.target.getAttribute("data-title");
    if(cartId == null){
        return;
    }
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });
      swalWithBootstrapButtons.fire({
        title: "確定要刪除嗎?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        reverseButtons: true
      })
      .then((result) => {
        if (result.isConfirmed) 
        {
          swalWithBootstrapButtons.fire({
            title: "已刪除成功",
            icon: "success"
          });
          axios.delete(`${API}/carts/${cartId}`)
            .then(function(response){
            getCartList()
        })
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire({
            title: "已取消刪除",
            icon: "error"
          });
        }
      });
    
})
//刪除全部購物車
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click",function(e){
    e.preventDefault()
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });
      swalWithBootstrapButtons.fire({
        title: "確定要刪除嗎?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        reverseButtons: true
      })
      .then((result) => {
        if (result.isConfirmed) 
        {
            axios.delete(`${API}/carts/`)
            .then(function(response){
            getCartList()
        })
          swalWithBootstrapButtons.fire({
            title: "已刪除成功",
            icon: "success"
          });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire({
            title: "已取消刪除",
            icon: "error"
          });
        }
      });}
)

//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    if(cartData.length == 0){
        Swal.fire({
            icon: "warning",
            title: "購物車是空的喔!",
          });
        return;
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const customertradeWay = document.querySelector("#tradeWay").value;

    if (customerName==""|| customerPhone==""|| customerEmail==""|| customerAddress==""|| customertradeWay==""){
        Swal.fire({
            icon: "warning",
            title: "請確認訂單資料已全部填寫",
          });
        return;
    }
    if(validateEmail(customerEmail) == false){
        Swal.fire({
            icon: "warning",
            title: "信箱格式錯誤!",
          });
        return
    };
    if(validatePhone(customerPhone) == false){
        Swal.fire({
            icon: "warning",
            title: "手機號碼格式錯誤!",
            text: "EX.0900111222",
          });
        return
    };
    axios.post(`${API}/orders`,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": customertradeWay
            }
          }
    }).then(function(response){
        Swal.fire({
            icon: "success",
            title: "訂單建立成功",
            showConfirmButton: false,
            timer: 1500
          });
        document.querySelector("#customerName").value = "";
        document.querySelector("#customerPhone").value = "";
        document.querySelector("#customerEmail").value = "";
        document.querySelector("#customerAddress").value = "";
        document.querySelector("#tradeWay").value = "ATM";
        getCartList();
    })
})
const customerEmail = document.querySelector("#customerEmail");
customerEmail.addEventListener("blur",function(e){
    if(validateEmail(customerEmail.value) == false){
        document.querySelector(`[data-message="Email"]`).textContent = "請填寫正確 Email 格式";
        return;
    }
})

// util js、元件
//千分位
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");}
//信箱驗證
function validateEmail(mail) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
    return true
  }
  return false;
}
//號碼驗證
function validatePhone(phone) {
  if (/^[09]{2}\d{8}$/.test(phone)) {
    return true
  }
  return false;
}