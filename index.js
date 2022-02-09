const express = require('express');
const app = express()
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const History = require('./models/history')
const Product = require('./models/product');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
var bodyParser = require("body-parser");
const Brand = require('./models/brand');
const User = require('./models/user');
const Joi = require('joi');
const {productSchema} = require('./Schema/Schema')
const {isLoggedIn} = require('./middleware/isLoggedIn');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/Apperror')
const { render } = require('ejs');
const { required } = require('joi');
const brand = require('./models/brand');
const PATH = 3000;
const productsHistory = []

mongoose.connect("mongodb://localhost:27017/makeover");

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('database connected')
})

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: "thisshouldbearealsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success')[0];
  res.locals.error = req.flash("error")[0];
  next();
})

// const validateProduct = app.use((req, res, next)=> {
//    const { error } = productSchema.validate(req.body);
//    if (error) {
//      const msg = error.details.map((err) => err.message).join(",");
//      throw new AppError(msg, 400);
//    }else{
//      next()
//    }
// })


app.get('/home',isLoggedIn, (req, res)=> {
     res.render('product/index')
})

app.get('/addnewproduct', isLoggedIn,(req, res)=> {
 res.render('product/addnewproduct')
})

app.post("/addnewproduct", isLoggedIn, catchAsync(async(req, res, next) => { 
  
    const { name, quantity, price } = req.body;
    let brand = req.body.brand.toLowerCase()
    let product = new Product({ name, brand, quantity, price });
    await product.save();
       product.author = req.user._id;
       let existingBrand = await Brand.findOne({ name: brand });
       if (existingBrand && existingBrand.name === brand) {
         existingBrand.product.push(product);
         existingBrand.save();
       } else {
         let brandName = new Brand({ name: brand });
         brandName.product.push(product);
         brandName.save();
       }
       req.flash("success", "product created success fully");
       
       res.redirect("/inventory");
    
  
  
}));

app.get('/inventory', isLoggedIn, catchAsync(async(req,res)=>{
    const brands = await Brand.find({});
    res.render('product/inventory', {brands})
}))

app.get('/history', isLoggedIn,async (req, res)=>{
   
  res.render('product/history')
})

app.get("/sell", isLoggedIn, catchAsync(async (req, res) => {
  const product = await Product.find({});
  const brand  =  await Brand.find({});
  res.render("product/sell", {product, brand});
}));

app.post('/sell', isLoggedIn, catchAsync(async(req, res)=>{
  const {name, brand, price, quantity, total} = req.body; 
  const product = await Product.findOne({name, brand});
  const updateProduct = await Product.findOneAndUpdate({
    name, brand},{
    quantity: product.quantity - req.body.quantity,
  },{new:true});
  
  res.redirect('/sell')
}));

app.get('/getHistory', async(req, res)=>{
  const history = await History.find({});
  res.render('product/history', {history})
})

app.post('/history', async(req, res)=>{
  const {cartTotal, itemsSold} = req.body;
  const history = new History({
    cartTotal:cartTotal,
  })
await history.save()
const items = JSON.parse(itemsSold)
const updateHistory = await History.findByIdAndUpdate(
    { _id: history.id },
    {
      $push: {
        product: items.map((item) => ({name:item.name, brand:item.brand, price:item.price, quantity:item.quantity})),
      },
    },{new:true}
  );

  console.log(updateHistory)
 
 
})

app.get('/history/:id', async(req, res)=> {
   const history = await History.findById(req.params.id);
   res.render('product/historydetails', {history})
})

app.delete('/inventory/:id', async (req, res)=>{
    const deleteBrand = await Brand.findById(req.params.id)
    await Product.deleteMany({brand:deleteBrand.name})
    await Brand.findByIdAndDelete(req.params.id);
    res.redirect('/inventory')
})

app.get('/inventory/:brand', isLoggedIn, catchAsync(async(req, res)=>{
  const brands = await Brand.findOne({name:req.params.brand})
  .populate({path:'product'});
  res.render('product/branditems', {brands})
}));

app.get('/inventory/:brand/:id/update', isLoggedIn, catchAsync(async(req, res)=>{
  const {id} = req.params;
  const product = await Product.findById(id)
  res.render('product/updateproduct', {product})
}));

app.put("/inventory/:brand/:id/update", isLoggedIn, catchAsync(async(req, res)=>{
    const { id } = req.params;
    const product = await Product.findById(id);
    product.quantity+= Number(req.body.quantity)
    product.save()
    console.log(product)
    req.flash("success", "product restocked");
    res.redirect(`/inventory/${req.params.brand}`)
}));

app.delete('/inventory/:brand/:id', catchAsync(async(req, res)=>{
  const {id, brand} = req.params;
  const product = await Product.findByIdAndDelete(id)
  const brandName = await Brand.findOneAndUpdate({name:brand},{
    $pull:{product:id}
    
  },{new:true})
  console.log(brandName)
  res.redirect(`/inventory/${brand}`);

}))

app.get('/signup',(req, res)=>{
  res.render('authentication/signupform')
});

app.post('/signup', catchAsync(async(req, res)=>{
  try{
     const {username, email, employeeType, password} = req.body;
  console.log(req.body)
  const user = new User({email, username, employeeType});
  const registeredUser = await User.register(user, password);
  req.login(registeredUser, err=>{
    if(err) console.log(err)
     req.flash("success", "signedup successfully");
     res.redirect("/home");
  })
  }catch(e){
    req.flash('error', e.message)
    res.redirect('/login')
  }
 
}))

app.get('/login', async(req, res)=> {
  res.render("authentication/login");
})

app.post("/login", passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}), (req, res)=>{
  req.flash('success', 'welcome back');
  res.redirect('/home')
});

app.get('/logout',(req, res)=>{
  req.logout();
  req.flash("success", "logged out successfully");
  res.redirect('/login')
})

app.use('*', (req, res, next)=>{
  next(new AppError('Page Not Found', 404))
})

app.use((err, req, res, next)=>{
    next(err)
  
})

app.use((err, req, res, next)=> {
  const {status = 500} = err;
  if(!err.message) err.message = 'Oh No Something Went Wrong'
  res.status(status).render('error', {err})
})


app.listen(PATH, ()=>{
    console.log(`SERVER IS LIVE ON PORT ${PATH}`)
})