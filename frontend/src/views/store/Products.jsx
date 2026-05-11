import { React, useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaShoppingCart, FaSpinner } from 'react-icons/fa';

import apiInstance from '../../utils/axios';
import Addon from '../plugin/Addon';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/CartID';
import { addToCart } from '../plugin/AddToCart';
import { addToWishlist } from '../plugin/AddToWishlist';
import { CartContext } from '../plugin/Context';

function Products() {

    const [featuredProducts, setFeaturedProducts] = useState([])
    const [newArrivals, setNewArrivals] = useState([])
    const [products, setProducts] = useState([])
    const [category, setCategory] = useState([])
    const [brand, setBrand] = useState([])

    let [isAddingToCart, setIsAddingToCart] = useState("Add To Cart");
    const [loadingStates, setLoadingStates] = useState({});
    let [loading, setLoading] = useState(true);

    const axios = apiInstance
    const addon = Addon()
    const currentAddress = GetCurrentAddress()
    const userData = UserData()
    let cart_id = CartID()

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedColors, setSelectedColors] = useState({});
    const [selectedSize, setSelectedSize] = useState({});
    const [colorImage, setColorImage] = useState("")
    const [colorValue, setColorValue] = useState("No Color")
    const [sizeValue, setSizeValue] = useState("No Size")
    const [qtyValue, setQtyValue] = useState(1)
    let [cartCount, setCartCount] = useContext(CartContext);

    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    async function fetchData(endpoint, setDataFunction) {
        try {
            const response = await axios.get(endpoint);
            setDataFunction(response.data);
            if (products) { setLoading(false) }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => { fetchData('products/', setProducts); }, []);
    useEffect(() => { fetchData('featured-products/', setFeaturedProducts); }, []);
    useEffect(() => { fetchData('new-arrivals/', setNewArrivals); }, []);
    useEffect(() => { fetchData('category/', setCategory); }, []);
    useEffect(() => { fetchData('brand/', setBrand); }, []);

    const handleColorButtonClick = (event, product_id, colorName, colorImage) => {
        setColorValue(colorName);
        setColorImage(colorImage);
        setSelectedProduct(product_id);
        setSelectedColors((prev) => ({ ...prev, [product_id]: colorName }));
    };

    const handleSizeButtonClick = (event, product_id, sizeName) => {
        setSizeValue(sizeName);
        setSelectedProduct(product_id);
        setSelectedSize((prev) => ({ ...prev, [product_id]: sizeName }));
    };

    const handleQtyChange = (event, product_id) => {
        setQtyValue(event.target.value);
        setSelectedProduct(product_id);
    };

    const handleAddToCart = async (product_id, price, shipping_amount) => {
        setLoadingStates((prev) => ({ ...prev, [product_id]: 'Adding...' }));
        try {
            await addToCart(product_id, userData?.user_id, qtyValue, price, shipping_amount, currentAddress.country, colorValue, sizeValue, cart_id, setIsAddingToCart)
            setLoadingStates((prev) => ({ ...prev, [product_id]: 'Added to Cart' }));
            setColorValue("No Color");
            setSizeValue("No Size");
            setQtyValue(0);
            const url = userData?.user_id ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`;
            const response = await axios.get(url);
            setCartCount(response.data.length);
        } catch (error) {
            console.log(error);
            setLoadingStates((prev) => ({ ...prev, [product_id]: 'Add to Cart' }));
        }
    };

    const handleAddToWishlist = (product_id) => {
        addToWishlist(product_id, userData?.user_id);
    };

    const AddToCartButton = ({ productId, price, shipping }) => (
        <button
            onClick={() => handleAddToCart(productId, price, shipping)}
            disabled={loadingStates[productId] === 'Adding...'}
            type="button"
            className="btn btn-primary flex-grow-1"
            style={{ fontSize: '0.75rem' }}
        >
            {loadingStates[productId] === 'Added to Cart' ? (
                <>Added <FaCheckCircle /></>
            ) : loadingStates[productId] === 'Adding...' ? (
                <>Adding... <FaSpinner className="fas fa-spin" /></>
            ) : (
                <>{loadingStates[productId] || 'Add to Cart'} <FaShoppingCart /></>
            )}
        </button>
    );

    return (
        <>
            {loading === false && (
                <div>
                    {/* ── Collections Section ── */}
                    <div id="our-collections" className="lc-products-section">
                        <div className="container">
                            <div className="text-center mb-2">
                                <span className="lc-section-label">Explore</span>
                                <h2 className="lc-section-title">Our Collections</h2>
                                <p className="lc-section-subtitle">Discover our latest categories</p>
                            </div>
                            <div className="lc-category-strip">
                                {category.map((c, index) => (
                                    <Link to={`/category/${c.slug}`} className="lc-category-chip" key={index}>
                                        <img src={c.image} alt={c.title} />
                                        <p>{c.title}</p>
                                    </Link>
                                ))}
                            </div>

                            {/* ── Featured Products ── */}
                            <div className="text-center mb-4 mt-2">
                                <span className="lc-section-label">Highlighted</span>
                                <h2 className="lc-section-title">Featured Products</h2>
                                <p className="lc-section-subtitle">A carefully curated selection just for you</p>
                            </div>
                            <div className="row">
                                {currentItems.map((product, index) => (
                                    <div className="col-lg-4 col-md-6 mb-4" key={product.id || index}>
                                        <div className="lc-product-card">
                                            <div className="lc-product-card-img-wrapper">
                                                <Link to={`/detail/${product.slug}`}>
                                                    <img
                                                        src={(selectedProduct === product.id && colorImage) ? colorImage : product.image}
                                                        alt={product.title}
                                                    />
                                                </Link>
                                            </div>
                                            <div className="lc-product-card-body">
                                                <Link to={`/vendor/${product?.vendor?.slug}`} className="lc-product-vendor">
                                                    {product.vendor.name}
                                                </Link>
                                                <Link to={`/detail/${product.slug}`} className="lc-product-title">
                                                    {product.title.slice(0, 40)}
                                                </Link>
                                                <Link to="/" className="lc-product-brand">{product?.brand.title}</Link>
                                                <p className="lc-product-price">${product.price}</p>

                                                {((product.color && product.color.length > 0) || (product.size && product.size.length > 0)) ? (
                                                    <div className="btn-group">
                                                        <button
                                                            className="lc-variation-toggle dropdown-toggle"
                                                            type="button"
                                                            data-bs-toggle="dropdown"
                                                            data-bs-auto-close="false"
                                                            aria-expanded="false"
                                                        >
                                                            Variations
                                                        </button>
                                                        <ul className="dropdown-menu" style={{ minWidth: '300px' }}>
                                                            {/* Quantity */}
                                                            <div className="d-flex flex-column mb-2 mt-2 p-1">
                                                                <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                    <li>
                                                                        <input
                                                                            type="number"
                                                                            className="form-control"
                                                                            placeholder="Quantity"
                                                                            onChange={(e) => handleQtyChange(e, product.id)}
                                                                            min={1}
                                                                            defaultValue={1}
                                                                        />
                                                                    </li>
                                                                </div>
                                                            </div>

                                                            {/* Size */}
                                                            {product?.size && product?.size.length > 0 && (
                                                                <div className="d-flex flex-column">
                                                                    <li className="p-1"><b>Size</b>: {selectedSize[product.id] || 'Select'}</li>
                                                                    <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                        {product?.size?.map((size, i) => (
                                                                            <li key={i}>
                                                                                <button
                                                                                    className="btn btn-secondary btn-sm me-2 mb-1"
                                                                                    onClick={(e) => handleSizeButtonClick(e, product.id, size.name)}
                                                                                >
                                                                                    {size.name}
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Color */}
                                                            {product.color && product.color.length > 0 && (
                                                                <div className="d-flex flex-column mt-3">
                                                                    <li className="p-1"><b>Color</b>: {selectedColors[product.id] || 'Select'}</li>
                                                                    <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                        {product?.color?.map((color, i) => (
                                                                            <li key={i}>
                                                                                <input type="hidden" className={`color_name${color.id}`} />
                                                                                <button
                                                                                    className="color-button btn"
                                                                                    style={{ backgroundColor: color.color_code }}
                                                                                    onClick={(e) => handleColorButtonClick(e, product.id, color.name, color.image)}
                                                                                />
                                                                            </li>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Add to cart inside dropdown */}
                                                            <div className="d-flex mt-3 p-1 w-100">
                                                                <AddToCartButton productId={product.id} price={product.price} shipping={product.shipping_amount} />
                                                            </div>
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <div className="lc-card-actions">
                                                        <AddToCartButton productId={product.id} price={product.price} shipping={product.shipping_amount} />
                                                        <button
                                                            onClick={() => handleAddToWishlist(product.id)}
                                                            type="button"
                                                            className="lc-wishlist-btn"
                                                        >
                                                            <i className="fas fa-heart" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <nav className="d-flex gap-1 pt-3">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                            &lsaquo; Previous
                                        </button>
                                    </li>
                                </ul>
                                <ul className="pagination">
                                    {pageNumbers.map((number) => (
                                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(number)}>{number}</button>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                            Next &rsaquo;
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                            <div className="mb-2">
                                <span className="lc-section-subtitle">Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
                            </div>
                            {totalPages !== 1 && (
                                <div className="mb-4">
                                    <span className="lc-section-subtitle">Showing <b>{itemsPerPage}</b> of <b>{products?.length}</b> items</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── New Arrivals ── */}
                    <div id="new-arrivals" className="lc-products-section">
                        <div className="container">
                            <div className="text-center mb-4">
                                <span className="lc-section-label">Just In</span>
                                <h2 className="lc-section-title">New Arrivals</h2>
                                <p className="lc-section-subtitle">The freshest additions to our collection</p>
                            </div>
                            <div className="row">
                                {newArrivals.map((product, index) => (
                                    <div className="col-lg-4 col-md-6 mb-4" key={product.id || index}>
                                        <div className="lc-product-card">
                                            <div className="lc-product-card-img-wrapper">
                                                <Link to={`/detail/${product.slug}`}>
                                                    <img src={product.image} alt={product.title} />
                                                </Link>
                                            </div>
                                            <div className="lc-product-card-body">
                                                <Link to={`/vendor/${product?.vendor?.slug}`} className="lc-product-vendor">
                                                    {product.vendor?.name}
                                                </Link>
                                                <Link to={`/detail/${product.slug}`} className="lc-product-title">
                                                    {product.title.slice(0, 40)}
                                                </Link>
                                                <span className="lc-product-brand">{product?.brand?.title}</span>
                                                <p className="lc-product-price">{addon.currency_sign}{product.price}</p>
                                                <div className="lc-card-actions">
                                                    <AddToCartButton productId={product.id} price={product.price} shipping={product.shipping_amount} />
                                                    <button
                                                        onClick={() => handleAddToWishlist(product.id)}
                                                        type="button"
                                                        className="lc-wishlist-btn"
                                                    >
                                                        <i className="fas fa-heart" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Trending Products ── */}
                    <div className="lc-products-section-alt">
                        <div className="container">
                            <div className="text-center mb-4">
                                <span className="lc-section-label">Trending</span>
                                <h2 className="lc-section-title">Staff Picks</h2>
                                <p className="lc-section-subtitle">The most loved pieces of the season</p>
                            </div>
                            <div className="row">
                                {featuredProducts.map((product, index) => (
                                    <div className="col-lg-4 col-md-6 mb-4" key={product.id || index}>
                                        <div className="lc-product-card">
                                            <div className="lc-product-card-img-wrapper">
                                                <Link to={`/detail/${product.slug}`}>
                                                    <img src={product.image} alt={product.title} />
                                                </Link>
                                            </div>
                                            <div className="lc-product-card-body">
                                                <span className="lc-product-vendor">{product.vendor?.name}</span>
                                                <Link to={`/detail/${product.slug}`} className="lc-product-title">
                                                    {product.title.slice(0, 40)}
                                                </Link>
                                                <span className="lc-product-brand">{product?.brand.title}</span>
                                                <p className="lc-product-price">{addon.currency_sign}{product.price}</p>
                                                <div className="lc-card-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary flex-grow-1"
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        Add to Cart <FaShoppingCart />
                                                    </button>
                                                    <button type="button" className="lc-wishlist-btn">
                                                        <i className="fas fa-heart" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading === true && (
                <div className="lc-loading">
                    <span className="lc-section-label" style={{ textAlign: 'center' }}>Loading</span>
                    <div className="d-flex gap-2">
                        <span className="lc-loading-dot" style={{ animationDelay: '0s' }} />
                        <span className="lc-loading-dot" style={{ animationDelay: '0.2s' }} />
                        <span className="lc-loading-dot" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>
            )}
        </>
    );
}

export default Products;
