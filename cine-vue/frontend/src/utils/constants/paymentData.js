import applepay from "@/assets/images/apple-icon.png";
import momo from "@/assets/images/momo-icon.png";
import payoo from "@/assets/images/payoo-icon.png";
import shopeepay from "@/assets/images/shopeepay-icon.png";
import visa from "@/assets/images/visa-icon.png";

export const PAYMENT_ICON_MAP = {
    apple: applepay,
    applepay,
    momo,
    payoo,
    shopeepay,
    visa,
};

export const resolvePaymentIcon = (iconKey) => PAYMENT_ICON_MAP[iconKey] || visa;

export const PAYMENT_DATA = [
    {
        id: 1,
        code: "atm-card",
        name: "Thẻ ATM / Thẻ quốc tế",
        payment_method: "card",
        icon_key: "visa",
        image: visa,
    },
    {
        id: 2,
        code: "shopeepay",
        name: "ShopeePay",
        payment_method: "shopeepay",
        icon_key: "shopeepay",
        image: shopeepay,
    },
    {
        id: 3,
        code: "apple-pay",
        name: "Apple Pay",
        payment_method: "applepay",
        icon_key: "applepay",
        image: applepay,
    },
    {
        id: 4,
        code: "momo",
        name: "Ví MoMo",
        payment_method: "momo",
        icon_key: "momo",
        image: momo,
    },
];
