var socket = io.connect('http://localhost:3000');

let inputMess = document.getElementById('inputMess'),
  btnMess = document.getElementById('btnMess'),
  convMess = document.getElementById('convMess'),
  rechConv = document.getElementById('rechConv'),
  ctnAuto = document.querySelector('.ulAuto'),
  searchForm = document.querySelector('.searchForm'),
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
  socket.on('connect',()=>{
    let user = btnMess.value;
    user = user.split(' /');
    var userId = user[1],
        convId = user[2];
    socket.emit('socketUser', {
      socketUser: socket.id,
      user:userId,
    })
  })

  btnMess.addEventListener('click', (e) => {
    e.preventDefault();
    let user = e.target.value;
    user = user.split(' /');
    var userName = user[0],
      userId = user[1],
      convId = user[2],
      socketUser = user[3],
      socketDest = user[4]

    if (!inputMess.value || (inputMess.value === undefined || inputMess.value === null) || inputMess.value.trim() === "") {

    } else {
      socket.emit('message', {
        message: inputMess.value,
        user: userName,
        convId: convId,
        socketUser:socketUser,
        socketDest:socketDest
      });
    }
    inputMess.value = "";
  })
}

if (rechConv) {
  rechConv.addEventListener('input', (e) => {
    socket.emit('searchUser', {
      inputRech: e.target.value
    })
  })
}

function getValueLi(pseudo, id) {
  console.log(pseudo, id);
  rechConv.value = pseudo;
  searchForm.action = '/newConv?id=' + id;
  ctnAuto.classList.add('notVisible');
}

socket.on('allMessages', (data) => {
  // if (data) {
  //   data.conv.messages.forEach((message) => {
  //     if (data.conv.messages[data.conv.messages.length - 1] === message) {
  //       let newDate = moment(message.date).format("DD/MM/YYYY HH:mm");
  //       convMess.innerHTML += `<div class="row container-fluid d-flex justify-content-between">
  //                   <p>${message.user} :</p>
  //                   <p>${message.message}</p>
  //                   <p>${newDate}</p>
  //                 </div>`
  //     }
  //   });
  // }
  let newDate = moment(data.conv.date).format("DD/MM/YYYY HH:mm");
  convMess.innerHTML += `<div class="row container-fluid d-flex justify-content-between">
                    <p>${data.conv.user} :</p>
                    <p>${data.conv.message}</p>
                    <p>${newDate}</p>
                  </div>`
})

socket.on('searchResult', (data) => {
  if (rechConv.value == "" || data.result.length == 0) {
    ctnAuto.innerHTML = "";
  } else {
    data.result.forEach((user) => {
      ctnAuto.classList.remove('notVisible');
      ctnAuto.innerHTML += `<li value="${user.id}" onclick="getValueLi('${user.pseudo}','${user.id}')">${user.pseudo}</li>`;
    });
  }
})
