from decimal import Decimal

from django.test import TestCase
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from userauths.models import User
from vendor.models import Vendor
from store.models import (
    Brand,
    Cart,
    CartOrder,
    CartOrderItem,
    Category,
    ConfigSettings,
    Coupon,
    Product,
    Review,
    Tax,
    Wishlist,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(email="test@example.com", username="testuser"):
    return User.objects.create_user(
        email=email,
        username=username,
        password="testpass123",
    )


def make_vendor(user):
    return Vendor.objects.create(user=user, name="Test Shop", email=user.email)


def make_category(title="Electronics", active=True):
    return Category.objects.create(title=title, active=active)


def make_product(vendor, category=None, title="Test Product", price=100.00,
                 old_price=150.00, stock_qty=10, status="published"):
    return Product.objects.create(
        title=title,
        vendor=vendor,
        category=category,
        price=Decimal(str(price)),
        old_price=Decimal(str(old_price)),
        shipping_amount=Decimal("5.00"),
        stock_qty=stock_qty,
        status=status,
    )


def make_config(service_fee_charge_type="percentage", service_fee_percentage=5):
    return ConfigSettings.objects.create(
        service_fee_charge_type=service_fee_charge_type,
        service_fee_percentage=service_fee_percentage,
    )


# ===========================================================================
# MODEL TESTS
# ===========================================================================

class CategoryModelTest(TestCase):
    def test_str(self):
        cat = make_category("Books")
        self.assertEqual(str(cat), "Books")

    def test_slug_auto_generated_on_create(self):
        cat = make_category("Home & Garden")
        self.assertIsNotNone(cat.slug)
        self.assertIn("home", cat.slug)

    def test_slug_not_overridden_when_set(self):
        cat = Category.objects.create(title="Music", slug="my-custom-slug")
        self.assertEqual(cat.slug, "my-custom-slug")

    def test_product_count(self):
        user = make_user()
        vendor = make_vendor(user)
        cat = make_category()
        make_product(vendor, category=cat)
        make_product(vendor, category=cat, title="Product 2")
        self.assertEqual(cat.product_count(), 2)

    def test_product_count_empty(self):
        cat = make_category()
        self.assertEqual(cat.product_count(), 0)


class BrandModelTest(TestCase):
    def test_str(self):
        brand = Brand.objects.create(title="Nike", active=True)
        self.assertEqual(str(brand), "Nike")


class ProductModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.cat = make_category()

    def test_str(self):
        product = make_product(self.vendor, self.cat)
        self.assertEqual(str(product), "Test Product")

    def test_slug_auto_generated(self):
        product = make_product(self.vendor, self.cat, title="My Awesome Product")
        self.assertIsNotNone(product.slug)
        self.assertIn("my-awesome-product", product.slug)

    def test_in_stock_true_when_qty_positive(self):
        product = make_product(self.vendor, self.cat, stock_qty=5)
        self.assertTrue(product.in_stock)

    def test_in_stock_false_when_qty_zero(self):
        product = make_product(self.vendor, self.cat, stock_qty=0)
        self.assertFalse(product.in_stock)

    def test_get_precentage(self):
        # (150 - 100) / 150 * 100 = 33%
        product = make_product(self.vendor, self.cat, price=100.00, old_price=150.00)
        self.assertEqual(product.get_precentage(), 33.0)

    def test_product_rating_no_reviews(self):
        product = make_product(self.vendor, self.cat)
        self.assertIsNone(product.product_rating())

    def test_product_rating_with_reviews(self):
        product = make_product(self.vendor, self.cat)
        user2 = make_user("reviewer@example.com", "reviewer")
        Review.objects.create(user=user2, product=product, rating=4, review="Good", active=True)
        Review.objects.create(user=self.user, product=product, rating=2, review="Bad", active=True)
        avg = product.product_rating()
        self.assertEqual(avg, 3.0)

    def test_rating_count(self):
        product = make_product(self.vendor, self.cat)
        user2 = make_user("reviewer@example.com", "reviewer")
        Review.objects.create(user=user2, product=product, rating=5, review="Great", active=True)
        self.assertEqual(product.rating_count(), 1)


class ReviewModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor)

    def test_str_with_product(self):
        review = Review.objects.create(
            user=self.user, product=self.product, rating=5, review="Excellent!"
        )
        self.assertEqual(str(review), self.product.title)

    def test_str_without_product(self):
        review = Review.objects.create(user=self.user, product=None, rating=3, review="Meh")
        self.assertEqual(str(review), "Review")

    def test_get_rating(self):
        review = Review.objects.create(
            user=self.user, product=self.product, rating=4, review="Nice"
        )
        self.assertEqual(review.get_rating(), 4)

    def test_post_save_signal_updates_product_rating(self):
        """Saving a review triggers product.save(), updating the rating field."""
        user2 = make_user("other@example.com", "other")
        Review.objects.create(user=user2, product=self.product, rating=4, review="Great")
        self.product.refresh_from_db()
        self.assertEqual(self.product.rating, 4)


class CouponModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)

    def test_str(self):
        coupon = Coupon.objects.create(vendor=self.vendor, code="SAVE10", discount=10)
        self.assertEqual(str(coupon), "SAVE10")

    def test_save_valid(self):
        coupon = Coupon.objects.create(vendor=self.vendor, code="HALF50", discount=50)
        self.assertIsNotNone(coupon.pk)
        self.assertEqual(coupon.discount, 50)


class CartModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor)

    def test_str(self):
        cart = Cart.objects.create(
            product=self.product,
            user=self.user,
            qty=2,
            price=Decimal("100.00"),
            cart_id="cart-abc123",
        )
        self.assertIn("cart-abc123", str(cart))
        self.assertIn(self.product.title, str(cart))


class CartOrderModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor)

    def test_str_returns_oid(self):
        order = CartOrder.objects.create(
            buyer=self.user,
            full_name="Test User",
            email="test@example.com",
            mobile="0612345678",
            payment_status="initiated",
        )
        self.assertEqual(str(order), order.oid)

    def test_get_order_items(self):
        order = CartOrder.objects.create(
            buyer=self.user,
            full_name="Test User",
            email="test@example.com",
            mobile="0612345678",
        )
        item = CartOrderItem.objects.create(
            order=order,
            product=self.product,
            vendor=self.vendor,
            qty=1,
            price=Decimal("100.00"),
            sub_total=Decimal("100.00"),
            total=Decimal("100.00"),
            initial_total=Decimal("100.00"),
        )
        items = list(order.get_order_items())
        self.assertIn(item, items)


# ===========================================================================
# API VIEW TESTS
# ===========================================================================

class CategoryListViewTest(APITestCase):
    def test_returns_only_active_categories(self):
        make_category("Active Cat", active=True)
        make_category("Inactive Cat", active=False)
        url = reverse("category_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [c["title"] for c in response.data]
        self.assertIn("Active Cat", titles)
        self.assertNotIn("Inactive Cat", titles)

    def test_empty_when_no_categories(self):
        url = reverse("category_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class BrandListViewTest(APITestCase):
    def test_returns_only_active_brands(self):
        Brand.objects.create(title="Active Brand", active=True)
        Brand.objects.create(title="Inactive Brand", active=False)
        url = reverse("brand")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [b["title"] for b in response.data]
        self.assertIn("Active Brand", titles)
        self.assertNotIn("Inactive Brand", titles)


class ProductListViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)

    def test_returns_published_products(self):
        make_product(self.vendor, title="Published", status="published")
        make_product(self.vendor, title="Draft", status="draft")
        url = reverse("product_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data]
        self.assertIn("Published", titles)
        self.assertNotIn("Draft", titles)

    def test_empty_when_no_products(self):
        url = reverse("product_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class ProductDetailViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor, title="Detail Product")

    def test_get_product_by_slug(self):
        url = reverse("product_detail", kwargs={"slug": self.product.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Detail Product")

    def test_product_not_found_raises_404(self):
        url = reverse("product_detail", kwargs={"slug": "non-existent-slug"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CartApiViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor, price=50.00)
        self.config = make_config()
        self.url = reverse("cart_api")
        self.payload = {
            "product": self.product.id,
            "user": "undefined",
            "qty": 2,
            "price": "50.00",
            "shipping_amount": "5.00",
            "country": "US",
            "size": "M",
            "color": "Red",
            "cart_id": "cart-test-001",
        }

    def test_create_cart_item(self):
        response = self.client.post(self.url, self.payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Cart.objects.count(), 1)

    def test_update_existing_cart_item(self):
        self.client.post(self.url, self.payload, format="json")
        updated_payload = dict(self.payload, qty=5)
        response = self.client.post(self.url, updated_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Cart.objects.count(), 1)
        cart = Cart.objects.first()
        self.assertEqual(cart.qty, 5)

    def test_tax_applied_when_country_has_tax(self):
        Tax.objects.create(country="FR", rate=20, active=True)
        payload = dict(self.payload, country="FR")
        self.client.post(self.url, payload, format="json")
        cart = Cart.objects.first()
        self.assertGreater(cart.tax_fee, 0)

    def test_no_tax_when_country_not_found(self):
        self.client.post(self.url, self.payload, format="json")
        cart = Cart.objects.first()
        self.assertEqual(cart.tax_fee, Decimal("0.00"))


class CartListViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor)
        Cart.objects.create(
            product=self.product,
            cart_id="cart-list-001",
            qty=1,
            price=Decimal("100.00"),
        )

    def test_list_by_cart_id(self):
        url = reverse("cart-list", kwargs={"cart_id": "cart-list-001"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_empty_for_unknown_cart_id(self):
        url = reverse("cart-list", kwargs={"cart_id": "unknown-cart"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class CartItemDeleteViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor)
        self.cart = Cart.objects.create(
            product=self.product,
            cart_id="cart-del-001",
            qty=1,
            price=Decimal("100.00"),
        )

    def test_delete_cart_item(self):
        url = reverse(
            "cart-delete",
            kwargs={"cart_id": "cart-del-001", "item_id": self.cart.id},
        )
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Cart.objects.count(), 0)

    def test_delete_nonexistent_item_returns_404(self):
        url = reverse(
            "cart-delete",
            kwargs={"cart_id": "cart-del-001", "item_id": 9999},
        )
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CreateOrderViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor, price=80.00)
        Cart.objects.create(
            product=self.product,
            cart_id="cart-order-001",
            qty=1,
            price=Decimal("80.00"),
            sub_total=Decimal("80.00"),
            shipping_amount=Decimal("5.00"),
            tax_fee=Decimal("0.00"),
            service_fee=Decimal("4.00"),
            total=Decimal("89.00"),
        )
        self.url = reverse("cart-delete")  # name="cart-delete" is reused for create-order in urls.py
        # Use direct URL instead since the name is duplicated
        self.url = "/api/v1/create-order/"

    def test_create_order_from_cart(self):
        payload = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "mobile": "0600000000",
            "address": "123 Main St",
            "city": "Casablanca",
            "state": "MA",
            "country": "MA",
            "cart_id": "cart-order-001",
            "user_id": 0,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("order_oid", response.data)
        self.assertEqual(CartOrder.objects.count(), 1)
        self.assertEqual(CartOrderItem.objects.count(), 1)


class ReviewRatingAPIViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor)
        self.url = reverse("create-review")

    def test_create_review(self):
        payload = {
            "user_id": self.user.id,
            "product_id": self.product.id,
            "rating": 5,
            "review": "Excellent product!",
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)

    def test_review_linked_to_product(self):
        payload = {
            "user_id": self.user.id,
            "product_id": self.product.id,
            "rating": 3,
            "review": "Decent.",
        }
        self.client.post(self.url, payload, format="json")
        review = Review.objects.first()
        self.assertEqual(review.product, self.product)
        self.assertEqual(review.rating, 3)


class ReviewListViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor)
        self.other_product = make_product(self.vendor, title="Other Product")
        Review.objects.create(user=self.user, product=self.product, rating=4, review="Good")
        Review.objects.create(user=self.user, product=self.other_product, rating=2, review="Bad")

    def test_list_reviews_for_product(self):
        url = reverse("create-review", kwargs={"product_id": self.product.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_no_reviews_for_product_without_reviews(self):
        new_product = make_product(self.vendor, title="No Reviews Product")
        url = reverse("create-review", kwargs={"product_id": new_product.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class SearchProductsAPIViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        make_product(self.vendor, title="iPhone 14 Pro", status="published")
        make_product(self.vendor, title="Samsung Galaxy S23", status="published")
        make_product(self.vendor, title="Hidden Draft Phone", status="draft")

    def test_search_returns_matching_published_products(self):
        url = reverse("search") + "?query=iPhone"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "iPhone 14 Pro")

    def test_search_is_case_insensitive(self):
        url = reverse("search") + "?query=iphone"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_search_excludes_drafts(self):
        url = reverse("search") + "?query=Draft Phone"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_search_no_results(self):
        url = reverse("search") + "?query=zzznomatch"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class CouponApiViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.vendor = make_vendor(self.user)
        self.product = make_product(self.vendor, price=100.00)

        self.order = CartOrder.objects.create(
            buyer=self.user,
            full_name="Test User",
            email="test@example.com",
            mobile="0600000000",
            payment_status="processing",
            sub_total=Decimal("100.00"),
            total=Decimal("100.00"),
            initial_total=Decimal("100.00"),
        )
        self.order_item = CartOrderItem.objects.create(
            order=self.order,
            product=self.product,
            vendor=self.vendor,
            qty=1,
            price=Decimal("100.00"),
            sub_total=Decimal("100.00"),
            total=Decimal("100.00"),
            initial_total=Decimal("100.00"),
        )
        self.coupon = Coupon.objects.create(
            vendor=self.vendor,
            code="DISCOUNT20",
            discount=20,
            active=True,
        )
        self.url = reverse("coupon")

    def test_valid_coupon_applied(self):
        payload = {"order_oid": self.order.oid, "coupon_code": "DISCOUNT20"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Coupon Activated")
        self.order_item.refresh_from_db()
        self.assertTrue(self.order_item.applied_coupon)

    def test_invalid_coupon_returns_404(self):
        payload = {"order_oid": self.order.oid, "coupon_code": "FAKECODE"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_already_applied_coupon_returns_message(self):
        payload = {"order_oid": self.order.oid, "coupon_code": "DISCOUNT20"}
        self.client.post(self.url, payload, format="json")
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Coupon Already Activated")

    def test_coupon_inactive_not_applied(self):
        Coupon.objects.create(
            vendor=self.vendor, code="INACTIVE", discount=10, active=False
        )
        payload = {"order_oid": self.order.oid, "coupon_code": "INACTIVE"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
