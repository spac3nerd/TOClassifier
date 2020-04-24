//built to fetch data from factba.se - simply paste it in the browser console for the speech you're interested in

let concatenatedText = "";
let maxSegments = 250; //the site splits speeches into segments, let's not fetch quite everything
let targetName = "Donald Trump"; //the site contain whole transcripts, including those of the other people, we must target only one person
function getAll() {
    let parentElems = $("a[name^='seq']");
    for (let k = 0; k < Math.min(parentElems.length, maxSegments); k++) {
        if (parentElems[k].parentElement.parentElement.parentElement.parentElement.children[0].innerText === targetName) {
            concatenatedText += parentElems[k].text + "\n";
        }
    }
}
getAll();
console.log(concatenatedText);