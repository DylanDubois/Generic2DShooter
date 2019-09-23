let scores;

$.getJSON('https://generic2dshooter.firebaseio.com/.json', function (data) {
    //data is the JSON string
    console.log(data);

    setScoresList(data);
});


const $scores = $('.scores ol');
function setScoresList(data) {
    scores = data;

    Object.keys(data).forEach(score => {
        console.log(scores[score]);
        $scores.append(`<li>${scores[score].name}: ${scores[score].value}</li>`);
    })
}



