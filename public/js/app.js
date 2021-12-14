const products = [...product];
let key = '';


function findMatch(wordstomatch, items){
    return items.filter(item => {
        const regex = new RegExp(wordstomatch, 'gi')
        return item.name.match(regex) || item.brand.match(regex);
    })
}

function displayMatches(){
    if(!this.value){
        suggestions.classList.add('close')
    }else{
         suggestions.classList.remove("close");
        const matchArray = findMatch(this.value, products);
        const key = matchArray
          .map((product) => {
              console.log(typeof product.quantity)
            return `
        <div class="productList"> 
        <p>Product: <span>${product.name}</span></p>
        <p>Brand: <span>${product.brand}</span></p>
        <p>Price: Ghc <span class="price">${product.price}</span></p>
        </div>
        `;
          })
          .join("");
        const findProduct = document.querySelectorAll(".productList");
        return (suggestions.innerHTML = key);
    }
    
}

function displayCartAction(prod){
let div = document.createElement('div');
div.classList.add('items')
let key = prod
div.innerHTML =
  key + `
   <label for="quantity">quantity</label>
   <input class="quantity" id="quantity" type="number" min="1" name="quatity" value="1">
  `;
  const productForDiv = div.children[0].firstElementChild.innerText;
  const brandForDiv = div.children[1].firstElementChild.innerText;
  const productList = document.querySelectorAll(".items");
  if(productList.length){
     productList.forEach((product) => {
       let productForCart = product.children[0].firstElementChild.innerText;
       let brandForCart = product.children[1].firstElementChild.innerText;
       if (productForDiv === productForCart && brandForDiv === brandForCart) {
         alert("item already exist in cart");
       }else{
           cart.appendChild(div);
           getTotal();
       }
     });
  }else{
    cart.appendChild(div);
    getTotal()
  }
 searchBox.value = ''


}

const searchBox = document.querySelector('#findproduct');
const suggestions = document.querySelector('.suggestions');
const cart = document.querySelector('.list-items');
const getQuantity = document.querySelector('#quantity');
const totalElem = document.querySelector('.total');


searchBox.addEventListener('keyup', displayMatches)
suggestions.addEventListener('click', (e)=>{
    if (!e.target.classList.value || e.target.classList.value === 'price') {
      displayCartAction(e.target.parentElement.innerHTML);
      suggestions.classList.add("close");
    } else {
      displayCartAction(e.target.innerHTML);
      suggestions.classList.add("close"); 
    }   
})

function getTotal() {
  let total = 0;
  const productList = document.querySelectorAll(".items");
  for (let i = 0; i < productList.length; i++) {
    let price = parseInt(
      productList[i].childNodes[5].firstElementChild.innerText
    );
    let quantity = parseInt(productList[i].childNodes[9].value);
    total = total + price * quantity;
  }
  totalElem.innerHTML= total;
}


cart.addEventListener('change', getTotal)

