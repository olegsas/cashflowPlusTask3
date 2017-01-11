// We write the constants here
const NUMBER_OF_CATEGORY_NAMES = 4;//how many names are in one category
const DATE_OF_DENOMINATION = new Date("2016-07-01");//the date of denomination, the constants
const WEEK = 7;//days in a week
var NamesIdH = {}; // the object with fields {name: ObjectID} for binding with transaction collection
var WalletsIdH = {}; // the object with fields {name: ObjectID} for binding with transaction collection

function randomMoney(min, max){
    var amount = Math.floor(Math.random()*(max-min) + min);
    return amount;
}

function oneDayOfUser(){// we parse all transaction list
    var i = 1, 
    TypeA = [],// TypeA because there is an array of Type
    OperationNameA = [],// 
    AmountMinA = [],
    AmountMaxA = [],
    CurrencyA = [],
    RateA = [],// Rate[2] - is the Rate field of the transaction 2
    PeriodA = [],
    AccountA = [],
    StudentH = {},// this is the hash, {TypeH : TypeA, and so on}
    cursor = db.student.find(),
    length;
    cursor.forEach(
        function(obj){
            TypeA[i] = obj.Type;// we find certain field of the certain transaction
            OperationNameA[i] = obj.OperationName;
            AmountMinA[i] = obj.AmountMin;
            AmountMaxA[i] = obj.AmountMax;
            CurrencyA[i] = obj.Currency;
            RateA[i] = obj.Rate;
            PeriodA[i] = obj.Period;
            AccountA[i] = obj.Account;
                i++; 
        }
    );
    length = i-1;//after last cycle step i=last step+1
    StudentH = {len : length,// StudentH is a hash of transactions and the it has .len
            Type : TypeA ,
            OperationName : OperationNameA,
            AmountMin : AmountMinA,
            AmountMax : AmountMaxA,
            Currency : CurrencyA,
            Rate : RateA,
            Period : PeriodA,
            Account : AccountA}
 return StudentH;   
}

function standartDate(anyDay){// this function normalize string date into a Date object

    var anyDayA = anyDay.split("/");// we have got an array of 3 numbers in a string type
    
    var anyDATE = new Date();
        anyDATE.setFullYear(anyDayA[2]);// A means Array
        anyDATE.setMonth(anyDayA[0]-1);// we have months in range of 0...11
        anyDATE.setDate(anyDayA[1]);// anyDATE is in a correct format
        // we use format m/y/dddd

    
    return anyDATE;

}


function WriteTransaction(Date, Type, Category, Name, Amount, Currency, Account){
    //Date is in standart format
    db.transactions.insert({"Date": Date, "Type": Type, "Category": Category, "Name": Name,
                           "Amount": Amount, "Currency": Currency, "Account": Account, 
                           "Wallet_id":WalletsIdH[Account],"Category_id": NamesIdH[Category]});
}// we insert document into the collection

function WriteWallet(name, amount){
    db.wallets.insert({"name": name, "amount": amount});
    var Cursor = db.wallets.find({"name": name}).toArray();
    var Element = Cursor[0];
    WalletsIdH[name] = Element['_id'];// we store ObjectID from the database into the hash
}// we create wallets collection

function WriteName(name){
    db.names.insert({"name": name});
    var Cursor = db.names.find({"name": name}).toArray();
    var Element = Cursor[0];
    NamesIdH[name] = Element['_id'];
}// we create names collection

function makeRandomDays(startDay, finishDay, Rate){
    var arr = [];
    var n;
    while(arr.length<Rate){
        n = Math.floor(Math.random()*(finishDay - startDay) + startDay);
        if(arr.indexOf(n) == -1){// the mistake was to use = instead of == or even ===
            arr.push(n);
        }
    }
return arr;
}

function makeMonthlyTransactionsUniversal(start_Day, finish_Day, Month, Year){
    var Rate;// the rate of the period - how many times we make the transaction
    var transaction_Date = [];
    var transactionTimeDay = [];// for normal time
    var transactionAmount = [];
    var transactionNormal_Date = []; // for normal time
    var Number_of_the_name_of_transaction = [];
    var transactionNameOnly = [];
    for(i=1; i<StudentH.len+1; i++){// we check the transaction list
        if(StudentH.Period[i] === "Month"){
            Rate = StudentH.Rate[i];
            var transactionDays = makeRandomDays(start_Day, finish_Day, Rate);
            // we have an array, the length = Rate
            for(var j=0; j<Rate; j++){
                transaction_Date[j] = new Date();
                transaction_Date[j].setFullYear(Year);
                transaction_Date[j].setMonth(Month);
                transaction_Date[j].setDate(transactionDays[j]);
                // we convert it into an object format
                // we need to set the time of transactions into the 0.00.00
                transactionTimeDay[j] = Math.floor(transaction_Date[j].getTime()/(1000*60*60*24));// we find a day since zero point
                transactionNormal_Date[j] = new Date();
                transactionNormal_Date[j].setTime(transactionTimeDay[j]*1000*60*60*24);// We don`t need tocompensate the 1 day difference
            };
            for(var j=0; j<Rate; j++){
                transactionAmount[j] = randomMoney(StudentH.AmountMin[i], StudentH.AmountMax[i]);//returns  amount
            };
            for(var j=0; j<Rate; j++){
               Number_of_the_name_of_transaction[j] = Math.floor((Math.random()*NUMBER_OF_CATEGORY_NAMES));//0...NUMBER-1 
            };
            var operationName =  StudentH.OperationName[i];
            var transactionNameA = namesH[operationName];
            for(var j=0; j<Rate; j++){
                transactionNameOnly[j] = transactionNameA[Number_of_the_name_of_transaction[j]];
            };
            var transactionType = StudentH.Type[i];
            var transactionCurrency = StudentH.Currency[i];
            var transactionAccount = StudentH.Account[i];
            for(var j=0; j<Rate; j++){
                if((StudentH.Currency[i] === "Byn") || (StudentH.Currency[i] === "Byr")){
                    if((StudentH.Currency[i] === "Byn")&&(transactionNormal_Date[j] >= DATE_OF_DENOMINATION)){
                       WriteTransaction(transactionNormal_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount) 
                    };
                    if((StudentH.Currency[i] === "Byr")&&(transactionNormal_Date[j] < DATE_OF_DENOMINATION)){
                        WriteTransaction(transactionNormal_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount)
                    }

                }else{
                    WriteTransaction(transactionNormal_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount)
                    // any currency we do not care of the denomination
                }
            }
        }
    }
}

function runMonthly(startDate, finishDate){// global function runs transaction generation
    var startDATE = standartDate(startDate);
    
    var finishDATE = standartDate(finishDate);//standart Data objects
    var start_Day = startDATE.getDate();
    var start_Month = startDATE.getMonth();// month is in range 0...11
    var start_Year = startDATE.getFullYear();

    var max_day_month = new  Date(start_Year, start_Month+1, 0).getDate();// how many days in month

    var last_Day = max_day_month; // for the first month
        
    makeMonthlyTransactionsUniversal(start_Day, last_Day, start_Month, start_Year);// we call this functions
    //to make all monthly transactions for the first month

       
        var zDATE = new Date(start_Year, start_Month, last_Day);
        zDATE.setDate(zDATE.getDate()+1);

	var cycleDATEstart,
	    cycleDATEfinish,
	    cycle_day_in_month,
	    cycleDay,
	    cycleMonth,
	    cycleYear,
	    bufferDay,
	    bufferMonth,
	    bufferYear;
	    do{
	        cycleDATEstart = zDATE;// first day of month
	        cycleDayFirst = zDATE.getDate();
	        cycleMonth = zDATE.getMonth();
	        cycleYear = zDATE.getFullYear();
	        cycle_day_in_month = new Date(cycleYear, cycleMonth+1,0).getDate();//how many days in month - OK

	        bufferDay = cycleDATEstart.getDate();
	        bufferMonth = cycleDATEstart.getMonth();
	        bufferYear = cycleDATEstart.getFullYear();
        
	        cycleDATEfinish = new Date(bufferYear, bufferMonth, bufferDay);//just now we have a clone
	        cycleDATEfinish.setDate(cycleDATEfinish.getDate()+cycle_day_in_month-1);
    
	        if(cycleDATEfinish > finishDATE){
	            makeMonthlyTransactionsUniversal(cycleDayFirst, finishDATE.getDate(), cycleMonth, cycleYear);
	            //we are in the last short month
	        }
	        else{
	            makeMonthlyTransactionsUniversal(cycleDayFirst, cycle_day_in_month, cycleMonth, cycleYear);
	            //we work with full month
	        }
    
	        bufferDay = cycleDATEfinish.getDate();
	        bufferMonth = cycleDATEfinish.getMonth();
	        bufferYear = cycleDATEfinish.getFullYear();
        
	        zDATE = new Date(bufferYear, bufferMonth, bufferDay);//just now we have a clone 
	        zDATE.setDate(cycleDATEfinish.getDate()+1);
    	}while(cycleDATEfinish < finishDATE);
}

function DaysInYear(Year){
    var jan = new Date(Year,1,0).getDate();// getDay is the method to find the day of a week
    var feb = new Date(Year,2,0).getDate();
    var mar = new Date(Year,3,0).getDate();
    var apr = new Date(Year,4,0).getDate();
    var may = new Date(Year,5,0).getDate();
    var jun = new Date(Year,6,0).getDate();
    var jul = new Date(Year,7,0).getDate();
    var aug = new Date(Year,8,0).getDate();
    var sep = new Date(Year,9,0).getDate();
    var oct = new Date(Year,10,0).getDate();
    var nov = new Date(Year,11,0).getDate();
    var dec = new Date(Year,12,0).getDate();
    var SumDay = jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec;
    return SumDay;
}

function toPlainDays(anyDate, anyMonth, anyYear){//returns tow many days between the 1-st January and the anyDATA
    // we use .getTime() method
   // var anyYear = anyDATA.getFullYear();
    var startTime = (new Date(anyYear,0,1)).getTime();//new year
    var anyDATA = new Date(anyYear, anyMonth, anyDate);
    var anyTime = anyDATA.getTime();
    var deltaTIME = anyTime - startTime;
    var plainDays = Math.floor(deltaTIME/(1000*60*60*24))+1;
    return plainDays;

}


function makeYearlyTransactionsUniversal(start_Day, last_Day, Year){
    var Rate;// the rate of the period - how many times we make the transaction
    var transaction_Date = [];
    var transactionTimeDay = [];
    var transactionAmount = [];
    var transactionNormal_Date = [];
    var Number_of_the_name_of_transaction = [];
    var transactionNameOnly = [];
    for(i=1; i<StudentH.len+1; i++){// we check the transaction list
        if(StudentH.Period[i] === "Year"){// we check year period only
            Rate = StudentH.Rate[i];
            var transactionDays = makeRandomDays(start_Day, last_Day, Rate);
            // we have an array, the length = Rate
            for(var j=0; j<Rate; j++){
                transaction_Date[j] = new Date(Year, 0, transactionDays[j]);
                // we convert it into an object format
                // we need to set the time of the date into the 0.00.00 hours
                transactionTimeDay[j] = Math.floor(transaction_Date[j].getTime()/(1000*60*60*24));// we find a day since zero point
                transactionNormal_Date[j] = new Date();
                transactionNormal_Date[j].setTime((transactionTimeDay[j]+1)*1000*60*60*24);// We compensate the 1 day difference
            };
            for(var j=0; j<Rate; j++){
                transactionAmount[j] = randomMoney(StudentH.AmountMin[i], StudentH.AmountMax[i]);//returns  amount
            };
            for(var j=0; j<Rate; j++){
               Number_of_the_name_of_transaction[j] = Math.floor((Math.random()*NUMBER_OF_CATEGORY_NAMES));//0...NUMBER-1 
            };
            var operationName =  StudentH.OperationName[i];
            var transactionNameA = namesH[operationName];
            for(var j=0; j<Rate; j++){
                transactionNameOnly[j] = transactionNameA[Number_of_the_name_of_transaction[j]];
            };
            var transactionType = StudentH.Type[i];
            var transactionCurrency = StudentH.Currency[i];
            var transactionAccount = StudentH.Account[i];

            for(var j=0; j<Rate; j++){
                if((StudentH.Currency[i] === "Byn") || (StudentH.Currency[i] === "Byr")){
                    if((StudentH.Currency[i] === "Byn")&&(transactionNormal_Date[j] >= DATE_OF_DENOMINATION)){
                       WriteTransaction(transactionNormal_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount) 
                    };
                    if((StudentH.Currency[i] === "Byr")&&(transactionNormal_Date[j] < DATE_OF_DENOMINATION)){
                        WriteTransaction(transactionNormal_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount)
                    }

                }else{
                    WriteTransaction(transactionNormal_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount)
                    // any currency we do not care of the denomination
                }

            }
        }
    }
}

function makeWeeklyTransactionsUniversal(startTimeDay, lastTimeDay){
    var Rate;// the rate of the period - how many times we make the transaction
    var transaction_Date = [];
    var transactionAmount = [];
    var Number_of_the_name_of_transaction = [];
    var transactionNameOnly = [];
    for(i=1; i<StudentH.len+1; i++){// we check the transaction list
    	if(StudentH.Period[i] === "Week"){
            Rate = StudentH.Rate[i];
            var transactionTimeDays = makeRandomDays(startTimeDay, lastTimeDay, Rate);
            // we have an array, the length = Rate
            for(var j=0; j<Rate; j++){
                transaction_Date[j] = new Date();
                transaction_Date[j].setTime(transactionTimeDays[j]*1000*60*60*24);// Data object format
                // we convert it into an object format
            };
            for(var j=0; j<Rate; j++){
                transactionAmount[j] = randomMoney(StudentH.AmountMin[i], StudentH.AmountMax[i]);//returns  amount
            };
            for(var j=0; j<Rate; j++){
               Number_of_the_name_of_transaction[j] = Math.floor((Math.random()*NUMBER_OF_CATEGORY_NAMES));//0...NUMBER-1 
            };
            var operationName =  StudentH.OperationName[i];
            var transactionNameA = namesH[operationName];
            for(var j=0; j<Rate; j++){
                transactionNameOnly[j] = transactionNameA[Number_of_the_name_of_transaction[j]];
            };
            var transactionType = StudentH.Type[i];
            var transactionCurrency = StudentH.Currency[i];
            var transactionAccount = StudentH.Account[i];
            for(var j=0; j<Rate; j++){
                if((StudentH.Currency[i] === "Byn") || (StudentH.Currency[i] === "Byr")){
                    if((StudentH.Currency[i] === "Byn")&&(transaction_Date[j] >= DATE_OF_DENOMINATION)){
                       WriteTransaction(transaction_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount) 
                    };
                    if((StudentH.Currency[i] === "Byr")&&(transaction_Date[j] < DATE_OF_DENOMINATION)){
                        WriteTransaction(transaction_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount)
                    }

                }else{
                    WriteTransaction(transaction_Date[j],transactionType, operationName, transactionNameOnly[j], 
                             transactionAmount[j], transactionCurrency, transactionAccount)
                    // any currency we do not care of the denomination
                }
            }
        }          
	}
}

function runYearly(startDate, finishDate){// global function runs transaction generation
    var startDATE = standartDate(startDate);
    
    var finishDATE = standartDate(finishDate);//standart Data objects
    var start_Day = startDATE.getDate();
    var start_Month = startDATE.getMonth();// month is in range 0...11
    var start_Year = startDATE.getFullYear();


    var last_Day = DaysInYear(start_Year);// it will be 365 or 366

    makeYearlyTransactionsUniversal(start_Day, last_Day, start_Year);// we call this functions
    
    var zDATE = new Date(start_Year, 0, last_Day);
        zDATE.setDate(zDATE.getDate()+1);

    var cycleDATEstart,
    cycleDATEfinish,
    cycle_day_in_year,
    cycleDay,
    cycleMonth,
    cycleYear,
    bufferDay,
    bufferMonth,
    bufferYear;

    do{
        cycleDATEstart = zDATE;// 1 jan 2011
        cycleDayFirst = zDATE.getDate();
        cycleMonth = zDATE.getMonth();
        cycleYear = zDATE.getFullYear();
        cycle_day_in_year = DaysInYear(cycleYear);// 365 or 366

        bufferDay = cycleDATEstart.getDate();
        bufferMonth = cycleDATEstart.getMonth();
        bufferYear = cycleDATEstart.getFullYear();
        
        cycleDATEfinish = new Date(bufferYear, bufferMonth, bufferDay);//just now we have a clone
        cycleDATEfinish.setDate(cycleDATEfinish.getDate()+cycle_day_in_year-1);

        if(cycleDATEfinish > finishDATE){
            makeYearlyTransactionsUniversal(cycleDayFirst, toPlainDays(finishDATE.getDate(), finishDATE.getMonth(), finishDATE.getFullYear()), cycleYear);
            //we are in the last short month
            //toPlainDays(anyDATA) returns how many days are between the 1-st January
            //and the anyDATA
        }
        else{
            makeYearlyTransactionsUniversal(cycleDayFirst, cycle_day_in_year, cycleYear);
            //we work with full month
        }

        bufferDay = cycleDATEfinish.getDate();
        bufferMonth = cycleDATEfinish.getMonth();
        bufferYear = cycleDATEfinish.getFullYear();
        
        zDATE = new Date(bufferYear, bufferMonth, bufferDay);//just now we have a clone 
        zDATE.setDate(cycleDATEfinish.getDate()+1);
    }while(cycleDATEfinish < finishDATE);
}

function runWeekly(startDate, finishDate){// global function runs transaction generation
    var startDATE = standartDate(startDate);
    var startTimeDay = Math.floor(startDATE.getTime()/(1000*60*60*24));// we find a day since the zero point
    // we do not need to use start_Day, start_Month, start_Year
    // we count days from the begining of the time;
    // the next step we want to transform days into the data;
    var finishDATE = standartDate(finishDate);//standart Data objects
    var finishTimeDay = Math.floor(finishDATE.getTime()/(1000*60*60*24));
    
    var lastTimeDay = startTimeDay + WEEK - 1;// first week - we count it from the begining of the zero point

    makeWeeklyTransactionsUniversal(startTimeDay, lastTimeDay);// we call this functions for the 1-st week
    
    var zTimeDay = lastTimeDay + 1;//the first day of the next week

    var cycleTimeDaystart;
    
    do{
        cycleTimeDayStart = zTimeDay;// 1-st day of the next week
        cycleTimeDayFinish = cycleTimeDayStart + WEEK - 1;// last day of the next week
        if(cycleTimeDayFinish <= finishTimeDay){
            makeWeeklyTransactionsUniversal(cycleTimeDayStart, cycleTimeDayFinish);
            // we are in a full-time week
            // we ignore short last week
        }

        zTimeDay = cycleTimeDayFinish + 1; // 1-st day of the next next week
    
    }while(cycleTimeDayFinish < finishTimeDay);

}    

/*--------------------- this three functions run three periods of transactions - month, year, week -----------------*/

var StudentH = oneDayOfUser();// we take this array;

function makeWallets(AccountA){//AccountA - is an array of accounts
    var wallets = [];
    var cycleWallet;
    var len = AccountA.length;
    for(var i = 1; i <=len ; i++){
        cycleWallet = AccountA[i];
        if(cycleWallet){
            if(wallets.indexOf(cycleWallet) == -1){// the mistake was to use = instead of == or even ===
            wallets.push(cycleWallet);
            }
        }
    }
    for(var j = 0; j<wallets.length; j++){
        WriteWallet(wallets[j],0);//start amounts = 0
    }
}// we make the wallets collection

function makeNames(OperationNameA){//OperationNameA - is an array of operation names
    var names = [];
    var cycleName;
    var len = OperationNameA.length;
    for(var i = 1; i<=len; i++){
        cycleName = OperationNameA[i];
        if(cycleName){
            if(names.indexOf(cycleName) == -1){
                names.push(cycleName);
            }
        }
    }
    for(var j = 0; j<names.length; j++){
        WriteName(names[j]);
    }
}// we make the names collection

function runAll(begin, end){
    makeWallets(StudentH.Account);// StudentH.AccountA - is the array of the transaction accounts
    //wallets is the array with single unique wallets
    makeNames(StudentH.OperationName);
    runYearly(begin, end);
    runMonthly(begin, end);
    runWeekly(begin, end);
}

function dataRates(){
    var ratesdbH = db.rates.find().toArray();// we accept it from the DB
    var len = ratesdbH.length;// the length of our array
    var ratesH = {};// we create a new object
    dataA = []; rateA = []; standartDateA = [];
    for(var i = 0; i<len; i++){
        dataA[i] = ratesdbH[i].date;
        //rateA[i] = ratesdbH[i].rate; there is a problem - field rate begins with a space
        standartDateA[i] = standartDate(dataA[i]);

    }

    ratesH.data = dataA;
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

function makeTransactionNames(){// we make names for the transaction operations
    var namesH = {
        "GroceryShopping": [ 
            "fruits", 
            "meat", 
            "vegetables", 
            "fish"
        ],
        "ClothesShopping": [
            "shirt", 
            "boots", 
            "jeans", 
            "hat"
        ],
        "Transport": [
            "bus", 
            "tram", 
            "metro", 
            "minibus"
        ],
        "Rest": [
            "cinema", 
            "cafe", 
            "football", 
            "gym"
        ],
        "Study": [
            "books", 
            "copybooks", 
            "online training", 
            "seminar"
        ],
        "HouseRent": [
            "gas", 
            "water", 
            "electricity", 
            "home telephone"
        ],
        "Utilities": [
            "toothpaste", 
            "soap", 
            "shampoo", 
            "shaving cream"
        ],
        "Internet": [
            "beltelecom", 
            "zala", 
            "damavik", 
            "hottelecom"
        ],
        "Phone": [
            "mts", 
            "velcom", 
            "life", 
            "privet"
        ],
        "PhoneAndInternet": [
            "life 3G", 
            "velcom 3G", 
            "mts 3G", 
            "privet 3G"
        ],
        "UtilitiesAndPhone": [
            "case for a phone", 
            "battery", 
            "microSD card", 
            "protective film for a phone"
        ],
        "Parents": [
            "mother", 
            "father", 
            "uncle", 
            "aunt"
        ],
        "Salary": [
            "work", 
            "hackwork", 
            "subcontractor`s work", 
            "telework"
        ]
    }
    return namesH;// we return an object with operation names
}

var namesH = makeTransactionNames();// namesH is an object with transaction names;


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
    //ratesH is in a string format
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

// runAll(findStartData(ratesH), findFinishData(ratesH));//start date and final date - in my task 2016

runCashFlow(findStartData(ratesH), findFinishData(ratesH));//start CashFlow

