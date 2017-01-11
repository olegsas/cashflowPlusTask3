function standartDate(anyDay){// this function normalize string date into a Date object

    var anyDayA = anyDay.split("/");// we have got an array of 3 numbers in a string type
    
    var anyDATE = new Date();
        anyDATE.setFullYear(anyDayA[2]);// A means Array
        anyDATE.setMonth(anyDayA[0]-1);// we have months in range of 0...11
        anyDATE.setDate(anyDayA[1]);// anyDATE is in a correct format
        // we use format m/y/dddd

    
    return anyDATE;

}

function dataRates(){
    var ratesdbH = db.rates.find().toArray();// we accept it from the DB
    var len = ratesdbH.length;// the length of our array
    var timeDay;
    var ratesH = {};// we create a new object
    dataA = []; rateA = []; standartDateA = [];
    rateInDaysA = []; // we use this array to put rates. A number in [] brackets is the number of the day since zero point 1970
    for(var i = 0; i<len; i++){
        dataA[i] = ratesdbH[i].date;
        rateA[i] = ratesdbH[i].rate;
        standartDateA[i] = standartDate(dataA[i]);
        
        timeDay = Math.floor(standartDateA[i].getTime()/(1000*60*60*24));// we find a day since zero point
        rateInDaysA[timeDay] = rateA[i];
        // print("timeDay = " + timeDay);
        // print("rateInDaysA[timeDay] = "+ rateInDaysA[timeDay])
    }
    ratesH.data = dataA;
    ratesH.rateInDays = rateInDaysA;
    //ratesH.rate = rateA;
    ratesH.standartDate = standartDateA;
    return ratesH;
}

var ratesH = dataRates();// we have all data from DB in ratesH

function findStartData(ratesH){
    var dataA = ratesH.data;// the array with string data
    var standartDateA = ratesH.standartDate; //we have the array
    var min = standartDateA[0].getTime();
    var cycleTime;
    var num = 0;
    var len = standartDateA.length;
    for(var i=0; i<len; i++){
        cycleTime = standartDateA[i].getTime();
        if (cycleTime < min){
            min = cycleTime;
            num = i;
        } 
    }
    return dataA[num];
}

function findFinishData(ratesH){
    var dataA = ratesH.data;// the array with string data
    var standartDateA = ratesH.standartDate; //we have the array
    var max = standartDateA[0].getTime();
    var cycleTime;
    var num = 0;
    var len = standartDateA.length;
    for(var i=0; i<len; i++){
        cycleTime = standartDateA[i].getTime();
        if (cycleTime > max){
            max = cycleTime;
            num = i;
        } 
    }
    return dataA[num];
}

function calculateCashDelta(nowTimeDay){
    // cashbox is a result of the daily transactions
    // let cashboxA = [];
    // let cashboxA[0] = Byr, cashboxA[1] = Byn, cashboxA[2] = USD
    var nowData = new Date();
    nowData.setTime(nowTimeDay*1000*60*60*24);
    var cashboxA = [];//0 - Byr, 1 - Byn, 2 - USD
    cashboxA[0] = 0; cashboxA[1] = 0; cashboxA[2] = 0;
    var i = 0,
    TypeA = [],
    OperationNameA = [],
    AmountA = [],
    CurrencyA = [],
    cursor = db.transactions.find({"Date": nowData}),
    length;
        cursor.forEach(
            function(obj){
                TypeA[i] = obj.Type;// we find certain field of the certain transaction
                OperationNameA[i] = obj.OperationName;
                AmountA[i] = obj.Amount;
                CurrencyA[i] = obj.Currency;
                i++;
            }
        );
        length = TypeA.length;
        if(length>0){
            for(var j = 0; j<length; j++){
                switch(CurrencyA[j]){
                    case "Byr":
                        if(TypeA[j] === "Exp"){
                            cashboxA[0] = cashboxA[0] - AmountA[j];
                        }
                        else{
                            cashboxA[0] = cashboxA[0] + AmountA[j];
                        };
                        break;
                    case "Byn":
                        if(TypeA[j] === "Exp"){
                            cashboxA[1] = cashboxA[1] - AmountA[j];
                        }
                        else{
                            cashboxA[1] = cashboxA[1] + AmountA[j];
                        };
                        break;
                    case "Usd":
                       if(TypeA[j] === "Exp"){
                            cashboxA[2] = cashboxA[2] - AmountA[j];
                        }
                        else{
                            cashboxA[2] = cashboxA[2] + AmountA[j];
                        }; 
                }
            }

        }
        return cashboxA;
}

function writeCashFlow(nowTimeDay, Byr, Byn, Usd){// we write the cashflow for the nowTimeDay
    var cashData  = new Date();
        cashData.setTime(nowTimeDay*1000*60*60*24);
        db.cashflow.insert({"Date": cashData, "Byr": Byr, "Byn": Byn, "Usd": Usd});
}

function runCashFlow(begin, end){// we want to use day from the begining Day 1970
    //ratesH.data is in a string format
    var startDATE = standartDate(begin);
    var startTimeDay = Math.floor(startDATE.getTime()/(1000*60*60*24));
    var finishDATE = standartDate(end);
    var finishTimeDay = Math.floor(finishDATE.getTime()/(1000*60*60*24));
    //startTimeDay = 14610
    //finishTimeDay = 17130
    // number of the days is finishTimeDay-startTimeDay+1 = 2521
    var flowcashboxA = []; // flowcashboxA is the global cashbox, it is the cashflow
    flowcashboxA[0] = 0; flowcashboxA[1] = 0; flowcashboxA[2] = 0;
    // let cashboxA[0] = Byr, cashboxA[1] = Byn, cashboxA[2] = USD
    var cashboxA = []; // we store the result of calculateCashDelta in it

    for(var cycleTimeDay = startTimeDay; cycleTimeDay <= finishTimeDay; cycleTimeDay++){
        var cycleData = new Date();
        cycleData.setTime(cycleTimeDay*1000*60*60*24);
        cashboxA = calculateCashDelta(cycleTimeDay);
        for(var i = 0; i<flowcashboxA.length; i++){// we increment flowcashboxA with values of cashboxA
            flowcashboxA[i] = flowcashboxA[i] + cashboxA[i];
        }// flowcashboxA has an actual amount of money on the cycleTimeDay
        writeCashFlow(cycleTimeDay, flowcashboxA[0], flowcashboxA[1], flowcashboxA[2]);   
    }
}


function exchange(nowTimeDay, ratesH, amount, fromCurrency, toCurrency){
    var fromCurency;
    var toCurrency;
    // nowTimeDay in days from zero point
    //fromCurrency = "Byr", "Byn", "Usd"
    //toCurrency = "Byr", "Byn", "Usd"
    var rate = ratesH.rateInDays[nowTimeDay]; // rate for the nowTimeDay
    var fromByr = 0; var fromByn = 0; var fromUsd = 0; // we sell it to a bank
    var toByr = 0; var toByn = 0; var toUsd = 0; // we buy it from a bank
    var exchangeResultA = []; // object for return the result of exchange operation
    // exchangeResultA[0] = fromByr; exchangeResultA[1] = fromByn; exchangeResultA[2] = fromUsd;
    // exchangeResultA[3] = toByr; exchangeResultA[4] = toByn; exchangeResultA[5] = toUsd;
    if((fromCurrency === "Byr") || (fromCurrency === "Byn")){
        if(fromCurrency === "Byr"){
            fromByr = amount; toUsd = amount/rate;
        } else{
            fromByn = amount; toUsd = amount/rate;
        }
    }
    if((toCurrency === "Byr") || (toCurrency === "Byn")){
        if(toCurrency === "Byr"){
            fromUsd = amount; /*toByr = amount*rate;*/
        } else{
            fromUsd = amount; toByn = amount*rate;
        }
    }
    exchangeResultA[0] = fromByr; exchangeResultA[1] = fromByn; exchangeResultA[2] = fromUsd;
    exchangeResultA[3] = toByr; exchangeResultA[4] = toByn; exchangeResultA[5] = toUsd;
    print("fromByr = " + fromByr);
    print("fromUsd = "+ fromUsd);
    print("toByr = "+ toByr); 
    print("toUsd = " + toUsd);
    print("nowTimeDay = " + nowTimeDay);
    print("amount = "+ amount);
    print("rate = " + rate);
    print(typeof rate);
    return exchangeResultA;
}

function ifWeNeedExchange(cycleTimeDay, Byr, Byn, Usd){
    if (Byr < 0){
        print("Byr is = " + Byr);
        exchange(cycleTimeDay, ratesH, Usd, "Usd", "Byr");
    }
}

function runCashFlowPLus(begin, end){// we want to use day from the begining Day 1970
    //ratesH.data is in a string format
    var startDATE = standartDate(begin);
    var startTimeDay = Math.floor(startDATE.getTime()/(1000*60*60*24));
    var finishDATE = standartDate(end);
    /////////////////////var finishTimeDay = Math.floor(finishDATE.getTime()/(1000*60*60*24));// for the debug only
    var finishTimeDay = 14630;// debug only////////////////////////////////////
    //startTimeDay = 14610
    //finishTimeDay = 17130
    // number of the days is finishTimeDay-startTimeDay+1 = 2521
    var flowcashboxA = []; // flowcashboxA is the global cashbox, it is the cashflow
    flowcashboxA[0] = 0; flowcashboxA[1] = 0; flowcashboxA[2] = 0;
    // let cashboxA[0] = Byr, cashboxA[1] = Byn, cashboxA[2] = USD
    var cashboxA = []; // we store the result of calculateCashDelta in it

    for(var cycleTimeDay = startTimeDay; cycleTimeDay <= finishTimeDay; cycleTimeDay++){
        var cycleData = new Date();
        cycleData.setTime(cycleTimeDay*1000*60*60*24);
        cashboxA = calculateCashDelta(cycleTimeDay);
        for(var i = 0; i<flowcashboxA.length; i++){// we increment flowcashboxA with values of cashboxA
            flowcashboxA[i] = flowcashboxA[i] + cashboxA[i];
        }// flowcashboxA has an actual amount of money on the cycleTimeDay
        writeCashFlow(cycleTimeDay, flowcashboxA[0], flowcashboxA[1], flowcashboxA[2]);
        ifWeNeedExchange(cycleTimeDay, flowcashboxA[0], flowcashboxA[1], flowcashboxA[2]); // I have no idea to use it
    }
}

//runCashFlow(findStartData(ratesH), findFinishData(ratesH));//start CashFlow

db.cashflow.remove({});

runCashFlowPLus(findStartData(ratesH), findFinishData(ratesH)); //start CashFlowPlus
