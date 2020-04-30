var messages = io.connect('http://localhost:3000/messages');

let inputMess = document.getElementById('inputMess'),
  btnMess = document.getElementById('btnMess'),
  convMess = document.getElementById('convMess'),
  ctnConv = document.querySelector('.ctn-conv');

if (ctnConv) {
  ctnConv.addEventListener('click', (e) => {
    let url = new URL(`http://localhost:3000/message?convId=${e.target.childNodes[1].className}`);
    window.location = url;
  });
}

btnMess.addEventListener('click', (e) => {
  e.preventDefault();
  let user = e.target.value;
  user = user.split(' ');
  var userName = user[0],
    userId = user[1],
    convId = user[2]
  messages.emit('message', {
    message: inputMess.value,
    user: userName,
    id: userId,
    convId: convId
  });
})

messages.on('allMessages', (data) => {
  data.conv.messages.forEach((message) => {
    convMess.innerHTML += `<div class="row container-fluid d-flex justify-content-between"><p>${message.user}:</p> <p>${message.message}</p> <p>${message.date}</p></div>`
  });
})
