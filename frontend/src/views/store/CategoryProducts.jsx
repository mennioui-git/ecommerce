import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingCart, FaSpinner } from 'react-icons/fa';

import apiInstance from '../../utils/axios';
import Addon from '../plugin/Addon';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/CartID';
import { addToCart } from '../plugin/AddToCart';
import { addToWishlist } from '../plugin/AddToWishlist';
import { CartContext } from '../plugin/Context';

function CategoryProducts() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingStates, setLoadingStates] = useState({});
    const [colorImage, setColorImage] = useState('');
    const [colorValue, setColorValue] = useState('No Color');
    const [sizeValue, setSizeValue] = useState('No Size');
    const [qtyValue, setQtyValue] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedColors, setSelectedColors] = useState({});
    const [selectedSize, setSelectedSize] = useState({});

    const axios = apiInstance;
    const addon = Addon();
    const currentAddress = GetCurrentAddress();
    const userData = UserData();
    const cart_id = CartID();
    const [cartCount, setCartCount] = useContext(CartContext);

    useEffect(() => {
        setLoading(true);
        axios.get(`category/${slug}/products/`).then((res) => {
            setProducts(res.data);
            setLoading(false);
        });
        axios.get('category/').then((res) => {
            const found = res.data.find((c) => c.slug === slug);
            if (found) setCategoryTitle(found.title);
        });
    }, [slug]);

    const handleColorButtonClick = (event, product_id, colorName, img) => {
        setColorValue(colorName);
        setColorImage(img);
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
            await addToCart(product_id, userData?.user_id, qtyValue, price, shipping_amount, currentAddress.country, colorValue, sizeValue, cart_id, () => {});
            setLoadingStates((prev) => ({ ...prev, [product_id]: 'Added to Cart' }));
            setColorValue('No Color');
            setSizeValue('No Size');
            setQtyValue(1);
            const url = userData?.user_id ? `cart-list/${cart_id}/${userData.user_id}/` : `cart-list/${cart_id}/`;
            const response = await axios.get(url);
            setCartCount(response.data.length);
        } catch {
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
        <div className="lc-products-section">
            <div className="container">
                <div className="text-center mb-4">
                    <span className="lc-section-label">Collection</span>
                    <h2 className="lc-section-title">{categoryTitle || slug}</h2>
                    <p className="lc-section-subtitle">
                        {products.length} product{products.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {loading && (
                    <div className="lc-loading">
                        <span className="lc-section-label" style={{ textAlign: 'center' }}>Loading</span>
                        <div className="d-flex gap-2">
                            <span className="lc-loading-dot" style={{ animationDelay: '0s' }} />
                            <span className="lc-loading-dot" style={{ animationDelay: '0.2s' }} />
                            <span className="lc-loading-dot" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="text-center py-5">
                        <p className="lc-section-subtitle">No products in this category yet.</p>
                        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="row">
                        {products.map((product, index) => (
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
                                            {product.vendor?.name}
                                        </Link>
                                        <Link to={`/detail/${product.slug}`} className="lc-product-title">
                                            {product.title.slice(0, 40)}
                                        </Link>
                                        <span className="lc-product-brand">{product?.brand?.title}</span>
                                        <p className="lc-product-price">{addon?.currency_sign}{product.price}</p>

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
                                                    {product?.size && product.size.length > 0 && (
                                                        <div className="d-flex flex-column">
                                                            <li className="p-1"><b>Size</b>: {selectedSize[product.id] || 'Select'}</li>
                                                            <div className="p-1 d-flex flex-wrap">
                                                                {product.size.map((s, i) => (
                                                                    <li key={i}>
                                                                        <button
                                                                            className="btn btn-secondary btn-sm me-2 mb-1"
                                                                            onClick={(e) => handleSizeButtonClick(e, product.id, s.name)}
                                                                        >
                                                                            {s.name}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {product.color && product.color.length > 0 && (
                                                        <div className="d-flex flex-column mt-3">
                                                            <li className="p-1"><b>Color</b>: {selectedColors[product.id] || 'Select'}</li>
                                                            <div className="p-1 d-flex flex-wrap">
                                                                {product.color.map((c, i) => (
                                                                    <li key={i}>
                                                                        <button
                                                                            className="color-button btn"
                                                                            style={{ backgroundColor: c.color_code }}
                                                                            onClick={(e) => handleColorButtonClick(e, product.id, c.name, c.image)}
                                                                        />
                                                                    </li>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
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
                )}
            </div>
        </div>
    );
}

export default CategoryProducts;
