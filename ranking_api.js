function postRank(score, name, cb) {
    var script = document.createElement("script");
    script.src = "https://script.google.com/macros/s/AKfycbx1Olm6pAbkxYMmxId1uLMVMsxmRdb6kLmTtbMZuDcK15XSPQ0/exec";
    script.src += "?score=" + score + "&name=" + name + "&time=" + Date.now();
    var name = "_callback";
    while (window[name]) name = "_" + name;
    script.src += "&callback=" + name;
    window[name] = function(json) {
        cb(json);
        delete window[name];
    }
    document.body.appendChild(script).remove();
}