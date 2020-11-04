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


//我同学sjc，从网上搜来的函数
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

/**
 * 获得bb上做的题目，也标注了自己选了什么，把它们下载为一个文本文件，方便自己复习
 * 浏览器右键--查看--console--把整个js文件的文字复制到浏览器的的console--回车
 * 做好的答案是不是正确的那个页面，我发现浏览器右键另存为，存成一个mhtml文件，是可以查看的
 * @return
 */
function getBBQuestions(debug, download_txt, download_xml, download_json) {
    debug = debug || false;
    download_txt = download_txt || true;
    download_xml = download_xml || false;
    download_json = download_json || false;

    console.log("debug: " + debug);
    // if (debug==null)debug=false;
    curriculum = document.getElementById("crumb_1").textContent;
    keyValueTable = document.getElementsByClassName("key-valueTable")[0];
    // instructionsContainer = document.getElementById("instructionsContainer_7512754_1_150583513_1");
    descripContainer = keyValueTable.getElementsByClassName("vtbegenerated")[0];
    if (descripContainer == null) descrip = "无描述";
    else descrip = descripContainer.textContent;

    pageTitleHeader = document.getElementById("pageTitleHeader");
    pageTitleText = document.getElementById("pageTitleText").textContent;
    curriculum = curriculum.trim();
    pageTitleText = pageTitleText.trim();
    if (download_txt) {
        outData = "标题: " + pageTitleText + "\n";
        outData += "描述: " + descrip + "\n";
    }
    if (download_xml) {
        outXmlData = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        outXmlData += `<main>\n`;
        outXmlData += `<title>${pageTitleText}</title>\n`;
        outXmlData += `<description>${descrip}</description>\n`;

    }
    let dataCollectionContainer = document.getElementById("dataCollectionContainer");
    let fieldsets = dataCollectionContainer.getElementsByTagName("fieldset");
    let legendVisibles = dataCollectionContainer.getElementsByClassName("legend-visible");
    if (debug)
        console.log("getBBQuestions");
    if (download_json) {
        /**
         *
         * @type {{questions: [], description: string, title: string}}
         */
        outObj = {
            "title": pageTitleText,
            description: descrip,
            questions: []
        }
    }

    for (let i = 0; i < fieldsets.length; i++) {
        fieldset = fieldsets[i];
        // vtbegenerated inlineVtbegenerated 填空的class
        // vtbegenerated inlineVtbegenerated
        inputs = fieldset.getElementsByTagName("input");
        // input=fieldset.getElementsByTagName("input")[0];
        quesContainer = fieldset.getElementsByClassName("legend-visible")[0];
        quesText = getQuesText(quesContainer);
        // ques = fieldset.getElementsByClassName("legend-visible")[0].textContent;
        answers = [];
        // 一个选项的answers
        table = fieldset.getElementsByTagName("table")[0];
        if (table) {
            // 选择题
            answers = getAnswers(table, true);
        } else {
            // 这是填空题的情况
            // if (debug) console.log("input.value: " + input.value);
            ansStr = "";
            for (j = 0; j < inputs.length; j++) {
                ansStr += "空" + `${j + 1}: ` + inputs[j].value + "\n";
            }
            answers.push(ansStr);
        }

        quesText = quesText.trim();
        // 经过我同学sjc的修改，这个文档更加符合审美了。向他致敬
        quesText = quesText.replaceAll("\n空白 [1-9]\n", "");

        if (download_txt) {
            outData += `${i + 1}.\n`;
            outData += "问题: " + quesText + "\n\n";
            outData = pushAnswersToOutData(answers, outData);
            outData += "-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------n";
        }


        if (download_json) {
            outObj.questions.append({
                que: quesText,
                answers: answers
            });
        }

        type = inputs ? "fillblank" : "single";
        if (download_xml) {
            outXmlData += `<oneQues type="${type}">\n`;
            outXmlData += `<queNum>${i + 1}</queNum>\n`;
            outXmlData += `<question>${quesText}</question>\n`;
            outXmlData = pushAnswersToOutXmlData(answers, outXmlData);
            outXmlData += "</oneQues>\n";
        }


    }
    if (debug)
        console.log("outObj: " + outObj);

    if (download_xml) {
        outXmlData += "</main>\n";
    }

    if (!debug) {
        downloadTxt("bb_" + curriculum + "_" + pageTitleText + ".txt", outData);
        downloadTxt("bb_" + curriculum + "_" + pageTitleText + ".xml", outXmlData);
        downloadTxt("bb_" + curriculum + "_" + pageTitleText + ".json", JSON.stringify(outObj));
    }


}

/**
 * 2020年11月3日update，之前是直接拼接str串，写在txt里面，但是这样后序操作变得好难
 * 所以现在改为把东西写在对象里面，这样要处理就方便多了。然后也可以写到json文件里面
 * @param debug
 * @returns {{questions: *[], description: string, title: string}}
 */
function getBBQuestionObjs(debug) {
    debug = debug || false;
    curriculum = document.getElementById("crumb_1").textContent;
    keyValueTable = document.getElementsByClassName("key-valueTable")[0];

    descripContainer = keyValueTable.getElementsByClassName("vtbegenerated")[0];
    if (descripContainer == null) descrip = "无描述";
    else descrip = descripContainer.textContent;

    pageTitleHeader = document.getElementById("pageTitleHeader");
    pageTitleText = document.getElementById("pageTitleText").textContent;
    curriculum = curriculum.trim();
    pageTitleText = pageTitleText.trim();
    /**
     *
     * @type {{questions: [], description: string, title: string}}
     */
    outObj = {
        title: pageTitleText,
        description: descrip,
        questions: []
    }

    let dataCollectionContainer = document.getElementById("dataCollectionContainer");
    let fieldsets = dataCollectionContainer.getElementsByTagName("fieldset");
    let legendVisibles = dataCollectionContainer.getElementsByClassName("legend-visible");
    if (debug)
        console.log("getBBQuestions");
    questions = [];
    for (let i = 0; i < fieldsets.length; i++) {
        fieldset = fieldsets[i];
        // vtbegenerated inlineVtbegenerated 填空的class
        // vtbegenerated inlineVtbegenerated
        inputs = fieldset.getElementsByTagName("input");
        // input=fieldset.getElementsByTagName("input")[0];
        quesContainer = fieldset.getElementsByClassName("legend-visible")[0];
        quesText = getQuesText(quesContainer);
        // ques = fieldset.getElementsByClassName("legend-visible")[0].textContent;
        answers = [];
        // 一个选项的answers
        table = fieldset.getElementsByTagName("table")[0];
        if (table) {
            // 选择题
            // answers = getAnswers(table, true);
            // 这是一个题目的底下好几个ans
            answers = getAnswerObjs(table, true);
            /**
             *
             * @type {{answers: (*[]|[]), type: string}}
             */
            oneQueAnswersObj = {
                type: "choose",
                answers: answers
            };
            // outObj.type = "choose";
        } else {
            // 这是填空题的情况
            // if (debug) console.log("input.value: " + input.value);
            // ansStr = "";
            for (j = 0; j < inputs.length; j++) {
                answers.push(inputs[j].value);
                // ansStr += "空" + `${j + 1}: ` + inputs[j].value + "\n";
            }
            // answers.push(ansStr);
            // outObj.type = "fill";
            oneQueAnswersObj = {
                type: "fill",
                answers: answers
            };
        }

        quesText = quesText.trim();
        // 经过我同学sjc的修改，这个文档更加符合审美了。向他致敬
        quesText = quesText.replaceAll("\n空白 [1-9]\n", "");

        questions.push({
            que: quesText,
            answers: oneQueAnswersObj
        });


    }

    outObj.questions = questions;
    // console.log("questions:"+questions);
    // console.log("questions[0].answers.length:"+questions[0].answers.length);
    if (debug)
        console.log("outObj: " + outObj);
    // console.log("outObj.questions:"+outObj.questions);
    return outObj;

}

function writeObjToTxtAndDownload(totalObj, debug) {
    console.log("writeObjToTxtAndDownload");
    debug = debug || false;
    outTxt = "标题: " + totalObj.title + "\n";
    outTxt += "描述: " + totalObj.description + "\n";
    questions = totalObj.questions;
    // console.log("questions.length:"+questions.length);

    // oneQueAnswersObj={
    //     type:"choose",
    //     answers:answers
    // };

    for (i = 0; i < questions.length; i++) {
        outTxt += `题号: ${i + 1}\n`
        outTxt += `问题: ${questions[i].que}\n`;
        outTxt += `你的答案: \n`;
        // console.log("questions[i].answers.length: "+questions[i].answers.length);
        answers = questions[i].answers.answers;
        console.log("answers:" + answers);
        console.log("answers.length:" + answers.length);
        // for(j=0;j<answers.length;j++){
        //     outTxt+=`${j+1}. ${answers[j].text} ${answers.type=="choose"?answers[j].chosen?"    :你选择了他":"":""}\n`;
        // }
        outTxt = pushAnswersToOutTxt(outTxt, answers, questions[i].answers.type);
        outTxt += "---------------------------------------------------------------------------------------------------------\n\n";
        // if(questions[i].answers.type="choose"){
        //     answers=questions[i].answers;
        //     for(j=0;j<answers.length;j++){
        //         outTxt+=`${j+1}. ${answers[i].text} ${answers[i].chosen?"    :你选择了他":""}\n`;
        //     }
        // }else {
        //     answers=questions[i].answers;
        //     for(j=0;j<answers.length;j++){
        //         outTxt+=`${j+1}. ${answers[i].text} \n`;
        //     }
        // }
    }
    // if (debug) {
    //     console.log("outTxt: " + outTxt);
    // }
    if (!debug)
        downloadTxt("bb_" + totalObj.title + ".txt", outTxt);


}

function pushAnswersToOutTxt(outTxt, answers, type) {
    console.log("pushAnswersToOutTxt");
    console.log("answers.length: " + answers.length);
    for (j = 0; j < answers.length; j++) {
        // console.log("j+1: ");
        // console.log(j+1);
        // console.log("answers[j].text: "+answers[j].text);
        outTxt += `${j + 1}. `;

        // console.log("answers[j].text: "+answers[j].text);
        if (type === "choose") {
            outTxt += answers[j].text
            outTxt += answers[j].chosen ? "    :你选择了他" : "";
        } else {
            outTxt += answers[j];
        }
        // 如果是填空题 答案在answers里面了 没有chosen 他不是个obj
        outTxt += "\n";
        // outTxt+=`${j+1}. ${answers[j].text} ${answers[j].type=="choose"?answers[j].chosen?"    :你选择了他":"":""}\n`;
    }
    // console.log("outTxt: "+outTxt);
    return outTxt;
}

// https://bbs.csdn.net/topics/300056001
function getQuesText(quesContainer) {
    // legend-visible
    // http://www.voidcn.com/article/p-njqoeeig-bth.html
    // innerText 这个有回车
    // console.log("quesContainer.innerText: " + quesContainer.innerText);


    return quesContainer.innerText;


}

function showAnswers(answers) {
    console.log("answers:");
    for (let i = 0; i < answers.length; i++) {
        console.log(answers[i] + "\n");
    }
}

function pushAnswersToOutData(answers, outData, debug) {
    debug = debug || false;
    // console.log("answers:" + answers);
    outData += "你的答案: \n";
    for (let i = 0; i < answers.length; i++) {
        // console.log(answers[i] + "\n");
        ans = answers[i].trim();
        // console.log("ans: "+ans);
        outData += ans + "\n";
    }
    return outData;
}


function frontDelStr(oldStr, dontWant) {

    if (dontWant === "") {
        return oldStr;
    }
    oldStrLen = (oldStr).length;
    dontWantLen = (dontWant).length;
    minLen = Math.min(oldStrLen, dontWantLen);

    iOld = 0;
    iDont = 0;

    iRes = 0;
    iNow = 0;
    while (true) {


        if (!(oldStr[iOld] === dontWant[iDont])) {
            return oldStr.substring(iRes, oldStrLen);
        }

        iNow++;
        if (iNow - iRes === dontWantLen) {
            iRes += dontWantLen;

        }
        if (iDont === minLen - 1 || iOld === minLen - 1)
            return oldStr.substring(iRes, oldStrLen);

        iOld++;
        iDont++;

    }
}

function backDelStr(oldStr, dontWant) {
    //todo ,completed
    if (dontWant === "") {
        return oldStr;
    }
    oldStrLen = (oldStr).length;
    dontWantLen = (dontWant).length;
    iOld = oldStrLen - 1;
    iDont = dontWantLen - 1;

    iRes = oldStrLen;
    iNow = oldStrLen;
    while (true) {


        if (!(oldStr[iOld] === dontWant[iDont])) {
            return oldStr.substring(0, iRes);
        }

        iNow -= 1;
        if (iRes - iNow === dontWantLen) {
            iRes -= dontWantLen;

        }
        // https://www.w3school.com.cn/js/jsref_substring.asp
        if (iDont === 0 || iOld === 0)
            return oldStr.substring(0, iRes);

        iOld--;
        iDont--;

    }

}

function test() {

    console.log(frontDelStr("1234", "12"));
}

function pushAnswersToOutXmlData(answers, outXmlData) {

    outXmlData += `<select>\n`;
    for (let i = 0; i < answers.length; i++) {

        ans = answers[i];
        if (ans.endsWith(":你选择了他")) {
            ans = backDelStr(ans, " :你选择了他");

            outXmlData += `<option>${ans.trim()}<choose>true</choose></option>\n`
        } else {
            outXmlData += `<option>${ans.trim()}<choose>false</choose></option>\n`
        }

    }
    outXmlData += "</select>\n";
    return outXmlData;
}

function getAnswers(table, debug) {
    // console.log("table:"+table);
    debug = debug || false;
    if (debug) console.log("getAnswers");
    answers = [];
    tbody = table.getElementsByTagName("tbody")[0];
    if (tbody == null) {
        console.log("no tbody");
        return answers;
    }
    trs = tbody.getElementsByTagName("tr");

    for (i = 0; i < trs.length; i++) {
        tds = trs[i].getElementsByTagName("td");

        isChecked = tds[0].getElementsByTagName("input")[0].checked;

        labels = tds[2].getElementsByTagName("label");

        ansLabel = labels[0];

        if (ansLabel == null) continue;
        ans = ansLabel.textContent;

        if (isChecked)
            ans = ans + " :你选择了他";
        // if (debug) {
        //     console.log("ans:" + ans);
        // }

        answers.push(ans.trim());
    }
    return answers;
}


/**
 * 获得一个题目下面的很多个选项和答案
 * @param table
 * @param debug
 * @returns {[]|*[]}
 */
function getAnswerObjs(table, debug) {
    // console.log("table:"+table);
// 如果是选择题 有choosen
    debug = debug || false;
    if (debug) console.log("getAnswers");
    answers = [];
    tbody = table.getElementsByTagName("tbody")[0];
    if (tbody == null) {
        console.log("no tbody");
        return answers;
    }
    trs = tbody.getElementsByTagName("tr");

    for (i = 0; i < trs.length; i++) {
        tds = trs[i].getElementsByTagName("td");

        isChecked = tds[0].getElementsByTagName("input")[0].checked;

        labels = tds[2].getElementsByTagName("label");

        ansLabel = labels[0];


        if (ansLabel == null) continue;
        ans = ansLabel.textContent.trim();
        ansObj = {
            text: ans
        };
        if (isChecked) {
            ansObj.chosen = true;
        } else {
            ansObj.chosen = false;
        }
        // ans = ans + " :你选择了他";
        // if (debug) {
        //     console.log("ans:" + ans);
        // }


        answers.push(ansObj);
    }
    return answers;
}


// getBBQuestions(true);
// getBBQuestionObjs(true);
bbQuesObj = getBBQuestionObjs(true);
// writeObjToTxtAndDownload(bbQuesObj);
downloadTxt("bb_" + bbQuesObj.title + ".json", JSON.stringify(bbQuesObj));