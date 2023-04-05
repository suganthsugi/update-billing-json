const json_keys = {
    AGE: "age",
    DOB: "dob",
    BILLS: "bills",
    PRICE: "price",
    QUANTITY: "quantity",
    DISCOUNT: "discount",
    taxAmt: "taxAmt",
    PRODUCTS: "products",
    DATE: "date",
    grossTotal: "grossTotal",
    boughtForBirthday: "boughtForBirthday",
    payableAmt: "payableAmt",
    ltv: "ltv",
    paidAmt: "paidAmt",
    payableAmt: "payableAmt",
}

const get_recent_billDate = (recent, curr) => {
    const recentDate = new Date(recent);
    const currDate = new Date(curr);
    return recentDate > currDate ? recentDate : currDate;
}

const add_lastBillDate = (json) => {
    var lastBillDate = json[json_keys.BILLS].reduce((acc, ele) => get_recent_billDate(acc, ele[json_keys.DATE]), 0);
    json.lastBillDate = lastBillDate;
    return json;
}


function add_ltv(json) {
    const ltv = json[json_keys.BILLS].reduce((acc, ele) => ele[json_keys.payableAmt] + acc, 0);
    json[json_keys.ltv] = ltv;
    return json;
}

const calculate_payableAmt = (x) => {
    const currProd = x[json_keys.PRODUCTS];
    const payableAmt = currProd.reduce((acc, ele) => acc + ele[json_keys.paidAmt], 0);
    return payableAmt;
}

const add_payableAmt = (json) => {
    const all_bills = json[json_keys.BILLS];
    all_bills.map((x) => {
        x[json_keys.payableAmt] = calculate_payableAmt(x);
    })
    return json;
}


const find_grossTot = (ele) => {
    const price = ele[json_keys.PRICE];
    const quantity = ele[json_keys.QUANTITY];
    const taxAmt = ele[json_keys.taxAmt];
    const grossTotal = (price * quantity) + taxAmt;
    return grossTotal;
}


const add_grossTotal = (json) => {
    json[json_keys.BILLS].map((x) => {
        const grossTotal = x[json_keys.PRODUCTS].reduce((acc, ele) => {
            return acc + find_grossTot(ele);
        }, 0);
        x[json_keys.grossTotal] = grossTotal;
    });

    return json;
}


const is_date_lies_btw_range = (dob, bill) => {
    const bill_date = bill[json_keys.DATE]
    dob = bill_date.slice(0, 4) + dob.slice(4, dob.length);
    const birthday = new Date(dob).getTime();
    const orderDate = new Date(bill_date).getTime();

    const days_diff = Math.floor((birthday - orderDate) / (1000 * 3600 * 24));

    return days_diff <= 30
}


const is_bought_for_birthday = (json) => {
    const all_bills = json[json_keys.BILLS];
    const dob = json[json_keys.DOB];
    all_bills.map((x) => {
        ordered_for_bday = is_date_lies_btw_range(dob, x)
        x[json_keys.boughtForBirthday] = ordered_for_bday;
    })

    return json;
}


function get_discount_format(discount) {
    const discount_string = discount.slice(0, discount.length - 1); // to remove %
    return Number(discount_string);
}


const calculate_paidAmt = (product, discount) => {
    const price = product[json_keys.PRICE];
    const quantity = product[json_keys.QUANTITY];

    const price_for_n_items = (price * quantity);

    discount = get_discount_format(discount);
    const discountAmt = (discount / 100) * price_for_n_items;

    const taxAmt = product[json_keys.taxAmt]

    const paidAmt = price_for_n_items - discountAmt + taxAmt;
    return paidAmt;
}


const add_paidAmt = (json) => {
    for (var i = 0; i < json[json_keys.BILLS].length; i++) {
        const currBill = json[json_keys.BILLS][i];
        const currProd = currBill[json_keys.PRODUCTS]
        currProd.map((x) => {
            x.paidAmt = calculate_paidAmt(x, currBill[json_keys.DISCOUNT]);
        })
    }
    return json;
}


const find_age = (dob) => {
    const currDate = Date.now();
    dob = new Date(dob);
    const age = Math.floor((currDate - dob) / (365.25 * 24 * 3600000));

    return age;
}


const add_age = (json) => {
    const dob = json[json_keys.DOB];
    json.age = find_age(dob);
    return json;
}

const update_bill_functions = [add_age, add_paidAmt, is_bought_for_birthday, add_payableAmt, add_grossTotal, add_ltv, add_lastBillDate];


var json = require('./bill.json')
update_bill_functions.reduce((acc, funcs) => funcs(acc), json)

console.log(json);

const fs = require('fs');
fs.writeFile('updated_bill.json', JSON.stringify(json), (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('File created successfully');
});
