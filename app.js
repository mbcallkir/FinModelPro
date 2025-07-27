// FinModel Pro - Главный JavaScript файл
class FinModelApp {
    constructor() {
        this.currentUser = null;
        this.currentModel = null;
        this.currentPage = 'landing';
        this.charts = {};
        this.authMode = 'login';
        
        this.initializeApp();
    }

    initializeApp() {
        // Инициализация приложения
        this.loadUserSession();
        this.setupEventListeners();
        this.updateUI();
        
        // Автосохранение каждые 30 секунд
        setInterval(() => {
            if (this.currentModel && this.currentPage === 'model-editor') {
                this.saveModel();
            }
        }, 30000);
    }

    setupEventListeners() {
        // Навигация в sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.showDashboardPage(page);
            });
        });

        // Табы в редакторе модели
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showEditorTab(tabName);
            });
        });

        // Табы расходов
        document.querySelectorAll('.expense-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.expenseTab;
                this.showExpenseTab(tabName);
            });
        });

        // Форма аутентификации
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuth();
            });
        }

        // Обновление полей модели
        this.setupModelFieldListeners();

        // Переключение темы
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }

        // Закрытие модальных окон по клику на фон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });

        // Закрытие модальных окон по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
    }

    setupModelFieldListeners() {
        // Основные параметры
        ['planning-horizon', 'base-currency', 'discount-rate', 'initial-investment', 'working-capital'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateModelCalculations());
            }
        });

        // Операционные расходы
        ['rent-expense', 'utilities-expense', 'admin-expense', 'other-expense'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateModelCalculations());
            }
        });

        // Маркетинговые расходы
        ['online-advertising', 'offline-advertising', 'pr-events', 'content-marketing'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateModelCalculations());
            }
        });
    }

    // Аутентификация
    showAuthModal(mode) {
        this.authMode = mode;
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('auth-modal-title');
        const submitBtn = document.getElementById('auth-submit');
        const registerFields = document.getElementById('register-fields');
        const switchText = document.getElementById('auth-switch-text');

        if (mode === 'register') {
            title.textContent = 'Регистрация';
            submitBtn.textContent = 'Зарегистрироваться';
            registerFields.classList.remove('hidden');
            switchText.innerHTML = 'Уже есть аккаунт? <a href="#" onclick="app.switchAuthMode()">Войти</a>';
        } else {
            title.textContent = 'Вход в систему';
            submitBtn.textContent = 'Войти';
            registerFields.classList.add('hidden');
            switchText.innerHTML = 'Нет аккаунта? <a href="#" onclick="app.switchAuthMode()">Зарегистрироваться</a>';
        }

        modal.classList.remove('hidden');
    }

    switchAuthMode() {
        const newMode = this.authMode === 'login' ? 'register' : 'login';
        this.showAuthModal(newMode);
    }

    handleAuth() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (!email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        if (this.authMode === 'register') {
            const name = document.getElementById('auth-name').value;
            const passwordConfirm = document.getElementById('auth-password-confirm').value;

            if (!name) {
                alert('Пожалуйста, введите имя');
                return;
            }

            if (password !== passwordConfirm) {
                alert('Пароли не совпадают');
                return;
            }

            this.registerUser(email, password, name);
        } else {
            this.loginUser(email, password);
        }
    }

    registerUser(email, password, name) {
        // Проверяем, есть ли уже такой пользователь
        const users = JSON.parse(localStorage.getItem('finmodel_users') || '{}');
        
        if (users[email]) {
            alert('Пользователь с таким email уже существует');
            return;
        }

        // Создаем нового пользователя
        users[email] = {
            email,
            name,
            password, // В реальном приложении пароль должен быть захеширован
            plan: 'FREE',
            modelsUsed: 0,
            createdAt: new Date(),
            settings: {
                theme: 'auto',
                company: ''
            }
        };

        localStorage.setItem('finmodel_users', JSON.stringify(users));
        this.loginUser(email, password);
    }

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('finmodel_users') || '{}');
        const user = users[email];

        if (!user || user.password !== password) {
            alert('Неверный email или пароль');
            return;
        }

        this.currentUser = user;
        localStorage.setItem('finmodel_current_user', email);
        this.closeModal('auth-modal');
        this.showDashboard();
    }

    googleAuth() {
        // Мокап Google OAuth
        alert('Google OAuth интеграция будет доступна в следующей версии');
        
        // Для демонстрации создадим тестового пользователя
        const testUser = {
            email: 'test@google.com',
            name: 'Тестовый пользователь',
            plan: 'FREE',
            modelsUsed: 0,
            createdAt: new Date(),
            settings: {
                theme: 'auto',
                company: 'Google'
            }
        };

        this.currentUser = testUser;
        const users = JSON.parse(localStorage.getItem('finmodel_users') || '{}');
        users[testUser.email] = testUser;
        localStorage.setItem('finmodel_users', JSON.stringify(users));
        localStorage.setItem('finmodel_current_user', testUser.email);
        
        this.closeModal('auth-modal');
        this.showDashboard();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('finmodel_current_user');
        this.showLanding();
    }

    loadUserSession() {
        const currentUserEmail = localStorage.getItem('finmodel_current_user');
        if (currentUserEmail) {
            const users = JSON.parse(localStorage.getItem('finmodel_users') || '{}');
            this.currentUser = users[currentUserEmail];
        }
    }

    // Управление страницами
    showLanding() {
        this.currentPage = 'landing';
        this.hideAllPages();
        document.getElementById('landing-page').classList.remove('hidden');
        this.updateNavbar();
    }

    showDashboard() {
        this.currentPage = 'dashboard';
        this.hideAllPages();
        document.getElementById('dashboard-page').classList.remove('hidden');
        this.showDashboardPage('models');
        this.updateNavbar();
        this.updateSidebarInfo();
        this.loadUserModels();
    }

    showModelEditor() {
        this.currentPage = 'model-editor';
        this.hideAllPages();
        document.getElementById('model-editor').classList.remove('hidden');
        this.showEditorTab('setup');
        this.updateNavbar();
    }

    hideAllPages() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.add('hidden');
        document.getElementById('model-editor').classList.add('hidden');
    }

    showDashboardPage(page) {
        // Скрываем все секции контента
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Показываем нужную секцию
        const contentSection = document.getElementById(`${page}-content`);
        if (contentSection) {
            contentSection.classList.remove('hidden');
        }

        // Обновляем активный пункт навигации
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Загружаем данные для страницы
        if (page === 'models') {
            this.loadUserModels();
        } else if (page === 'settings') {
            this.loadUserSettings();
        } else if (page === 'billing') {
            this.loadBillingInfo();
        }
    }

    updateNavbar() {
        const loggedOut = document.getElementById('navbar-logged-out');
        const loggedIn = document.getElementById('navbar-logged-in');

        if (this.currentUser) {
            loggedOut.classList.add('hidden');
            loggedIn.classList.remove('hidden');
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('user-plan').textContent = this.currentUser.plan;
        } else {
            loggedOut.classList.remove('hidden');
            loggedIn.classList.add('hidden');
        }
    }

    updateSidebarInfo() {
        if (!this.currentUser) return;

        const planLimits = {
            'FREE': 3,
            'BASIC': 'Неограниченно',
            'WHITE-LABEL': 'Неограниченно'
        };

        document.getElementById('sidebar-plan').textContent = `${this.currentUser.plan} план`;
        document.getElementById('models-used').textContent = this.currentUser.modelsUsed || 0;
        
        const limit = planLimits[this.currentUser.plan];
        document.getElementById('models-limit').textContent = limit;
    }

    // Модели
    createNewModel() {
        if (!this.canCreateModel()) {
            this.showUpgradeModal();
            return;
        }

        this.currentModel = this.getDefaultModel();
        this.showModelEditor();
        this.populateModelEditor();
    }

    canCreateModel() {
        if (!this.currentUser) return false;
        if (this.currentUser.plan !== 'FREE') return true;
        return (this.currentUser.modelsUsed || 0) < 3;
    }

    getDefaultModel() {
        return {
            id: Date.now().toString(),
            name: `Модель ${new Date().toLocaleDateString()}`,
            createdAt: new Date(),
            lastModified: new Date(),
            
            // Основные параметры
            settings: {
                planningHorizon: 36,
                baseCurrency: 'RUB',
                discountRate: 12,
                initialInvestment: 0,
                workingCapital: 0
            },

            // Продукты
            products: [],

            // Расходы
            expenses: {
                operational: {
                    rent: 0,
                    utilities: 0,
                    admin: 0,
                    other: 0
                },
                personnel: [],
                marketing: {
                    onlineAdvertising: 0,
                    offlineAdvertising: 0,
                    prEvents: 0,
                    contentMarketing: 0
                },
                capex: []
            },

            // Расчеты
            calculations: {
                revenue: [],
                costs: [],
                cashFlow: [],
                metrics: {}
            }
        };
    }

    loadUserModels() {
        if (!this.currentUser) return;

        const modelsKey = `finmodel_models_${this.currentUser.email}`;
        const models = JSON.parse(localStorage.getItem(modelsKey) || '[]');

        const modelsGrid = document.getElementById('models-grid');
        
        if (models.length === 0) {
            modelsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>У вас пока нет моделей</h3>
                    <p>Создайте первую финансовую модель или выберите шаблон</p>
                    <button class="btn btn--primary" onclick="app.createNewModel()">
                        Создать модель
                    </button>
                </div>
            `;
            return;
        }

        modelsGrid.innerHTML = models.map(model => `
            <div class="model-card" onclick="app.openModel('${model.id}')">
                <h3>${model.name}</h3>
                <div class="model-meta">
                    Создана: ${new Date(model.createdAt).toLocaleDateString()}
                    <br>
                    Изменена: ${new Date(model.lastModified).toLocaleDateString()}
                </div>
                <div class="model-metrics">
                    <div class="metric">
                        <div class="metric-label">NPV</div>
                        <div class="metric-value">${this.formatCurrency(model.calculations?.metrics?.npv || 0)}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">IRR</div>
                        <div class="metric-value">${this.formatPercent(model.calculations?.metrics?.irr || 0)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openModel(modelId) {
        const modelsKey = `finmodel_models_${this.currentUser.email}`;
        const models = JSON.parse(localStorage.getItem(modelsKey) || '[]');
        
        this.currentModel = models.find(m => m.id === modelId);
        if (this.currentModel) {
            this.showModelEditor();
            this.populateModelEditor();
        }
    }

    populateModelEditor() {
        if (!this.currentModel) return;

        // Заполняем основные поля
        const modelNameInput = document.getElementById('model-name');
        if (modelNameInput) modelNameInput.value = this.currentModel.name;
        
        const planningHorizonSelect = document.getElementById('planning-horizon');
        if (planningHorizonSelect) planningHorizonSelect.value = this.currentModel.settings.planningHorizon;
        
        const baseCurrencySelect = document.getElementById('base-currency');
        if (baseCurrencySelect) baseCurrencySelect.value = this.currentModel.settings.baseCurrency;
        
        const discountRateInput = document.getElementById('discount-rate');
        if (discountRateInput) discountRateInput.value = this.currentModel.settings.discountRate;
        
        const initialInvestmentInput = document.getElementById('initial-investment');
        if (initialInvestmentInput) initialInvestmentInput.value = this.currentModel.settings.initialInvestment;
        
        const workingCapitalInput = document.getElementById('working-capital');
        if (workingCapitalInput) workingCapitalInput.value = this.currentModel.settings.workingCapital;

        // Заполняем расходы
        const expenses = this.currentModel.expenses;
        const rentExpenseInput = document.getElementById('rent-expense');
        if (rentExpenseInput) rentExpenseInput.value = expenses.operational.rent;
        
        const utilitiesExpenseInput = document.getElementById('utilities-expense');
        if (utilitiesExpenseInput) utilitiesExpenseInput.value = expenses.operational.utilities;
        
        const adminExpenseInput = document.getElementById('admin-expense');
        if (adminExpenseInput) adminExpenseInput.value = expenses.operational.admin;
        
        const otherExpenseInput = document.getElementById('other-expense');
        if (otherExpenseInput) otherExpenseInput.value = expenses.operational.other;

        const onlineAdvertisingInput = document.getElementById('online-advertising');
        if (onlineAdvertisingInput) onlineAdvertisingInput.value = expenses.marketing.onlineAdvertising;
        
        const offlineAdvertisingInput = document.getElementById('offline-advertising');
        if (offlineAdvertisingInput) offlineAdvertisingInput.value = expenses.marketing.offlineAdvertising;
        
        const prEventsInput = document.getElementById('pr-events');
        if (prEventsInput) prEventsInput.value = expenses.marketing.prEvents;
        
        const contentMarketingInput = document.getElementById('content-marketing');
        if (contentMarketingInput) contentMarketingInput.value = expenses.marketing.contentMarketing;

        // Загружаем продукты, персонал и капитальные расходы
        this.renderProducts();
        this.renderPersonnel();
        this.renderCapex();

        // Обновляем расчеты
        this.updateModelCalculations();
    }

    saveModel() {
        if (!this.currentModel || !this.currentUser) return;

        // Обновляем данные модели из формы
        const modelNameInput = document.getElementById('model-name');
        if (modelNameInput) this.currentModel.name = modelNameInput.value;
        this.currentModel.lastModified = new Date();

        // Сохраняем настройки
        const planningHorizonSelect = document.getElementById('planning-horizon');
        const baseCurrencySelect = document.getElementById('base-currency');
        const discountRateInput = document.getElementById('discount-rate');
        const initialInvestmentInput = document.getElementById('initial-investment');
        const workingCapitalInput = document.getElementById('working-capital');

        this.currentModel.settings = {
            planningHorizon: planningHorizonSelect ? parseInt(planningHorizonSelect.value) : 36,
            baseCurrency: baseCurrencySelect ? baseCurrencySelect.value : 'RUB',
            discountRate: discountRateInput ? parseFloat(discountRateInput.value) : 12,
            initialInvestment: initialInvestmentInput ? parseFloat(initialInvestmentInput.value) || 0 : 0,
            workingCapital: workingCapitalInput ? parseFloat(workingCapitalInput.value) || 0 : 0
        };

        // Сохраняем расходы
        const rentExpenseInput = document.getElementById('rent-expense');
        const utilitiesExpenseInput = document.getElementById('utilities-expense');
        const adminExpenseInput = document.getElementById('admin-expense');
        const otherExpenseInput = document.getElementById('other-expense');

        this.currentModel.expenses.operational = {
            rent: rentExpenseInput ? parseFloat(rentExpenseInput.value) || 0 : 0,
            utilities: utilitiesExpenseInput ? parseFloat(utilitiesExpenseInput.value) || 0 : 0,
            admin: adminExpenseInput ? parseFloat(adminExpenseInput.value) || 0 : 0,
            other: otherExpenseInput ? parseFloat(otherExpenseInput.value) || 0 : 0
        };

        const onlineAdvertisingInput = document.getElementById('online-advertising');
        const offlineAdvertisingInput = document.getElementById('offline-advertising');
        const prEventsInput = document.getElementById('pr-events');
        const contentMarketingInput = document.getElementById('content-marketing');

        this.currentModel.expenses.marketing = {
            onlineAdvertising: onlineAdvertisingInput ? parseFloat(onlineAdvertisingInput.value) || 0 : 0,
            offlineAdvertising: offlineAdvertisingInput ? parseFloat(offlineAdvertisingInput.value) || 0 : 0,
            prEvents: prEventsInput ? parseFloat(prEventsInput.value) || 0 : 0,
            contentMarketing: contentMarketingInput ? parseFloat(contentMarketingInput.value) || 0 : 0
        };

        // Сохраняем в localStorage
        const modelsKey = `finmodel_models_${this.currentUser.email}`;
        const models = JSON.parse(localStorage.getItem(modelsKey) || '[]');
        
        const existingIndex = models.findIndex(m => m.id === this.currentModel.id);
        if (existingIndex >= 0) {
            models[existingIndex] = this.currentModel;
        } else {
            models.push(this.currentModel);
            // Увеличиваем счетчик использованных моделей
            this.currentUser.modelsUsed = (this.currentUser.modelsUsed || 0) + 1;
            this.updateUserData();
        }

        localStorage.setItem(modelsKey, JSON.stringify(models));
        
        // Показываем уведомление
        this.showNotification('Модель сохранена', 'success');
    }

    updateUserData() {
        const users = JSON.parse(localStorage.getItem('finmodel_users') || '{}');
        users[this.currentUser.email] = this.currentUser;
        localStorage.setItem('finmodel_users', JSON.stringify(users));
    }

    // Продукты
    addProduct() {
        const product = {
            id: Date.now().toString(),
            name: 'Новый продукт',
            price: 1000,
            cost: 400,
            currency: this.currentModel.settings.baseCurrency,
            salesGrowth: 'linear',
            initialSales: 100,
            growthRate: 10,
            seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };

        this.currentModel.products.push(product);
        this.renderProducts();
        this.updateModelCalculations();
    }

    renderProducts() {
        const productsList = document.getElementById('products-list');
        if (!productsList) return;
        
        if (this.currentModel.products.length === 0) {
            productsList.innerHTML = `
                <div class="empty-state">
                    <h3>Добавьте первый продукт</h3>
                    <p>Начните с добавления продукта или услуги для планирования выручки</p>
                </div>
            `;
            return;
        }

        productsList.innerHTML = this.currentModel.products.map(product => `
            <div class="product-item" data-product-id="${product.id}">
                <div class="product-header">
                    <input type="text" class="form-control" value="${product.name}" 
                           onchange="app.updateProductField('${product.id}', 'name', this.value)">
                    <button class="remove-btn" onclick="app.removeProduct('${product.id}')">&times;</button>
                </div>
                <div class="product-grid">
                    <div class="form-group">
                        <label class="form-label">Цена за единицу</label>
                        <input type="number" class="form-control" value="${product.price}" 
                               onchange="app.updateProductField('${product.id}', 'price', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Себестоимость</label>
                        <input type="number" class="form-control" value="${product.cost}" 
                               onchange="app.updateProductField('${product.id}', 'cost', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Начальные продажи</label>
                        <input type="number" class="form-control" value="${product.initialSales}" 
                               onchange="app.updateProductField('${product.id}', 'initialSales', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Рост продаж (%)</label>
                        <input type="number" class="form-control" value="${product.growthRate}" 
                               onchange="app.updateProductField('${product.id}', 'growthRate', parseFloat(this.value))">
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateProductField(productId, field, value) {
        const product = this.currentModel.products.find(p => p.id === productId);
        if (product) {
            product[field] = value;
            this.updateModelCalculations();
        }
    }

    removeProduct(productId) {
        this.currentModel.products = this.currentModel.products.filter(p => p.id !== productId);
        this.renderProducts();
        this.updateModelCalculations();
    }

    // Персонал
    addEmployee() {
        const employee = {
            id: Date.now().toString(),
            position: 'Новая должность',
            count: 1,
            salary: 50000,
            startMonth: 1
        };

        this.currentModel.expenses.personnel.push(employee);
        this.renderPersonnel();
        this.updateModelCalculations();
    }

    renderPersonnel() {
        const personnelList = document.getElementById('personnel-list');
        if (!personnelList) return;
        
        if (this.currentModel.expenses.personnel.length === 0) {
            personnelList.innerHTML = `
                <div class="empty-state">
                    <p>Добавьте сотрудников для планирования расходов на персонал</p>
                </div>
            `;
            return;
        }

        personnelList.innerHTML = this.currentModel.expenses.personnel.map(employee => `
            <div class="personnel-item" data-employee-id="${employee.id}">
                <div class="personnel-grid">
                    <div class="form-group">
                        <label class="form-label">Должность</label>
                        <input type="text" class="form-control" value="${employee.position}" 
                               onchange="app.updateEmployeeField('${employee.id}', 'position', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Количество</label>
                        <input type="number" class="form-control" value="${employee.count}" min="1"
                               onchange="app.updateEmployeeField('${employee.id}', 'count', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Зарплата</label>
                        <input type="number" class="form-control" value="${employee.salary}" 
                               onchange="app.updateEmployeeField('${employee.id}', 'salary', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Месяц найма</label>
                        <input type="number" class="form-control" value="${employee.startMonth}" min="1" max="12"
                               onchange="app.updateEmployeeField('${employee.id}', 'startMonth', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <button class="remove-btn" onclick="app.removeEmployee('${employee.id}')">&times;</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateEmployeeField(employeeId, field, value) {
        const employee = this.currentModel.expenses.personnel.find(e => e.id === employeeId);
        if (employee) {
            employee[field] = value;
            this.updateModelCalculations();
        }
    }

    removeEmployee(employeeId) {
        this.currentModel.expenses.personnel = this.currentModel.expenses.personnel.filter(e => e.id !== employeeId);
        this.renderPersonnel();
        this.updateModelCalculations();
    }

    // Капитальные расходы
    addCapexItem() {
        const capexItem = {
            id: Date.now().toString(),
            name: 'Новая инвестиция',
            amount: 100000,
            month: 1,
            depreciationPeriod: 60,
            depreciationType: 'linear'
        };

        this.currentModel.expenses.capex.push(capexItem);
        this.renderCapex();
        this.updateModelCalculations();
    }

    renderCapex() {
        const capexList = document.getElementById('capex-list');
        if (!capexList) return;
        
        if (this.currentModel.expenses.capex.length === 0) {
            capexList.innerHTML = `
                <div class="empty-state">
                    <p>Добавьте капитальные расходы для планирования инвестиций</p>
                </div>
            `;
            return;
        }

        capexList.innerHTML = this.currentModel.expenses.capex.map(capex => `
            <div class="capex-item" data-capex-id="${capex.id}">
                <div class="capex-grid">
                    <div class="form-group">
                        <label class="form-label">Название</label>
                        <input type="text" class="form-control" value="${capex.name}" 
                               onchange="app.updateCapexField('${capex.id}', 'name', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Сумма</label>
                        <input type="number" class="form-control" value="${capex.amount}" 
                               onchange="app.updateCapexField('${capex.id}', 'amount', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Месяц покупки</label>
                        <input type="number" class="form-control" value="${capex.month}" min="1"
                               onchange="app.updateCapexField('${capex.id}', 'month', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Амортизация (мес)</label>
                        <input type="number" class="form-control" value="${capex.depreciationPeriod}" min="1"
                               onchange="app.updateCapexField('${capex.id}', 'depreciationPeriod', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <button class="remove-btn" onclick="app.removeCapexItem('${capex.id}')">&times;</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateCapexField(capexId, field, value) {
        const capex = this.currentModel.expenses.capex.find(c => c.id === capexId);
        if (capex) {
            capex[field] = value;
            this.updateModelCalculations();
        }
    }

    removeCapexItem(capexId) {
        this.currentModel.expenses.capex = this.currentModel.expenses.capex.filter(c => c.id !== capexId);
        this.renderCapex();
        this.updateModelCalculations();
    }

    // Расчеты
    updateModelCalculations() {
        if (!this.currentModel) return;

        const horizon = this.currentModel.settings.planningHorizon;
        const revenue = this.calculateRevenue(horizon);
        const costs = this.calculateCosts(horizon);
        const cashFlow = this.calculateCashFlow(revenue, costs, horizon);
        const metrics = this.calculateMetrics(cashFlow);

        this.currentModel.calculations = {
            revenue,
            costs,
            cashFlow,
            metrics
        };

        this.updateDashboard();
        this.updateReports();
        this.updateCharts();
    }

    calculateRevenue(horizon) {
        const revenue = new Array(horizon).fill(0);
        
        this.currentModel.products.forEach(product => {
            let currentSales = product.initialSales || 0;
            const growthRate = (product.growthRate || 0) / 100;
            const price = product.price || 0;

            for (let month = 0; month < horizon; month++) {
                // Применяем рост
                if (month > 0) {
                    currentSales *= (1 + growthRate / 12);
                }

                // Применяем сезонность
                const seasonalityIndex = product.seasonality[month % 12] || 1;
                const monthlyRevenue = currentSales * price * seasonalityIndex;
                
                revenue[month] += monthlyRevenue;
            }
        });

        return revenue;
    }

    calculateCosts(horizon) {
        const costs = new Array(horizon).fill(0);
        const expenses = this.currentModel.expenses;

        for (let month = 0; month < horizon; month++) {
            let monthlyCosts = 0;

            // Операционные расходы
            monthlyCosts += expenses.operational.rent || 0;
            monthlyCosts += expenses.operational.utilities || 0;
            monthlyCosts += expenses.operational.admin || 0;
            monthlyCosts += expenses.operational.other || 0;

            // Маркетинговые расходы
            monthlyCosts += expenses.marketing.onlineAdvertising || 0;
            monthlyCosts += expenses.marketing.offlineAdvertising || 0;
            monthlyCosts += expenses.marketing.prEvents || 0;
            monthlyCosts += expenses.marketing.contentMarketing || 0;

            // Расходы на персонал
            expenses.personnel.forEach(employee => {
                if (month >= (employee.startMonth - 1)) {
                    const salaryWithTaxes = (employee.salary || 0) * (employee.count || 1) * 1.302; // С соц. взносами
                    monthlyCosts += salaryWithTaxes;
                }
            });

            // Себестоимость продуктов
            this.currentModel.products.forEach(product => {
                const monthlyRevenue = this.currentModel.calculations?.revenue?.[month] || 0;
                const costRatio = (product.cost || 0) / (product.price || 1);
                monthlyCosts += monthlyRevenue * costRatio;
            });

            // Амортизация
            expenses.capex.forEach(capex => {
                if (month >= (capex.month - 1)) {
                    const monthsFromPurchase = month - (capex.month - 1);
                    if (monthsFromPurchase < capex.depreciationPeriod) {
                        monthlyCosts += (capex.amount || 0) / (capex.depreciationPeriod || 1);
                    }
                }
            });

            costs[month] = monthlyCosts;
        }

        return costs;
    }

    calculateCashFlow(revenue, costs, horizon) {
        const cashFlow = [];
        let cumulativeCashFlow = -(this.currentModel.settings.initialInvestment || 0) - (this.currentModel.settings.workingCapital || 0);

        // Капитальные расходы
        const capexByMonth = new Array(horizon).fill(0);
        this.currentModel.expenses.capex.forEach(capex => {
            const month = (capex.month || 1) - 1;
            if (month < horizon) {
                capexByMonth[month] += capex.amount || 0;
            }
        });

        for (let month = 0; month < horizon; month++) {
            const monthlyProfit = (revenue[month] || 0) - (costs[month] || 0);
            const monthlyCapex = capexByMonth[month] || 0;
            const netCashFlow = monthlyProfit - monthlyCapex;
            
            cumulativeCashFlow += netCashFlow;
            
            cashFlow.push({
                month: month + 1,
                revenue: revenue[month] || 0,
                costs: costs[month] || 0,
                profit: monthlyProfit,
                capex: monthlyCapex,
                netCashFlow,
                cumulativeCashFlow
            });
        }

        return cashFlow;
    }

    calculateMetrics(cashFlow) {
        const discountRate = (this.currentModel.settings.discountRate || 12) / 100;
        let npv = -(this.currentModel.settings.initialInvestment || 0);
        let paybackPeriod = null;
        let breakevenPeriod = null;

        // Расчет NPV и определение периодов окупаемости
        for (let i = 0; i < cashFlow.length; i++) {
            const cf = cashFlow[i];
            const discountFactor = Math.pow(1 + discountRate / 12, i + 1);
            npv += cf.netCashFlow / discountFactor;

            // Точка безубыточности (когда прибыль становится положительной)
            if (!breakevenPeriod && cf.profit > 0) {
                breakevenPeriod = i + 1;
            }

            // Срок окупаемости (когда накопленный денежный поток становится положительным)
            if (!paybackPeriod && cf.cumulativeCashFlow > 0) {
                paybackPeriod = i + 1;
            }
        }

        // Расчет IRR (приближенный)
        let irr = 0;
        if (npv > 0) {
            // Простая аппроксимация IRR
            const totalCashFlow = cashFlow.reduce((sum, cf) => sum + cf.netCashFlow, 0);
            const initialInvestment = this.currentModel.settings.initialInvestment || 1;
            irr = (totalCashFlow / initialInvestment / (cashFlow.length / 12)) * 100;
        }

        // EBITDA (за первый год)
        const yearlyProfit = cashFlow.slice(0, 12).reduce((sum, cf) => sum + cf.profit, 0);
        
        // Выручка за 12 месяцев
        const revenue12m = cashFlow.slice(0, 12).reduce((sum, cf) => sum + cf.revenue, 0);

        return {
            npv,
            irr: Math.max(0, Math.min(irr, 1000)), // Ограничиваем IRR разумными пределами
            paybackPeriod,
            breakevenPeriod,
            ebitda: yearlyProfit,
            revenue12m
        };
    }

    updateDashboard() {
        if (!this.currentModel?.calculations) return;

        const metrics = this.currentModel.calculations.metrics;
        const currency = this.getCurrencySymbol(this.currentModel.settings.baseCurrency);

        // Обновляем метрики
        const revenue12mEl = document.getElementById('revenue-12m');
        if (revenue12mEl) revenue12mEl.textContent = this.formatCurrency(metrics.revenue12m, currency);
        
        const ebitdaValueEl = document.getElementById('ebitda-value');
        if (ebitdaValueEl) ebitdaValueEl.textContent = this.formatCurrency(metrics.ebitda, currency);
        
        const npvValueEl = document.getElementById('npv-value');
        if (npvValueEl) npvValueEl.textContent = this.formatCurrency(metrics.npv, currency);
        
        const irrValueEl = document.getElementById('irr-value');
        if (irrValueEl) irrValueEl.textContent = this.formatPercent(metrics.irr);
        
        const paybackValueEl = document.getElementById('payback-value');
        if (paybackValueEl) paybackValueEl.textContent = metrics.paybackPeriod ? `${metrics.paybackPeriod} мес.` : '> 5 лет';
        
        const breakevenValueEl = document.getElementById('breakeven-value');
        if (breakevenValueEl) breakevenValueEl.textContent = metrics.breakevenPeriod ? `${metrics.breakevenPeriod} мес.` : '> 5 лет';
    }

    updateCharts() {
        if (!this.currentModel?.calculations) return;

        this.createRevenueChart();
        this.createCashFlowChart();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        // Уничтожаем предыдущий график
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        const cashFlow = this.currentModel.calculations.cashFlow;
        const labels = cashFlow.map(cf => `Месяц ${cf.month}`);
        const revenueData = cashFlow.map(cf => cf.revenue);
        const costsData = cashFlow.map(cf => cf.costs);

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Выручка',
                        data: revenueData,
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Расходы',
                        data: costsData,
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    createCashFlowChart() {
        const ctx = document.getElementById('cashflow-chart');
        if (!ctx) return;

        // Уничтожаем предыдущий график
        if (this.charts.cashflow) {
            this.charts.cashflow.destroy();
        }

        const cashFlow = this.currentModel.calculations.cashFlow;
        const labels = cashFlow.map(cf => `Месяц ${cf.month}`);
        const cumulativeData = cashFlow.map(cf => cf.cumulativeCashFlow);

        this.charts.cashflow = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Накопленный денежный поток',
                        data: cumulativeData,
                        borderColor: '#5D878F',
                        backgroundColor: 'rgba(93, 135, 143, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    updateReports() {
        if (!this.currentModel?.calculations) return;

        this.updatePnLTable();
        this.updateCashFlowTable();
    }

    updatePnLTable() {
        const table = document.getElementById('pnl-table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const cashFlow = this.currentModel.calculations.cashFlow;

        // Группируем по годам
        const yearlyData = this.groupByYears(cashFlow);

        tbody.innerHTML = `
            <tr>
                <td><strong>Выручка</strong></td>
                ${yearlyData.map(year => `<td>${this.formatCurrency(year.revenue)}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Себестоимость</strong></td>
                ${yearlyData.map(year => `<td>${this.formatCurrency(year.costs * 0.6)}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Валовая прибыль</strong></td>
                ${yearlyData.map(year => `<td>${this.formatCurrency(year.revenue - year.costs * 0.6)}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Операционные расходы</strong></td>
                ${yearlyData.map(year => `<td>${this.formatCurrency(year.costs * 0.4)}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>EBITDA</strong></td>
                ${yearlyData.map(year => `<td><strong>${this.formatCurrency(year.profit)}</strong></td>`).join('')}
            </tr>
            <tr>
                <td><strong>Чистая прибыль</strong></td>
                ${yearlyData.map(year => `<td><strong>${this.formatCurrency(year.profit * 0.8)}</strong></td>`).join('')}
            </tr>
        `;
    }

    updateCashFlowTable() {
        const table = document.getElementById('cashflow-table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const cashFlow = this.currentModel.calculations.cashFlow;

        // Группируем по годам
        const yearlyData = this.groupByYears(cashFlow);

        tbody.innerHTML = `
            <tr>
                <td><strong>Операционный поток</strong></td>
                ${yearlyData.map(year => `<td>${this.formatCurrency(year.profit)}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Инвестиционный поток</strong></td>
                ${yearlyData.map(year => `<td>${this.formatCurrency(-year.capex)}</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Финансовый поток</strong></td>
                ${yearlyData.map(year => `<td>0</td>`).join('')}
            </tr>
            <tr>
                <td><strong>Чистый денежный поток</strong></td>
                ${yearlyData.map(year => `<td><strong>${this.formatCurrency(year.netCashFlow)}</strong></td>`).join('')}
            </tr>
            <tr>
                <td><strong>Накопленный поток</strong></td>
                ${yearlyData.map((year, index) => {
                    const cumulative = yearlyData.slice(0, index + 1).reduce((sum, y) => sum + y.netCashFlow, 0);
                    return `<td><strong>${this.formatCurrency(cumulative)}</strong></td>`;
                }).join('')}
            </tr>
        `;
    }

    groupByYears(cashFlow) {
        const years = [];
        const monthsPerYear = 12;
        
        for (let year = 0; year < 3; year++) {
            const startMonth = year * monthsPerYear;
            const endMonth = Math.min(startMonth + monthsPerYear, cashFlow.length);
            
            if (startMonth < cashFlow.length) {
                const yearData = cashFlow.slice(startMonth, endMonth);
                years.push({
                    revenue: yearData.reduce((sum, cf) => sum + cf.revenue, 0),
                    costs: yearData.reduce((sum, cf) => sum + cf.costs, 0),
                    profit: yearData.reduce((sum, cf) => sum + cf.profit, 0),
                    capex: yearData.reduce((sum, cf) => sum + cf.capex, 0),
                    netCashFlow: yearData.reduce((sum, cf) => sum + cf.netCashFlow, 0)
                });
            }
        }
        
        return years;
    }

    // Управление вкладками
    showEditorTab(tabName) {
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Показываем нужную вкладку
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.remove('hidden');
        }

        // Обновляем активную вкладку
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`.editor-tab[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Специальная логика для вкладки дашборда
        if (tabName === 'dashboard') {
            setTimeout(() => {
                this.updateCharts();
            }, 100);
        }
    }

    showExpenseTab(tabName) {
        // Скрываем все секции расходов
        document.querySelectorAll('.expense-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Показываем нужную секцию
        const expenseSection = document.getElementById(`${tabName}-expenses`);
        if (expenseSection) {
            expenseSection.classList.remove('hidden');
        }

        // Обновляем активную вкладку
        document.querySelectorAll('.expense-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeExpenseTab = document.querySelector(`.expense-tab[data-expense-tab="${tabName}"]`);
        if (activeExpenseTab) {
            activeExpenseTab.classList.add('active');
        }
    }

    // Шаблоны
    createFromTemplate(templateType) {
        if (!this.canCreateModel()) {
            this.showUpgradeModal();
            return;
        }

        this.currentModel = this.getTemplateModel(templateType);
        this.showModelEditor();
        this.populateModelEditor();
    }

    getTemplateModel(templateType) {
        const baseModel = this.getDefaultModel();
        
        switch (templateType) {
            case 'ecommerce':
                baseModel.name = 'Интернет-магазин';
                baseModel.products = [
                    {
                        id: '1',
                        name: 'Основной товар',
                        price: 2000,
                        cost: 800,
                        currency: 'RUB',
                        salesGrowth: 'exponential',
                        initialSales: 50,
                        growthRate: 15,
                        seasonality: [0.8, 0.9, 1.0, 1.1, 1.0, 0.9, 0.7, 0.8, 1.0, 1.2, 1.3, 1.4]
                    }
                ];
                baseModel.expenses.marketing.onlineAdvertising = 30000;
                baseModel.expenses.operational.rent = 25000;
                break;

            case 'saas':
                baseModel.name = 'SaaS стартап';
                baseModel.products = [
                    {
                        id: '1',
                        name: 'Месячная подписка',
                        price: 990,
                        cost: 100,
                        currency: 'RUB',
                        salesGrowth: 'exponential',
                        initialSales: 10,
                        growthRate: 25,
                        seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                    }
                ];
                baseModel.expenses.personnel = [
                    { id: '1', position: 'Разработчик', count: 2, salary: 120000, startMonth: 1 },
                    { id: '2', position: 'Маркетолог', count: 1, salary: 80000, startMonth: 3 }
                ];
                break;

            case 'restaurant':
                baseModel.name = 'Ресторан';
                baseModel.products = [
                    {
                        id: '1',
                        name: 'Средний чек',
                        price: 800,
                        cost: 320,
                        currency: 'RUB',
                        salesGrowth: 'linear',
                        initialSales: 200,
                        growthRate: 5,
                        seasonality: [0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.0, 1.0, 1.1, 1.3]
                    }
                ];
                baseModel.expenses.operational.rent = 80000;
                baseModel.expenses.operational.utilities = 25000;
                break;

            case 'manufacturing':
                baseModel.name = 'Производственная компания';
                baseModel.settings.initialInvestment = 500000;
                baseModel.products = [
                    {
                        id: '1',
                        name: 'Основная продукция',
                        price: 5000,
                        cost: 2500,
                        currency: 'RUB',
                        salesGrowth: 'linear',
                        initialSales: 100,
                        growthRate: 8,
                        seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                    }
                ];
                baseModel.expenses.capex = [
                    { id: '1', name: 'Оборудование', amount: 300000, month: 1, depreciationPeriod: 60, depreciationType: 'linear' }
                ];
                break;
        }

        return baseModel;
    }

    // Настройки
    loadUserSettings() {
        if (!this.currentUser) return;

        const profileNameInput = document.getElementById('profile-name');
        if (profileNameInput) profileNameInput.value = this.currentUser.name || '';
        
        const profileEmailInput = document.getElementById('profile-email');
        if (profileEmailInput) profileEmailInput.value = this.currentUser.email || '';
        
        const profileCompanyInput = document.getElementById('profile-company');
        if (profileCompanyInput) profileCompanyInput.value = this.currentUser.settings?.company || '';
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.value = this.currentUser.settings?.theme || 'auto';
    }

    saveSettings() {
        if (!this.currentUser) return;

        const profileNameInput = document.getElementById('profile-name');
        if (profileNameInput) this.currentUser.name = profileNameInput.value;
        
        const profileCompanyInput = document.getElementById('profile-company');
        const themeSelect = document.getElementById('theme-select');
        
        this.currentUser.settings = {
            ...this.currentUser.settings,
            company: profileCompanyInput ? profileCompanyInput.value : '',
            theme: themeSelect ? themeSelect.value : 'auto'
        };

        this.updateUserData();
        this.setTheme(this.currentUser.settings.theme);
        this.showNotification('Настройки сохранены', 'success');
    }

    setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.setAttribute('data-color-scheme', 'light');
        } else {
            document.documentElement.removeAttribute('data-color-scheme');
        }
    }

    // Биллинг
    loadBillingInfo() {
        if (!this.currentUser) return;

        const currentPlanNameEl = document.getElementById('current-plan-name');
        if (currentPlanNameEl) currentPlanNameEl.textContent = this.currentUser.plan;
        
        const currentModelsUsedEl = document.getElementById('current-models-used');
        if (currentModelsUsedEl) currentModelsUsedEl.textContent = this.currentUser.modelsUsed || 0;
        
        const limits = { 'FREE': 3, 'BASIC': '∞', 'WHITE-LABEL': '∞' };
        const currentModelsLimitEl = document.getElementById('current-models-limit');
        if (currentModelsLimitEl) currentModelsLimitEl.textContent = limits[this.currentUser.plan];
    }

    upgradePlan(plan) {
        // Мокап платежной системы
        const prices = { 'basic': 1990, 'white-label': 9900 };
        const planNames = { 'basic': 'BASIC', 'white-label': 'WHITE-LABEL' };
        
        const confirmed = confirm(`Подтвердите покупку плана ${planNames[plan]} за ${prices[plan]}₽/мес`);
        
        if (confirmed) {
            this.currentUser.plan = planNames[plan];
            this.updateUserData();
            this.updateUI();
            this.closeModal('upgrade-modal');
            this.showNotification(`План обновлен до ${planNames[plan]}`, 'success');
        }
    }

    contactSales() {
        alert('Для получения WHITE-LABEL плана свяжитесь с нами:\nEmail: sales@finmodel.pro\nТелефон: +7 (495) 123-45-67');
    }

    // Экспорт
    exportModel() {
        if (!this.currentModel) return;

        // Проверяем доступность форматов экспорта
        const userPlan = this.currentUser?.plan || 'FREE';
        const excelOption = document.getElementById('excel-option');
        const powerpointOption = document.getElementById('powerpoint-option');

        if (userPlan === 'FREE') {
            if (excelOption) {
                excelOption.classList.add('disabled');
                const excelRadio = document.getElementById('export-excel');
                if (excelRadio) excelRadio.disabled = true;
            }
            if (powerpointOption) {
                powerpointOption.classList.add('disabled');
                const powerpointRadio = document.getElementById('export-powerpoint');
                if (powerpointRadio) powerpointRadio.disabled = true;
            }
        } else {
            if (excelOption) {
                excelOption.classList.remove('disabled');
                const excelRadio = document.getElementById('export-excel');
                if (excelRadio) excelRadio.disabled = false;
            }
            if (powerpointOption) {
                powerpointOption.classList.remove('disabled');
                const powerpointRadio = document.getElementById('export-powerpoint');
                if (powerpointRadio) powerpointRadio.disabled = false;
            }
        }

        document.getElementById('export-modal').classList.remove('hidden');
    }

    performExport() {
        const formatRadio = document.querySelector('input[name="export-format"]:checked');
        if (!formatRadio) return;
        
        const format = formatRadio.value;
        
        switch (format) {
            case 'pdf':
                this.exportToPDF();
                break;
            case 'excel':
                if (this.currentUser?.plan === 'FREE') {
                    this.showUpgradeModal();
                    return;
                }
                this.exportToExcel();
                break;
            case 'powerpoint':
                if (this.currentUser?.plan === 'FREE') {
                    this.showUpgradeModal();
                    return;
                }
                this.exportToPowerPoint();
                break;
        }

        this.closeModal('export-modal');
    }

    exportToPDF() {
        // Мокап экспорта в PDF
        const modelData = this.generateExportData();
        console.log('Экспорт в PDF:', modelData);
        
        // Имитируем скачивание файла
        this.simulateFileDownload(`${this.currentModel.name}.pdf`, 'PDF отчет готов к скачиванию');
    }

    exportToExcel() {
        // Мокап экспорта в Excel
        const modelData = this.generateExportData();
        console.log('Экспорт в Excel:', modelData);
        
        this.simulateFileDownload(`${this.currentModel.name}.xlsx`, 'Excel модель готова к скачиванию');
    }

    exportToPowerPoint() {
        // Мокап экспорта в PowerPoint
        const modelData = this.generateExportData();
        console.log('Экспорт в PowerPoint:', modelData);
        
        this.simulateFileDownload(`${this.currentModel.name}.pptx`, 'PowerPoint презентация готова к скачиванию');
    }

    generateExportData() {
        return {
            model: this.currentModel,
            exportDate: new Date(),
            user: this.currentUser,
            watermark: this.currentUser?.plan === 'FREE'
        };
    }

    simulateFileDownload(filename, message) {
        // Имитируем процесс скачивания
        this.showNotification('Подготавливаем файл...', 'info');
        
        setTimeout(() => {
            this.showNotification(message, 'success');
        }, 2000);
    }

    // Модальные окна
    showUpgradeModal() {
        document.getElementById('upgrade-modal').classList.remove('hidden');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Утилиты
    updateUI() {
        this.updateNavbar();
        if (this.currentPage === 'dashboard') {
            this.updateSidebarInfo();
        }
    }

    showDemo() {
        alert('Демо-режим будет доступен в следующей версии');
    }

    backToDashboard() {
        this.showDashboard();
    }

    showNotification(message, type = 'info') {
        // Простое уведомление через alert (в реальном приложении лучше использовать toast)
        alert(message);
    }

    formatCurrency(amount, symbol = '₽') {
        if (typeof amount !== 'number') return '0 ' + symbol;
        return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ' + symbol;
    }

    formatPercent(value) {
        if (typeof value !== 'number') return '0%';
        return Math.round(value * 100) / 100 + '%';
    }

    getCurrencySymbol(currency) {
        const symbols = { 'RUB': '₽', 'USD': '$', 'EUR': '€' };
        return symbols[currency] || '₽';
    }
}

// Глобальные функции для HTML onclick handlers
let app;

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    app = new FinModelApp();
});

// Экспортируем функции в глобальную область видимости для onclick handlers
window.showAuthModal = (mode) => app?.showAuthModal(mode);
window.switchAuthMode = () => app?.switchAuthMode();
window.googleAuth = () => app?.googleAuth();
window.logout = () => app?.logout();
window.showDemo = () => app?.showDemo();
window.createNewModel = () => app?.createNewModel();
window.createFromTemplate = (type) => app?.createFromTemplate(type);
window.saveSettings = () => app?.saveSettings();
window.upgradePlan = (plan) => app?.upgradePlan(plan);
window.contactSales = () => app?.contactSales();
window.saveModel = () => app?.saveModel();
window.exportModel = () => app?.exportModel();
window.performExport = () => app?.performExport();
window.backToDashboard = () => app?.backToDashboard();
window.closeModal = (modalId) => app?.closeModal(modalId);
window.showUpgradeModal = () => app?.showUpgradeModal();
window.addProduct = () => app?.addProduct();
window.addEmployee = () => app?.addEmployee();
window.addCapexItem = () => app?.addCapexItem();