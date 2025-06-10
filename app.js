let testTextBox = document.querySelector(".test-text");
let testWords, testSpans, testString;
 
getParagraph();                         // to get the paragraph text for testing.
async function getParagraph() {

    try {
        let aiResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "give me a paragraph of length 200 words" }],
            temperature: 1.85

        }, {
            headers: {
                Authorization: `Bearer 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`,
                "Content-Type": 'application/json'
            }
        })

        let text = aiResponse.data.choices[0].message.content // main text of the ai response
        testTextBox.innerText = text;
        currWord.setAttribute("contenteditable", "true")

        testWords = testTextBox.innerText.split(" ");

        testString = testTextBox.innerText;
        toSpans(".test-text");

        testSpans = document.querySelectorAll(".test-text span");

    } catch (e) {
        console.log(e);
        let text = "Technology has significantly transformed modern education, reshaping how students learn and how educators teach. With the rise of digital platforms, access to information has become easier and faster than ever before. Online courses, educational apps, and virtual classrooms have expanded learning beyond traditional boundaries, enabling students to gain knowledge at their own pace and from virtually anywhere in the world. Interactive tools like videos, simulations, and quizzes help make complex topics more engaging and easier to understand. Teachers, too, benefit from technology through tools that help track student performance, create customized lesson plans, and provide instant feedback. Additionally, artificial intelligence and machine learning are beginning to personalize learning experiences, identifying areas where students struggle and offering targeted help. However, while technology offers numerous advantages, it also raises concerns about screen time, reduced face-to-face interaction, and unequal access to resources in underprivileged areas. Digital literacy has become essential not just for students, but also for educators who must stay updated with new tools and platforms. Ultimately, when used effectively, technology can bridge gaps in education, foster collaboration, and promote a more inclusive and innovative learning environment for all. It is redefining the classroom experience in ways we are only beginning to fully understand."
        testTextBox.innerText = text;
    }
}










const toSpans = (selector) => { // breaking a text into spans for functionality
    let box = document.querySelector(selector);
    let str = box.innerText;
    let newStr = '';
    str.split(" ").forEach((el) => {
        newStr = newStr + `<span>${el}</span>`;
    })
    box.innerHTML = newStr;
    // console.log("split done for", selector)
}




let currWord = document.querySelector(".current-word"); // The editable span
let userInp = document.querySelector(".user-input"); // container of currWord and entered text
let enteredText = document.querySelector(".entered");// words that are submitted with spacebar


let i = 0;  // iterator for pointing to the words of the original paragraph
let j = 0;  // iterator pointing to letters of a word of the original paragraph
let wpm = 0;
let cpm = 0;



let typeBox = document.querySelector(".box");
typeBox.addEventListener("click", () => {
    currWord.focus();

});


let isCorrect = false;
const checkWord = (key) => { // function to check correctness of a word on keypress
    let newCurrWord = ""
    if (key != "Backspace" && key != " ") {
        newCurrWord = currWord.innerText + key;
    }
    else if (key == " ") {
        newCurrWord = currWord.innerText;
        if (newCurrWord.length != testWords[i].length) {
            isCorrect = false;
            return;
        }
        else {

        }
    }
    else if (key == "Backspace") {
        newCurrWord = currWord.innerText.slice(0, -1)
    }
   
    for (let q = 0; q < newCurrWord.length; q++) {
        if (newCurrWord[q] != testWords[i][q]) {
            isCorrect = false;
            return;
        }

    }
    isCorrect = true;



}

// ...................complex lines to handle typing and checking correctness.............................

currWord.addEventListener("keydown", (e) => { //  to handle backspace
 
    if (e.key == "Backspace" && currWord.innerText.length) {
        checkWord(e.key)
        
        if (currWord.innerText.length == 1) {
            
            j > 0 && (testSpans[i].innerText = testWords[i][--j] + testSpans[i].innerText);
            currWord.innerText = "";
        }
        else if (isCorrect) {

            if (currWord.classList.contains("wrong-word")) {
                currWord.classList.remove("wrong-word");


            }

            else {

                (testSpans[i].innerText = testWords[i][--j] + testSpans[i].innerText)
            }


        }

    }
})

currWord.addEventListener("keypress", (e) => { //...handle all other keypresses
    if (e.key == " " || e.key== "Enter") {
        e.preventDefault();
    }
    // 
    document.querySelector("#timer svg circle").style.animation = "timer 60s linear 0s 1 reverse  " //start timer
    timerTick();



  
    checkWord(e.key)
  

    if ((e.key == ' ' || e.code == 'Enter') && (currWord.innerText != "" && currWord.innerText != " ")) {
        e.preventDefault();

        //move the word to grey area after clicking spacebar
       enteredText.innerHTML = enteredText.innerHTML + "" + `<span class=${isCorrect ? "" : "wrong-word"}>${currWord.innerText}</span>`;

       //update stats
        if (isCorrect) { wpm++;cpm=cpm + currWord.innerText.length }

        // display the stats
        document.querySelector(".words.counter span").innerText = wpm;
        document.querySelector(".chars.counter span").innerText = cpm;
        document.querySelector(".accuracy.counter span").innerText = getAccuracy();

        currWord.innerText = '';
        testSpans[i].remove(); // remove the current word from the display 
        i++; j = 0;// move iterator to next word
    }
    else if (e.key == "Backspace" && currWord.innerText.length) {
     

        if (currWord.innerText.length == 1) {
           
            testSpans[i].innerText = testWords[i][--j] + testSpans[i].innerText
            currWord.innerText = "";
        }
    
        else if (isCorrect) {


            if (currWord.classList.contains("wrong-word")) {
                currWord.classList.remove("wrong-word");

            }

            else {
                testSpans[i].innerText = testWords[i][--j] + testSpans[i].innerText  // append the letter to the untyped text
            }

        }
    }
    else {
        document.querySelector(".test").classList.remove("stop");
        if (isCorrect) {
            currWord.classList.remove("wrong-word");
            e.key == testSpans[i].innerText[0] && (testSpans[i].innerText = testSpans[i].innerText.slice(1));
            j++;

        }

        else if (!isCorrect) {
            currWord.classList.add("wrong-word");
        }
    }
})








// ........timer trigger
let timerTriggered = false;
let sec = 60;
const timerTick = () => {
    if (!timerTriggered) {
        timerTriggered = true;


        let intId = setInterval(() => {// ticking of the clock per second
            document.querySelector("#timer .sec-count").innerText = sec >= 1 ? --sec : 0;
        }, 1000);

        setTimeout(() => {// for stoping the timer
            clearInterval(intId);
            timerTriggered = false;
            timeOver();
        }, 60000);

    }

}




//..........................................timeOver................................
const trophies = [
    {
        name: "snail", imgsrc: "snail.gif", min: 0
    },
    {
        name: "Octupus", imgsrc: "Octopus.gif", min: 31
    },
    {
        name: "T-Rex", imgsrc: "T-Rex.gif", min: 46
    }


]


let result = document.querySelector(".result");
const timeOver = () => {
    showResult();
    currWord.setAttribute("contenteditable", "false")
    document.querySelector(".page").classList.add("blur");

}



const showResult = () => {

    for (let trophy of trophies) {
        if (wpm >= trophy.min) {
            result.querySelector("img").setAttribute("src", trophy.imgsrc)
            result.querySelector(".trophy").innerText = trophy.name;
            result.querySelector(".wpm").innerText = wpm;
            result.querySelector(".cpm").innerText = cpm;
            result.querySelector(".acc").innerText = getAccuracy();
        }
    }


    result.style.display = "flex"

}

const getAccuracy = () => {
    let totalEntered = enteredText.querySelectorAll("span").length
    let accuracy = wpm / totalEntered * 100;
    accuracy = Math.floor(accuracy * 10) / 10; // truncating to 1 decimal place
    return accuracy;
}





//..............try again........................................................
const retryBtn = document.querySelector(".try-again");
retryBtn.addEventListener("click", () => {
    tryAgain();
})
const tryAgain = () => {  // reseting everything to default and getting a new paragraph
    result.style.display = "none";
    document.querySelector(".test-text").innerText = testString;
    toSpans(".test-text");
    testSpans = document.querySelectorAll(".test-text span");
    currWord.innerText = "";
    enteredText.innerText = "";
    wpm = 0;
    cpm = 0;
    sec = 60;
    i = 0; j = 0;

    document.querySelector(".test").classList.add("stop");

    document.querySelector("#timer .sec-count").innerText = sec;
    document.querySelector("#timer circle").style.animation="none";
    document.querySelector(".words.counter span").innerText = 0;
    document.querySelector(".accuracy.counter span").innerText = 0;
    document.querySelector(".page").classList.remove("blur")
    getParagraph();

}