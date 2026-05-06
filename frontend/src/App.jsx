import './App.css';

import { useMemo } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './views/store/home'; 
import MainWrapper from './layouts/MainWrapper'; 
import Login from './views/auth/Login';
import PrivateRoute from './layouts/PrivateRoute';
import Logout from './views/auth/Logout';
import Private from './views/auth/Private';
import Register from './views/auth/Register';
import StoreHeader from './views/base/StoreHeader';
import StoreFooter from './views/base/StoreFooter';
import ProductDetail from './views/store/ProductDetail';
import Cart from './views/store/Cart';
import Checkout from './views/store/Checkout';
import PaymentSuccess from './views/store/PaymentSuccess';
import Invoice from './views/store/Invoice';
import Account from './views/customer/Account';
import Orders from './views/customer/Orders';
import OrderDetail from './views/customer/OrderDetail';
import Wishlist from './views/customer/Wishlist';
import Notifications from './views/customer/Notifications';
import Settings from './views/customer/Settings';
import { CartContext } from './views/plugin/Context';
import UserData from './views/plugin/UserData';
import CartID from './views/plugin/CartID';
import apiInstance from './utils/axios';
import Dashboard from './views/vendor/Dashboard';
import Products from './views/vendor/Products';
import AddProduct from './views/vendor/AddProduct';
import UpdateProduct from './views/vendor/UpdateProduct';
import VendorOrders from './views/vendor/Orders';
import VendorOrderDetail from './views/vendor/OrderDetail';
import Earning from './views/vendor/Earning';
import Reviews from './views/vendor/Reviews';
import ReviewDetail from './views/vendor/ReviewDetail';
import Coupon from './views/vendor/Coupon';
import EditCoupon from './views/vendor/EditCoupon';
import VendorNotifications from './views/vendor/Notifications';
import VendorSettings from './views/vendor/Settings';
import Shop from './views/vendor/Shop';
import Search from './views/store/Search';
import ForgotPassword from './views/auth/ForgotPassword';
import CreatePassword from './views/auth/CreatePassword';
import VendorRegister from './views/vendor/VendorRegister';
import OrderItemDetail from './views/vendor/OrderItemDetail';



function App() { // Define the main 'App' component.
    const [cartCount, setCartCount] = useState()
    const userData = UserData()
    let cart_id = CartID()
    const axios = apiInstance

    const cartContextValue = useMemo(() => {
        return [cartCount, setCartCount];
    }, [cartCount]);


    useEffect(() => {
        const url = userData?.user_id 
            ? `cart-list/${cart_id}/${userData?.user_id}/` 
            : `cart-list/${cart_id}/`;

        axios.get(url).then((res) => {
            setCartCount(res.data.length)
        });
    }, [userData, cart_id]);

    return (
        <CartContext.Provider value={cartContextValue} >
            <BrowserRouter>

                <StoreHeader />
                <MainWrapper>
                    <Routes>
                        <Route
                            path="/private"
                            element={ 
                                <PrivateRoute>
                                    <Private />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/" element={<Home />} />
                        {/* Authentication Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/create-new-password" element={<CreatePassword />} />

                        {/* Store Routes */}
                        <Route path="/detail/:slug" element={<ProductDetail />} />
                        <Route path="/cart/" element={<Cart />} />
                        <Route path="/checkout/:order_oid" element={<Checkout />} />
                        <Route path="/payment-success/:order_oid/" element={<PaymentSuccess />} />
                        <Route path="/invoice/:order_oid/" element={<Invoice />} />
                        <Route path="/search" element={<Search />} />

                        {/* Customer Routes */}
                        <Route path="/customer/account/" element={<PrivateRoute><Account /></PrivateRoute>} />
                        <Route path="/customer/orders/" element={<PrivateRoute><Orders /></PrivateRoute>} />
                        <Route path="/customer/order/detail/:order_oid/" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
                        <Route path="/customer/wishlist/" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                        <Route path="/customer/notifications/" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                        <Route path="/customer/settings/" element={<PrivateRoute><Settings /></PrivateRoute>} />

                        {/* Vendor Routes */}
                        <Route path="/vendor/dashboard/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/vendor/products/" element={<PrivateRoute> <Products /></PrivateRoute>} />
                        <Route path="/vendor/product/new/" element={<PrivateRoute> <AddProduct /></PrivateRoute>} />
                        <Route path="/vendor/product/update/:pid/" element={<PrivateRoute> <UpdateProduct /></PrivateRoute>} />
                        <Route path="/vendor/orders/" element={<PrivateRoute> <VendorOrders /></PrivateRoute>} />
                        <Route path="/vendor/orders/:oid/" element={<PrivateRoute> <VendorOrderDetail /></PrivateRoute>} />
                        <Route path="/vendor/earning/" element={<PrivateRoute> <Earning /></PrivateRoute>} />
                        <Route path="/vendor/reviews/" element={<PrivateRoute> <Reviews /></PrivateRoute>} />
                        <Route path="/vendor/reviews/:id/" element={<PrivateRoute> <ReviewDetail /></PrivateRoute>} />
                        <Route path="/vendor/coupon/" element={<PrivateRoute> <Coupon /></PrivateRoute>} />
                        <Route path="/vendor/coupon/:id/" element={<PrivateRoute> <EditCoupon /></PrivateRoute>} />
                        <Route path="/vendor/notifications/" element={<PrivateRoute> <VendorNotifications /></PrivateRoute>} />
                        <Route path="/vendor/settings/" element={<PrivateRoute> <VendorSettings /></PrivateRoute>} />
                        <Route path="/vendor/:slug/" element={<Shop />} />
                        <Route path="/vendor/register/" element={<VendorRegister />} />
                        <Route path="/vendor/orders/:oid/:id/" element={<OrderItemDetail />} />

                    </Routes>
                </MainWrapper>
                <StoreFooter />
            </BrowserRouter>
        </CartContext.Provider >

    );
}

export default App;
