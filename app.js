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

    // --- عناصر الواجهة ---
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

    const questionBadge = document.getElementById("question-badge");
    const progressText = document.getElementById("progress-text");
    const questionTitle = document.getElementById("question-title");
    const verseText = document.getElementById("verse-text");
    const optionsContainer = document.getElementById("options-container");
    const nextBtn = document.getElementById("next-btn");

    const quizTimerDisplay = document.getElementById("quiz-timer-display");
    const timerSecondsSpan = document.getElementById("timer-seconds");

    const scoreText = document.getElementById("score-text");
    const scoreMessage = document.getElementById("score-message");
    const earnedPointsSpan = document.getElementById("earned-points");
    const totalTimeSpentSpan = document.getElementById("total-time-spent");
    const toggleErrorsBtn = document.getElementById("toggle-errors-btn");
    const errorsContainer = document.getElementById("errors-container");
    const restartBtn = document.getElementById("restart-btn");
    const homeBtn = document.getElementById("home-btn");

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

    // --- حالة البيانات والتخزين ---
    let currentSlide = 0;
    let allSurahs = [];
    let currentScope = "surahs";
    let generatedQuestions = [];
    let currentQuestionIndex = 0;
    let userScore = 0;
    let userAnswersLog = [];
    let timerInterval = null;
    let initialTime = 30;
    let timeLeft = 0;
    let warningTriggered = false;
    let quizStartTime = null;

    let currentUser = localStorage.getItem("mudakkir_user") || "زائر";
    let userPoints = parseInt(localStorage.getItem(`mudakkir_points_${currentUser}`)) || 0;
    let quizHistory = JSON.parse(localStorage.getItem(`mudakkir_history_${currentUser}`)) || [];

    function updateUserDataUI() {
        if (userDisplayName) userDisplayName.textContent = currentUser;
        if (userPointsSpan) userPointsSpan.textContent = userPoints;
    }
    updateUserDataUI();

    function saveUserData() {
        localStorage.setItem("mudakkir_user", currentUser);
        localStorage.setItem(`mudakkir_points_${currentUser}`, userPoints);
        localStorage.setItem(`mudakkir_history_${currentUser}`, JSON.stringify(quizHistory));
        updateUserDataUI();
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener("click", () => {
            document.getElementById("guest-mode-box").classList.add("hidden");
            loginFormBox.classList.remove("hidden");
        });
    }

    if (loginFormBox) {
        loginFormBox.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputVal = document.getElementById("user-name-input").value.trim();
            if (inputVal) {
                currentUser = inputVal;
                userPoints = parseInt(localStorage.getItem(`mudakkir_points_${currentUser}`)) || 0;
                quizHistory = JSON.parse(localStorage.getItem(`mudakkir_history_${currentUser}`)) || [];
                saveUserData();
                alert(`مرحباً بك ${currentUser}! تم جلب نقاطك وسجلك بنجاح.`);
                loginFormBox.classList.add("hidden");
                document.getElementById("guest-mode-box").classList.remove("hidden");
            }
        });
    }

    // --- تسريع التخزين المحلي للبيانات ---
    async function fetchSurahsList() {
        const cachedSurahs = localStorage.getItem("mudakkir_cached_surahs");
        if (cachedSurahs) {
            allSurahs = JSON.parse(cachedSurahs);
            renderScopeItems();
            return;
        }

        scopeContainer.innerHTML = "<p class='loading-text'>⏳ جاري تحميل بيانات المصحف الشريف...</p>";
        try {
            const res = await fetch("https://api.alquran.cloud/v1/surah");
            const data = await res.json();
            if (data.code === 200) {
                allSurahs = data.data;
                localStorage.setItem("mudakkir_cached_surahs", JSON.stringify(allSurahs));
                renderScopeItems();
            }
        } catch (err) {
            scopeContainer.innerHTML = "<p style='color:red;'>تعذر جلب البيانات. تحقق من اتصال الإنترنِت.</p>";
        }
    }

    async function fetchSurahDetail(surahNum) {
        const cacheKey = `mudakkir_surah_detail_${surahNum}`;
        const cachedDetail = localStorage.getItem(cacheKey);

        if (cachedDetail) {
            return JSON.parse(cachedDetail);
        }

        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`);
        const data = await res.json();
        if (data.code === 200) {
            localStorage.setItem(cacheKey, JSON.stringify(data.data));
            return data.data;
        }
        return null;
    }

    // --- العدادات والاهتزاز الناعم ---
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
            dropdownMenu.classList.toggle("hidden");
        });
    }
    document.addEventListener("click", () => { if (dropdownMenu) dropdownMenu.classList.add("hidden"); });

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
            themeText.textContent = isDark ? "الوضع النهار" : "الوضع الليلي";
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

    // --- عرض وإدارة سجل الاختبارات تفصيلياً ---
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

        if (historyItem.logs.length === 0) {
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
            if (e.target.checked) timerInputContainer.classList.remove("hidden");
            else timerInputContainer.classList.add("hidden");
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
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
        if (allSurahs.length === 0) fetchSurahsList();
    }

    if(backToStep1Btn) {
        backToStep1Btn.addEventListener("click", () => {
            step2.classList.add("hidden");
            step1.classList.remove("hidden");
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

    if(startBtn) startBtn.addEventListener("click", () => startNewQuiz());

    async function startNewQuiz() {
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

        const finalCount = parseInt(qCountInput.value) || 5;

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
            quizStartTime = new Date();

            resetStartButton();
            step2.classList.add("hidden");
            step3.classList.remove("hidden");

            showQuestion(currentQuestionIndex);
        } catch (err) {
            alert("حدث خطأ أثناء تحميل الأسئلة.");
            resetStartButton();
        }
    }

    function resetStartButton() {
        if(!startBtn) return;
        startBtn.disabled = false;
        startBtn.innerHTML = `ابدأ الاختبار الآن <i class="fa-solid fa-play icon-margin"></i>`;
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

    // --- خوارزمية التوليد غير المحدودة والديناميكية بالكامل ---
    async function buildDynamicUnlimitedQuestions(surahNumbers, totalCount, allowedTypes) {
        let questions = [];
        let usedKeysSet = new Set();
        const fetchedSurahs = await Promise.all(surahNumbers.map(num => fetchSurahDetail(num)));

        // تجميع كافة آيات النطاق المختار لإنشاء مشتتات حقيقية
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

            // رقم عشوائي كجزء من المפתח لضمان عدم حدوث تكرار
            const uniqueKey = `${randomSurah.number}_${ayah.numberInSurah}_${chosenType}_${Math.random()}`;
            if (usedKeysSet.has(uniqueKey)) continue;

            // 1. إكمال باقي الآية
            if (chosenType === "completion" && idx < ayahs.length - 1) {
                const nextAyah = ayahs[idx + 1];
                const words = nextAyah.text.split(" ");
                // اقتطاع ديناميكي متعدّد الطول (3 إلى 5 كلمات)
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
            // 2. الكلمة الناقصة في المنتصف
            else if (chosenType === "missing_word") {
                const words = ayah.text.split(" ");
                if (words.length < 4) continue;
                // إمكانية اختيار كلمة من أي موقع بالآية عشوائياً
                const targetIdx = Math.floor(Math.random() * (words.length - 2)) + 1;
                const missingWord = words[targetIdx].replace(/[^\u0600-\u06FF]/g, ""); // تنظيف الكلمة
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
            // 3. تحديد اسم السورة
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
            // 4. بداية أو نهاية الآية
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
            // 5. ترتيب كلمات الآية
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
            // 6. السورة التالية أو السابقة
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
                        options: shuffleArray([targetName, ...allSurahs.map(s => s.name).filter(n => n !== targetName).slice(0, 3)]),
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
                        options: shuffleArray([targetName, ...allSurahs.map(s => s.name).filter(n => n !== targetName).slice(0, 3)]),
                        surahName: randomSurah.name
                    });
                }
            }
        }
        return questions;
    }

    // --- توليد مشتتات ديناميكية متجددة للآيات ---
    function getDynamicAyahDistractors(correctSnippet, pool) {
        let distractors = new Set();
        let shuffledPool = shuffleArray([...pool]);

        for (let item of shuffledPool) {
            let words = item.text.split(" ");
            if (words.length >= 3) {
                let snip = words.slice(0, 3).join(" ") + "...";
                if (snip !== correctSnippet) distractors.add(snip);
            }
            if (distractors.size >= 3) break;
        }

        while (distractors.size < 3) {
            distractors.add("وَإِذَا قِيلَ لَهُمْ...");
            distractors.add("إِنَّ الَّذِينَ آمَنُوا...");
            distractors.add("قُلْ هُوَ اللَّهُ...");
        }
        return Array.from(distractors).slice(0, 3);
    }

    // --- توليد مشتتات ديناميكية متجددة للكلمات ---
    function getDynamicWordDistractors(correctWord, pool) {
        let distractors = new Set();
        let shuffledPool = shuffleArray([...pool]);

        for (let item of shuffledPool) {
            let words = item.text.split(" ");
            for (let w of words) {
                let cleanW = w.replace(/[^\u0600-\u06FF]/g, "");
                if (cleanW.length >= 3 && cleanW !== correctWord) {
                    distractors.add(cleanW);
                }
                if (distractors.size >= 3) break;
            }
            if (distractors.size >= 3) break;
        }

        const fallback = ["عَلِيمٌ", "حَكِيمٌ", "غَفُورٌ", "رَحِيمٌ", "عَظِيمٌ"];
        let i = 0;
        while (distractors.size < 3) {
            if (fallback[i] !== correctWord) distractors.add(fallback[i]);
            i++;
        }
        return Array.from(distractors).slice(0, 3);
    }

    function shuffleArray(arr) { return arr.sort(() => Math.random() - 0.5); }

    // --- إدارة العرض والتفاعلات أثناء الاختبار ---
    let selectedAnswerForCurrentQ = null;

    function showQuestion(index) {
        clearInterval(timerInterval);
        selectedAnswerForCurrentQ = null;
        warningTriggered = false;

        const q = generatedQuestions[index];
        questionBadge.textContent = q.badge;
        progressText.innerHTML = `سؤال <span class="en-number">${index + 1}</span> من <span class="en-number">${generatedQuestions.length}</span>`;
        questionTitle.textContent = q.title;
        verseText.innerHTML = q.promptHtml;

        optionsContainer.innerHTML = "";
        q.options.forEach(opt => {
            const btn = document.createElement("div");
            btn.className = "option-card";
            btn.innerHTML = `<span>${opt}</span> <i class="fa-regular fa-circle"></i>`;
            btn.addEventListener("click", () => {
                playBeep(600, 0.05);
                handleAnswerSelection(btn, opt);
            });
            optionsContainer.appendChild(btn);
        });

        if (timerToggle && timerToggle.checked) {
            quizTimerDisplay.classList.remove("hidden", "timer-warning");
            initialTime = parseInt(sCountInput.value) || 30;
            timeLeft = initialTime;
            timerSecondsSpan.textContent = timeLeft;

            const halfTime = Math.floor(initialTime / 2);

            timerInterval = setInterval(() => {
                timeLeft--;
                timerSecondsSpan.textContent = timeLeft;

                if (timeLeft <= halfTime && !warningTriggered) {
                    warningTriggered = true;
                    quizTimerDisplay.classList.add("timer-warning");
                    playWarningSound();
                }

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    playErrorSound();
                    autoSubmitOnTimeout(q);
                }
            }, 1000);
        } else {
            if(quizTimerDisplay) quizTimerDisplay.classList.add("hidden");
        }
    }

    function handleAnswerSelection(selectedBtn, selectedOption) {
        const allOptions = optionsContainer.querySelectorAll(".option-card");
        allOptions.forEach(b => {
            b.classList.remove("selected");
            b.querySelector("i").className = "fa-regular fa-circle";
        });
        selectedBtn.classList.add("selected");
        selectedBtn.querySelector("i").className = "fa-solid fa-circle-dot";
        selectedAnswerForCurrentQ = selectedOption;
    }

    function autoSubmitOnTimeout(q) {
        userAnswersLog.push({
            question: q,
            userAnswer: "انتهى الوقت ولم تجب",
            isCorrect: false
        });
        proceedToNextOrFinish();
    }

    if(nextBtn) {
        nextBtn.addEventListener("click", () => {
            clearInterval(timerInterval);
            const q = generatedQuestions[currentQuestionIndex];

            if (selectedAnswerForCurrentQ !== null) {
                const isCorrect = selectedAnswerForCurrentQ === q.correctAnswer;
                if (isCorrect) userScore++;

                userAnswersLog.push({
                    question: q,
                    userAnswer: selectedAnswerForCurrentQ,
                    isCorrect: isCorrect
                });
            } else {
                userAnswersLog.push({
                    question: q,
                    userAnswer: "لم تقم باختيار إجابة",
                    isCorrect: false
                });
            }
            proceedToNextOrFinish();
        });
    }

    function proceedToNextOrFinish() {
        currentQuestionIndex++;
        if (currentQuestionIndex < generatedQuestions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            finishQuiz();
        }
    }

    // --- إنهاء الاختبار وتنسيق النتائج ---
    function finishQuiz() {
        clearInterval(timerInterval);
        playSuccessSound();

        step3.classList.add("hidden");
        step4.classList.remove("hidden");

        const total = generatedQuestions.length;
        scoreText.textContent = `${userScore} / ${total}`;

        const earnedPts = userScore;
        userPoints += earnedPts;
        if(earnedPointsSpan) earnedPointsSpan.textContent = earnedPts;

        const durationMs = new Date() - quizStartTime;
        const totalSecs = Math.floor(durationMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        if(totalTimeSpentSpan) totalTimeSpentSpan.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        quizHistory.push({
            date: new Date().toLocaleDateString('ar-EG'),
            surahsCount: generatedQuestions.length,
            score: `${userScore}/${total}`,
            pts: earnedPts,
            logs: userAnswersLog
        });
        saveUserData();

        if (userScore === total) scoreMessage.textContent = "أداء ممتاز جداً ودرجة كاملة! 🎉";
        else if (userScore >= total / 2) scoreMessage.textContent = "أحسنت! أداء جيد جداً. 👍";
        else scoreMessage.textContent = "واصل المراجعة لتثبيت الحفظ. 🤍";

        if(errorsContainer) {
            errorsContainer.innerHTML = "";
            userAnswersLog.forEach((log, i) => {
                const item = document.createElement("div");
                item.style.marginBottom = "0.8rem";
                item.style.padding = "0.8rem";
                item.style.borderRadius = "8px";
                item.style.background = log.isCorrect ? "rgba(22, 163, 74, 0.05)" : "rgba(220, 38, 38, 0.05)";
                item.innerHTML = `
                    <p><strong>س<span class="en-number">${i + 1}</span>: ${log.question.title}</strong></p>
                    <p class="quran-text" style="font-size:1.1rem; margin: 4px 0;">${log.question.promptHtml}</p>
                    <p>إجابتك: <span style="color: ${log.isCorrect ? 'green' : 'red'}; font-weight: bold;">${log.userAnswer}</span></p>
                    ${!log.isCorrect ? `<p style="color: green; font-weight: bold;">الإجابة الصحيحة: ${log.question.correctAnswer}</p>` : ""}
                `;
                errorsContainer.appendChild(item);
            });
        }
    }

    if(toggleErrorsBtn) toggleErrorsBtn.addEventListener("click", () => errorsContainer.classList.toggle("hidden"));

    if(restartBtn) {
        restartBtn.addEventListener("click", () => {
            step4.classList.add("hidden");
            startNewQuiz();
        });
    }

    if(homeBtn) {
        homeBtn.addEventListener("click", () => {
            step4.classList.add("hidden");
            step2.classList.remove("hidden");
        });
    }
});
// .....1
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA Registered Successfully!'))
            .catch(err => console.log('PWA Registration Failed: ', err));
    });
}