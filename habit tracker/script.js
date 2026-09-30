const habitForm = document.getElementById('habitForm');
const habitInput = document.getElementById('habitInput');
const habitList = document.getElementById('habitList');
const moodButtons = document.querySelectorAll('.mood-btn');
const dateToday = document.getElementById('dateToday');
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const streakList = document.getElementById('streakList');

let habits = JSON.parse(localStorage.getItem('habits')) || [];
let moodLog = JSON.parse(localStorage.getItem('moodLog')) || {};
let habitLog = JSON.parse(localStorage.getItem('habitLog')) || {};

let viewDate = new Date();

function todayKey() {
    return new Date().toISOString().split('T')[0];
}

function saveAll() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('moodLog', JSON.stringify(moodLog));
    localStorage.setItem('habitLog', JSON.stringify(habitLog));
}

function showToday() {
    const today = new Date();
    dateToday.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
}

// Mood picker
moodButtons.forEach(btn => {
   btn.addEventListener('click', () =>{
    moodButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    moodLog[todDaKey()] = btn.dataset.mood;
    saveAll();
    renderCalendar();
   });
});

function restoreMoodSelection() {
    const mood = moodLog[todayKey()];
    if (mood) {
        moodButtons.forEach(b => {
            if (b.dataset.mood === mood) b.classList.add('selected');
        });
    }
}

// Habits
function renderHabits() {
    habitList.innerHTML = '';
    const key = todayKey();
    if (!habitLog[key]) habitLog[key] = {};

    habits.forEach(habit => {
        const done = habitLog[key][habit.id] || false;
        const li = document.createElement('li');
        li.className = 'habit-item' + (done ? ' done' : '');
        li.innerHTML = `
          <input type="checkbox" ${done ? 'checked' : ''}>
          <span class="habit-text">${habit.text}</span>
          <button class="habit-delete">Remove</button>
        `;

        li.querySelector('input').addEvenListener('change', (e) => {
          habitLog[key][habit.id] = e.target.checked;
          saveAll();
          renderHabits();
          renderStreaks();
          renderCalendar();
        });

        li.querySelector('.habit-delete').addEventListener('click', () => {
          habits = habits.filter(h => h.id !== habit.id);
          saveAll();
          renderHabits();
          renderStreaks();
        });

        habitList.appendChild(li);
      });
}

habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = habitInput.value.trim();
    if (!text) return;
    habits.push({ id: Date.now(), text });
    habitInput.value = '';
    saveAll();
    renderHabits();
    renderStreaks();
});

// Streaks
function calcStreak(habitId) {
    let streak = 0;
    let date = new Date();
    while (true) {
        const key = date.toISOString().split('T')[0];
        if (habitLog[key] && habitLog[key][habitId]) {
            streak++;
            date.setDate(date.getDate() - 1);
         }  else {
            break;
         }
    }
    return streak;
}

function renderStreaks() {
    streakList.innerHTML = '';
    if (habits.length === 0) {
        streakList.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">No habits yet</p>';
        return;
    }
    habits.forEach(habit => {
        const streak = calcStreak(habit.id);
        const div = document.createElement('div');
        div.className = 'streak-item';
        div.innerHTML = `<span>${habit.text}</span><span>${streak} day${streak !== 1 ? 's' : ''} 🔥</span>`;
        streakList.appendChild(div);
    });
}

// Calendar
function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    monthLabel.textContent = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric'});

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        calendarGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const key = dateObj.toISOString().split('T')[0];
        const mood = moodLog[key] || '';

        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.innerHTML = `<span>${d}</span><span class="day-mood">${mood}</span`;
        calendarGrid.appendChild(cell);
    }
}

prevMonthBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
});

// Init
showToday();
restoreMoodSelection();
renderHabits();
renderStreaks();
renderCalendar();