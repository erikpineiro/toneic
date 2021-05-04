
import * as Components from "../components/components.js";

const crosswords = JSON.parse(`{"words": [{"origin": [0,0],"direction": "h","word": "mädrid","description": {"image": null,"podcastTime": 0,"text": "Spaniens huvudstad"}},{"origin": [3, 0],"direction": "v","word": "roma","description": {"image": null,"podcastTime": 0,"text": "huvudstad i regionen Lazio och huvudort och en kommun i storstadsregionen Rom, innan 2015 provinsen Rom."}},{"origin": [2,3],"direction": "h","word": "pariser","description": {"image": null,"podcastTime": 0,"text": "Tête de veaux"}},{"origin": [5,2],"direction": "v","word": "lima","description": {"image": "image_21v17_5_2v.jpg","podcastTime": 0,"text": ""}}],"multipliers": [{"origin": [0,0],"factor": 2}]}`);

export function init (toneic) {

    toneic.innerHTML = `
        <div id="playMode">
        </div>
        <div id="toneicContent">
            <div class="meta">Meta</div>
            <div class="podcast">Podcast</div>
            <div class="crosswords"></div>
        </div>
    `;


    // Get the crosswords
    // Api.getCrosswords({
    //     id: 
    // });
    // Crosswords come here without the solution but with the length of each word
    // Fix that while testing
    crosswords.words.forEach( word => {
        word.length = word.word.length;
        delete word.word;
    });
    new Components.Crosswords({
        element: toneic.querySelector(".crosswords"),
        crosswords
    });
    

    // Choose playmode (if not already chosen)

}



