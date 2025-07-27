// Global Application State
class FinModelApp {
    constructor() {
        this.currentUser = null;
        this.currentModel = null;
        this.models = [];
        this.currentStep = 0;
        this.autoSaveInterval = null;
        this.hasUnsavedChanges = false;
        
        // Application data from requirements
        this.subscriptionPlans = {
            "FREE": {
                "name": "FREE",
                "price": "0₽/месяц",
                "maxModels": 3,
                "features": ["До 3 моделей", "PDF экспорт", "Базовые расчеты"],
                "exportFormats": ["PDF"]
            },
            "BASIC": {
                "name": "BASIC", 
                "price": "1990₽/месяц",
                "maxModels": -1,
                "features": ["Неограниченные модели", "Excel + PowerPoint экспорт", "Email поддержка"],
                "exportFormats": ["PDF", "Excel", "PowerPoint"]
            },
            "WHITE_LABEL": {
                "name": "WHITE-LABEL",
                "price": "от 9900₽/месяц", 
                "maxModels": -1,
                "features": ["Все функции Basic", "Кастомизация брендинга", "API доступ", "Персональный менеджер"],
                "exportFormats": ["PDF", "Excel", "PowerPoint"]
            }
        };

        this.currencies = [
            {"code": "RUB", "symbol": "₽", "name": "Российский рубль"},
            {"code": "USD", "symbol": "$", "name": "Доллар США"},
            {"code": "EUR", "symbol": "€", "name": "Евро"}
        ];

        this.expenseCategories = [
            {"id": "salary", "name": "Заработная плата", "type": "personnel"},
            {"id": "rent", "name": "Аренда помещений", "type": "fixed"},
            {"id": "utilities", "name": "Коммунальные услуги", "type": "variable"},
            {"id": "marketing", "name": "Маркетинг и реклама", "type": "variable"},
            {"id": "admin", "name": "Административные расходы", "type": "mixed"},
            {"id": "other", "name": "Прочие расходы", "type": "mixed"}
        ];

        this.industryTemplates = [
            {"id": "ecommerce", "name": "Интернет-магазин", "description": "Модель для e-commerce проекта"},
            {"id": "saas", "name": "SaaS стартап", "description": "Подписочная модель для IT-продукта"},
            {"id": "restaurant", "name": "Ресторанный бизнес", "description": "Модель для заведений общепита"},
            {"id": "manufacturing", "name": "Производство", "description": "Производственная компания"},
            {"id": "consulting", "name": "IT-консалтинг", "description": "Консалтинговые услуги"},
            {"id": "medical", "name": "Медицинские услуги", "description": "Частная медицинская практика"}
        ];

        this.taxRates = {
            "ndfl": 0.13,
            "socialContributions": 0.302,
            "pfr": 0.22,
            "fss": 0.029,
            "foms": 0.051
        };

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
        this.startAutoSave();
    }

    loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('finmodel_user') || 'null');
            const modelsData = JSON.parse(localStorage.getItem('finmodel_models') || '[]');
            
            if (userData) {
                this.currentUser = userData;
                this.models = modelsData;
            }
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }

    saveUserData() {
        try {
            if (this.currentUser) {
                localStorage.setItem('finmodel_user', JSON.stringify(this.currentUser));
                localStorage.setItem('finmodel_models', JSON.stringify(this.models));
            }
        } catch (e) {
            console.error('Error saving user data:', e);
        }
    }

    setupEventListeners() {
        // Header authentication buttons
        this.setupElement('loginBtn', 'click', () => this.showModal('loginModal'));
        this.setupElement('registerBtn', 'click', () => this.showModal('registerModal'));
        this.setupElement('logoutBtn', 'click', () => this.logout());

        // Hero buttons
        this.setupElement('heroLoginBtn', 'click', () => this.showModal('loginModal'));
        this.setupElement('heroRegisterBtn', 'click', () => this.showModal('registerModal'));

        // Dashboard buttons
        this.setupElement('createModelBtn', 'click', () => this.showView('new-model'));
        this.setupElement('createModelBtn2', 'click', () => this.showView('new-model'));

        // Profile buttons
        this.setupElement('updateProfileBtn', 'click', () => this.updateProfile());
        this.setupElement('changePasswordBtn', 'click', () => this.showModal('changePasswordModal'));

        // Model builder buttons
        this.setupElement('prevStepBtn', 'click', () => this.previousStep());
        this.setupElement('nextStepBtn', 'click', () => this.nextStep());
        this.setupElement('saveModelBtn', 'click', () => this.saveModel());
        this.setupElement('addProductBtn', 'click', () => this.addProduct());
        this.setupElement('addPersonnelBtn', 'click', () => this.addPersonnel());
        this.setupElement('addEquipmentBtn', 'click', () => this.addEquipment());
        this.setupElement('addFundingBtn', 'click', () => this.addFunding());

        // Modal close buttons
        this.setupElement('loginModalClose', 'click', () => this.hideModal('loginModal'));
        this.setupElement('registerModalClose', 'click', () => this.hideModal('registerModal'));
        this.setupElement('forgotPasswordModalClose', 'click', () => this.hideModal('forgotPasswordModal'));
        this.setupElement('changePasswordModalClose', 'click', () => this.hideModal('changePasswordModal'));

        // Modal navigation links
        this.setupElement('showForgotPassword', 'click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('forgotPasswordModal');
        });
        this.setupElement('showRegisterFromLogin', 'click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });
        this.setupElement('showLoginFromRegister', 'click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });
        this.setupElement('backToLogin', 'click', (e) => {
            e.preventDefault();
            this.hideModal('forgotPasswordModal');
            this.showModal('loginModal');
        });

        // Google login buttons
        this.setupElement('googleLoginBtn', 'click', () => this.googleLogin());
        this.setupElement('googleRegisterBtn', 'click', () => this.googleLogin());

        // Confirm dialog buttons
        this.setupElement('confirmCancel', 'click', () => this.hideConfirmDialog());

        // Forms
        this.setupElement('loginForm', 'submit', (e) => this.login(e));
        this.setupElement('registerForm', 'submit', (e) => this.register(e));
        this.setupElement('forgotPasswordForm', 'submit', (e) => this.resetPassword(e));
        this.setupElement('changePasswordForm', 'submit', (e) => this.changePassword(e));

        // Sidebar navigation
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.showView(view);
                
                // Update active link
                document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('sidebar--collapsed');
            });
        }

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabId = e.target.dataset.tab;
                this.switchTab(e.target, tabId);
            }
        });

        // Form change detection for auto-save
        document.addEventListener('input', (e) => {
            if (e.target.closest('.model-builder')) {
                this.hasUnsavedChanges = true;
                this.updateSaveStatus('unsaved');
            }
        });

        // Advanced expenses toggle
        const advancedExpenses = document.getElementById('advancedExpenses');
        if (advancedExpenses) {
            advancedExpenses.addEventListener('change', (e) => {
                this.toggleAdvancedExpenses(e.target.checked);
            });
        }

        // Close modals when clicking backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal__backdrop')) {
                const modal = e.target.closest('.modal');
                if (modal && modal.id) {
                    this.hideModal(modal.id);
                }
            }
        });
    }

    setupElement(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    updateUI() {
        if (this.currentUser) {
            this.showAppInterface();
            this.updateUserInfo();
            this.updateDashboard();
            this.renderModels();
        } else {
            this.showLandingPage();
        }
        this.renderPricingPlans();
        this.populateIndustryOptions();
    }

    showLandingPage() {
        const landingPage = document.getElementById('landingPage');
        const appInterface = document.getElementById('appInterface');
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');

        if (landingPage) landingPage.classList.remove('hidden');
        if (appInterface) appInterface.classList.add('hidden');
        if (authButtons) authButtons.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
    }

    showAppInterface() {
        const landingPage = document.getElementById('landingPage');
        const appInterface = document.getElementById('appInterface');
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');

        if (landingPage) landingPage.classList.add('hidden');
        if (appInterface) appInterface.classList.remove('hidden');
        if (authButtons) authButtons.classList.add('hidden');
        if (userInfo) userInfo.classList.remove('hidden');

        // Show dashboard by default
        this.showView('dashboard');
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update sidebar active state
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            }
        });

        // Update view-specific content
        if (viewName === 'models') {
            this.renderModels();
        } else if (viewName === 'dashboard') {
            this.updateDashboard();
        } else if (viewName === 'profile') {
            this.updateProfile();
        } else if (viewName === 'new-model') {
            this.initNewModel();
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const userName = document.getElementById('userName');
        const userPlan = document.getElementById('userPlan');
        const sidebarPlan = document.getElementById('sidebarPlan');
        const sidebarUsage = document.getElementById('sidebarUsage');

        if (userName) userName.textContent = this.currentUser.name;
        if (userPlan) userPlan.textContent = this.currentUser.plan || 'FREE';
        if (sidebarPlan) sidebarPlan.textContent = this.currentUser.plan || 'FREE';
        
        if (sidebarUsage) {
            const maxModels = this.subscriptionPlans[this.currentUser.plan || 'FREE'].maxModels;
            const usedModels = this.models.length;
            const usageText = maxModels === -1 ? `${usedModels} моделей` : `${usedModels}/${maxModels} моделей`;
            sidebarUsage.textContent = usageText;
        }
    }

    renderPricingPlans() {
        const container = document.getElementById('pricingPlans');
        if (!container) return;

        container.innerHTML = '';
        
        Object.values(this.subscriptionPlans).forEach((plan, index) => {
            const planCard = document.createElement('div');
            planCard.className = `pricing-card ${index === 1 ? 'pricing-card--featured' : ''}`;
            
            const btnText = plan.name === 'FREE' ? 'Начать бесплатно' : 'Выбрать план';
            const btnAction = plan.name === 'FREE' ? 'showModal(\'registerModal\')' : 'handlePricingUpgrade()';
            
            planCard.innerHTML = `
                <div class="pricing-card__name">${plan.name}</div>
                <div class="pricing-card__price">${plan.price}</div>
                <ul class="pricing-card__features">
                    ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <button class="btn btn--primary btn--full-width" onclick="${btnAction}">
                    ${btnText}
                </button>
            `;
            
            container.appendChild(planCard);
        });
    }

    handlePricingUpgrade() {
        this.showToast('Функция выбора платного плана будет доступна в полной версии', 'info');
    }

    populateIndustryOptions() {
        const select = document.getElementById('modelIndustry');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        this.industryTemplates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            select.appendChild(option);
        });
    }

    updateDashboard() {
        if (!this.currentUser) return;

        const totalModels = this.models.length;
        const activeProjects = this.models.filter(model => model.status === 'active').length;
        const totalRevenue = this.models.reduce((sum, model) => sum + (model.metrics?.totalRevenue || 0), 0);
        const averageNPV = totalModels > 0 ? this.models.reduce((sum, model) => sum + (model.metrics?.npv || 0), 0) / totalModels : 0;

        const totalModelsEl = document.getElementById('totalModels');
        const activeProjectsEl = document.getElementById('activeProjects');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const averageNPVEl = document.getElementById('averageNPV');

        if (totalModelsEl) totalModelsEl.textContent = totalModels;
        if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;
        if (totalRevenueEl) totalRevenueEl.textContent = this.formatCurrency(totalRevenue, 'RUB');
        if (averageNPVEl) averageNPVEl.textContent = this.formatCurrency(averageNPV, 'RUB');

        this.renderDashboardChart();
    }

    renderDashboardChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        
        // Clear any existing chart
        Chart.getChart(canvas)?.destroy();
        
        // Sample data for demonstration
        const data = {
            labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
            datasets: [{
                label: 'Выручка',
                data: [120000, 180000, 250000, 320000, 400000, 480000],
                backgroundColor: '#1FB8CD',
                borderColor: '#1FB8CD',
                tension: 0.4
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    renderModels() {
        const container = document.getElementById('modelsGrid');
        if (!container) return;

        container.innerHTML = '';

        if (this.models.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>У вас пока нет моделей</h3>
                    <p>Создайте первую финансовую модель для вашего проекта</p>
                    <button class="btn btn--primary" onclick="app.showView('new-model')">Создать модель</button>
                </div>
            `;
            return;
        }

        this.models.forEach(model => {
            const modelCard = document.createElement('div');
            modelCard.className = 'model-card';
            
            modelCard.innerHTML = `
                <div class="model-card__header">
                    <h3 class="model-card__title">${model.name}</h3>
                    <button class="model-card__delete" onclick="app.confirmDeleteModel('${model.id}')" title="Удалить модель">×</button>
                </div>
                <p class="model-card__description">${model.description || 'Без описания'}</p>
                <div class="model-card__stats">
                    <div class="model-card__stat">
                        <span class="model-card__stat-value">${this.formatCurrency(model.metrics?.totalRevenue || 0, model.currency)}</span>
                        <span class="model-card__stat-label">Выручка</span>
                    </div>
                    <div class="model-card__stat">
                        <span class="model-card__stat-value">${this.formatCurrency(model.metrics?.npv || 0, model.currency)}</span>
                        <span class="model-card__stat-label">NPV</span>
                    </div>
                    <div class="model-card__stat">
                        <span class="model-card__stat-value">${(model.metrics?.irr || 0).toFixed(1)}%</span>
                        <span class="model-card__stat-label">IRR</span>
                    </div>
                </div>
                <div class="model-card__actions">
                    <button class="btn btn--outline btn--sm" onclick="app.editModel('${model.id}')">Редактировать</button>
                    <button class="btn btn--primary btn--sm" onclick="app.viewResults('${model.id}')">Результаты</button>
                </div>
            `;
            
            container.appendChild(modelCard);
        });
    }

    updateProfile() {
        if (!this.currentUser) return;

        const profileEmail = document.getElementById('profileEmail');
        const profileName = document.getElementById('profileName');
        const profileCompany = document.getElementById('profileCompany');
        const subscriptionPlan = document.getElementById('subscriptionPlan');
        const subscriptionDetails = document.getElementById('subscriptionDetails');
        const subscriptionUsage = document.getElementById('subscriptionUsage');

        if (profileEmail) profileEmail.value = this.currentUser.email;
        if (profileName) profileName.value = this.currentUser.name;
        if (profileCompany) profileCompany.value = this.currentUser.company || '';

        const plan = this.subscriptionPlans[this.currentUser.plan || 'FREE'];
        if (subscriptionPlan) subscriptionPlan.textContent = plan.name;
        if (subscriptionDetails) subscriptionDetails.textContent = plan.features.join(', ');
        
        if (subscriptionUsage) {
            const maxModels = plan.maxModels;
            const usedModels = this.models.length;
            const usageText = maxModels === -1 ? `Использовано: ${usedModels} моделей` : `Использовано: ${usedModels} из ${maxModels} моделей`;
            subscriptionUsage.textContent = usageText;
        }
    }

    // Authentication Methods
    async login(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Вход...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // For demo purposes, accept any email/password
            this.currentUser = {
                id: Date.now().toString(),
                email: email,
                name: email.split('@')[0],
                plan: 'FREE',
                loginMethod: 'email',
                createdAt: new Date().toISOString()
            };

            this.saveUserData();
            this.updateUI();
            this.hideModal('loginModal');
            this.showToast('Добро пожаловать в FinModel Pro!', 'success');

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            event.target.reset();
        }, 1000);
    }

    async register(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const name = formData.get('name');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showToast('Пароли не совпадают', 'error');
            return;
        }

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.currentUser = {
                id: Date.now().toString(),
                email: email,
                name: name,
                plan: 'FREE',
                loginMethod: 'email',
                createdAt: new Date().toISOString()
            };

            this.saveUserData();
            this.updateUI();
            this.hideModal('registerModal');
            this.showToast('Регистрация успешно завершена!', 'success');

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            event.target.reset();
        }, 1000);
    }

    async resetPassword(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.hideModal('forgotPasswordModal');
            this.showToast('Инструкции по восстановлению отправлены на email', 'success');

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            event.target.reset();
        }, 1000);
    }

    async changePassword(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');

        if (newPassword !== confirmNewPassword) {
            this.showToast('Новые пароли не совпадают', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Изменение...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.hideModal('changePasswordModal');
            this.showToast('Пароль успешно изменен', 'success');

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            event.target.reset();
        }, 1000);
    }

    googleLogin() {
        // Simulate Google OAuth
        setTimeout(() => {
            this.currentUser = {
                id: Date.now().toString(),
                email: 'user@gmail.com',
                name: 'Google User',
                plan: 'FREE',
                loginMethod: 'google',
                createdAt: new Date().toISOString()
            };

            this.saveUserData();
            this.updateUI();
            this.hideModal('loginModal');
            this.hideModal('registerModal');
            this.showToast('Вход через Google успешен!', 'success');
        }, 1000);
    }

    updateProfile() {
        const profileName = document.getElementById('profileName');
        const profileCompany = document.getElementById('profileCompany');

        if (!profileName || !profileCompany) return;

        const name = profileName.value;
        const company = profileCompany.value;

        if (this.currentUser) {
            this.currentUser.name = name;
            this.currentUser.company = company;
            this.saveUserData();
            this.updateUserInfo();
            this.showToast('Профиль обновлен', 'success');
        }
    }

    logout() {
        this.currentUser = null;
        this.models = [];
        this.currentModel = null;
        localStorage.removeItem('finmodel_user');
        localStorage.removeItem('finmodel_models');
        this.updateUI();
        this.showToast('Вы вышли из системы', 'info');
    }

    // Model Management Methods
    initNewModel() {
        this.currentModel = {
            id: Date.now().toString(),
            name: '',
            description: '',
            industry: '',
            currency: 'RUB',
            planningPeriod: 'monthly',
            products: [],
            expenses: [],
            personnel: [],
            equipment: [],
            funding: [],
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.currentStep = 0;
        this.updateModelBuilderStep();
        this.renderExpenses();
    }

    editModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            this.currentModel = { ...model };
            this.showView('new-model');
            this.currentStep = 0;
            this.updateModelBuilderStep();
        }
    }

    viewResults(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            this.currentModel = { ...model };
            this.showView('new-model');
            this.currentStep = 5; // Results step
            this.updateModelBuilderStep();
            this.renderResults();
        }
    }

    confirmDeleteModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            this.showConfirmDialog(
                'Удаление модели',
                `Вы уверены, что хотите удалить модель "${model.name}"? Это действие нельзя отменить.`,
                () => this.deleteModel(modelId)
            );
        }
    }

    deleteModel(modelId) {
        this.models = this.models.filter(m => m.id !== modelId);
        this.saveUserData();
        this.renderModels();
        this.updateDashboard();
        this.showToast('Модель удалена', 'success');
    }

    saveModel() {
        if (!this.currentModel || !this.currentUser) return;

        // Validate required fields
        if (!this.currentModel.name) {
            this.showToast('Укажите название модели', 'error');
            return;
        }

        // Check subscription limits
        const plan = this.subscriptionPlans[this.currentUser.plan || 'FREE'];
        if (plan.maxModels !== -1 && this.models.length >= plan.maxModels) {
            const existingIndex = this.models.findIndex(m => m.id === this.currentModel.id);
            if (existingIndex === -1) {
                this.showToast('Достигнут лимит моделей. Обновите тариф.', 'error');
                return;
            }
        }

        // Calculate metrics
        this.currentModel.metrics = this.calculateMetrics(this.currentModel);
        this.currentModel.status = 'active';
        this.currentModel.updatedAt = new Date().toISOString();

        // Save model
        const existingIndex = this.models.findIndex(m => m.id === this.currentModel.id);
        if (existingIndex >= 0) {
            this.models[existingIndex] = { ...this.currentModel };
        } else {
            this.models.push({ ...this.currentModel });
        }

        this.saveUserData();
        this.hasUnsavedChanges = false;
        this.updateSaveStatus('saved');
        this.showToast('Модель сохранена', 'success');
    }

    // Model Builder Navigation
    nextStep() {
        if (this.currentStep < 5) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateModelBuilderStep();
            }
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateModelBuilderStep();
        }
    }

    updateModelBuilderStep() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index === this.currentStep);
        });

        // Update step content
        document.querySelectorAll('.step-content').forEach((content, index) => {
            content.classList.toggle('active', index === this.currentStep);
            content.classList.toggle('hidden', index !== this.currentStep);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const saveBtn = document.getElementById('saveModelBtn');

        if (prevBtn) prevBtn.disabled = this.currentStep === 0;
        
        if (this.currentStep === 5) {
            if (nextBtn) nextBtn.classList.add('hidden');
            if (saveBtn) saveBtn.classList.remove('hidden');
            this.renderResults();
        } else {
            if (nextBtn) nextBtn.classList.remove('hidden');
            if (saveBtn) saveBtn.classList.add('hidden');
        }

        // Load step-specific data
        this.loadStepData();
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 0: // Basic info
                const modelName = document.getElementById('modelName');
                if (!modelName || !modelName.value.trim()) {
                    this.showToast('Укажите название модели', 'error');
                    return false;
                }
                this.currentModel.name = modelName.value;
                
                const modelDescription = document.getElementById('modelDescription');
                if (modelDescription) this.currentModel.description = modelDescription.value;
                
                const modelIndustry = document.getElementById('modelIndustry');
                if (modelIndustry) this.currentModel.industry = modelIndustry.value;
                
                const modelCurrency = document.getElementById('modelCurrency');
                if (modelCurrency) this.currentModel.currency = modelCurrency.value;
                
                const planningPeriod = document.getElementById('planningPeriod');
                if (planningPeriod) this.currentModel.planningPeriod = planningPeriod.value;
                
                return true;
            default:
                return true;
        }
    }

    loadStepData() {
        if (!this.currentModel) return;

        switch (this.currentStep) {
            case 0: // Basic info
                const modelName = document.getElementById('modelName');
                const modelDescription = document.getElementById('modelDescription');
                const modelIndustry = document.getElementById('modelIndustry');
                const modelCurrency = document.getElementById('modelCurrency');
                const planningPeriod = document.getElementById('planningPeriod');

                if (modelName) modelName.value = this.currentModel.name || '';
                if (modelDescription) modelDescription.value = this.currentModel.description || '';
                if (modelIndustry) modelIndustry.value = this.currentModel.industry || '';
                if (modelCurrency) modelCurrency.value = this.currentModel.currency || 'RUB';
                if (planningPeriod) planningPeriod.value = this.currentModel.planningPeriod || 'monthly';
                break;
            case 1: // Products
                this.renderProducts();
                break;
            case 2: // Expenses
                this.renderExpenses();
                break;
            case 3: // Personnel
                this.renderPersonnel();
                break;
            case 4: // Investments
                this.renderInvestments();
                break;
            case 5: // Results
                this.renderResults();
                break;
        }
    }

    // Product Management
    addProduct() {
        if (!this.currentModel.products) this.currentModel.products = [];
        
        const product = {
            id: Date.now().toString(),
            name: '',
            description: '',
            price: 0,
            cost: 0,
            salesPlan: 'manual',
            periods: []
        };

        this.currentModel.products.push(product);
        this.renderProducts();
        this.hasUnsavedChanges = true;
    }

    removeProduct(productId) {
        this.currentModel.products = this.currentModel.products.filter(p => p.id !== productId);
        this.renderProducts();
        this.hasUnsavedChanges = true;
    }

    renderProducts() {
        const container = document.getElementById('productsList');
        if (!container || !this.currentModel.products) return;

        container.innerHTML = '';

        this.currentModel.products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product-item';
            
            productDiv.innerHTML = `
                <div class="product-item__header">
                    <div class="product-item__title">Продукт #${product.id.slice(-4)}</div>
                    <button class="product-item__remove" onclick="app.removeProduct('${product.id}')">×</button>
                </div>
                <div class="product-item__fields">
                    <div class="form-group">
                        <label class="form-label">Название</label>
                        <input type="text" class="form-control" value="${product.name}" 
                               onchange="app.updateProductField('${product.id}', 'name', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Описание</label>
                        <input type="text" class="form-control" value="${product.description}" 
                               onchange="app.updateProductField('${product.id}', 'description', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Цена продажи</label>
                        <input type="number" class="form-control" value="${product.price}" 
                               onchange="app.updateProductField('${product.id}', 'price', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Себестоимость</label>
                        <input type="number" class="form-control" value="${product.cost}" 
                               onchange="app.updateProductField('${product.id}', 'cost', parseFloat(this.value))">
                    </div>
                </div>
            `;
            
            container.appendChild(productDiv);
        });
    }

    updateProductField(productId, field, value) {
        const product = this.currentModel.products.find(p => p.id === productId);
        if (product) {
            product[field] = value;
            this.hasUnsavedChanges = true;
        }
    }

    // Expense Management
    toggleAdvancedExpenses(advanced) {
        // Toggle between simple and advanced expense modes
        this.renderExpenses();
    }

    renderExpenses() {
        const container = document.getElementById('expensesList');
        if (!container) return;

        container.innerHTML = '';

        this.expenseCategories.forEach(category => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = 'expense-item';
            
            expenseDiv.innerHTML = `
                <div class="form-group">
                    <label class="form-label">${category.name}</label>
                    <input type="number" class="form-control" placeholder="Сумма в месяц" 
                           onchange="app.updateExpense('${category.id}', parseFloat(this.value))">
                </div>
            `;
            
            container.appendChild(expenseDiv);
        });
    }

    updateExpense(categoryId, amount) {
        if (!this.currentModel.expenses) this.currentModel.expenses = [];
        
        const existingIndex = this.currentModel.expenses.findIndex(e => e.categoryId === categoryId);
        if (existingIndex >= 0) {
            this.currentModel.expenses[existingIndex].amount = amount;
        } else {
            this.currentModel.expenses.push({
                categoryId: categoryId,
                amount: amount
            });
        }
        
        this.hasUnsavedChanges = true;
    }

    // Personnel Management
    addPersonnel() {
        if (!this.currentModel.personnel) this.currentModel.personnel = [];
        
        const person = {
            id: Date.now().toString(),
            position: '',
            count: 1,
            salary: 0,
            startMonth: 1
        };

        this.currentModel.personnel.push(person);
        this.renderPersonnel();
        this.hasUnsavedChanges = true;
    }

    renderPersonnel() {
        const container = document.getElementById('personnelList');
        if (!container || !this.currentModel.personnel) return;

        container.innerHTML = '';

        this.currentModel.personnel.forEach(person => {
            const taxes = this.calculatePersonnelTaxes(person.salary * person.count);
            
            const personnelDiv = document.createElement('div');
            personnelDiv.className = 'personnel-item';
            
            personnelDiv.innerHTML = `
                <div class="product-item__header">
                    <div class="product-item__title">Должность #${person.id.slice(-4)}</div>
                    <button class="product-item__remove" onclick="app.removePersonnel('${person.id}')">×</button>
                </div>
                <div class="personnel-item__fields">
                    <div class="form-group">
                        <label class="form-label">Должность</label>
                        <input type="text" class="form-control" value="${person.position}" 
                               onchange="app.updatePersonnelField('${person.id}', 'position', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Количество</label>
                        <input type="number" class="form-control" value="${person.count}" min="1"
                               onchange="app.updatePersonnelField('${person.id}', 'count', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Зарплата (за 1 чел.)</label>
                        <input type="number" class="form-control" value="${person.salary}" 
                               onchange="app.updatePersonnelField('${person.id}', 'salary', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Месяц найма</label>
                        <select class="form-control" onchange="app.updatePersonnelField('${person.id}', 'startMonth', parseInt(this.value))">
                            ${this.generateMonthOptions(person.startMonth)}
                        </select>
                    </div>
                </div>
                <div class="tax-info">
                    <div class="tax-info__title">Налоги и взносы (всего):</div>
                    <div class="tax-breakdown">
                        <div class="tax-breakdown__item">
                            <span>НДФЛ (13%)</span>
                            <span>${this.formatCurrency(taxes.ndfl, this.currentModel.currency)}</span>
                        </div>
                        <div class="tax-breakdown__item">
                            <span>ПФР (22%)</span>
                            <span>${this.formatCurrency(taxes.pfr, this.currentModel.currency)}</span>
                        </div>
                        <div class="tax-breakdown__item">
                            <span>ФСС (2.9%)</span>
                            <span>${this.formatCurrency(taxes.fss, this.currentModel.currency)}</span>
                        </div>
                        <div class="tax-breakdown__item">
                            <span>ФОМС (5.1%)</span>
                            <span>${this.formatCurrency(taxes.foms, this.currentModel.currency)}</span>
                        </div>
                        <div class="tax-breakdown__item font-bold">
                            <span>Итого расходов</span>
                            <span>${this.formatCurrency(taxes.total, this.currentModel.currency)}</span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(personnelDiv);
        });
    }

    removePersonnel(personnelId) {
        this.currentModel.personnel = this.currentModel.personnel.filter(p => p.id !== personnelId);
        this.renderPersonnel();
        this.hasUnsavedChanges = true;
    }

    updatePersonnelField(personnelId, field, value) {
        const person = this.currentModel.personnel.find(p => p.id === personnelId);
        if (person) {
            person[field] = value;
            this.renderPersonnel(); // Re-render to update tax calculations
            this.hasUnsavedChanges = true;
        }
    }

    generateMonthOptions(selectedMonth) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        return months.map((month, index) => 
            `<option value="${index + 1}" ${selectedMonth === index + 1 ? 'selected' : ''}>${month}</option>`
        ).join('');
    }

    calculatePersonnelTaxes(grossSalary) {
        const ndfl = grossSalary * this.taxRates.ndfl;
        const pfr = grossSalary * this.taxRates.pfr;
        const fss = grossSalary * this.taxRates.fss;
        const foms = grossSalary * this.taxRates.foms;
        const total = grossSalary + pfr + fss + foms;

        return { ndfl, pfr, fss, foms, total };
    }

    // Investment Management
    addEquipment() {
        if (!this.currentModel.equipment) this.currentModel.equipment = [];
        
        const equipment = {
            id: Date.now().toString(),
            name: '',
            cost: 0,
            lifespan: 5,
            purchaseMonth: 1
        };

        this.currentModel.equipment.push(equipment);
        this.renderInvestments();
        this.hasUnsavedChanges = true;
    }

    addFunding() {
        if (!this.currentModel.funding) this.currentModel.funding = [];
        
        const funding = {
            id: Date.now().toString(),
            type: 'investment',
            amount: 0,
            month: 1,
            terms: ''
        };

        this.currentModel.funding.push(funding);
        this.renderInvestments();
        this.hasUnsavedChanges = true;
    }

    renderInvestments() {
        // Equipment tab
        const equipmentContainer = document.getElementById('equipmentList');
        if (equipmentContainer && this.currentModel.equipment) {
            equipmentContainer.innerHTML = '';
            
            this.currentModel.equipment.forEach(equipment => {
                const equipmentDiv = document.createElement('div');
                equipmentDiv.className = 'product-item';
                
                equipmentDiv.innerHTML = `
                    <div class="product-item__header">
                        <div class="product-item__title">Оборудование #${equipment.id.slice(-4)}</div>
                        <button class="product-item__remove" onclick="app.removeEquipment('${equipment.id}')">×</button>
                    </div>
                    <div class="product-item__fields">
                        <div class="form-group">
                            <label class="form-label">Название</label>
                            <input type="text" class="form-control" value="${equipment.name}" 
                                   onchange="app.updateEquipmentField('${equipment.id}', 'name', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Стоимость</label>
                            <input type="number" class="form-control" value="${equipment.cost}" 
                                   onchange="app.updateEquipmentField('${equipment.id}', 'cost', parseFloat(this.value))">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Срок службы (лет)</label>
                            <input type="number" class="form-control" value="${equipment.lifespan}" 
                                   onchange="app.updateEquipmentField('${equipment.id}', 'lifespan', parseInt(this.value))">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Месяц покупки</label>
                            <select class="form-control" onchange="app.updateEquipmentField('${equipment.id}', 'purchaseMonth', parseInt(this.value))">
                                ${this.generateMonthOptions(equipment.purchaseMonth)}
                            </select>
                        </div>
                    </div>
                `;
                
                equipmentContainer.appendChild(equipmentDiv);
            });
        }

        // Funding tab
        const fundingContainer = document.getElementById('fundingList');
        if (fundingContainer && this.currentModel.funding) {
            fundingContainer.innerHTML = '';
            
            this.currentModel.funding.forEach(funding => {
                const fundingDiv = document.createElement('div');
                fundingDiv.className = 'product-item';
                
                fundingDiv.innerHTML = `
                    <div class="product-item__header">
                        <div class="product-item__title">Финансирование #${funding.id.slice(-4)}</div>
                        <button class="product-item__remove" onclick="app.removeFunding('${funding.id}')">×</button>
                    </div>
                    <div class="product-item__fields">
                        <div class="form-group">
                            <label class="form-label">Тип</label>
                            <select class="form-control" onchange="app.updateFundingField('${funding.id}', 'type', this.value)">
                                <option value="investment" ${funding.type === 'investment' ? 'selected' : ''}>Инвестиции</option>
                                <option value="loan" ${funding.type === 'loan' ? 'selected' : ''}>Кредит</option>
                                <option value="grant" ${funding.type === 'grant' ? 'selected' : ''}>Грант</option>
                                <option value="personal" ${funding.type === 'personal' ? 'selected' : ''}>Собственные средства</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Сумма</label>
                            <input type="number" class="form-control" value="${funding.amount}" 
                                   onchange="app.updateFundingField('${funding.id}', 'amount', parseFloat(this.value))">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Месяц получения</label>
                            <select class="form-control" onchange="app.updateFundingField('${funding.id}', 'month', parseInt(this.value))">
                                ${this.generateMonthOptions(funding.month)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Условия</label>
                            <input type="text" class="form-control" value="${funding.terms}" 
                                   onchange="app.updateFundingField('${funding.id}', 'terms', this.value)">
                        </div>
                    </div>
                `;
                
                fundingContainer.appendChild(fundingDiv);
            });
        }
    }

    removeEquipment(equipmentId) {
        this.currentModel.equipment = this.currentModel.equipment.filter(e => e.id !== equipmentId);
        this.renderInvestments();
        this.hasUnsavedChanges = true;
    }

    removeFunding(fundingId) {
        this.currentModel.funding = this.currentModel.funding.filter(f => f.id !== fundingId);
        this.renderInvestments();
        this.hasUnsavedChanges = true;
    }

    updateEquipmentField(equipmentId, field, value) {
        const equipment = this.currentModel.equipment.find(e => e.id === equipmentId);
        if (equipment) {
            equipment[field] = value;
            this.hasUnsavedChanges = true;
        }
    }

    updateFundingField(fundingId, field, value) {
        const funding = this.currentModel.funding.find(f => f.id === fundingId);
        if (funding) {
            funding[field] = value;
            this.hasUnsavedChanges = true;
        }
    }

    // Results and Calculations
    renderResults() {
        if (!this.currentModel) return;

        const metrics = this.calculateMetrics(this.currentModel);
        this.renderPnLTable(metrics);
        this.renderCashFlowTable(metrics);
        this.renderMetricsGrid(metrics);
        this.renderResultsChart(metrics);
    }

    calculateMetrics(model) {
        // Simplified financial calculations for demo
        const periods = 36; // 3 years monthly
        
        let totalRevenue = 0;
        let totalCosts = 0;
        let totalExpenses = 0;

        // Calculate revenue from products
        if (model.products && model.products.length > 0) {
            model.products.forEach(product => {
                totalRevenue += (product.price || 0) * periods * 100; // Assuming 100 units per month
                totalCosts += (product.cost || 0) * periods * 100;
            });
        }

        // Calculate expenses
        if (model.expenses && model.expenses.length > 0) {
            model.expenses.forEach(expense => {
                totalExpenses += (expense.amount || 0) * periods;
            });
        }

        // Calculate personnel costs
        if (model.personnel && model.personnel.length > 0) {
            model.personnel.forEach(person => {
                const taxes = this.calculatePersonnelTaxes((person.salary || 0) * (person.count || 1));
                totalExpenses += taxes.total * periods;
            });
        }

        const grossProfit = totalRevenue - totalCosts;
        const netProfit = grossProfit - totalExpenses;
        const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const npv = netProfit * 0.8; // Simplified NPV
        const irr = netProfit > 0 ? 25 : -5; // Simplified IRR
        const paybackPeriod = totalExpenses > 0 ? (totalExpenses / (netProfit / periods)) : 0;

        return {
            totalRevenue,
            totalCosts,
            totalExpenses,
            grossProfit,
            netProfit,
            margin,
            npv,
            irr,
            paybackPeriod,
            periods
        };
    }

    renderPnLTable(metrics) {
        const container = document.getElementById('pnlTable');
        if (!container) return;

        const currency = this.currentModel.currency || 'RUB';
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Показатель</th>
                        <th>Год 1</th>
                        <th>Год 2</th>
                        <th>Год 3</th>
                        <th>Итого</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Выручка</td>
                        <td>${this.formatCurrency(metrics.totalRevenue / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalRevenue / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalRevenue / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.totalRevenue, currency)}</td>
                    </tr>
                    <tr>
                        <td>Себестоимость</td>
                        <td>${this.formatCurrency(metrics.totalCosts / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalCosts / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalCosts / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.totalCosts, currency)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Валовая прибыль</td>
                        <td>${this.formatCurrency(metrics.grossProfit / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.grossProfit / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.grossProfit / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.grossProfit, currency)}</td>
                    </tr>
                    <tr>
                        <td>Операционные расходы</td>
                        <td>${this.formatCurrency(metrics.totalExpenses / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalExpenses / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalExpenses / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.totalExpenses, currency)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Чистая прибыль</td>
                        <td>${this.formatCurrency(metrics.netProfit / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.netProfit / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.netProfit / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.netProfit, currency)}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    renderCashFlowTable(metrics) {
        const container = document.getElementById('cashflowTable');
        if (!container) return;

        const currency = this.currentModel.currency || 'RUB';
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Показатель</th>
                        <th>Год 1</th>
                        <th>Год 2</th>
                        <th>Год 3</th>
                        <th>Итого</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Поступления</td>
                        <td>${this.formatCurrency(metrics.totalRevenue / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalRevenue / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.totalRevenue / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.totalRevenue, currency)}</td>
                    </tr>
                    <tr>
                        <td>Операционные расходы</td>
                        <td>${this.formatCurrency((metrics.totalCosts + metrics.totalExpenses) / 3, currency)}</td>
                        <td>${this.formatCurrency((metrics.totalCosts + metrics.totalExpenses) / 3, currency)}</td>
                        <td>${this.formatCurrency((metrics.totalCosts + metrics.totalExpenses) / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.totalCosts + metrics.totalExpenses, currency)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Чистый денежный поток</td>
                        <td>${this.formatCurrency(metrics.netProfit / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.netProfit / 3, currency)}</td>
                        <td>${this.formatCurrency(metrics.netProfit / 3, currency)}</td>
                        <td class="font-bold">${this.formatCurrency(metrics.netProfit, currency)}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    renderMetricsGrid(metrics) {
        const container = document.getElementById('metricsGrid');
        if (!container) return;

        const currency = this.currentModel.currency || 'RUB';
        
        container.innerHTML = `
            <div class="metric-card">
                <div class="metric-card__label">NPV</div>
                <div class="metric-card__value">${this.formatCurrency(metrics.npv, currency)}</div>
                <div class="metric-card__description">Чистая приведенная стоимость</div>
            </div>
            <div class="metric-card">
                <div class="metric-card__label">IRR</div>
                <div class="metric-card__value">${metrics.irr.toFixed(1)}%</div>
                <div class="metric-card__description">Внутренняя норма доходности</div>
            </div>
            <div class="metric-card">
                <div class="metric-card__label">Payback</div>
                <div class="metric-card__value">${Math.abs(metrics.paybackPeriod).toFixed(1)} мес</div>
                <div class="metric-card__description">Срок окупаемости</div>
            </div>
            <div class="metric-card">
                <div class="metric-card__label">Маржинальность</div>
                <div class="metric-card__value">${metrics.margin.toFixed(1)}%</div>
                <div class="metric-card__description">Валовая маржа</div>
            </div>
            <div class="metric-card">
                <div class="metric-card__label">Выручка</div>
                <div class="metric-card__value">${this.formatCurrency(metrics.totalRevenue, currency)}</div>
                <div class="metric-card__description">Общая выручка за период</div>
            </div>
            <div class="metric-card">
                <div class="metric-card__label">Прибыль</div>
                <div class="metric-card__value">${this.formatCurrency(metrics.netProfit, currency)}</div>
                <div class="metric-card__description">Чистая прибыль</div>
            </div>
        `;
    }

    renderResultsChart(metrics) {
        const canvas = document.getElementById('resultsChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        
        // Clear any existing chart
        Chart.getChart(canvas)?.destroy();
        
        const data = {
            labels: ['Год 1', 'Год 2', 'Год 3'],
            datasets: [
                {
                    label: 'Выручка',
                    data: [metrics.totalRevenue / 3, metrics.totalRevenue / 3, metrics.totalRevenue / 3],
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD'
                },
                {
                    label: 'Расходы',
                    data: [(metrics.totalCosts + metrics.totalExpenses) / 3, (metrics.totalCosts + metrics.totalExpenses) / 3, (metrics.totalCosts + metrics.totalExpenses) / 3],
                    backgroundColor: '#FFC185',
                    borderColor: '#FFC185'
                },
                {
                    label: 'Прибыль',
                    data: [metrics.netProfit / 3, metrics.netProfit / 3, metrics.netProfit / 3],
                    backgroundColor: '#B4413C',
                    borderColor: '#B4413C'
                }
            ]
        };

        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Utility Methods
    switchTab(tabBtn, tabId) {
        // Remove active class from all tab buttons in the same container
        const container = tabBtn.closest('.model-builder__content, [class*="tab"]').parentElement;
        const tabButtons = container.querySelectorAll('.tab-btn');
        const tabContents = container.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.add('hidden'));

        // Activate clicked tab
        tabBtn.classList.add('active');
        const targetContent = document.getElementById(tabId + 'Tab');
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
    }

    formatCurrency(amount, currencyCode = 'RUB') {
        const currency = this.currencies.find(c => c.code === currencyCode);
        const symbol = currency ? currency.symbol : '₽';
        
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0) + ' ' + symbol;
    }

    // Auto-save functionality
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges && this.currentModel) {
                this.autoSave();
            }
        }, 30000); // Every 30 seconds
    }

    autoSave() {
        if (!this.currentModel || !this.currentUser) return;

        // Save current model data
        this.updateSaveStatus('saving');
        
        setTimeout(() => {
            // Simulate save delay
            this.hasUnsavedChanges = false;
            this.updateSaveStatus('saved');
        }, 1000);
    }

    updateSaveStatus(status) {
        const statusElement = document.getElementById('saveStatus');
        const statusText = statusElement?.querySelector('.save-status__text');
        
        if (!statusElement || !statusText) return;

        statusElement.className = 'save-status';
        
        switch (status) {
            case 'saving':
                statusElement.classList.add('save-status--saving');
                statusText.textContent = 'Сохранение...';
                break;
            case 'saved':
                statusText.textContent = 'Все изменения сохранены';
                break;
            case 'unsaved':
                statusElement.classList.add('save-status--error');
                statusText.textContent = 'Есть несохраненные изменения';
                break;
            case 'error':
                statusElement.classList.add('save-status--error');
                statusText.textContent = 'Ошибка сохранения';
                break;
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        const confirmTitle = document.getElementById('confirmTitle');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmButton');

        if (confirmTitle) confirmTitle.textContent = title;
        if (confirmMessage) confirmMessage.textContent = message;
        
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                onConfirm();
                this.hideConfirmDialog();
            };
        }
        
        this.showModal('confirmDialog');
    }

    hideConfirmDialog() {
        this.hideModal('confirmDialog');
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        toast.innerHTML = `
            <div class="toast__message">${message}</div>
            <button class="toast__close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers - make them available immediately
window.showModal = function(modalId) {
    if (window.app) window.app.showModal(modalId);
};

window.hideModal = function(modalId) {
    if (window.app) window.app.hideModal(modalId);
};

window.handlePricingUpgrade = function() {
    if (window.app) window.app.handlePricingUpgrade();
};

// Initialize application
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new FinModelApp();
        window.app = app; // Make globally accessible
    });
} else {
    app = new FinModelApp();
    window.app = app; // Make globally accessible
}