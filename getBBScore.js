function downloadTxt(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}
function getBBScore(){
    pageTitleText=document.getElementById("pageTitleText").textContent.trim();

    ul=document.getElementById("content_listContainer");
    lis=ul.getElementsByTagName("li");
    scoreStrs=[];
    for(i=0;i<lis.length;i++){
        contentListRight=lis[i].getElementsByClassName("contentListRight")[0];
        scoreStr=contentListRight.textContent.trim();
        // console.log("scoreStr:"+ scoreStr);
        scoreStrs.push(scoreStr);
    }
// console.log(JSON.stringify(scoreStrs));
    downloadTxt("bb_score_"+pageTitleText+".json",JSON.stringify(scoreStrs));
}
getBBScore();

