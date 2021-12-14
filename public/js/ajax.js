$(document).ready(function(){
      
    $('.checkout').click(function(){  
      const allProduct = []  ;
      let total = 0;
          
         $(".total").each((index, value) => {
           total = value.innerText;
           value.innerText = 0;
         });

          $(".items").each((item, value) => {
            let name = value.children[0].firstElementChild.innerText;
            let brand = value.children[1].firstElementChild.innerText;
            let price = parseInt(value.children[2].firstElementChild.innerText);
            let quantity = parseInt(value.lastElementChild.value);

            allProduct.push({name, brand, price, quantity})
          });

          console.log(allProduct)

       
         
   

        $('.items').each((item, value)=>{
            let name = value.children[0].firstElementChild.innerText;
            let brand = value.children[1].firstElementChild.innerText;
            let price = parseInt(value.children[2].firstElementChild.innerText);
            let quantity = parseInt(value.lastElementChild.value);
            $.post('/sell',
        {
            name,
            brand,
            price,
            quantity,
        }
       ,
        function(data, status){
           // console.log(data)
        } 
        )
        })

           $.post(
             "/history",
             {
               itemsSold: JSON.stringify(allProduct),
               cartTotal: total,
             },
             function (data, status) {
               // console.log(data)
             }
           );
          
     
          

          $(".list-items").each((index, value) => {
            value.innerHTML = "";
          });
        
        
    })
})