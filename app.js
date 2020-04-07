// BUDGET CONTROLLER
var budgetController = (function() {
    var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
      if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome)*100);
      } else {
        this.percentage = -1;
      }
    };

    Expense.prototype.getPercentage = function () {
      return this.percentage;
    }

    var Income = function(id, description,value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var calculateTotal = function(type) {
      var sum = 0;
      data.allItems[type].forEach(function(cur){
        sum = sum + cur.value;
      });
      data.total[type] = sum;

    };

    var data = {
        allItems: {
          exp: [],
          inc: []
        },
        total: {
          exp: 0,
          inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
      addItem: function(type, des, val){
        var newItem, ID;

        //CREATE NEW ID
        if(data.allItems[type].length > 0){
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          ID = 0;
        }

        //CREATE NEW ITEM BASED ON EXPENSE OR INCOME
        if (type === "exp") {
            newItem = new Expense (ID,des,val);
        } else if (type === "inc") {
            newItem = new Income (ID,des,val);
        }

        //SENDING DATA TO DATA STRUCTURE
        data.allItems[type].push(newItem);

        return newItem;
      },

      deleteItem: function(type, id) {
          var ids, index;
          ids = data.allItems[type].map(function(current) {
              return current.id;
          });

          //GETTING THE ID OF WHAT WE WANT TO DELETE
          index = ids.indexOf(id);

          if (index !== -1){
              data.allItems[type].splice(index, 1);
          }
      },

      calculateBudget: function(){

        // CALCULATE TOTAL INCOME AND Expense
            calculateTotal("exp");
            calculateTotal("inc");

        // CALCULATE THE BUDGET: INCOME - EXPENSE
            data.budget = data.total.inc - data.total.exp;

        // CALCULATE THE PERCENTEGE OF INCOME THAT WE SPENT
            if(data.total.inc > 0){
                data.percentage = Math.round((data.total.exp/data.total.inc) * 100);
            } else {
              data.percentage = -1;
            }

      },

      getBudget: function(){
          return {
            budget: data.budget,
            percentage: data.percentage,
            totalInc: data.total.inc,
            totalExp: data.total.exp
          }
      },

      calculatePercentage: function() {
          data.allItems.exp.forEach(function(current){
            current.calcPercentage(data.total.inc);
          });
      },

      getPercentage: function(){
          var allPercentage = data.allItems.exp.map(function(current){
            return current.getPercentage();
          });
          return allPercentage;
      },

      testing: function(){
        console.log(data);
      }
    };

})();

// UI CONTROLLER
var UIController = (function(){
      var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
      };

      var formatNumber =  function(num, type){
          var numSplit, int, dec, type;
          num = Math.abs(num);    //.abs method convert it to absolute number
          num = num.toFixed(2);   //.toFixed round the number to about of decimal passed as argument

          numSplit= num.split('.');
          int = numSplit[0];
          dec = numSplit[1];
          if (int.length > 3) {
              int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //substr = substring method which allows us to take sub part of our string
          }



          return (type === "exp" ? "-" : "+") + " " + int + '.' + dec;
      };

      return {
            getInput: function(){
                  return {
                    type: document.querySelector(DOMStrings.inputType).value,
                    description: document.querySelector(DOMStrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
                  };
            },

            addListItem: function(obj, type, id){
              var html, insert, element;
              ids = id;
              //HTML STRING
              if (type === "inc"){
                html = '<div class="item clearfix" id="inc-' + ids + '"><div class="item__description">'+ obj.description +'</div><div class="right clearfix"><div class="item__value">'+ formatNumber(obj.value, type) +'</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                element = DOMStrings.incomeContainer;
              } else if (type === "exp"){
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-'+ ids +'"><div class="item__description">'+ obj.description +'</div><div class="right clearfix"><div class="item__value">'+ formatNumber(obj.value, type) +'</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>';
              }

              //INSERTING INTO THE EXPENSE AND INCOME PANELS
              document.querySelector(element).insertAdjacentHTML("beforeend", html);

            },

            deleteListItem: function(selectorID){
              var el = document.getElementById(selectorID)
              el.parentNode.removeChild(el);

            },

            clearfields: function(){
              var fields,fieldsarray;
              fields = document.querySelectorAll(DOMStrings.inputDescription + ',' +DOMStrings.inputValue);

              //CONVERTING LIST RETURNED BY querySelectorAll TO ARRAY
              fieldsarray = Array.prototype.slice.call(fields);
              fieldsarray.forEach(function(current, index, array){
                  current.value= "";
              });

              fieldsarray[0].focus();
            },

            displayBudget: function(obj){

              // DISPLAYING THE BUDGET
              var type;
              obj.budget > 0 ? type = "inc" : type = "exp"
              document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
              document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "exp");
              document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");
              if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";

              } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
              }

            },

            displayPercentages: function(percentages) {
                var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

                var nodeListForEach = function (list, callback) {
                    for (var i = 0; i < list.length; i++){
                      callback(list[i], i);
                    }
                };

                nodeListForEach(fields, function(current, index) {

                  //CALLBACK FUNCTION FOR FUNCTION nodeListForEach
                  if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                  } else {
                    current.textContent = '---';
                  }

                });
            },

            displayMonth : function(){
              var now, months, year, month;
              now = new Date();

              months = ["jan", "feb", "march" , "april", "may", "june", "july", "august", "sept", "oct", "nov", "dec"];
              month = now.getMonth();
              year = now.getFullYear();
              document.querySelector(DOMStrings.dateLabel).textContent = months[month - 1] + ", " + year;

            },

            getDomStrings:function() {
              return DOMStrings;
            }
      };

})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

      var setupEventListener = function (){

        //FOR EVENT WHEN CLICK OR ENTER IS PRESSED
        var DOM = UICtrl.getDomStrings();
        document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function(e){
          if (e.key === "Enter") {
              ctrlAddItem();
          }

        });

          document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      };

      var updateBudget = function(){
        // 1. calculate the budget
            budgetCtrl.calculateBudget();

        // 2. Return the budget
            var budget =  budgetCtrl.getBudget();

        // 3. display the budget on UI
            UICtrl.displayBudget(budget);

      };

      var updatePercentage = function(){
          // 1. CALCULATE THE PERCENTAGE
              budgetCtrl.calculatePercentage();
          // 2. READ PERCENTAGE FROM BUDGET CONTROLLER
              var percentage = budgetCtrl.getPercentage();
          // 3. UPDATE THE UI WITH PERCENTAGES
              UICtrl.displayPercentages(percentage);
      };

      var ctrlAddItem = function(){
        var input, newItem;

            // 1.Get feild input data
            var input = UICtrl.getInput();

            if (input.description !== "" && !isNaN(input.value) && input.value > 0){
              // 2. Add item to budget CONTROLLER
                var newItem = budgetCtrl.addItem(input.type,input.description,input.value);

              // 3. add item to ui
                UICtrl.addListItem(input, input.type , newItem.id);

              // 4. Clearing the fields
                UICtrl.clearfields();

              // 5. Calculate and Update the budget
                updateBudget();

              // 6. CALCULATE THE UPDATED PERCENTAGE
                updatePercentage();
            }

      };

      var ctrlDeleteItem = function(event){
          var itemID, splitID, type, ID;
          itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

          if (itemID) {
              splitID = itemID.split("-");
              type = splitID[0];
              ID = parseInt(splitID[1]);

              // 1. DELETE ITEM FROM DATA STRUCTURE
                  budgetCtrl.deleteItem(type, ID);

              // 2. DELETE THE ITEM FROM UI
                  UICtrl.deleteListItem(itemID);

              // 3. UPDATE AND SHOW NEW BUDGET
                  updateBudget();

              // 4. CALCULATE AND UPDATE PERCENTAGE
                  updatePercentage();

          }

      };

      return{
        init: function(){
          console.log("Application has Started");
          UICtrl.displayMonth();
          UICtrl.displayBudget({
            budget: 0,
            percentage: "---",
            totalInc: 0,
            totalExp: 0
          });
          setupEventListener();
        }
      };

})(budgetController, UIController);

controller.init();
