// Front Page Flip
const kingCard = document.getElementById('kingCard');
const playBtn = document.getElementById('playBtn');
const frontPage = document.getElementById('frontPage');
const setupDiv = document.getElementById('setup');

playBtn.addEventListener('click', () => {
  kingCard.style.transform = 'rotateY(180deg)';
  setTimeout(() => {
    frontPage.classList.add('hidden');
    setupDiv.classList.remove('hidden');
  }, 1000);
});

// Setup
const difficultySelect = document.getElementById('difficulty');
const numPlayersInput = document.getElementById('numPlayers');
const playerInputsDiv = document.getElementById('playerInputs');
const startBtn = document.getElementById('startBtn');

// Game Elements
const gameDiv = document.getElementById('game');
const currentPlayerP = document.getElementById('currentPlayer');
const buttonsContainer = document.getElementById('buttonsContainer');
const chosenStatus = document.getElementById('chosenStatus');
const nextBtn = document.getElementById('nextBtn');
const timerDisplay = document.getElementById('timer');
const exitBtn = document.getElementById('exitBtn');

const scoreList = document.getElementById('scoreList');
const resultsDiv = document.getElementById('results');
const averageP = document.getElementById('average');
const targetP = document.getElementById('target');
const roundWinnerP = document.getElementById('roundWinner');
const gameWinnerP = document.getElementById('gameWinner');
const nextRoundBtn = document.getElementById('nextRoundBtn');

// Timer bar
const timerBarContainer = document.createElement('div');
timerBarContainer.id = 'timerBar';
const timerBarFill = document.createElement('div');
timerBarFill.id = 'timerFill';
timerBarContainer.appendChild(timerBarFill);
gameDiv.insertBefore(timerBarContainer, buttonsContainer);

let players=[], playerChoices=[], currentPlayerIndex=0, scores=[], maxNumber=50, countdownTime=20, timerInterval;
let tempSelectedNumber = null;

// Player Input
numPlayersInput.addEventListener('input', ()=>{
  const num=Number(numPlayersInput.value);
  playerInputsDiv.innerHTML='';
  for(let i=0;i<num;i++){
    const input=document.createElement('input');
    input.placeholder=`Player ${i+1} Name`;
    input.classList.add('playerNameInput');
    playerInputsDiv.appendChild(input);
  }
});

// Start Game
startBtn.addEventListener('click', ()=>{
  const nameInputs=document.querySelectorAll('.playerNameInput');
  players=[];
  nameInputs.forEach(input=>{
    if(input.value.trim()) players.push(input.value.trim());
  });
  if(players.length===0){ alert("Enter player names!"); return; }

  const difficulty=difficultySelect.value;
  if(difficulty==='easy'){ maxNumber=20; countdownTime=20; }
  else if(difficulty==='intermediate'){ maxNumber=50; countdownTime=15; }
  else{ maxNumber=100; countdownTime=10; }

  if(players.length === 1) players.push("AI");

  scores=new Array(players.length).fill(0);
  playerChoices=new Array(players.length).fill(null);
  currentPlayerIndex=0;

  setupDiv.classList.add('hidden');
  gameDiv.classList.remove('hidden');
  resultsDiv.classList.add('hidden');
  nextRoundBtn.classList.add('hidden');
  updateScores();
  createButtons();
  startTurn();
});

// Create number buttons
function createButtons(){
  buttonsContainer.innerHTML='';
  for(let i=1;i<=maxNumber;i++){
    const btn=document.createElement('button');
    const front = document.createElement('div'); front.classList.add('front'); front.textContent = i;
    const back = document.createElement('div'); back.classList.add('back'); back.textContent = i;
    btn.appendChild(front); btn.appendChild(back);
    btn.dataset.value = i;

    btn.addEventListener('click', ()=>{
      buttonsContainer.querySelectorAll('button').forEach(b=>{
        b.classList.remove('flipped');
        b.style.zIndex = 1; 
      });

      btn.classList.add('flipped');
      btn.style.zIndex = 10;
      tempSelectedNumber = Number(btn.dataset.value);
      chosenStatus.textContent = `Selected number: ${tempSelectedNumber}`;
      nextBtn.classList.remove('hidden');
    });

    buttonsContainer.appendChild(btn);
  }
}

// Start Turn
function startTurn(){
  showCurrentPlayer();
  chosenStatus.textContent='';
  tempSelectedNumber = null;
  buttonsContainer.querySelectorAll('button').forEach(b=>b.classList.remove('flipped'));
  nextBtn.classList.add('hidden');

  if(players[currentPlayerIndex] === "AI"){
    const aiChoice = Math.floor(Math.random() * maxNumber) + 1;
    playerChoices[currentPlayerIndex] = aiChoice;

    const aiButton = Array.from(buttonsContainer.querySelectorAll('button'))
                          .find(b => Number(b.dataset.value) === aiChoice);
    if(aiButton){
        buttonsContainer.querySelectorAll('button').forEach(b=>{
            b.classList.remove('flipped');
            b.style.zIndex = 1;
        });
        aiButton.classList.add('flipped');
        aiButton.style.zIndex = 10;
    }

    chosenStatus.textContent=`AI is choosing...`;
    setTimeout(()=>{
        chosenStatus.textContent=`AI has chosen: ${aiChoice}`;
        currentPlayerIndex++;
        if(currentPlayerIndex >= players.length){ 
            showRoundResults(); 
        } else startTurn();
    }, 1000);
    return;
  }

  // Human player timer
  let timeLeft=countdownTime;
  timerDisplay.textContent=timeLeft;
  timerBarFill.style.width = '100%';
  timerBarFill.style.backgroundColor = '#ff0000';

  timerInterval=setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent=timeLeft;
    timerBarFill.style.width = (timeLeft/countdownTime*100)+'%';
    if(timeLeft<=Math.floor(countdownTime/2)) timerBarFill.style.backgroundColor='#ff8800';
    if(timeLeft<=Math.floor(countdownTime/4)) timerBarFill.style.backgroundColor='#ff4444';
    if(timeLeft<=0){
      clearInterval(timerInterval);
      if(tempSelectedNumber===null) tempSelectedNumber=1;
      playerChoices[currentPlayerIndex] = tempSelectedNumber;
      chosenStatus.textContent=`Time's up! Default choice: ${tempSelectedNumber}`;
      nextBtn.classList.remove('hidden');
    }
  },1000);
}

// Next Player Button
nextBtn.addEventListener('click', ()=>{
  clearInterval(timerInterval);
  if(tempSelectedNumber===null) tempSelectedNumber=1;
  playerChoices[currentPlayerIndex] = tempSelectedNumber;
  tempSelectedNumber = null;

  currentPlayerIndex++;
  if(currentPlayerIndex>=players.length){ 
    showRoundResults(); 
  } else startTurn();
});

function showCurrentPlayer(){
  currentPlayerP.textContent=`Current Player: ${players[currentPlayerIndex]}`;
}

// Round Results
function showRoundResults(){
  resultsDiv.classList.remove('hidden');
  nextBtn.classList.add('hidden');

  const sum = playerChoices.reduce((a,b)=>a+b,0);
  const average = sum/players.length;
  const target = (2/3)*average;

  let closestIndex = playerChoices.reduce((prevIdx, curr, idx) =>
    Math.abs(curr - target) < Math.abs(playerChoices[prevIdx] - target) ? idx : prevIdx, 0
  );
  scores[closestIndex]++;
  updateScores();

  averageP.textContent = `Average: ${average.toFixed(2)}`;
  targetP.textContent = `Target (2/3 × Average): ${target.toFixed(2)}`;
  roundWinnerP.textContent = `Round Winner: ${players[closestIndex]} (${playerChoices[closestIndex]})`;

  let choicesText = 'Numbers chosen: ';
  players.forEach((player, idx)=>{
    choicesText += `${player}: ${playerChoices[idx]}${idx<players.length-1?', ':''}`;
  });
  chosenStatus.textContent = choicesText;

  if(scores[closestIndex]>=5){
    gameWinnerP.textContent = `🎉 Game Winner: ${players[closestIndex]} 🎉`;
    gameWinnerP.classList.remove('hidden');
    nextRoundBtn.classList.add('hidden');
  } else nextRoundBtn.classList.remove('hidden');
}

// Next Round
nextRoundBtn.addEventListener('click', ()=>{
  playerChoices=new Array(players.length).fill(null);
  currentPlayerIndex=0;
  resultsDiv.classList.add('hidden');
  nextRoundBtn.classList.add('hidden');
  startTurn();
});

// Exit Game
exitBtn.addEventListener('click', ()=>{
  gameDiv.classList.add('hidden');
  setupDiv.classList.remove('hidden');
  playerChoices=[];
  currentPlayerIndex=0;
  resultsDiv.classList.add('hidden');
  nextRoundBtn.classList.add('hidden');
  buttonsContainer.innerHTML='';
  chosenStatus.textContent='';
  clearInterval(timerInterval);
  gameWinnerP.classList.add('hidden');
});

// Update Scores
function updateScores(){
  scoreList.innerHTML='';
  players.forEach((player,idx)=>{
    const li=document.createElement('li');
    li.textContent=`${player}: ${scores[idx]} points`;
    scoreList.appendChild(li);
  });
}

// Diamond Animation
function createDiamond(){
  const diamond=document.createElement('div');
  diamond.classList.add('diamond');
  diamond.style.left=Math.random()*90+'vw';
  diamond.style.width = 10+Math.random()*20+'px';
  diamond.style.height = diamond.style.width;
  diamond.style.animationDuration=(2+Math.random()*3)+'s';
  document.body.appendChild(diamond);
  setTimeout(()=>{diamond.remove();},5000);
}
setInterval(createDiamond,500);