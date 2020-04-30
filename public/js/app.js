const inputImg = document.getElementById('newBanniere');
const imgbanniere = document.getElementById('banniere');
if (inputImg) {
  inputImg.addEventListener('change',(event)=>{
    const reader = new FileReader();
    let file = inputImg.files[0];
    var img = new Image();
    img.src = window.URL.createObjectURL(file);
    reader.onload = function (e) {
      console.log(img.naturalWidth,img.naturalHeight,img.naturalWidth >= 1500 && img.naturalHeight >= 500);
      if (img.naturalWidth >= 1500 && img.naturalHeight >= 500) {
        banniere.src = e.target.result;
      }else {
        inputImg.value = null;
        console.log(`l'image ne correspond pas !`);
      }
    }
    reader.readAsDataURL(file);
  });
}
