const API = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`;
let orderData = [];
const orderList = document.querySelector('.js-orderList');

function init(){
    getOrderList();
}
init()
//C3圖表LV_1
function renderC3(){
    
    //物件資料收集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category]==undefined){
                total[productItem.category] = productItem.price*productItem.quantity;
              }else{
                total[productItem.category] += productItem.price * productItem.quantity;
              }
        })
    })
  
  // 做出資料關聯
  let categoryAry = Object.keys(total);
  let newData = [];
  categoryAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);})
    
    //C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData
        },
    });
}
//C3圖表LV_2
function renderC3_lv2(){
    //資料蒐集
    let obj = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productsItem){
            if(obj[productsItem.title] === undefined){
                obj[productsItem.title] = productsItem.quantity * productsItem.price;
            }else{
                obj[productsItem.title] += productsItem.quantity * productsItem.price;
            }
        })
    });
    console.log(obj);

    // 拉出資料關聯
    let originAry = Object.keys(obj);
    console.log(originAry);
    //整理成 C3 格式
    let rankSortAry = [];

    originAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary)
    })
    rankSortAry.sort(function(a,b){
        return b[1] - a[1];
    })
    //筆數超過4筆統整為其它
    if(rankSortAry.length>3){
        let otherTotal = 0;
        rankSortAry.forEach(function(item,index){
            if(index>2){
                otherTotal += rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3,rankSortAry.length-1);
        rankSortAry.push(["其他",otherTotal]);
    }
    c3.generate({
        bindto: '#chart',
        data: {
          columns: rankSortAry,
          type: 'pie',
        },
        color: {
          pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
        }
      });
    }
//產品列表
function getOrderList(){
    axios.get(`${API}/orders`,{
        headers:{
            'authorization':token,
        }
    })
    .then(function(response){
        orderData = response.data.orders;
        let str = '';
        orderData.forEach(function(item){
            //組時間字串
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

            //組產品字串
            let productStr = "";
            item.products.forEach(function(productItem){
            productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
            })

            //判斷訂單處理狀態
            let orderStatus = "";
            if(item.paid ==true){
                orderStatus = "已處理"
            }else{
                orderStatus = "未處理"
            }

            //組訂單字串
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
            <td>${orderTime}</td>
            <td class="js-orderStatus">
            <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除" ">
            </td>
            </tr>` 
        })
        orderList.innerHTML = str;
        renderC3_lv2();
    })
}
//監聽刪除
orderList.addEventListener("click",function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id")
    if(targetClass == "delSingleOrder-Btn js-orderDelete"){
        deletOrderItem(id)
        return;
    }

    if(targetClass == "orderStatus"){
        let status = e.target.getAttribute("data-status");
        changeOrderStatus(status,id)
        return;
    }
})

//修改訂單狀態
function changeOrderStatus(status,id){
    let newStatus;
    if(status == true){
        newStatus = false;
    }else{
        newStatus=true;
    }
    axios.put(`${API}/orders`,{
        "data": {
            "id": id,
            "paid": newStatus
          }
    },{
        headers:{
            'authorization':token,
        }
    })

    .then(function(reponse){
        Swal.fire({
            position: "top",
            icon: "success",
            title: "修改訂單成功",
            showConfirmButton: false,
            timer: 1500
          });
        getOrderList()
    })
}

//刪除訂單
function deletOrderItem(id){
    
    axios.delete(`${API}/orders/${id}`,{
        headers:{
            'authorization':token,
        }
    })
    
    .then(function(response){
        Swal.fire({
            position: "top",
            icon: "success",
            title: "刪除成功",
            showConfirmButton: false,
            timer: 1500
          });
        getOrderList();

    })

}

//全部刪除訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`${API}/orders/`,{
        headers:{
            'authorization':token,
        }
    })
    .then(function(response){
        Swal.fire({
            position: "top",
            icon: "success",
            title: "刪除全部訂單成功",
            showConfirmButton: false,
            timer: 1500
          });

        getOrderList();

    })

})