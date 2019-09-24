let scores;
let scoreKeys;

$.getJSON('https://generic2dshooter.firebaseio.com/.json', function (data) {
    //data is the JSON string
    console.log(data[Object.keys(data)[0]]);
    scores = data[Object.keys(data)[0]];

    setScoresList(scores);
});


const $scores = $('.scores ol');
function setScoresList(data) {
    scoreKeys = Object.keys(data).sort(function (a, b) { return data[b].value - data[a].value });

    console.log(scoreKeys);
    scoreKeys.forEach(score => {
        console.log(scores[score]);
        $scores.append(`<li>${scores[score].name}: ${scores[score].value}</li>`);
    })
}

function updateHighScores(score) {
    console.log("high scores updated", score);



    //     $.post('https://generic2dshooter.firebaseio.com/.json',
    //   JSON.stringify(scores),
    //   function () {
    //     alert("success");
    //   }
    // );

    if (Object.keys(scores).length < 5) {
        let userName = 'Anon';
        userName = prompt('Enter your name');
        scores[Date.now()] = { name: userName, value: score };
    } else {
        let newHighScore = false;
        Object.keys(scores).forEach((s, i) => {
            console.log(scores[s].value);
            if (!newHighScore && score > scores[s].value && i < 5) {
                console.log(i);
                newHighScore = true;
                let userName = 'Anon';
                userName = prompt('Enter your name');
                scores[Date.now()] = { name: userName, value: score };
            }
        })
    }


    console.log(scores);
    let scoreKeys = Object.keys(scores).sort((a, b) => { return scores[b].value - scores[a].value }).slice(0, 5);
    console.log(scoreKeys);
    let finalScores = {};
    scoreKeys.forEach(scoreKey => {
        finalScores[scoreKey] = scores[scoreKey];
    });


    $.ajax({
        url: 'https://generic2dshooter.firebaseio.com/.json',
        type: 'DELETE',
        success: function () {
            $.post('https://generic2dshooter.firebaseio.com/.json',
                JSON.stringify(finalScores),
                function () {
                }
            );
        },
    });


}

