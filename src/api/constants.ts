// export const BASE_URL = 'https://mbapi.dswip.com/';
export const BASE_URL = 'https://goapi.dswip.com/';

// auth
export const ENDPOINT_DECODE_TOKEN = 'decode';
export const ENDPOINT_FORGOT = 'forgot';
export const ENDPOINT_LOGIN = 'login';
export const ENDPOINT_LOGOUT = 'logout';
export const ENDPOINT_OAUTH = 'oauth';
export const ENDPOINT_REQ_OTP = 'otp';
export const ENDPOINT_VERIFY = 'verify';

// user
export const ENDPOINT_UPLOAD_IMAGE = 'image';
export const ENDPOINT_NOTIF = 'notif';
export const ENDPOINT_NOTIF_DETAIL = 'notif_detail/';
export const ENDPOINT_CHANGE_PASSWORD = 'password';
export const ENDPOINT_REGISTER = 'register';
export const ENDPOINT_UPDATE = 'update';
export const ENDPOINT_GET_PROFILE = 'user';
export const ENDPOINT_LEDGER = 'wallet'; 
// product
export const ENDPOINT_PRODUCT = 'product';
export const ENDPOINT_PRODUCT_REFRESH_CACHE = 'product/refresh_cache'; // api baru
export const ENDPOINT_PRODUCT_SEARCH = 'product/search';
export const ENDPOINT_PRODUCT_DETAIL = 'product/';
export const ENDPOINT_PRODUCT_CITY = 'product/product_city';
export const ENDPOINT_PRODUCT_LATEST = 'product_front/0'
export const ENDPOINT_PRODUCT_BEST_SELLER = 'product_front/1';
// export const ENDPOINT_PRODUCT_SKU = 'product/get_by_sku/';
// whistlist
export const ENDPOINT_PRODUCT_ISWHISTLIST = 'is_whishlist/'; // api baru
export const ENDPOINT_PRODUCT_WHISHLIST = 'whishlist';
export const ENDPOINT_PRODUCT_WHISHLIST_GET = 'whishlist/'; // api baru

// article
export const ENDPOINT_ARTICLE = 'article';
export const ENDPOINT_ARTICLE_GET_PERMALINK = 'article/get_by_permalink';
export const ENDPOINT_ARTICLE_CATEGORY = 'article/category';

// GENERAL
export const ENDPOINT_GET_CITY = 'city';
// export const ENDPOINT_CITY_GET_PROVINCE = 'city/get_province_rj/';
// export const ENDPOINT_CITY_GET_DISTRICT = 'city/get_district_rj/';
// export const ENDPOINT_GET_DISTRICT = 'city/get_district/';
// export const ENDPOINT_GET_DISTRICT_BY_ID = 'city/get_district_by_id/';
// export const ENDPOINT_CITY_RECON_PROVINCE = 'city/recon_province';
// export const ENDPOINT_RECON_CITY = 'city/recon_city';
// export const ENDPOINT_CITY = 'city/get_city'

//SHIPPING
export const ENDPOINT_SHIPPING = 'city_shipping/';
export const ENDPOINT_DISTRICT_SHIPPING = 'district_shipping/';
export const ENDPOINT_PROVINCE_SHIPPING = 'province_shipping/';
export const ENDPOINT_SET_SHIPPING = 'set_shipping';

// event
export const ENDPOINT_EVENT = 'event';
export const ENDPOINT_EVENT_REGISTER_MERCHANT = 'event/merchant';  
export const ENDPOINT_EVENT_REGISTER_PUBLIC = 'event/public';
export const ENDPOINT_EVENT_REGISTER = 'event/register/';
// export const ENDPOINT_EVENT_FRONT = 'event/front';
// export const ENDPOINT_EVENT_BY_ID = 'event/get_by_id/';
// export const ENDPOINT_EVENT_GET_BY_CUSTOMER = 'event/get_by_customer/';

// chapter
export const ENDPOINT_CHAPTER = 'chapter';
export const ENDPOINT_CHAPTER_BY_ID = 'chapter/';
// export const ENDPOINT_CHAPTER_GET_BY_CUSTOMER = 'chapter/get_by_customer/';
export const ENDPOINT_GET_FRONT = 'chapter_front'

// redeem
// export const ENDPOINT_REDEEM = 'redeem';
// export const ENDPOINT_REDEEM_ADD = 'redeem/add';
// export const ENDPOINT_RESERVATION_ROOM_CATEGORY = 'reservation/room_category';
// export const ENDPOINT_RESERVATION_ROOM_TABLE = 'reservation/room_table';
// export const ENDPOINT_RESERVATION_ROOM_BY_ID = 'reservation/room_by_id/';
// order
export const ENDPOINT_ORDER = 'order';
export const ENDPOINT_ORDER_CHECKOUT = 'checkout/';
export const ENDPOINT_ORDER_TRACKING = 'order/tracking/';
export const ENDPOINT_ORDER_GET = 'order/get/';

// export const ENDPOINT_ORDER_ADD = 'orders/add';
// export const ENDPOINT_ORDER_ADD_ITEM = 'orders/add_item/';
// export const ENDPOINT_ORDER_CLEANING = 'orders/cleaning';
// export const ENDPOINT_ORDER_REPORT = 'orders/report';
// export const ENDPOINT_ORDER_UPDATE = 'orders/update';
// export const ENDPOINT_ORDER_CONFIRMATION = 'orders/confirmation/1';
// export const ENDPOINT_ORDER_CALLBACK = 'orders/callback/';
// export const ENDPOINT_ORDER_DELETE = 'orders/delete/';
// export const ENDPOINT_ORDER_DELETE_ITEM = 'orders/delete_item/';
// export const ENDPOINT_ORDER_LIST_BONUS_ORDER = 'orders/list_bonus_order';
// export const ENDPOINT_ORDER_SET_BONUS_ORDER = 'orders/set_bonus_order';

// pos
// export const ENDPOINT_POS = 'pos';
// export const ENDPOINT_POS_GET = 'pos/get/';
// export const ENDPOINT_POS_ADD = 'pos/add/';
// export const ENDPOINT_POS_DELETE_ITEM = 'pos/delete_item/';
// export const ENDPOINT_POS_DELETE = 'pos/delete/';
// export const ENDPOINT_POS_CHECKOUT = 'pos/checkout/';
// export const ENDPOINT_POS_API = 'pos/post_api/';

// cart
export const ENDPOINT_CART = 'cart'; // bisa dipakai untuk get cart dan add product ke cart, dengan method yang berbeda (GET untuk get cart, POST untuk add product ke cart)
// export const ENDPOINT_CART_ADD = 'cart/add/';
export const ENDPOINT_CART_CLEAN = 'cart/clean/';
export const ENDPOINT_CART_SET_PICKUP = 'cart/pickup/';
export const ENDPOINT_CART_NOTES = 'cart/notes/';
export const ENDPOINT_CART_PICKUP = 'cart/pickup/';
export const ENDPOINT_CART_PUBLISH = 'cart/publish/';
export const ENDPOINT_CART_DELETE_ITEM = 'cart/';
// other
// export const ENDPOINT_MEMBER_TOKEN = 'member/tes_token';
// export const ENDPOINT_BANKLIST = 'banklist';
// export const ENDPOINT_CEK_TOKEN = 'api/cek_token';
// export const ENDPOINT_CONFIGURATION = 'configuration';
//slider
export const ENDPOINT_SLIDER = 'slider';
export const ENDPOINT_SPLASH = 'slider/splash';
export const ENDPOINT_REFRESH = 'slider/refresh';

// payment
export const ENDPOINT_PAYMENT = 'payment';
export const ENDPOINT_PAYMENT_GET = 'payment/get';
