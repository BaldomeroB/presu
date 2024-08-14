document.addEventListener('DOMContentLoaded', function () {
    let bankATotal = 0;
    let bankBTotal = 0;
    let transactions = [];
    let loans = [];

    // Cargar datos desde localStorage
    function loadData() {
        const savedTransactions = localStorage.getItem('transactions');
        const savedLoans = localStorage.getItem('loans');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
            transactions.forEach(transaction => addTransactionToList(transaction));
        }
        if (savedLoans) {
            loans = JSON.parse(savedLoans);
            renderLoans();
        }
        // Recalcular los totales
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                if (transaction.bank === 'A') {
                    bankATotal += transaction.amount;
                } else {
                    bankBTotal += transaction.amount;
                }
            } else {
                if (transaction.bank === 'A') {
                    bankATotal -= transaction.amount;
                } else {
                    bankBTotal -= transaction.amount;
                }
            }
        });
        updateTotal();
    }

    function updateTotal() {
        const total = bankATotal + bankBTotal;
        document.getElementById('bankATotal').textContent = bankATotal.toFixed(2);
        document.getElementById('bankBTotal').textContent = bankBTotal.toFixed(2);
        document.getElementById('total').textContent = total.toFixed(2);
    }

    function addTransaction(description, amount, bank, type) {
        const date = new Date().toLocaleDateString();
        if (type === 'expense') {
            if (bank === 'A' && amount > bankATotal) {
                alert('El monto del gasto supera el saldo disponible en BCP.');
                return;
            } else if (bank === 'B' && amount > bankBTotal) {
                alert('El monto del gasto supera el saldo disponible en Scotiabank.');
                return;
            }
        }
        const transaction = { description, amount, bank, type, date };
        transactions.push(transaction);
        addTransactionToList(transaction);
        if (type === 'income') {
            if (bank === 'A') {
                bankATotal += amount;
            } else {
                bankBTotal += amount;
            }
        } else {
            if (bank === 'A') {
                bankATotal -= amount;
            } else {
                bankBTotal -= amount;
            }
        }
        updateTotal();
        // Guardar datos en localStorage
        localStorage.setItem('transactions', JSON.stringify(transactions));
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
    }

    function addTransactionToList(transaction) {
        const li = document.createElement('li');
        li.textContent = `${transaction.description} - $${transaction.amount.toFixed(2)} - ${transaction.date}`;
        li.classList.add(transaction.type === 'income' ? 'income' : 'expense');
        document.getElementById('transactionsList').appendChild(li);
    }

    function addLoan(name, amount) {
        const date = new Date().toLocaleDateString();
        const loan = { name, amount, date };
        loans.push(loan);
        renderLoans();
        // Guardar datos en localStorage
        localStorage.setItem('loans', JSON.stringify(loans));
        document.getElementById('loanName').value = '';
        document.getElementById('loanAmount').value = '';
    }

    function renderLoans() {
        const loansList = document.getElementById('loansList');
        loansList.innerHTML = '';
        loans.forEach((loan, index) => {
            const li = document.createElement('li');
            li.classList.add('loan');
            li.innerHTML = `
                ${loan.name} - $${loan.amount.toFixed(2)} - ${loan.date}
                <div class="reduce-debt-container">
                    <input type="number" placeholder="Monto a reducir" class="reduceAmount">
                    <button class="reduceLoan" onclick="reduceLoan(${index})">Reducir</button>
                    <button class="payLoan" onclick="payLoan(${index})">Pagar</button>
                </div>
            `;
            loansList.appendChild(li);
        });
    }

    window.reduceLoan = function (index) {
        const amountInput = document.querySelectorAll('.reduceAmount')[index];
        const amount = parseFloat(amountInput.value);
        if (!isNaN(amount) && amount > 0 && amount <= loans[index].amount) {
            loans[index].amount -= amount;
            if (loans[index].amount === 0) {
                loans.splice(index, 1);
            }
            renderLoans();
            // Guardar datos en localStorage
            localStorage.setItem('loans', JSON.stringify(loans));
        } else {
            alert('Monto inválido o mayor al saldo de la deuda');
        }
    };

    window.payLoan = function (index) {
        loans.splice(index, 1);
        renderLoans();
        // Guardar datos en localStorage
        localStorage.setItem('loans', JSON.stringify(loans));
    };

    document.getElementById('addIncome').addEventListener('click', function () {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const bank = document.getElementById('bank').value;
        if (description && !isNaN(amount) && amount > 0) {
            addTransaction(description, amount, bank, 'income');
        } else {
            alert('Por favor, ingrese una descripción válida y un monto positivo.');
        }
    });

    document.getElementById('addExpense').addEventListener('click', function () {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const bank = document.getElementById('bank').value;
        if (description && !isNaN(amount) && amount > 0) {
            addTransaction(description, amount, bank, 'expense');
        } else {
            alert('Por favor, ingrese una descripción válida y un monto positivo.');
        }
    });

    document.getElementById('addLoan').addEventListener('click', function () {
        const name = document.getElementById('loanName').value;
        const amount = parseFloat(document.getElementById('loanAmount').value);
        if (name && !isNaN(amount) && amount > 0) {
            addLoan(name, amount);
        } else {
            alert('Por favor, ingrese un nombre válido y un monto positivo.');
        }
    });

    function showTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
    }

    window.showTab = showTab;

    // Cargar los datos al iniciar
    loadData();
});
