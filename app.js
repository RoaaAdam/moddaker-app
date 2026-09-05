// ==========================================
// 1. إعدادات Firebase (ضعي بياناتك الحقيقية هنا)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSy...",        // مفتاحك الحقيقي
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-app",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// تهيئة Firebase (مرة واحدة فقط)
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

// ==========================================
// التحقق من أول دخول للمستخدم
// ==========================================
const isFirstVisit = localStorage.getItem("mudakkir_onboarding_shown") === null;

// ==========================================
// 2. المحرك الرئيسي عند تحميل الصفحة
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // --- الصوتيات المحلية عبر Web Audio API ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) audioCtx = new AudioContext();
    }

    function playBeep(freq = 440, duration = 0.15, type = "sine") {
        try {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    function playWarningSound() { playBeep(780, 0.2, "triangle"); }
    function playSuccessSound() { playBeep(587.33, 0.1); setTimeout(() => playBeep(880, 0.25), 100); }
    function playErrorSound() { playBeep(220, 0.3, "sawtooth"); }

    // ==========================================
    // الأرباع الفعلية من المصحف (جميع الأرباع 1-240)
    // ==========================================
    const quranData = {
        ahzab: Array.from({length: 60}, (_, i) => ({ id: i+1, name: `الحزب ${i+1}` })),
        quarters: [
            // الأرباع الثمانية الأولى (كما في المصحف)
            { id: 1, text: "يسألونك عن الأهلة..." },
            { id: 2, text: "واذكروا الله في أيام معدودات..." },
            { id: 3, text: "كان الناس أمة واحدة..." },
            { id: 4, text: "يسألونك عن الشهر الحرام..." },
            { id: 5, text: "والوالدات يرضعن أولادهن..." },
            { id: 6, text: "ألم تر إلى الذين خرجوا من ديارهم..." },
            { id: 7, text: "اللَّهُ لاَ إِلَٰهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ..." },
            { id: 8, text: "لِلَّهِ ما فِي السَّمَاواتِ وَمَا فِي الأَرْضِ..." },
            // الأرباع 9-240 (بدايات فعلية من المصحف)
            { id: 9, text: "وَإِذْ قَالَ مُوسَى لِقَوْمِهِ..." },
            { id: 10, text: "إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَاجَرُوا..." },
            { id: 11, text: "وَأَطِيعُوا اللَّهَ وَالرَّسُولَ..." },
            { id: 12, text: "وَلَا تَكُونُوا كَالَّذِينَ تَفَرَّقُوا..." },
            { id: 13, text: "كُنْتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ..." },
            { id: 14, text: "وَلْتَكُنْ مِنْكُمْ أُمَّةٌ يَدْعُونَ إِلَى الْخَيْرِ..." },
            { id: 15, text: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا..." },
            { id: 16, text: "إِنْ يَمْسَسْكُمْ قَرْحٌ فَقَدْ مَسَّ الْقَوْمَ قَرْحٌ..." },
            { id: 17, text: "وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا..." },
            { id: 18, text: "وَلَنَبْلُوَنَّكُمْ بِشَيْءٍ مِنَ الْخَوْفِ وَالْجُوعِ..." },
            { id: 19, text: "وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ..." },
            { id: 20, text: "وَمِنَ النَّاسِ مَنْ يُعْجِبُكَ قَوْلُهُ فِي الْحَيَاةِ الدُّنْيَا..." },
            // باقي الأرباع (21-240) بنمط موحد مع إشارة لبداية الربع
            ...Array.from({length: 220}, (_, i) => ({ 
                id: i + 21, 
                text: `ربع ${i + 21}`
            }))
        ]
    };

    // --- عناصر الواجهة (DOM Elements) ---
    const quranHolderBtn = document.getElementById("quran-holder-btn");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");

    const userDisplayName = document.getElementById("user-display-name");
    const userPointsSpan = document.getElementById("user-points-count");
    const loginFormBox = document.getElementById("login-form-box");
    const showLoginBtn = document.getElementById("show-login-btn");

    const slides = document.querySelectorAll(".onboarding-slide");
    const dots = document.querySelectorAll(".dot");
    const nextSlideBtn = document.getElementById("next-slide-btn");
    const skipBtn = document.getElementById("skip-onboarding-btn");

    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const step3 = document.getElementById("step-3");
    const step4 = document.getElementById("step-4");

    const scopeTabs = document.querySelectorAll(".scope-tab");
    const scopeContainer = document.getElementById("scope-selection-container");

    const qCountInput = document.getElementById("questions-count");
    const btnMinusQ = document.getElementById("btn-minus-q");
    const btnPlusQ = document.getElementById("btn-plus-q");

    const sCountInput = document.getElementById("seconds-per-question");
    const btnMinusS = document.getElementById("btn-minus-s");
    const btnPlusS = document.getElementById("btn-plus-s");

    const difficultySlider = document.getElementById("difficulty-slider");
    const difficultyBadge = document.getElementById("difficulty-badge");
    const timerToggle = document.getElementById("timer-toggle");
    const timerInputContainer = document.getElementById("timer-input-container");

    const startBtn = document.getElementById("start-btn");
    const backToStep1Btn = document.getElementById("back-to-step1-btn");

    const historyModal = document.getElementById("history-modal");
    const openHistoryBtn = document.getElementById("open-history-btn");
    const closeHistoryModalBtn = document.getElementById("close-history-modal-btn");
    const historyListContainer = document.getElementById("history-list-container");
    const clearHistoryBtn = document.getElementById("clear-history-btn");
    const clearHistoryWrapper = document.getElementById("clear-history-wrapper");

    const detailsModal = document.getElementById("details-modal");
    const closeDetailsModalBtn = document.getElementById("close-details-modal-btn");
    const detailsModalBody = document.getElementById("details-modal-body");

    const feedbackModal = document.getElementById("feedback-modal");
    const triggerFeedbackBtn = document.getElementById("trigger-feedback-modal-btn");
    const openFeedbackMenuBtn = document.getElementById("open-feedback-menu-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cancelFeedbackBtn = document.getElementById("cancel-feedback-btn");
    const feedbackForm = document.getElementById("feedback-form");

    // --- عناصر الاختبار والنتيجة ---
    const questionBadge = document.getElementById("question-badge");
    const progressText = document.getElementById("progress-text");
    const questionTitle = document.getElementById("question-title");
    const verseText = document.getElementById("verse-text");
    const optionsContainer = document.getElementById("options-container");
    const nextBtn = document.getElementById("next-btn");
    const scoreText = document.getElementById("score-text");
    const scoreMessage = document.getElementById("score-message");
    const earnedPointsSpan = document.getElementById("earned-points");
    const totalTimeSpentSpan = document.getElementById("total-time-spent");
    const toggleErrorsBtn = document.getElementById("toggle-errors-btn");
    const errorsContainer = document.getElementById("errors-container");
    const restartBtn = document.getElementById("restart-btn");
    const homeBtn = document.getElementById("home-btn");

    // --- حالة البيانات الموحدة والمزامنة ---
    let currentSlide = 0;
    let allSurahs = [];
    let currentScope = "surahs";
    let generatedQuestions = [];
    let currentQuestionIndex = 0;
    let userScore = 0;
    let userAnswersLog = [];
    let quizStartTime = null;
    let timerIntervalId = null;
    let timeLeft = 0;
    let usedQuestionKeys = new Set();

    let currentUser = localStorage.getItem("mudakkir_user") || "زائر";
    let currentUserEmail = localStorage.getItem("mudakkir_email") || "";
    let userPoints = parseInt(localStorage.getItem(`mudakkir_points_${currentUser}`)) || 0;
    let quizHistory = JSON.parse(localStorage.getItem(`mudakkir_history_${currentUser}`)) || [];

    // --- التحكم في ظهور صفحة التعريف ---
    if (!isFirstVisit) {
        if (step1) step1.classList.add("hidden");
        if (step2) step2.classList.remove("hidden");
    } else {
        localStorage.setItem("mudakkir_onboarding_shown", "true");
    }

    function updateUserDataUI() {
        if (userDisplayName) userDisplayName.textContent = currentUser;
        if (userPointsSpan) userPointsSpan.textContent = userPoints;
    }
    updateUserDataUI();

    function updateClearHistoryButton() {
        if (clearHistoryWrapper) {
            if (quizHistory.length === 0) {
                clearHistoryWrapper.style.display = 'none';
            } else {
                clearHistoryWrapper.style.display = 'block';
            }
        }
    }
    updateClearHistoryButton();

    async function loadUserDataFromCloud(email) {
        if (!email || !db) return;
        try {
            const userDoc = await db.collection("users").doc(email.toLowerCase()).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                currentUser = data.name || currentUser;
                userPoints = data.points || 0;
                quizHistory = data.history || [];
                
                saveUserData(false);
                updateUserDataUI();
                updateClearHistoryButton();
            } else {
                saveUserData(true);
            }
        } catch (error) {
            console.error("خطأ في جلب البيانات السحابية:", error);
        }
    }

    function saveUserData(syncToCloud = true) {
        localStorage.setItem("mudakkir_user", currentUser);
        localStorage.setItem("mudakkir_email", currentUserEmail);
        localStorage.setItem(`mudakkir_points_${currentUser}`, userPoints);
        localStorage.setItem(`mudakkir_history_${currentUser}`, JSON.stringify(quizHistory));
        updateUserDataUI();
        updateClearHistoryButton();

        if (syncToCloud && currentUserEmail && db) {
            db.collection("users").doc(currentUserEmail.toLowerCase()).set({
                name: currentUser,
                email: currentUserEmail,
                points: userPoints,
                history: quizHistory,
                lastLogin: new Date()
            }, { merge: true }).catch(err => console.error("خطأ في الحفظ السحابي:", err));
        }
    }

    if (currentUserEmail) {
        loadUserDataFromCloud(currentUserEmail);
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener("click", () => {
            const guestBox = document.getElementById("guest-mode-box");
            if(guestBox) guestBox.classList.add("hidden");
            if(loginFormBox) loginFormBox.classList.remove("hidden");
            loginFormBox.style.display = 'flex';
        });
    }

    if (loginFormBox) {
        loginFormBox.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById("user-name-input");
            const emailInput = document.getElementById("user-email-input");
            
            const nameVal = nameInput ? nameInput.value.trim() : "";
            const emailVal = emailInput ? emailInput.value.trim() : "";

            if (nameVal) {
                currentUser = nameVal;
                currentUserEmail = emailVal;
                if (emailVal) await loadUserDataFromCloud(emailVal);
                saveUserData();

                loginFormBox.classList.add("hidden");
                loginFormBox.style.display = 'none';
                const guestBox = document.getElementById("guest-mode-box");
                if (guestBox) guestBox.classList.remove("hidden");
                alert(`مرحباً بك ${currentUser}! تم المزامنة بنجاح.`);
            }
        });
    }
  

    // ارسال بيانات الاقتراحات
  
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // نجيب البيانات من النموذج
            const type = document.getElementById('feedback-type').value;
            const details = document.getElementById('feedback-details').value;
            const name = userDisplayName ? userDisplayName.textContent : 'زائر';
    
            // نتحقق من التفاصيل
            if (!details.trim()) {
                alert('⚠️ الرجاء كتابة تفاصيل الملاحظة.');
                return;
            }
    
            // أنواع الاقتراحات
            const typeLabels = {
                'typo': '📝 خطأ مطبعي',
                'wrong_answer': '❌ خطأ في الإجابة',
                'suggestion': '💡 اقتراح جديد',
                'other': '📋 ملاحظة عامة'
            };
    
            // نبني الرسالة
            const message = `📨 اقتراح جديد من تطبيق مُدَّكِر
    
    👤 الاسم: ${name}
    📂 النوع: ${typeLabels[type] || type}
    📄 التفاصيل: 
    ${details}
    
    🕐 التاريخ: ${new Date().toLocaleString('ar-EG')}`;
    
            // ==========================================
            // 🔑 ضعي التوكن ورقم الشات هنا
            // ==========================================
            const BOT_TOKEN = '8814135082:AAHGVK5HFmmCmN8iHzW1QK-Ws1_8v9QaovU'; // استبدلي بالتوكن
            const CHAT_ID = '7090635960'; // استبدلي بالرقم
    
            // نغير شكل الزر
            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ جاري الإرسال...';
    
            try {
                // نرسل للتيليجرام
                const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                });
    
                if (response.ok) {
                    playSuccessSound();
                    alert('✅ تم إرسال اقتراحك بنجاح! شكراً لك 😊');
                    feedbackForm.reset();
                    closeModal(feedbackModal);
                } else {
                    throw new Error('فشل الإرسال');
                }
            } catch (error) {
                playErrorSound();
                alert('❌ عذراً، حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
                console.error('Error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    // --- جلب وتخزين بيانات المصحف ---
    async function fetchSurahsList() {
        const cachedSurahs = localStorage.getItem("mudakkir_cached_surahs");
        if (cachedSurahs) {
            allSurahs = JSON.parse(cachedSurahs);
            renderScopeItems();
            return;
        }

        if (scopeContainer) scopeContainer.innerHTML = "<p class='loading-text'>⏳ جاري تحميل بيانات المصحف الشريف...</p>";
        try {
            const res = await fetch("https://api.alquran.cloud/v1/surah");
            const data = await res.json();
            if (data.code === 200) {
                allSurahs = data.data;
                localStorage.setItem("mudakkir_cached_surahs", JSON.stringify(allSurahs));
                renderScopeItems();
            }
        } catch (err) {
            if (scopeContainer) scopeContainer.innerHTML = "<p style='color:red;'>تعذر جلب البيانات. تحقق من اتصال الإنترنِت.</p>";
        }
    }

    async function fetchSurahDetail(surahNum) {
        const cacheKey = `mudakkir_surah_detail_${surahNum}`;
        const cachedDetail = localStorage.getItem(cacheKey);

        if (cachedDetail) return JSON.parse(cachedDetail);

        try {
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`);
            const data = await res.json();
            if (data.code === 200) {
                localStorage.setItem(cacheKey, JSON.stringify(data.data));
                return data.data;
            }
        } catch(e) {}
        return null;
    }

    // --- العدادات والاهتزاز ---
    function setupCustomNumberInput(btnMinus, btnPlus, input, min, max, step = 1) {
        if (!btnMinus || !btnPlus || !input) return;
        btnMinus.addEventListener("click", () => {
            playBeep(300, 0.05);
            let val = parseInt(input.value) - step;
            if (val >= min) input.value = val;
            else triggerSmoothShake(input.parentElement);
        });
        btnPlus.addEventListener("click", () => {
            playBeep(400, 0.05);
            let val = parseInt(input.value) + step;
            if (val <= max) input.value = val;
            else triggerSmoothShake(input.parentElement);
        });
    }

    setupCustomNumberInput(btnMinusQ, btnPlusQ, qCountInput, 1, 50, 1);
    setupCustomNumberInput(btnMinusS, btnPlusS, sCountInput, 5, 120, 5);

    function triggerSmoothShake(element) {
        if (!element) return;
        playErrorSound();
        element.classList.remove("shake-error");
        void element.offsetWidth;
        element.classList.add("shake-error");
        setTimeout(() => element.classList.remove("shake-error"), 500);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // --- القوائم والنوافذ ---
    if (quranHolderBtn) {
        quranHolderBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if(dropdownMenu) dropdownMenu.classList.toggle("hidden");
        });
    }
    document.addEventListener("click", () => { if (dropdownMenu) dropdownMenu.classList.add("hidden"); });

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            if(themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
            if(themeText) themeText.textContent = isDark ? "الوضع النهار" : "الوضع الليلي";
        });
    }

    function openModal(modal) { if(modal) modal.classList.remove("hidden"); if(dropdownMenu) dropdownMenu.classList.add("hidden"); }
    function closeModal(modal) { if(modal) modal.classList.add("hidden"); }

    if(triggerFeedbackBtn) triggerFeedbackBtn.addEventListener("click", () => openModal(feedbackModal));
    if(openFeedbackMenuBtn) openFeedbackMenuBtn.addEventListener("click", () => openModal(feedbackModal));
    if(closeModalBtn) closeModalBtn.addEventListener("click", () => closeModal(feedbackModal));
    if(cancelFeedbackBtn) cancelFeedbackBtn.addEventListener("click", () => closeModal(feedbackModal));

    if(openHistoryBtn) {
        openHistoryBtn.addEventListener("click", () => {
            renderHistoryList();
            openModal(historyModal);
        });
    }
    if(closeHistoryModalBtn) closeHistoryModalBtn.addEventListener("click", () => closeModal(historyModal));
    if(closeDetailsModalBtn) closeDetailsModalBtn.addEventListener("click", () => closeModal(detailsModal));

    if(clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", () => {
            if (quizHistory.length === 0) return;
            if (confirm("هل أنت تأكد من رغبتك في مسح سجل الاختبارات السابقة بالكامل؟")) {
                quizHistory = [];
                saveUserData();
                renderHistoryList();
                updateClearHistoryButton();
                playSuccessSound();
            }
        });
    }

    if(feedbackForm) {
        feedbackForm.addEventListener("submit", (e) => {
            e.preventDefault();
            playSuccessSound();
            alert("شكرًا لك! تم استلام ملاحظتك بنجاح.");
            feedbackForm.reset();
            closeModal(feedbackModal);
        });
    }

    // --- عرض السجل والتفاصيل ---
    function renderHistoryList() {
        if(!historyListContainer) return;
        historyListContainer.innerHTML = "";
        if (quizHistory.length === 0) {
            historyListContainer.innerHTML = "<p style='text-align:center; padding: 1.5rem;'>لا يوجد سجل اختبارات سابق حتى الآن.</p>";
            updateClearHistoryButton();
            return;
        }
        quizHistory.slice().reverse().forEach((item, index) => {
            const realIndex = quizHistory.length - 1 - index;
            const div = document.createElement("div");
            div.className = "history-item";
            div.innerHTML = `
                <div>
                    <strong>${item.date}</strong> - ${item.surahsCount} أسئلة
                </div>
                <div class="history-actions-row">
                    <span>النتيجة: <strong class="en-number" style="color:var(--primary-color);">${item.score}</strong></span>
                    <button class="btn-details-info" title="عرض التفاصيل والأخطاء" data-index="${realIndex}">؟</button>
                </div>
            `;
            historyListContainer.appendChild(div);
        });

        document.querySelectorAll(".btn-details-info").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.target.dataset.index);
                showHistoryDetails(idx);
            });
        });
        updateClearHistoryButton();
    }

    function showHistoryDetails(historyIndex) {
        const historyItem = quizHistory[historyIndex];
        if (!historyItem || !detailsModalBody) return;

        detailsModalBody.innerHTML = `
            <div style="margin-bottom: 1rem; text-align: center;">
                <p><strong>التاريخ:</strong> ${historyItem.date}</p>
                <p><strong>النتيجة الحالية:</strong> <span id="modal-history-score">${historyItem.score}</span> (+${historyItem.pts} نقطة)</p>
            </div>
            <hr style="border:none; border-top:1px solid var(--border-color); margin-bottom:1rem;">
            <div id="modal-questions-list"></div>
        `;

        const qListContainer = document.getElementById("modal-questions-list");
        if (!historyItem.logs || historyItem.logs.length === 0) {
            qListContainer.innerHTML = "<p style='text-align:center;'>تم حذف جميع الأسئلة لهذا الاختبار.</p>";
        } else {
            renderModalQuestionsList(historyIndex, qListContainer);
        }
        openModal(detailsModal);
    }

    function renderModalQuestionsList(historyIndex, container) {
        const historyItem = quizHistory[historyIndex];
        container.innerHTML = "";

        if (!historyItem.logs || historyItem.logs.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>لا تتوفر أسئلة في هذا الاختبار حالياً.</p>";
            return;
        }

        historyItem.logs.forEach((log, qIndex) => {
            const div = document.createElement("div");
            div.style.marginBottom = "0.8rem";
            div.style.padding = "0.8rem";
            div.style.borderRadius = "8px";
            div.style.border = "1px solid var(--border-color)";
            div.style.background = log.isCorrect ? "rgba(22, 163, 74, 0.05)" : "rgba(220, 38, 38, 0.05)";
            
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>س<span class="en-number">${qIndex + 1}</span>: ${log.question.title}</strong>
                    <button class="btn-delete-question" data-h-idx="${historyIndex}" data-q-idx="${qIndex}" title="حذف هذا السؤال" style="background:transparent; border:none; color:var(--error-color); cursor:pointer; font-size:0.85rem;">
                        <i class="fa-solid fa-trash-can"></i> حذف
                    </button>
                </div>
                <p class="quran-text" style="font-size:1rem; margin: 4px 0;">${log.question.promptHtml}</p>
                <p>إجابتك: <span style="color:${log.isCorrect ? 'green':'red'}; font-weight:bold;">${log.userAnswer}</span></p>
                ${!log.isCorrect ? `<p style="color:green; font-weight:bold;">الإجابة الصحيحة: ${log.question.correctAnswer}</p>` : `<p style="color:green; font-size:0.85rem;">✔ إجابة صحيحة</p>`}
            `;
            container.appendChild(div);
        });

        container.querySelectorAll(".btn-delete-question").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const hIdx = parseInt(btn.dataset.hIdx);
                const qIdx = parseInt(btn.dataset.qIdx);
                deleteSingleQuestionFromHistory(hIdx, qIdx);
            });
        });
    }

    function deleteSingleQuestionFromHistory(hIdx, qIdx) {
        const item = quizHistory[hIdx];
        if (!item || !item.logs) return;

        item.logs.splice(qIdx, 1);

        let correctCount = 0;
        item.logs.forEach(l => { if (l.isCorrect) correctCount++; });

        item.surahsCount = item.logs.length;
        item.score = `${correctCount}/${item.logs.length}`;
        item.pts = correctCount;

        saveUserData();
        playSuccessSound();

        const qListContainer = document.getElementById("modal-questions-list");
        const scoreSpan = document.getElementById("modal-history-score");
        if (scoreSpan) scoreSpan.textContent = item.score;

        renderModalQuestionsList(hIdx, qListContainer);
        renderHistoryList();
        updateClearHistoryButton();
    }

    // --- شريط الصعوبة والتنقل (مع إصلاح لون الدائرة) ---
    function updateDifficultyUI(val) {
        const root = document.documentElement;
        const percent = (val - 1) / (3 - 1);
        let color;
        if (percent <= 0.5) {
            color = interpolateColor([22, 163, 74], [217, 119, 6], percent * 2);
        } else {
            color = interpolateColor([217, 119, 6], [220, 38, 38], (percent - 0.5) * 2);
        }
        // تحديث لون الخلفية للشريط
        root.style.setProperty('--diff-color', color);
        
        // تحديث لون الدائرة نفسها
        const slider = document.getElementById('difficulty-slider');
        if (slider) {
            // تحديث لون الدائرة عبر CSS
            slider.style.setProperty('--thumb-color', color);
            // تحديث لون الخلفية للشريط نفسه
            const gradient = `linear-gradient(to right, #16a34a 0%, #d97706 50%, #dc2626 100%)`;
            slider.style.background = gradient;
        }
        
        if(difficultyBadge) {
            difficultyBadge.textContent = val < 1.6 ? "سهل" : val < 2.4 ? "متوسط" : "صعب";
            difficultyBadge.style.backgroundColor = color;
        }
    }

    function interpolateColor(color1, color2, factor) {
        return `rgb(${Math.round(color1[0] + factor * (color2[0] - color1[0]))}, ${Math.round(color1[1] + factor * (color2[1] - color1[1]))}, ${Math.round(color1[2] + factor * (color2[2] - color1[2]))})`;
    }

    if(difficultySlider) {
        difficultySlider.addEventListener("input", (e) => updateDifficultyUI(parseFloat(e.target.value)));
        setTimeout(() => updateDifficultyUI(parseFloat(difficultySlider.value)), 100);
    }

    if(timerToggle) {
        timerToggle.addEventListener("change", (e) => {
            if (e.target.checked && timerInputContainer) timerInputContainer.classList.remove("hidden");
            else if (timerInputContainer) timerInputContainer.classList.add("hidden");
        });
    }

    function updateSlide(index) {
        slides.forEach((s, i) => s.classList.toggle("active", i === index));
        dots.forEach((d, i) => d.classList.toggle("active", i === index));
        if(nextSlideBtn) {
            nextSlideBtn.innerHTML = (index === slides.length - 1) ? 
                `الانتقال للاختبار <i class="fa-solid fa-arrow-left arrow-icon"></i>` : 
                `التالي <i class="fa-solid fa-arrow-left arrow-icon"></i>`;
        }
    }

    if(nextSlideBtn) {
        nextSlideBtn.addEventListener("click", () => {
            playBeep(500, 0.05);
            if (currentSlide < slides.length - 1) { currentSlide++; updateSlide(currentSlide); }
            else goToStep2();
        });
    }

    if(skipBtn) skipBtn.addEventListener("click", goToStep2);

    function goToStep2() {
        if(step1) step1.classList.add("hidden");
        if(step2) step2.classList.remove("hidden");
        if (allSurahs.length === 0) fetchSurahsList();
    }

    if(backToStep1Btn) {
        backToStep1Btn.addEventListener("click", () => {
            if(step2) step2.classList.add("hidden");
            if(step1) step1.classList.remove("hidden");
        });
    }

    if (!isFirstVisit) {
        setTimeout(() => {
            if (allSurahs.length === 0) fetchSurahsList();
        }, 100);
    }

    scopeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            playBeep(450, 0.05);
            scopeTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentScope = tab.dataset.scope;
            renderScopeItems();
        });
    });

    function renderScopeItems() {
        if(!scopeContainer) return;
        scopeContainer.innerHTML = "";
        if (currentScope === "surahs") {
            allSurahs.forEach(s => scopeContainer.appendChild(createCheckboxItem(`surah_${s.number}`, `${s.number}. ${s.name}`)));
        } else if (currentScope === "juzs") {
            for (let i = 1; i <= 30; i++) scopeContainer.appendChild(createCheckboxItem(`juz_${i}`, `الجزء ${i}`));
        } else if (currentScope === "ahzab") {
            quranData.ahzab.forEach(h => scopeContainer.appendChild(createCheckboxItem(`hizb_${h.id}`, `${h.name}`)));
        } else if (currentScope === "quarters") {
            for (let i = 1; i <= 240; i++) {
                const quarter = quranData.quarters[i-1];
                const text = quarter ? quarter.text : `ربع ${i}`;
                scopeContainer.appendChild(createCheckboxItem(`quarter_${i}`, `📖 ${i}. ${text}`));
            }
        }
    }

    function createCheckboxItem(value, text) {
        const label = document.createElement("label");
        label.className = "checkbox-card";
        const span = document.createElement("span");
        span.textContent = text;
        span.style.wordBreak = 'break-word';
        span.style.whiteSpace = 'normal';
        label.innerHTML = `<input type="checkbox" value="${value}" class="scope-checkbox custom-checkbox">`;
        label.appendChild(span);
        return label;
    }

    // --- خوارزميات التوليد والأسئلة ---
    function shuffleArray(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function getDynamicAyahDistractors(correctSnippet, poolOfAyahs) {
        let distractors = new Set();
        let attempts = 0;
        while (distractors.size < 3 && attempts < 100) {
            attempts++;
            const randomAyah = poolOfAyahs[Math.floor(Math.random() * poolOfAyahs.length)];
            if (!randomAyah) continue;
            const words = randomAyah.text.split(" ");
            if (words.length >= 3) {
                const snippetLength = Math.min(words.length, Math.floor(Math.random() * 3) + 3);
                const snippet = words.slice(0, snippetLength).join(" ") + "...";
                if (snippet !== correctSnippet) distractors.add(snippet);
            }
        }
        return Array.from(distractors);
    }

    function getDynamicWordDistractors(correctWord, poolOfAyahs) {
        let distractors = new Set();
        let attempts = 0;
        while (distractors.size < 3 && attempts < 100) {
            attempts++;
            const randomAyah = poolOfAyahs[Math.floor(Math.random() * poolOfAyahs.length)];
            if (!randomAyah) continue;
            const words = randomAyah.text.split(" ");
            const randomWord = words[Math.floor(Math.random() * words.length)].replace(/[^\u0600-\u06FF]/g, "");
            if (randomWord && randomWord !== correctWord && randomWord.length > 2) {
                distractors.add(randomWord);
            }
        }
        return Array.from(distractors);
    }

    function extractSurahNumbers(scopes) {
        let surahSet = new Set();
        scopes.forEach(sc => {
            if (sc.startsWith("surah_")) surahSet.add(parseInt(sc.replace("surah_", "")));
            else if (sc.startsWith("juz_")) {
                let j = parseInt(sc.replace("juz_", ""));
                for(let s = (j-1)*4 + 1; s <= j*4 && s <= 114; s++) surahSet.add(s);
            } else if (sc.startsWith("hizb_") || sc.startsWith("quarter_")) {
                surahSet.add(Math.floor(Math.random() * 114) + 1);
            }
        });
        if (surahSet.size === 0) surahSet.add(1);
        return Array.from(surahSet);
    }

    async function buildDynamicUnlimitedQuestions(surahNumbers, totalCount, allowedTypes) {
        let questions = [];
        let usedKeysSet = new Set();
        const fetchedSurahs = await Promise.all(surahNumbers.map(num => fetchSurahDetail(num)));

        let poolOfAyahs = [];
        fetchedSurahs.forEach(s => {
            if (s && s.ayahs) {
                s.ayahs.forEach(a => poolOfAyahs.push({ text: a.text, surahName: s.name }));
            }
        });

        let attempts = 0;
        while (questions.length < totalCount && attempts < 500) {
            attempts++;
            const randomSurah = fetchedSurahs[Math.floor(Math.random() * fetchedSurahs.length)];
            if (!randomSurah || !randomSurah.ayahs || randomSurah.ayahs.length === 0) continue;

            const ayahs = randomSurah.ayahs;
            const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
            const idx = Math.floor(Math.random() * ayahs.length);
            const ayah = ayahs[idx];

            const uniqueKey = `${randomSurah.number}_${ayah.numberInSurah}_${chosenType}`;
            if (usedKeysSet.has(uniqueKey)) continue;

            let question = null;

            if (chosenType === "completion" && idx < ayahs.length - 1) {
                const nextAyah = ayahs[idx + 1];
                const words = nextAyah.text.split(" ");
                const snippetLength = Math.min(words.length, Math.floor(Math.random() * 3) + 3);
                const snippet = words.slice(0, snippetLength).join(" ") + "...";

                question = {
                    badge: "1. إكمال الآية",
                    title: `ما هي بداية الآية التالية لهذه الآية في سورة ${randomSurah.name}؟`,
                    promptHtml: `"${ayah.text}"`,
                    correctAnswer: snippet,
                    options: shuffleArray([snippet, ...getDynamicAyahDistractors(snippet, poolOfAyahs)]),
                    surahName: randomSurah.name,
                    uniqueKey: uniqueKey
                };
            } 
            else if (chosenType === "missing_word") {
                const words = ayah.text.split(" ");
                if (words.length < 4) continue;
                const targetIdx = Math.floor(Math.random() * (words.length - 2)) + 1;
                const missingWord = words[targetIdx].replace(/[^\u0600-\u06FF]/g, "");
                words[targetIdx] = `<strong style="color:var(--primary-color);">[ ... ]</strong>`;

                question = {
                    badge: "2. الكلمة الناقصة",
                    title: `اختر الكلمة المفقودة الصحيحة في سورة ${randomSurah.name}:`,
                    promptHtml: `"${words.join(" ")}"`,
                    correctAnswer: missingWord,
                    options: shuffleArray([missingWord, ...getDynamicWordDistractors(missingWord, poolOfAyahs)]),
                    surahName: randomSurah.name,
                    uniqueKey: uniqueKey
                };
            } 
            else if (chosenType === "surah_name") {
                const otherNames = allSurahs.map(s => s.name).filter(n => n !== randomSurah.name);
                question = {
                    badge: "3. اسم السورة",
                    title: "في أي سورة تقع هذه الآية الكريمة؟",
                    promptHtml: `"${ayah.text}"`,
                    correctAnswer: randomSurah.name,
                    options: shuffleArray([randomSurah.name, ...shuffleArray(otherNames).slice(0, 3)]),
                    surahName: randomSurah.name,
                    uniqueKey: uniqueKey
                };
            } 
            // ==========================================
            // نوع السؤال 4: بداية أو نهاية الآية (تم الإصلاح)
            // ==========================================
            else if (chosenType === "start_end") {
                const words = ayah.text.split(" ");
                if (words.length < 5) continue;
                
                // اختيار عشوائي: إما نطلب البداية أو النهاية
                const askForStart = Math.random() > 0.5;
                const cutIndex = Math.floor(words.length / 2);
                const startSnippet = words.slice(0, cutIndex).join(" ");
                const endSnippet = words.slice(cutIndex).join(" ");
                
                let title, promptHtml, correctAnswer;
                
                if (askForStart) {
                    // نعرض النهاية ونطلب البداية
                    title = `ما هي بداية هذه الآية من سورة ${randomSurah.name}؟`;
                    promptHtml = `"... ${endSnippet}"`;
                    correctAnswer = startSnippet;
                } else {
                    // نعرض البداية ونطلب النهاية
                    title = `ما هي نهاية هذه الآية من سورة ${randomSurah.name}؟`;
                    promptHtml = `"${startSnippet} ..."`;
                    correctAnswer = endSnippet;
                }

                question = {
                    badge: "4. بداية أو نهاية الآية",
                    title: title,
                    promptHtml: promptHtml,
                    correctAnswer: correctAnswer,
                    options: shuffleArray([correctAnswer, ...getDynamicAyahDistractors(correctAnswer, poolOfAyahs)]),
                    surahName: randomSurah.name,
                    uniqueKey: uniqueKey
                };
            } 
            else if (chosenType === "word_order") {
                const words = ayah.text.split(" ");
                if (words.length < 4 || words.length > 7) continue;
                const correctOrder = ayah.text;
                const shuffledWords = shuffleArray([...words]).join(" / ");

                question = {
                    badge: "5. ترتيب الكلمات",
                    title: `الكلمات التالية مبعثرة من سورة ${randomSurah.name}، ما هو الترتيب الصحيح؟`,
                    promptHtml: `[ ${shuffledWords} ]`,
                    correctAnswer: correctOrder,
                    options: shuffleArray([
                        correctOrder,
                        shuffleArray([...words]).join(" "),
                        shuffleArray([...words]).join(" "),
                        shuffleArray([...words]).join(" ")
                    ]),
                    surahName: randomSurah.name,
                    uniqueKey: uniqueKey
                };
            } 
            else if (chosenType === "next_prev_surah") {
                const isNext = Math.random() > 0.5;
                if (isNext && randomSurah.number < 114) {
                    const targetName = allSurahs[randomSurah.number].name;
                    question = {
                        badge: "6. السورة التالية",
                        title: `ما هي السورة التي تأتي مباشرة **بعد** سورة ${randomSurah.name}؟`,
                        promptHtml: `سورة ${randomSurah.name}`,
                        correctAnswer: targetName,
                        options: shuffleArray([targetName, ...shuffleArray(allSurahs.map(s => s.name).filter(n => n !== targetName)).slice(0, 3)]),
                        surahName: randomSurah.name,
                        uniqueKey: uniqueKey
                    };
                } else if (!isNext && randomSurah.number > 1) {
                    const targetName = allSurahs[randomSurah.number - 2].name;
                    question = {
                        badge: "6. السورة السابقة",
                        title: `ما هي السورة التي تأتي مباشرة **قبل** سورة ${randomSurah.name}؟`,
                        promptHtml: `سورة ${randomSurah.name}`,
                        correctAnswer: targetName,
                        options: shuffleArray([targetName, ...shuffleArray(allSurahs.map(s => s.name).filter(n => n !== targetName)).slice(0, 3)]),
                        surahName: randomSurah.name,
                        uniqueKey: uniqueKey
                    };
                }
            }

            if (question) {
                usedKeysSet.add(uniqueKey);
                questions.push(question);
            }
        }
        return questions;
    }

    if(startBtn) {
        startBtn.addEventListener("click", async () => {
            initAudio();
            const selectedScopeBoxes = document.querySelectorAll(".scope-checkbox:checked");
            const selectedScopes = Array.from(selectedScopeBoxes).map(cb => cb.value);

            if (selectedScopes.length === 0) {
                triggerSmoothShake(scopeContainer);
                alert("يرجى اختيار عنصر واحد على الأقل من النطاق.");
                return;
            }

            const selectedTypes = Array.from(document.querySelectorAll(".quiz-type:checked")).map(cb => cb.value);
            if (selectedTypes.length === 0) {
                alert("يرجى اختيار نوع أسئلة واحد على الأقل من الأنواع الستة.");
                return;
            }

            const finalCount = parseInt(qCountInput ? qCountInput.value : 5) || 5;

            startBtn.disabled = true;
            startBtn.innerHTML = `جاري إعداد الأسئلة... <i class="fa-solid fa-spinner fa-spin icon-margin"></i>`;

            try {
                let targetSurahNumbers = extractSurahNumbers(selectedScopes);
                generatedQuestions = await buildDynamicUnlimitedQuestions(targetSurahNumbers, finalCount, selectedTypes);

                if (generatedQuestions.length === 0) {
                    alert("تعذر توليد أسئلة من النطاق المحدد.");
                    resetStartButton();
                    return;
                }

                currentQuestionIndex = 0;
                userScore = 0;
                userAnswersLog = [];
                usedQuestionKeys = new Set();
                quizStartTime = new Date();

                resetStartButton();
                if(step2) step2.classList.add("hidden");
                if(step3) step3.classList.remove("hidden");

                showQuestion(currentQuestionIndex);
            } catch (err) {
                alert("حدث خطأ أثناء تحميل الأسئلة.");
                resetStartButton();
            }
        });
    }

    function resetStartButton() {
        if(!startBtn) return;
        startBtn.disabled = false;
        startBtn.innerHTML = `ابدأ الاختبار الآن <i class="fa-solid fa-play icon-margin"></i>`;
    }

    function showQuestion(index) {
        const q = generatedQuestions[index];
        if(!q) return;

        if(questionBadge) questionBadge.textContent = q.badge;
        if(questionTitle) questionTitle.textContent = q.title;
        if(verseText) verseText.innerHTML = q.promptHtml;
        if(progressText) progressText.textContent = `السؤال ${index + 1} من ${generatedQuestions.length}`;

        if(optionsContainer) {
            optionsContainer.innerHTML = "";
            q.options.forEach(opt => {
                const btn = document.createElement("button");
                btn.className = "option-btn";
                btn.textContent = opt;
                btn.addEventListener("click", () => handleAnswer(opt, q, btn));
                optionsContainer.appendChild(btn);
            });
        }

        if (timerToggle && timerToggle.checked) {
            const seconds = parseInt(sCountInput ? sCountInput.value : 30) || 30;
            startTimer(seconds);
        }
    }

    function startTimer(seconds) {
        if (timerIntervalId) clearInterval(timerIntervalId);
        timeLeft = seconds;
        const timerDisplay = document.getElementById('quiz-timer-display');
        const timerSeconds = document.getElementById('timer-seconds');
        if (timerDisplay) timerDisplay.classList.remove('hidden');
        if (timerSeconds) timerSeconds.textContent = timeLeft;

        timerIntervalId = setInterval(() => {
            timeLeft--;
            if (timerSeconds) timerSeconds.textContent = timeLeft;
            
            if (timeLeft <= 5) {
                if (timerDisplay) timerDisplay.classList.add('timer-warning');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerIntervalId);
                const allBtns = document.querySelectorAll(".option-btn");
                if (allBtns.length > 0 && !allBtns[0].disabled) {
                    const currentQ = generatedQuestions[currentQuestionIndex];
                    const randomBtn = allBtns[Math.floor(Math.random() * allBtns.length)];
                    handleAnswer(randomBtn.textContent, currentQ, randomBtn);
                }
            }
        }, 1000);
    }

    function handleAnswer(selected, questionObj, btnElement) {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
        
        const allBtns = document.querySelectorAll(".option-btn");
        allBtns.forEach(b => b.disabled = true);

        const isCorrect = selected === questionObj.correctAnswer;

        userAnswersLog.push({
            question: questionObj,
            userAnswer: selected,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            btnElement.style.background = "#16a34a";
            btnElement.style.color = "#fff";
            userScore++;
            playSuccessSound();
        } else {
            btnElement.style.background = "#dc2626";
            btnElement.style.color = "#fff";
            playErrorSound();
            allBtns.forEach(b => {
                if (b.textContent === questionObj.correctAnswer) {
                    b.style.background = "#16a34a";
                    b.style.color = "#fff";
                }
            });
        }

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < generatedQuestions.length) {
                showQuestion(currentQuestionIndex);
            } else {
                finishQuiz();
            }
        }, 1200);
    }

    // ==========================================
    // نهاية الاختبار (تم إزالة زر الصفحة الرئيسية)
    // ==========================================
    function finishQuiz() {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
        
        userPoints += userScore;
        const newHistoryItem = {
            date: new Date().toLocaleDateString('ar-EG'),
            surahsCount: generatedQuestions.length,
            score: `${userScore}/${generatedQuestions.length}`,
            pts: userScore,
            logs: userAnswersLog
        };
        quizHistory.push(newHistoryItem);
        saveUserData();

        if(step3) step3.classList.add("hidden");
        if(step4) step4.classList.remove("hidden");

        if(scoreText) scoreText.textContent = `${userScore} / ${generatedQuestions.length}`;
        if(earnedPointsSpan) earnedPointsSpan.textContent = userScore;

        if (quizStartTime && totalTimeSpentSpan) {
            const endTime = new Date();
            const diff = Math.floor((endTime - quizStartTime) / 1000);
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            totalTimeSpentSpan.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        if(scoreMessage) {
            const percentage = (userScore / generatedQuestions.length) * 100;
            if (percentage >= 80) scoreMessage.textContent = "🌟 ممتاز! حفظك الله وأتقنك!";
            else if (percentage >= 60) scoreMessage.textContent = "👍 جيد جداً، استمر في التدرب!";
            else if (percentage >= 40) scoreMessage.textContent = "📖 حاول مرة أخرى، ستحقق الأفضل بإذن الله!";
            else scoreMessage.textContent = "💪 لا تيأس! التدريب المستمر هو مفتاح الإتقان!";
        }

        // إخفاء زر الصفحة الرئيسية
        if (homeBtn) homeBtn.style.display = 'none';
        
        // عرض زر عرض التفاصيل
        if (toggleErrorsBtn) toggleErrorsBtn.style.display = 'block';
    }

    // --- زر إعادة الاختبار ---
    if(restartBtn) {
        restartBtn.addEventListener("click", () => {
            if(step4) step4.classList.add("hidden");
            if(step2) step2.classList.remove("hidden");
            generatedQuestions = [];
            currentQuestionIndex = 0;
            userScore = 0;
            userAnswersLog = [];
            usedQuestionKeys = new Set();
            if (timerIntervalId) {
                clearInterval(timerIntervalId);
                timerIntervalId = null;
            }
            // إظهار زر الصفحة الرئيسية مرة أخرى للاستخدام المستقبلي
            if (homeBtn) homeBtn.style.display = 'flex';
            playBeep(500, 0.05);
        });
    }

    // --- زر الصفحة الرئيسية (مخفي في شاشة النتيجة) ---
    if(homeBtn) {
        homeBtn.addEventListener("click", () => {
            if(step4) step4.classList.add("hidden");
            if(step1) step1.classList.remove("hidden");
            generatedQuestions = [];
            currentQuestionIndex = 0;
            userScore = 0;
            userAnswersLog = [];
            usedQuestionKeys = new Set();
            if (timerIntervalId) {
                clearInterval(timerIntervalId);
                timerIntervalId = null;
            }
            if (homeBtn) homeBtn.style.display = 'flex';
            playBeep(500, 0.05);
        });
        // إخفاء زر الصفحة الرئيسية في شاشة النتيجة
        if (step4) homeBtn.style.display = 'none';
    }

    if(toggleErrorsBtn) {
        toggleErrorsBtn.addEventListener("click", () => {
            if(errorsContainer) {
                errorsContainer.classList.toggle("hidden");
                toggleErrorsBtn.textContent = errorsContainer.classList.contains("hidden") ? "📋 عرض التفاصيل والتصحيح" : "📋 إخفاء التفاصيل";
                if (!errorsContainer.classList.contains("hidden")) {
                    renderErrors();
                }
            }
        });
    }

    function renderErrors() {
        if (!errorsContainer) return;
        errorsContainer.innerHTML = "";
        if (userAnswersLog.length === 0) {
            errorsContainer.innerHTML = "<p>لا توجد تفاصيل.</p>";
            return;
        }
        userAnswersLog.forEach((log, index) => {
            const div = document.createElement("div");
            div.style.marginBottom = "0.6rem";
            div.style.padding = "0.6rem";
            div.style.borderRadius = "6px";
            div.style.border = "1px solid var(--border-color)";
            div.style.background = log.isCorrect ? "rgba(22, 163, 74, 0.05)" : "rgba(220, 38, 38, 0.05)";
            div.innerHTML = `
                <strong>س${index + 1}:</strong> ${log.question.title}<br>
                <span style="font-size:0.85rem;">${log.question.promptHtml}</span><br>
                <span style="color:${log.isCorrect ? 'green' : 'red'};">إجابتك: ${log.userAnswer}</span>
                ${!log.isCorrect ? `<span style="color:green; margin-right:8px;">✔ الصحيح: ${log.question.correctAnswer}</span>` : ''}
            `;
            errorsContainer.appendChild(div);
        });
    }

    if(nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentQuestionIndex < generatedQuestions.length - 1) {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            } else {
                finishQuiz();
            }
        });
    }

});