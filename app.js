// ==========================================
// 1. إعدادات Firebase (استبدلي الكائن بالذي نسخته)
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAShRnY6XvH0sMAPl9s_FHioH0Ytb3Gf9w",
  authDomain: "mudakkir-app.firebaseapp.com",
  projectId: "mudakkir-app",
  storageBucket: "mudakkir-app.firebasestorage.app",
  messagingSenderId: "120022023023",
  appId: "1:120022023023:web:6d1a84448cd73d2fca869a",
  measurementId: "G-DKLL56Z7VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تشغيل خدمات Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

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

    const quranData = {
        ahzab: Array.from({length: 60}, (_, i) => ({ id: i+1, name: `الحزب ${i+1}` })),
        quarters: [
            { id: 1, text: "يسألونك عن الأهلة..." },
            { id: 2, text: "واذكروا الله في أيام معدودات..." },
            { id: 3, text: "كان الناس أمة واحدة..." },
            { id: 4, text: "يسألونك عن الشهر الحرام..." },
            { id: 5, text: "والوالدات يرضعن أولادهن..." },
            { id: 6, text: "ألم تر إلى الذين خرجوا من ديارهم..." },
            { id: 7, text: "اللَّهُ لاَ إِلَٰهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ..." },
            { id: 8, text: "لَّلَّهِ ما فِي السَّمَاواتِ وَمَا فِي الأَرْضِ..." }
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

    const detailsModal = document.getElementById("details-modal");
    const closeDetailsModalBtn = document.getElementById("close-details-modal-btn");
    const detailsModalBody = document.getElementById("details-modal-body");

    const feedbackModal = document.getElementById("feedback-modal");
    const triggerFeedbackBtn = document.getElementById("trigger-feedback-modal-btn");
    const openFeedbackMenuBtn = document.getElementById("open-feedback-menu-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cancelFeedbackBtn = document.getElementById("cancel-feedback-btn");
    const feedbackForm = document.getElementById("feedback-form");

    // --- حالة البيانات الموحدة والمزامنة ---
    let currentSlide = 0;
    let allSurahs = [];
    let currentScope = "surahs";
    let generatedQuestions = [];
    let currentQuestionIndex = 0;
    let userScore = 0;
    let userAnswersLog = [];

    let currentUser = localStorage.getItem("mudakkir_user") || "زائر";
    let currentUserEmail = localStorage.getItem("mudakkir_email") || "";
    let userPoints = parseInt(localStorage.getItem(`mudakkir_points_${currentUser}`)) || 0;
    let quizHistory = JSON.parse(localStorage.getItem(`mudakkir_history_${currentUser}`)) || [];

    function updateUserDataUI() {
        if (userDisplayName) userDisplayName.textContent = currentUser;
        if (userPointsSpan) userPointsSpan.textContent = userPoints;
    }
    updateUserDataUI();

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
                alert(`مرحباً بك مجدداً ${currentUser}! تم جلب بياناتك بنجاح من السحابة.`);
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

        if (syncToCloud && currentUserEmail && db) {
            db.collection("users").doc(currentUserEmail.toLowerCase()).set({
                name: currentUser,
                email: currentUserEmail,
                points: userPoints,
                history: quizHistory,
                lastLogin: new Date()
            }, { merge: true });
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
                const guestBox = document.getElementById("guest-mode-box");
                if (guestBox) guestBox.classList.remove("hidden");
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
    }

    // --- شريط الصعوبة والتنقل ---
    function updateDifficultyUI(val) {
        const root = document.documentElement;
        const percent = (val - 1) / (3 - 1);
        let color;
        if (percent <= 0.5) {
            color = interpolateColor([22, 163, 74], [217, 119, 6], percent * 2);
        } else {
            color = interpolateColor([217, 119, 6], [220, 38, 38], (percent - 0.5) * 2);
        }
        root.style.setProperty('--diff-color', color);
        if(difficultyBadge) difficultyBadge.textContent = val < 1.6 ? "سهل" : val < 2.4 ? "متوسط" : "صعب";
    }

    function interpolateColor(color1, color2, factor) {
        return `rgb(${Math.round(color1[0] + factor * (color2[0] - color1[0]))}, ${Math.round(color1[1] + factor * (color2[1] - color1[1]))}, ${Math.round(color1[2] + factor * (color2[2] - color1[2]))})`;
    }

    if(difficultySlider) difficultySlider.addEventListener("input", (e) => updateDifficultyUI(parseFloat(e.target.value)));

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
                let startText = quranData.quarters[i-1] ? quranData.quarters[i-1].text : "بداية الربع...";
                scopeContainer.appendChild(createCheckboxItem(`quarter_${i}`, `⭐ ${i}. ${startText}`));
            }
        }
    }

    function createCheckboxItem(value, text) {
        const label = document.createElement("label");
        label.className = "checkbox-card";
        label.innerHTML = `<input type="checkbox" value="${value}" class="scope-checkbox custom-checkbox"> <span>${text}</span>`;
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
        while (questions.length < totalCount && attempts < 400) {
            attempts++;
            const randomSurah = fetchedSurahs[Math.floor(Math.random() * fetchedSurahs.length)];
            if (!randomSurah || !randomSurah.ayahs || randomSurah.ayahs.length === 0) continue;

            const ayahs = randomSurah.ayahs;
            const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
            const idx = Math.floor(Math.random() * ayahs.length);
            const ayah = ayahs[idx];

            const uniqueKey = `${randomSurah.number}_${ayah.numberInSurah}_${chosenType}_${Math.random()}`;
            if (usedKeysSet.has(uniqueKey)) continue;

            if (chosenType === "completion" && idx < ayahs.length - 1) {
                const nextAyah = ayahs[idx + 1];
                const words = nextAyah.text.split(" ");
                const snippetLength = Math.min(words.length, Math.floor(Math.random() * 3) + 3);
                const snippet = words.slice(0, snippetLength).join(" ") + "...";

                usedKeysSet.add(uniqueKey);
                questions.push({
                    badge: "1. إكمال الآية",
                    title: `ما هي بداية الآية التالية لهذه الآية في سورة ${randomSurah.name}؟`,
                    promptHtml: `"${ayah.text}"`,
                    correctAnswer: snippet,
                    options: shuffleArray([snippet, ...getDynamicAyahDistractors(snippet, poolOfAyahs)]),
                    surahName: randomSurah.name
                });
            } 
            else if (chosenType === "missing_word") {
                const words = ayah.text.split(" ");
                if (words.length < 4) continue;
                const targetIdx = Math.floor(Math.random() * (words.length - 2)) + 1;
                const missingWord = words[targetIdx].replace(/[^\u0600-\u06FF]/g, "");
                words[targetIdx] = `<strong style="color:var(--primary-color);">[ ... ]</strong>`;

                usedKeysSet.add(uniqueKey);
                questions.push({
                    badge: "2. الكلمة الناقصة",
                    title: `اختر الكلمة المفقودة الصحيحة في سورة ${randomSurah.name}:`,
                    promptHtml: `"${words.join(" ")}"`,
                    correctAnswer: missingWord,
                    options: shuffleArray([missingWord, ...getDynamicWordDistractors(missingWord, poolOfAyahs)]),
                    surahName: randomSurah.name
                });
            } 
            else if (chosenType === "surah_name") {
                const otherNames = allSurahs.map(s => s.name).filter(n => n !== randomSurah.name);
                usedKeysSet.add(uniqueKey);
                questions.push({
                    badge: "3. اسم السورة",
                    title: "في أي سورة تقع هذه الآية الكريمة؟",
                    promptHtml: `"${ayah.text}"`,
                    correctAnswer: randomSurah.name,
                    options: shuffleArray([randomSurah.name, ...shuffleArray(otherNames).slice(0, 3)]),
                    surahName: randomSurah.name
                });
            } 
            else if (chosenType === "start_end") {
                const words = ayah.text.split(" ");
                if (words.length < 5) continue;
                const cutIndex = Math.floor(words.length / 2);
                const startSnippet = words.slice(0, cutIndex).join(" ");
                const endSnippet = words.slice(cutIndex).join(" ");

                usedKeysSet.add(uniqueKey);
                questions.push({
                    badge: "4. بداية الآية",
                    title: `اختر بداية هذه الآية من سورة ${randomSurah.name}:`,
                    promptHtml: `"... ${endSnippet}"`,
                    correctAnswer: startSnippet,
                    options: shuffleArray([startSnippet, ...getDynamicAyahDistractors(startSnippet, poolOfAyahs)]),
                    surahName: randomSurah.name
                });
            } 
            else if (chosenType === "word_order") {
                const words = ayah.text.split(" ");
                if (words.length < 4 || words.length > 7) continue;
                const correctOrder = ayah.text;
                const shuffledWords = shuffleArray([...words]).join(" / ");

                usedKeysSet.add(uniqueKey);
                questions.push({
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
                    surahName: randomSurah.name
                });
            } 
            else if (chosenType === "next_prev_surah") {
                const isNext = Math.random() > 0.5;
                if (isNext && randomSurah.number < 114) {
                    const targetName = allSurahs[randomSurah.number].name;
                    usedKeysSet.add(uniqueKey);
                    questions.push({
                        badge: "6. السورة التالية",
                        title: `ما هي السورة التي تأتي مباشرة **بعد** سورة ${randomSurah.name}؟`,
                        promptHtml: `سورة ${randomSurah.name}`,
                        correctAnswer: targetName,
                        options: shuffleArray([targetName, ...shuffleArray(allSurahs.map(s => s.name).filter(n => n !== targetName)).slice(0, 3)]),
                        surahName: randomSurah.name
                    });
                } else if (!isNext && randomSurah.number > 1) {
                    const targetName = allSurahs[randomSurah.number - 2].name;
                    usedKeysSet.add(uniqueKey);
                    questions.push({
                        badge: "6. السورة السابقة",
                        title: `ما هي السورة التي تأتي مباشرة **قبل** سورة ${randomSurah.name}؟`,
                        promptHtml: `سورة ${randomSurah.name}`,
                        correctAnswer: targetName,
                        options: shuffleArray([targetName, ...shuffleArray(allSurahs.map(s => s.name).filter(n => n !== targetName)).slice(0, 3)]),
                        surahName: randomSurah.name
                    });
                }
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

        const badge = document.getElementById("question-badge");
        const title = document.getElementById("question-title");
        const verse = document.getElementById("verse-text");
        const optionsContainer = document.getElementById("options-container");
        const progressText = document.getElementById("progress-text");

        if(badge) badge.textContent = q.badge;
        if(title) title.textContent = q.title;
        if(verse) verse.innerHTML = q.promptHtml;
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
    }

    function handleAnswer(selected, questionObj, btnElement) {
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

    function finishQuiz() {
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

        const scoreText = document.getElementById("score-text");
        const earnedPointsSpan = document.getElementById("earned-points");

        if(scoreText) scoreText.textContent = `${userScore} / ${generatedQuestions.length}`;
        if(earnedPointsSpan) earnedPointsSpan.textContent = userScore;
    }

    const restartBtn = document.getElementById("restart-btn");
    if(restartBtn) {
        restartBtn.addEventListener("click", () => {
            if(step4) step4.classList.add("hidden");
            if(step2) step2.classList.remove("hidden");
        });
    }

    const homeBtn = document.getElementById("home-btn");
    if(homeBtn) {
        homeBtn.addEventListener("click", () => {
            if(step4) step4.classList.add("hidden");
            if(step1) step1.classList.remove("hidden");
        });
    }
});