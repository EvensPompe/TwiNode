var socket = io.connect('http://localhost:3000');

let inputMess = document.getElementById('inputMess'),
  btnMess = document.getElementById('btnMess'),
  convMess = document.getElementById('convMess'),
  rechConv = document.getElementById('rechConv'),
  ctnAuto = document.querySelector('.divAuto'),
  searchForm = document.querySelector('.searchForm'),
  inputRechTwit = document.getElementById('inputRechTwit'),
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

  if(inputRechTwit){
  inputRechTwit.addEventListener("input",(e)=>{
    socket.emit('searchUser', {
      inputRechTwit: e.target.value
    })
  })
}

function getValueLi(pseudo, id) {
  console.log(pseudo, id);
  rechConv.value = pseudo;
  searchForm.action = '/newConv?id=' + id;
  ctnAuto.classList.add('notVisible');
}

if (convMess) {
  function scrollToButton(){
    var lastMessage;
    for (let index = 0; index < convMess.children.length; index++) {
      if(index === convMess.children.length -1){
        lastMessage = convMess.children[index];
      }
    }
    convMess.scrollTop = lastMessage.offsetTop - 10; 
  }
  scrollToButton();
} 

socket.on('allMessages', (data) => {
  let newDate = moment(data.conv.date).format("DD/MM/YYYY HH:mm");
  convMess.innerHTML += `<div class="row container-fluid d-flex justify-content-between">
                    <p>${data.conv.user} :</p>
                    <p>${data.conv.message}</p>
                    <p>${newDate}</p>
                  </div>`;
  scrollToButton();                
})

socket.on('searchResult', (data) => {
  if (rechConv.value == "" || data.result.length == 0) {
    ctnAuto.innerHTML = "";
  } else {
      let filterRes = data.result.filter(user => {
          return user.pseudo.toLowerCase().includes(data.inputRech.toLowerCase().toString()) == true;
      });
      let result = filterRes.map((user)=>{ 
       return `<div value="${user.id}" onclick="getValueLi('${user.pseudo}','${user.id}')">${user.pseudo}</div>`
      }).join("");
      ctnAuto.classList.remove('notVisible');
      ctnAuto.innerHTML = result;
  }
})
