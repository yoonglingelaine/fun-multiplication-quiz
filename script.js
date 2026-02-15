// 状态管理
let state = {
    view: 'menu', // menu, selection, quiz, game
    mode: null,   // 'mix', 'specific'
    selectedNumber: null,
    stars: 0,
    currentQuestion: null,
    speakQuestion: true // 默认朗读题目
};

const app = document.getElementById('app');

// 本地化物品列表
const items = [
    { name: 'Nasi Lemak', emoji: '🍚', unit: '盘' },
    { name: 'Roti Canai', emoji: '🥞', unit: '片' },
    { name: 'Teh Tarik', emoji: '☕', unit: '杯' },
    { name: '猫山王榴莲', emoji: '🍈', unit: '个' },
    { name: '沙爹', emoji: '🍢', unit: '串' },
    { name: '红豆冰', emoji: '🍧', unit: '碗' },
    { name: '咖喱角', emoji: '🥟', unit: '个' },
    { name: 'Ramly Burger', emoji: '🍔', unit: '个' },
    { name: '芒果', emoji: '🥭', unit: '个' }
];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    showMainMenu();
    // 尝试初始化音频
    if (window.audioCtrl) {
        audioCtrl.init();
    }
});

// 显示主菜单
function showMainMenu() {
    state.view = 'menu';
    app.innerHTML = `
        <h1>趣味乘法表 🚀</h1>
        <p>收集星星 ⭐ 解锁小游戏！</p>
        <div class="menu-buttons">
            <button onclick="startMixMode()">🔀 混合练习</button>
            <button onclick="showNumberSelection()">🔢 选择乘法表 (1-10)</button>
        </div>
        <div class="stars-display">
            当前星星: <span id="star-count">${state.stars}</span> ⭐
        </div>
        <div class="settings">
            <label>
                <input type="checkbox" id="speak-toggle" ${state.speakQuestion ? 'checked' : ''} onchange="toggleSpeak(this)"> 🔊 朗读题目
            </label>
        </div>
    `;
}

// 切换朗读设置
window.toggleSpeak = function(el) {
    state.speakQuestion = el.checked;
    // 第一次交互时初始化音频上下文
    if (el.checked && window.audioCtrl) {
        audioCtrl.init();
    }
};

// 开始混合模式
window.startMixMode = function() {
    state.mode = 'mix';
    state.selectedNumber = null;
    startQuiz();
};

// 显示数字选择界面
window.showNumberSelection = function() {
    state.view = 'selection';
    let buttonsHTML = '';
    for (let i = 1; i <= 10; i++) {
        buttonsHTML += `<button onclick="selectNumber(${i})" class="num-btn">${i}</button>`;
    }
    
    app.innerHTML = `
        <h1>选择一个数字练习</h1>
        <div class="number-grid">
            ${buttonsHTML}
        </div>
        <button onclick="showMainMenu()" class="back-btn">🔙 返回菜单</button>
    `;
};

// 选择特定数字开始练习
window.selectNumber = function(num) {
    state.mode = 'specific';
    state.selectedNumber = num;
    startQuiz();
};

// 开始测验
function startQuiz() {
    state.view = 'quiz';
    nextQuestion();
}

// 生成并显示下一题
window.nextQuestion = function() {
    const q = generateQuestion();
    state.currentQuestion = q;
    
    // 朗读题目
    if (window.audioCtrl && state.speakQuestion) {
        audioCtrl.speak(q.speakText);
    }
    
    const starsToGame = 10 - state.stars;
    const gameUnlockText = starsToGame <= 0 
        ? '<button onclick="startGame()" class="game-btn pulse">🎮 玩小游戏！</button>' 
        : `<p class="hint-text">再收集 ${starsToGame} 颗星星就可以玩游戏啦！</p>`;

    app.innerHTML = `
        <div class="quiz-header">
            <button onclick="showMainMenu()" class="small-btn">🏠 主页</button>
            <span class="stars">⭐ ${state.stars}</span>
        </div>
        
        <div class="question-container">
            <div class="emoji-display">${q.emojiDisplay}</div>
            <h2 class="question-text">${q.text}</h2>
            <div class="math-expression">${q.num1} × ${q.num2} = ?</div>
            
            <input type="number" id="answer-input" placeholder="?" onkeydown="if(event.key==='Enter') checkAnswer()">
            <br>
            <button onclick="checkAnswer()" class="action-btn">提交答案</button>
            
            <div id="feedback" class="feedback"></div>
        </div>
        
        <div class="game-unlock-area">
            ${gameUnlockText}
        </div>
    `;
    
    document.getElementById('answer-input').focus();
}

// 生成题目逻辑
function generateQuestion() {
    let num1, num2;
    
    if (state.mode === 'mix') {
        num1 = Math.floor(Math.random() * 10) + 1; // 1-10
        num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    } else {
        num1 = state.selectedNumber;
        num2 = Math.floor(Math.random() * 10) + 1;
    }
    
    // 随机决定是否反转显示（比如 3x4 和 4x3），但在特定数字模式下保持 num1 为主
    if (state.mode === 'mix' && Math.random() > 0.5) {
        [num1, num2] = [num2, num1];
    }

    const item = items[Math.floor(Math.random() * items.length)];
    const isStory = Math.random() > 0.3; // 70% 概率出应用题，30% 纯算式

    let text = '';
    let emojiDisplay = '';
    let speakText = '';

    if (isStory) {
        // 简单的价格应用题
        text = `买 ${num1} ${item.unit} ${item.name}，每${item.unit} ${num2} 令吉，一共要多少钱？`;
        speakText = text;
        // 显示 num1 个 item emoji
        let displayCount = Math.min(num1, 10); // 最多显示10个，避免太拥挤
        emojiDisplay = item.emoji.repeat(displayCount);
        if (num1 > 10) emojiDisplay += '...';
    } else {
        text = `请算出这个乘法题：`;
        emojiDisplay = `${num1} × ${num2}`;
        speakText = `${num1} 乘 ${num2} 等于多少？`;
    }

    return {
        num1,
        num2,
        answer: num1 * num2,
        text,
        emojiDisplay,
        item,
        speakText
    };
}

// 检查答案
window.checkAnswer = function() {
    const input = document.getElementById('answer-input');
    const feedback = document.getElementById('feedback');
    const val = parseInt(input.value);
    
    if (isNaN(val)) return;

    if (val === state.currentQuestion.answer) {
        state.stars++;
        
        // 播放音效和语音
        if (window.audioCtrl) {
            audioCtrl.playEffect('correct');
            audioCtrl.speak("答对了！太棒了！");
        }
        
        // 立即更新星星显示
        const starSpan = document.querySelector('.stars');
        if (starSpan) starSpan.innerText = `⭐ ${state.stars}`;
        
        // 检查是否刚刚解锁游戏
        const starsToGame = 10 - state.stars;
        if (starsToGame <= 0) {
            const gameArea = document.querySelector('.game-unlock-area');
            if (gameArea) {
                gameArea.innerHTML = '<button onclick="startGame()" class="game-btn pulse">🎮 玩小游戏！</button>';
            }
        }

        feedback.innerHTML = `<span class="correct">✅ 答对了！太棒了！</span>`;
        feedback.className = 'feedback show';
        
        // 播放音效（可选，暂时略过）
        
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    } else {
        // 播放音效和语音
        if (window.audioCtrl) {
            audioCtrl.playEffect('wrong');
            audioCtrl.speak("不对哦，再试一次");
        }

        feedback.innerHTML = `<span class="wrong">❌ 不对哦，再试一次！<br>提示：${state.currentQuestion.num1} × ${state.currentQuestion.num2} = ?</span>`;
        feedback.className = 'feedback show';
        input.value = '';
        input.focus();
    }
};

// 游戏相关变量
let gameCtx;
let gameLoopId;
let gameState = {
    score: 0,
    timeLeft: 30,
    playerX: 0,
    items: [],
    lastTime: 0,
    dropInterval: 1000,
    lastDrop: 0
};

window.startGame = function() {
    state.view = 'game';
    app.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span class="score">得分: <span id="game-score">0</span></span>
                <span class="timer">时间: <span id="game-timer">30</span>s</span>
            </div>
            <canvas id="game-canvas" width="400" height="600"></canvas>
            <button onclick="endGame(true)" class="small-btn">退出游戏</button>
        </div>
    `;

    const canvas = document.getElementById('game-canvas');
    gameCtx = canvas.getContext('2d');
    
    // 初始化游戏状态
    gameState.score = 0;
    gameState.timeLeft = 30;
    gameState.playerX = canvas.width / 2;
    gameState.items = [];
    gameState.lastTime = performance.now();
    gameState.lastDrop = 0;
    gameState.dropInterval = 800;

    // 绑定输入事件
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        gameState.playerX = (e.clientX - rect.left) * scaleX;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        gameState.playerX = (e.touches[0].clientX - rect.left) * scaleX;
    }, { passive: false });

    // 开始倒计时
    const timerInterval = setInterval(() => {
        if (state.view !== 'game') {
            clearInterval(timerInterval);
            return;
        }
        gameState.timeLeft--;
        const timerEl = document.getElementById('game-timer');
        if (timerEl) timerEl.innerText = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver();
        }
    }, 1000);

    // 开始游戏循环
    requestAnimationFrame(gameLoop);
};

function gameLoop(timestamp) {
    if (state.view !== 'game' || gameState.timeLeft <= 0) return;

    const dt = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    updateGame(dt, timestamp);
    drawGame();

    gameLoopId = requestAnimationFrame(gameLoop);
}

function updateGame(dt, timestamp) {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    // 生成掉落物
    if (timestamp - gameState.lastDrop > gameState.dropInterval) {
        const item = items[Math.floor(Math.random() * items.length)];
        gameState.items.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: -30,
            speed: Math.random() * 100 + 100, // 100-200 px/sec
            emoji: item.emoji
        });
        gameState.lastDrop = timestamp;
        // 稍微加快掉落速度
        if (gameState.dropInterval > 300) gameState.dropInterval -= 5;
    }

    // 更新掉落物位置
    for (let i = gameState.items.length - 1; i >= 0; i--) {
        let drop = gameState.items[i];
        drop.y += drop.speed * (dt / 1000);

        // 检测碰撞 (玩家篮子大小 60x40)
        // 简单矩形碰撞
        if (drop.y > canvas.height - 60 && drop.y < canvas.height - 10 &&
            Math.abs(drop.x - gameState.playerX) < 40) {
            // 接住了
            if (window.audioCtrl) audioCtrl.playEffect('catch');
            gameState.score++;
            document.getElementById('game-score').innerText = gameState.score;
            gameState.items.splice(i, 1);
        } else if (drop.y > canvas.height) {
            // 没接住
            gameState.items.splice(i, 1);
        }
    }
}

function drawGame() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    // 清空画布
    gameCtx.fillStyle = '#87CEEB';
    gameCtx.fillRect(0, 0, canvas.width, canvas.height);

    // 画玩家 (简单的篮子)
    gameCtx.fillStyle = '#e67e22';
    gameCtx.beginPath();
    // 限制玩家在屏幕内
    let px = Math.max(30, Math.min(canvas.width - 30, gameState.playerX));
    gameCtx.arc(px, canvas.height - 30, 30, 0, Math.PI, false);
    gameCtx.fill();
    gameCtx.lineWidth = 3;
    gameCtx.strokeStyle = '#d35400';
    gameCtx.stroke();
    
    // 画掉落物
    gameCtx.font = '30px Arial';
    gameCtx.textAlign = 'center';
    gameCtx.textBaseline = 'middle';
    gameState.items.forEach(drop => {
        gameCtx.fillText(drop.emoji, drop.x, drop.y);
    });
}

function gameOver() {
    cancelAnimationFrame(gameLoopId);
    if (window.audioCtrl) audioCtrl.playEffect('gameover');
    
    const div = document.createElement('div');
    div.className = 'game-over-modal';
    div.innerHTML = `
        <h2>游戏结束！</h2>
        <p>你的得分: <span>${gameState.score}</span></p>
        <button onclick="endGame(false)">再玩一次 (需要星星)</button>
        <button onclick="endGame(true)">回到主菜单</button>
    `;
    app.appendChild(div);
}

window.endGame = function(toMenu) {
    state.stars = 0; // 重置星星，鼓励继续做题
    if (toMenu) {
        showMainMenu();
    } else {
        // 如果想再玩一次，必须先做题
        startQuiz(); // 简单起见，回到做题界面，虽然文案说“再玩一次”
        // 或者我们可以让用户保留星星如果分数够高？不，还是简单的循环比较好：做题 -> 游戏 -> 做题
    }
};

// 音频开关逻辑
window.toggleAudio = function() {
    if (!window.audioCtrl) return;
    // 第一次点击时确保 Context 被激活
    audioCtrl.init();
    
    const isMuted = audioCtrl.toggleMute();
    const btn = document.getElementById('audio-btn');
    if (isMuted) {
        btn.innerText = '🔇';
        btn.classList.add('muted');
    } else {
        btn.innerText = '🔊';
        btn.classList.remove('muted');
    }
};
