let stepIndex = 1;
let conversationSteps = [];

window.onload = async function () {
  const res = await fetch('conversation.json');
  const data = await res.json();
  conversationSteps = data.steps;

  // Show first message from config
  addMessage(conversationSteps[0], 'agent');
};

function handleKey(e) {
  if (e.key === 'Enter') {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    respondToNextStep();
    input.value = '';
  }
}

function addMessage(text, sender) {
  const chatBox = document.getElementById('chatBox');
  const msg = document.createElement('div');
  msg.className = 'message ' + sender;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function respondToNextStep() {
  if (stepIndex < conversationSteps.length) {
    setTimeout(() => {
      addMessage(conversationSteps[stepIndex], 'agent');
      stepIndex++;
    }, 1000);
  }
}
