function sayHello(){
    console.log("hello");
}

function copy(id) {
    /* Get the text field */
    const copyText = document.getElementById(id);
  
    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
  
     /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);
  }
