function add_lastBillDate(json){
    var lastBillDate = null;
    for(var i=0; i<json.bills.length; i++) {
        if(lastBillDate===null || new Date(lastBillDate)< new Date(json.bills[i].date)){
            lastBillDate = json.bills[i].date;
        }
    }

    json.lastBillDate=lastBillDate;
}

function add_ltv(json){
    var ltv = 0;
    for(var i=0; i<json.bills.length; i++) {
        ltv+=json.bills[i].payableAmt;
    }

    json.ltv = ltv;
    add_lastBillDate(json);
}


function add_payableAmt(json){
    for(var i=0; i<json.bills.length; i++) {
        var payableAmt = 0;
        for(var j=0; j<json.bills[i].products.length; j++){
            payableAmt+=json.bills[i].products[j].paidAmount;
        }
        json.bills[i].payableAmt=payableAmt;
    }

    add_ltv(json);
}

function add_grossTotal(json) {
    for(var i=0; i<json.bills.length; i++){
        var grossTotal = 0;
        for(var j=0; j<json.bills[i].products.length; j++){
            var currProd = json.bills[i].products[j];
            grossTotal+=(currProd.price * currProd.quantity) + currProd.taxAmt;
        }
        json.bills[i].grossTotal = grossTotal;
    }
    
    add_payableAmt(json);
}



function is_bought_for_birthday(json){
    for (let i = 0; i < json.bills.length; i++) {
        const currBill = json.bills[i];
        var billDate = json.dob.slice(0, 4)+'-'+currBill.date.slice(5, 10);
        const diffMilliseconds = Math.abs(new Date(billDate) - new Date(json.dob));
        const diffDays = Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24));
        // console.log(diffDays);
        if(Math.abs(diffDays<=30)){
            json.bills[i]["boughtForBirthday"] = true;
        }
        else{
            json.bills[i]["boughtForBirthday"] = false;
        }
    }

    add_grossTotal(json);
}


function get_dicount_format(discount){
    return Number(discount.slice(0, discount.length-1));
}

function add_paidAmt(json){
    for(var i=0; i<json.bills.length; i++) {
        for(var j=0; j<json.bills[i].products.length; j++){
            var currProd = json.bills[i].products[j];
            var discount = get_dicount_format(json.bills[i].discount);
            json.bills[i].products[j]["paidAmount"] = (currProd.price * currProd.quantity) - ((currProd.price * currProd.quantity)*discount/100) + currProd.taxAmt;
            // console.log(json.bills[i].products[j]);
        }
    }

    is_bought_for_birthday(json);
}

function add_age(json){
    var dob = new Date(json["dob"]);
    var currDate = Date.now();
    const age = Math.floor((currDate - dob) / (365.25 * 24 * 60 * 60 * 1000));
    json.age = age

    add_paidAmt(json);
}



var json = require('./bill.json')
const fs = require('fs');

add_age(json);

console.log(json);

fs.writeFile('updated_bill.json', JSON.stringify(json), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File created successfully');
});
