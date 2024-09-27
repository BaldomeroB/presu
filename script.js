document.addEventListener('DOMContentLoaded', function () {
    let bankATotal = 0;
    let bankBTotal = 0;
    let transactions = [];
    let loans = [];

    // Función para abrir pestañas
    window.openTab = function(tabName) {
        document.querySelectorAll('.tab-content').forEach(function (tab) {
            tab.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    };
  
    // Cargar datos desde LocalStorage
    function loadData() {
        const savedTransactions = localStorage.getItem('transactions');
        const savedLoans = localStorage.getItem('loans');
        const savedBankATotal = localStorage.getItem('bankATotal');
        const savedBankBTotal = localStorage.getItem('bankBTotal');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
            renderTransactions();
        }
        if (savedLoans) {
            loans = JSON.parse(savedLoans);
            renderLoans();
        }
        if (savedBankATotal !== null) {
            bankATotal = parseFloat(savedBankATotal);
        }
        if (savedBankBTotal !== null) {
            bankBTotal = parseFloat(savedBankBTotal);
        }
        updateTotals();
    }
  
    // Guardar transacciones y préstamos en LocalStorage
    function saveData() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('loans', JSON.stringify(loans));
        localStorage.setItem('bankATotal', bankATotal);  // Guardar total de BCP
        localStorage.setItem('bankBTotal', bankBTotal);  // Guardar total de Scotiabank
    }

    // Mostrar totales de bancos
    function updateTotals() {
        const total = bankATotal + bankBTotal;
        document.getElementById('bankATotal').textContent = bankATotal.toFixed(2);
        document.getElementById('bankBTotal').textContent = bankBTotal.toFixed(2);
        document.getElementById('total').textContent = total.toFixed(2);
        saveData();  // Guardar los datos en LocalStorage
    }

    // Agregar Ingreso
    window.addIncome = function () {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const bank = document.getElementById('bank').value;
        const date = new Date().toLocaleDateString();

        if (!description || isNaN(amount) || amount <= 0) {
            alert('Por favor, ingrese una descripción y monto válido.');
            return;
        }

        transactions.push({ description, amount, bank, date, type: 'income' });
        if (bank === 'A') {
            bankATotal += amount;
        } else {
            bankBTotal += amount;
        }
        updateTotals();
        renderTransactions();
        saveData();  // Guardar los datos en LocalStorage

        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
    };

    // Agregar Gasto
    window.addExpense = function () {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const bank = document.getElementById('bank').value;
        const date = new Date().toLocaleDateString();

        if (!description || isNaN(amount) || amount <= 0) {
            alert('Por favor, ingrese una descripción y monto válido.');
            return;
        }

        if (bank === 'A' && amount > bankATotal || bank === 'B' && amount > bankBTotal) {
            alert('El gasto supera el saldo disponible.');
            return;
        }

        transactions.push({ description, amount, bank, date, type: 'expense' });
        if (bank === 'A') {
            bankATotal -= amount;
        } else {
            bankBTotal -= amount;
        }
        updateTotals();
        renderTransactions();
        saveData();  // Guardar los datos en LocalStorage

        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
    };

    

    // Mostrar transacciones
    function renderTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        transactionsList.innerHTML = '';

        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.textContent = `${transaction.description} - $${transaction.amount.toFixed(2)} - ${transaction.date}`;
            li.classList.add(transaction.type === 'income' ? 'income' : 'expense');
            transactionsList.appendChild(li);
        });
    }

    // Agregar préstamo
    window.addLoan = function () {
        const name = document.getElementById('loanName').value;
        const amount = parseFloat(document.getElementById('loanAmount').value);
        const date = new Date().toLocaleDateString();

        if (!name || isNaN(amount) || amount <= 0) {
            alert('Por favor, ingrese un nombre y monto válido.');
            return;
        }

        loans.push({ name, amount, date, movements: [{ amount, date, type: 'add' }] });
        renderLoans();
        saveData(); // Guardar datos en LocalStorage

        document.getElementById('loanName').value = '';
        document.getElementById('loanAmount').value = '';
    };

    // Renderizar préstamos
    function renderLoans() {
        const loansList = document.getElementById('loansList');
        loansList.innerHTML = '';

        loans.forEach((loan, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${loan.name} - $${loan.amount.toFixed(2)}</strong> - ${loan.date}
                <ul>
                    ${loan.movements.map(movement => `
                        <li>${movement.type === 'add' ? 'Agregado' : 'Reducido'}: $${movement.amount.toFixed(2)} - ${movement.date}</li>
                    `).join('')}
                </ul>
                <div>
                    <input type="number" placeholder="Monto" class="modifyAmount">
                    <button class="addLoanAmount" onclick="addLoanAmount(${index})">Aumentar</button>
                    <button class="reduceLoan" onclick="reduceLoan(${index})">Reducir</button>
                    <button class="payLoan" onclick="payLoan(${index})">Pagar</button>
                </div>
            `;
            loansList.appendChild(li);
        });
    }

    // Aumentar monto de préstamo
    window.addLoanAmount = function (index) {
        const amountInput = document.querySelectorAll('.modifyAmount')[index];
        const amount = parseFloat(amountInput.value);
        const date = new Date().toLocaleDateString();

        if (!isNaN(amount) && amount > 0) {
            loans[index].amount += amount;
            loans[index].movements.push({ amount, date, type: 'add' });
            renderLoans();
            saveData();  // Guardar los datos en LocalStorage
        } else {
            alert('Ingrese un monto válido');
        }
    };

    // Reducir préstamo
    window.reduceLoan = function (index) {
        const amountInput = document.querySelectorAll('.modifyAmount')[index];
        const amount = parseFloat(amountInput.value);
        const date = new Date().toLocaleDateString();

        if (!isNaN(amount) && amount > 0 && amount <= loans[index].amount) {
            loans[index].amount -= amount;
            loans[index].movements.push({ amount, date, type: 'reduce' });
            if (loans[index].amount === 0) loans.splice(index, 1);
            renderLoans();
            saveData();  // Guardar los datos en LocalStorage
        } else {
            alert('Monto inválido o mayor al saldo del préstamo');
        }
    };

    // Pagar préstamo completo
    window.payLoan = function (index) {
        loans.splice(index, 1);
        renderLoans();
        saveData();  // Guardar los datos en LocalStorage
    };

      
    loadData();  // Cargar los datos al cargar la página
    openTab('presupuesto');  // Mostrar la pestaña de presupuesto por defecto
});
