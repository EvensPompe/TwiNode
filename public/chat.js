var messages = io.connect('http://localhost:3000/messages');

let inputMess = document.getElementById('inputMess'),
  btnMess = document.getElementById('btnMess'),
  convMess = document.getElementById('convMess'),
  ctnConv = document.querySelectorAll('.ctn-conv');

if (ctnConv) {
  ctnConv.forEach((ctn) => {
    ctn.addEventListener('click', (e) => {
      let url = new URL(`http://localhost:3000/message?convId=${e.target.childNodes[1].className}`);
      window.location = url;
    });
  });
}

if (btnMess) {
  btnMess.addEventListener('click', (e) => {
    e.preventDefault();
    let user = e.target.value;
    user = user.split(' ');
    var userName = user[0],
      userId = user[1],
      convId = user[2]
      if (!inputMess.value || (inputMess.value === undefined || inputMess.value === null) || inputMess.value.trim() === "") {

      }else {
        messages.emit('message', {
          message: inputMess.value,
          user: userName,
          id: userId,
          convId: convId
        });
      }
    inputMess.value = "";
  })
}

messages.on('allMessages', (data) => {
  data.conv.messages.forEach((message) => {
    if (data.conv.messages[data.conv.messages.length - 1] === message) {
      let newDate = moment(message.date).format("DD/MM/YYYY HH:mm");
      convMess.innerHTML += `<div class="row container-fluid d-flex justify-content-between">
                  <p>${message.user} :</p>
                  <p>${message.message}</p>
                  <p>${newDate}</p>
                </div>`
    }
  });
})
