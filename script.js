'use strict';

const CARDS = [
  { name: '6',      value: 6,  image: '6.png' },
  { name: '7',      value: 7,  image: '7.png' },
  { name: '8',      value: 8,  image: '8.png' },
  { name: '9',      value: 9,  image: '9.png' },
  { name: '10',     value: 10, image: '10.png' },
  { name: 'Валет',  value: 2,  image: 'валет.png' },
  { name: 'Дама',   value: 3,  image: 'дама.png' },
  { name: 'Король', value: 4,  image: 'король.png' },
  { name: 'Туз',    value: 11, image: 'туз.png' }
];

const CARD_BACK = 'фон карти.jpg';

const TARGET = 21;        
const MAX_ATTEMPTS = 3;  
const BTN_TEXT = 'Видача';
const BTN_AGAIN = 'Грати ще раз';
const COLOR_BUST = '#ff6b6b';  
const COLOR_21 = '#4cd964';   
const COLOR_LEADER = '#ffd700';  

const NAME_REGEX = /^\p{L}[\p{L}' ’-]{1,19}$/u;

const gameEl      = document.querySelector('.game');
const userNameEl  = document.getElementById('userName');
const userScoreEl = document.getElementById('userScore');
const userCardEl  = document.getElementById('userCard');
const compScoreEl = document.getElementById('compScore');
const compCardEl  = document.getElementById('compCard');
const attemptEl   = document.getElementById('attempt');
const btn         = document.getElementById('generateBtn');
const resultEl    = document.getElementById('result');

let userName = 'Гравець';
let attempt = 0;
let userScore = 0;
let compScore = 0;
let finished = false;

function askName() {
  let message = "Введіть ваше ім'я:";
  while (true) {
    const input = prompt(message);
    if (input === null) return 'Гравець';      
    const name = input.trim().replace(/\s+/g, ' ');
    if (NAME_REGEX.test(name)) return name;
    message = "Некоректне ім'я!\nВикористайте 2–20 символів: літери, пробіл, дефіс або апостроф.";
  }
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function evaluate(score) {
  return score > TARGET ? -1 : score;
}

function getOutcome(user, comp) {
  const u = evaluate(user);
  const c = evaluate(comp);
  if (u > c) return 'user';
  if (u < c) return 'comp';
  return 'draw';                         
}

function isGameOver() {
  return attempt >= MAX_ATTEMPTS || userScore >= TARGET || compScore >= TARGET;
}

function describe() {
  if (userScore > TARGET && compScore > TARGET) return 'перебір в обох гравців';
  if (userScore > TARGET) return `у ${userName} перебір`;
  if (compScore > TARGET) return 'у комп’ютера перебір';
  if (userScore === TARGET || compScore === TARGET) return 'рівно 21!';
  return '';
}

// Показує заглушку замість фото
function buildPlaceholder(el, title, hint) {
  el.classList.add('placeholder');
  el.append(makeEl('span', 'ph-title', title), makeEl('small', 'ph-hint', hint));
}

function attachPhoto(el, src, alt, title, hint) {
  const img = makeEl('img', 'card-img');
  img.alt = alt;
  img.addEventListener('error', () => {
    img.remove();
    buildPlaceholder(el, title, hint);
  });
  img.src = src;
  el.append(img);
}

function showCard(slot, card) {
  slot.replaceChildren();
  const el = makeEl('div', 'card');
  slot.append(el);

  if (!card) {
    attachPhoto(el, CARD_BACK, 'Сорочка карти', '?', 'сорочка карти');
    return;
  }
  el.classList.add('deal');
  attachPhoto(el, card.image, `${card.name}, ${card.value} очок`,
    card.name, `${card.value} очок · тут буде фото`);
}

function scoreColor(score, other) {
  if (score > TARGET) return COLOR_BUST;
  if (score === TARGET) return COLOR_21;
  if (evaluate(score) > evaluate(other)) return COLOR_LEADER;
  return '';
}

function updateScores() {
  userScoreEl.textContent = userScore;
  compScoreEl.textContent = compScore;

  const outcome = getOutcome(userScore, compScore);
  userScoreEl.classList.toggle('leading', outcome === 'user');
  compScoreEl.classList.toggle('leading', outcome === 'comp');
  userScoreEl.style.backgroundColor = scoreColor(userScore, compScore);
  compScoreEl.style.backgroundColor = scoreColor(compScore, userScore);
}

function setResult(text, bg, color) {
  resultEl.textContent = text;
  resultEl.style.backgroundColor = bg;
  resultEl.style.color = color;
}

function finishGame() {
  finished = true;
  const outcome = getOutcome(userScore, compScore);
  let text, bg;
  if (outcome === 'user')      { text = `Перемога ${userName}`; bg = '#b7f5b0'; }
  else if (outcome === 'comp') { text = 'Перемога комп’ютера';      bg = '#f7b3b3'; }
  else                         { text = 'Нічия';                 bg = '#fff3a8'; }

  const note = describe();
  setResult(`${text} (${userScore} : ${compScore})${note ? ' — ' + note : ''}`, bg, '#111');
  btn.textContent = BTN_AGAIN;
  btn.style.backgroundColor = '#ff9800';
}

function resetGame() {
  attempt = 0;
  userScore = 0;
  compScore = 0;
  finished = false;
  attemptEl.textContent = `Спроба 0 з ${MAX_ATTEMPTS}`;
  btn.textContent = BTN_TEXT;
  btn.style.removeProperty('background-color');
  userScoreEl.style.removeProperty('background-color');
  compScoreEl.style.removeProperty('background-color');
  userScoreEl.classList.remove('leading');
  compScoreEl.classList.remove('leading');
  userScoreEl.textContent = 0;
  compScoreEl.textContent = 0;
  setResult('', '', '');
  showCard(userCardEl, null);
  showCard(compCardEl, null);
}

function addRules() {
  const rules = makeEl('p', 'rules',
    `Мета гри: набрати ${TARGET} очко або якомога ближче до ${TARGET}. ` +
    `Сума більша за ${TARGET} — перебір і програш. ` +
    `Якщо в когось ${TARGET} або перебір, гра закінчується достроково.`);
  rules.style.gridColumn = '1 / -1';
  rules.style.fontSize = 'clamp(.8rem, 2.4vw, 1rem)';
  rules.style.color = '#333';
  gameEl.append(rules);
}

function playRound() {
  const user = randomItem(CARDS);
  const comp = randomItem(CARDS);
  attempt++;
  userScore += user.value;
  compScore += comp.value;

  showCard(userCardEl, user);
  showCard(compCardEl, comp);
  attemptEl.textContent = `Спроба ${attempt} з ${MAX_ATTEMPTS}`;
  updateScores();

  if (isGameOver()) finishGame();
}

btn.addEventListener('click', () => {
  if (finished) resetGame();                  
  else playRound();
});

window.addEventListener('load', () => {
  addRules();
  resetGame();
  setTimeout(() => {                    
    userName = askName();
    userNameEl.textContent = userName;
  }, 50);
});