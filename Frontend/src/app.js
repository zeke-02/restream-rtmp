
//get id token and sub (unique uuid for user)

let preferences = { //has to be object bc of JSON upload to DB.
    youtube: false,
    facebook: false,
    twitch: false
};
let new_user = true;
let hide_endpoint = false;
const keys = new Map([
    ['youtube_key',''],
    ['facebook_key',''],
    ['twitch_key','']
]);

const id_token = _.split(_.trimStart(_.split(window.location.hash, '&')[0], '#'),'=')[1];

const parsed = parseJwt(id_token);
const UUID = parsed.sub;
const user_name = parsed["cognito:username"]; 

const init = async () => {
    let retrieveResult;
    let greetingElm = elt('h4',{
        textContent: `Hello ${user_name}!`,
        id: 'greeting'
    });
    document.body.prepend(greetingElm);

    try {
        retrieveResult = await axios.post('https://xcreddg90e.execute-api.us-east-1.amazonaws.com/retrieveUUID', {
        UUID
        },
        {
            headers: {
                Authorization: id_token
        }});
        // console.log('retrieve result', retrieveResult);
    } catch (error) {
        console.log(error);   
    }
    
    if (retrieveResult.data){
        // console.log(retrieveResult.data);
        const User = retrieveResult.data;
        document.querySelector('#endpoint').textContent = makeEndpoint(User.key);

        preferences = JSON.parse(User.preferences);
        _.forEach(preferences, (val, key) => {
            //update preferences form
            document.querySelector(`#${key}`).checked = val;
        });
        if (User.youtube_key){
            // console.log('youtube key set');
            keys.set('youtube_key', User.youtube_key);
        }
        if (User.facebook_key){
            // console.log('facebook key set');
            keys.set('facebook_key', User.facebook_key);
        }
        if (User.twitch_key){
            // console.log('twitch key set');
            keys.set('twitch_key', User.twitch_key);
        }

        keys.forEach((val,key)=>{
            // console.log(val, key);
            document.querySelector(`#${key}`).value = val;
        })
        new_user = false;
        checkEndpoint();
    } else {
        // console.log('new user!');
        new_user = true;
        await axios.post('https://xcreddg90e.execute-api.us-east-1.amazonaws.com/create', {
            UUID
        }, {
            headers: {
                Authorization: id_token
            }
        });

    }
}



//helper functions

function makeEndpoint (key) {
    return 'rtmp://rtmp.defybits.com/stream' + `/${key}`;
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const changeVisibility = (element) => {
    if (element.classList.contains('hidden')){
        element.classList.remove('hidden').add('visible');
    } else {
        element.classList.remove('visible');
        element.classList.add('hidden');
    }
}

const makeVisible = (element) => {
    if (element.classList.contains('hidden')){
        element.classList.remove('hidden');
        element.classList.add('visible');
    } else if (element.classList.contains('visible')){
        return
    } else {
        element.classList.add('visible');
    }
}

const makeHidden = (element) => {
    if (element.classList.contains('visible')){
        element.classList.remove('visible')
        element.classList.add('hidden');
    
    } else if (element.classList.contains('hidden')){
        return
    } else {
        element.classList.add('hidden');
    }
}

function elt(type, props, ...children) {
    let dom = document.createElement(type);
    if (props) Object.assign(dom, props);
    for (let child of children) {
      if (typeof child != "string") dom.appendChild(child);
      else dom.appendChild(document.createTextNode(child));
    }
    return dom;
  }

// event handler functions

const handlePreferences = async (event) => {

    event.preventDefault();
    // console.log('executing handlePreferences');

    _.forEach(preferences, (val, key)=> {
        preferences[key] = document.querySelector(`#${key}`).checked;
    });
    // console.log(preferences);
    //update preferences with api.
    //only update if new? => how to see if things have changed. X, can't since JSON data is just one entry.

    await axios.post('https://xcreddg90e.execute-api.us-east-1.amazonaws.com/update', {
        'UUID': UUID,
        'preferences': JSON.stringify(preferences)
    }, {
        headers: {
            Authorization: id_token
        }
    }); 
    checkEndpoint();
}


const handleKeys = async (event) => {
    // 1. upload keys
    // 2. hide key section and remove all child nodes of keyForm
    // 3. make visible the endpoint

    _.forEach(document.getElementsByTagName('input'), (elm) => {
        if (elm.type == 'text' && _.split(elm.id,'_')[1] == 'key'){
            if (keys.get(elm.id) != elm.value){
                keys.set(elm.id, elm.value);
            }
            
        }
    });

    event.preventDefault();
    let requestData = {
        'UUID': UUID,
    };
    keys.forEach((val,key)=>{
        if (val){
            requestData[key] = val;
        }  
    });
    await axios.post('https://xcreddg90e.execute-api.us-east-1.amazonaws.com/update', requestData,{
        headers: {
            Authorization: id_token
        }
    }); 
    checkEndpoint();
}

function copyDivToClipboard(event) {
    var range = document.createRange();
    range.selectNode(document.getElementById('endpoint'));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges();// to deselect
}

function checkEndpoint (){
    hide = false;
    keys.forEach((val,key) =>{
        let tmp = _.split(key,'_')[0];
        _.forEach(preferences, (pval, pkey)=>{
            if (tmp == pkey && pval && !val){
                makeHidden(document.querySelector('#endpoint-section'));
                hide = true;
            }
        });
    });
    if (! hide ){
        makeVisible(document.querySelector('#endpoint-section'));
    } else {
        alert('missing keys');
    }
    
}
{/* <label for="fname">First name:</label><br>
<input type="text" id="fname" name="fname"><br><br></br> */}



// let new_user = true;
//handlePreferences();
document.querySelector('#button-endpoint').addEventListener('click', copyDivToClipboard);
document.querySelector('#preferencesForm').addEventListener('submit', handlePreferences);
document.querySelector('#keyForm').addEventListener('submit', handleKeys);
document.querySelector('#get-endpoint').addEventListener('click', checkEndpoint);

init();