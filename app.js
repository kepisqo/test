const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const csurf = require('csurf');

app.set('view engine', 'pug');
app.set('views', './views');

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/shop');
const accountRoutes = require('./routes/account');

const errorController = require('./controllers/errors');
const sequelize = require('./utility/database');

const Category = require('./models/category');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

var store = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '123ssk06',
	database: 'node-app',
	schema: {
		tableName: 'custom_sessions_table_name',
		columnNames: {
			session_id: 'custom_session_id',
			expires: 'custom_expires_column_name',
			data: 'custom_data_column_name'
		}
	}
};

var mysqlDbStore = new MySQLStore(store);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    },
    store: mysqlDbStore
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    console.log(req.session.user);
    User.findByPk(req.session.user.id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => { console.log(err) });
   
});

app.use(csurf());
// routes
app.use('/admin', adminRoutes);
app.use(userRoutes);
app.use(accountRoutes);

app.use(errorController.get404Page);

Product.belongsTo(Category, { foreignKey: { allowNull: false } });
Category.hasMany(Product);

Product.belongsTo(User);
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize.sync();
// let _user;
// sequelize
//     //.sync({ force: true })
//     .sync()
//     .then(() => {

//         User.findByPk(1)
//             .then(user => {
//                 if (!user) {
//                     return User.create({ name: 'sadikturan', email: 'email@gmail.com' });
//                 }
//                 return user;
//             }).then(user => {
//                 _user = user;
//                 return user.getCart();
//             }).then(cart => {
//                 if (!cart) {
//                     return _user.createCart();
//                 }
//                 return cart;
//             }).then(() => {
//                 Category.count()
//                     .then(count => {
//                         if (count === 0) {
//                             Category.bulkCreate([
//                                 { name: 'Telefon', description: 'telefon kategorisi' },
//                                 { name: 'Bilgisayar', description: 'bilgisayar kategorisi' },
//                                 { name: 'Elektronik', description: 'elektronik kategorisi' }
//                             ]);
//                         }
//                     });
//             });
//     })
//     .catch(err => {
//         console.log(err);
//     });

app.listen(3000, () => {
    console.log('listening on port 3000');
});
