/* Citizenship Bridge 音频播放器（无依赖、无追踪；设置只存在本机 localStorage）。
   页面约定：<body data-root="../" data-page="unit|senior">；每题 <article class="card" data-n="001" data-a data-zq data-za>。 */
(function () {
  "use strict";
  var KEY = "cb-audio-settings-v1";
  var body = document.body;
  var ROOT = body.getAttribute("data-root") || "./";
  var PAGE = body.getAttribute("data-page") || "unit";
  var S = { speed: "normal", pause: 5, lang: "en", mode: "qa" };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "{}"); for (var k in saved) if (k in S) S[k] = saved[k]; } catch (e) {}
  if (PAGE !== "senior") { S.lang = "en"; S.mode = "qa"; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  var audio = new Audio();
  audio.preload = "auto";
  var token = 0, timer = null, waking = null;
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var stopbar = document.getElementById("stopbar");

  function src(n, part) {
    if (S.lang === "zh") return ROOT + "audio/zh/q" + n + "-" + part + ".mp3";
    return ROOT + "audio/en/" + S.speed + "/q" + n + "-" + part + ".mp3";
  }
  function has(card, part) {
    if (S.lang === "zh") return card.hasAttribute(part === "question" ? "data-zq" : "data-za");
    return part === "question" || card.hasAttribute("data-a");
  }
  function say(card, msg) { var el = card && card.querySelector(".status"); if (el) el.textContent = msg; }

  function playFile(url, my) {
    return new Promise(function (resolve) {
      if (my !== token) return resolve(false);
      var done = function (ok) { audio.onended = audio.onerror = null; waking = null; resolve(ok); };
      waking = function () { done(false); };
      audio.onended = function () { done(true); };
      audio.onerror = function () { done("error"); };
      audio.src = url;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { done("error"); });
    });
  }
  function wait(sec, my, card, label) {
    return new Promise(function (resolve) {
      var left = Math.round(sec);
      var tick = function () {
        if (my !== token) { waking = null; return resolve(false); }
        if (left <= 0) { waking = null; return resolve(true); }
        if (label) say(card, label + "（" + left + " 秒）");
        left -= 1;
        timer = setTimeout(tick, 1000);
      };
      waking = function () { clearTimeout(timer); resolve(false); };
      tick();
    });
  }
  var current = null;
  function mainLabel(c) {
    return S.mode === "q" ? "▶ 播放题目 → 停顿（自测）" : (has(c, "answer") ? "▶ 题目 → 停顿 → 答案" : "▶ 题目 → 停顿（看文字答案）");
  }
  function setPlaying(on, card) {
    cards.forEach(function (c) {
      if (c !== card) c.classList.remove("playing");
      var m = c.querySelector("[data-play='qa']");
      if (m) m.textContent = (on && c === card) ? "■ 正在播放，点这里停止" : mainLabel(c);
    });
    current = on ? card : null;
    if (card) card.classList.toggle("playing", on);
    body.classList.toggle("is-playing", on);
    if (stopbar) stopbar.classList.toggle("on", on);
  }
  function stop() {
    token += 1;
    clearTimeout(timer);
    audio.pause();
    if (waking) waking();
    cards.forEach(function (c) { c.classList.remove("playing"); say(c, ""); });
    setPlaying(false, null);
  }

  /* 一题：题目 →（停顿）→ 答案。what = "qa" | "q" | "a" */
  async function playCard(card, what, my, inSequence) {
    var n = card.getAttribute("data-n");
    setPlaying(true, card);
    if (inSequence) card.scrollIntoView({ block: "center", behavior: "smooth" });
    var wantA = (what === "qa" || what === "a") && S.mode !== "q";
    if (what === "a" && !has(card, "answer")) { say(card, "这一题没有答案录音，请看上面的文字。"); return true; }
    if (what !== "a") {
      say(card, "正在播放题目…");
      var r = await playFile(src(n, "question"), my);
      if (r === "error") { say(card, "音频没有加载成功，请检查网络后再试。"); return false; }
      if (r === false) return false;
    }
    if (what === "q") { say(card, ""); return true; }
    if (wantA && has(card, "answer")) {
      if (what === "qa") { if (!(await wait(S.pause, my, card, "请您回答"))) return false; }
      say(card, "正在播放答案…");
      var r2 = await playFile(src(n, "answer"), my);
      if (r2 === "error") { say(card, "音频没有加载成功，请检查网络后再试。"); return false; }
      if (r2 === false) return false;
    } else if (what === "qa") {
      var why = S.mode === "q" ? "自测：请您回答" : (S.lang === "zh" ? "这一题没有中文答案录音，请看文字" : "这一题没有答案录音，请看文字");
      if (!(await wait(S.pause, my, card, why))) return false;
    }
    say(card, "");
    return true;
  }

  async function runOne(card, what) {
    if (what === "qa" && current === card) { stop(); return; }
    stop();
    var my = token;
    await playCard(card, what, my, false);
    if (my === token) setPlaying(false, card);
  }
  async function runAll() {
    stop();
    var my = token;
    var list = cards.slice();
    if (S.mode === "q") {  // 自测：打乱顺序
      for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = list[i]; list[i] = list[j]; list[j] = t; }
    }
    for (var k = 0; k < list.length; k++) {
      if (!(await playCard(list[k], "qa", my, true))) break;
      list[k].classList.remove("playing");
      if (k < list.length - 1 && !(await wait(2, my, null, null))) break;
    }
    if (my === token) setPlaying(false, null);
  }

  /* 设置面板 */
  function syncUI() {
    document.querySelectorAll("[data-set]").forEach(function (b) {
      var kv = b.getAttribute("data-set").split("=");
      b.setAttribute("aria-pressed", String(S[kv[0]] === kv[1]));
    });
    var out = document.getElementById("pause-out");
    if (out) out.textContent = S.pause + " 秒";
    var sp = document.getElementById("speed-box");
    if (sp) sp.hidden = S.lang === "zh";
    body.classList.toggle("quiz", S.mode === "q");
    var hint = document.getElementById("mode-hint");
    if (hint) hint.hidden = S.mode !== "q";
    document.querySelectorAll(".card").forEach(function (c) {
      var b = c.querySelector("[data-play='a']");
      if (b) b.disabled = !has(c, "answer");
      var m = c.querySelector("[data-play='qa']");
      if (m) m.textContent = mainLabel(c);
    });
    body.classList.toggle("lang-zh", S.lang === "zh");
  }
  document.querySelectorAll("[data-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      var kv = b.getAttribute("data-set").split("=");
      stop(); S[kv[0]] = kv[1]; save(); syncUI();
    });
  });
  document.querySelectorAll("[data-pause]").forEach(function (b) {
    b.addEventListener("click", function () {
      S.pause = Math.max(1, Math.min(20, S.pause + Number(b.getAttribute("data-pause")))); save(); syncUI();
    });
  });
  cards.forEach(function (c) {
    c.querySelectorAll("[data-play]").forEach(function (b) {
      b.addEventListener("click", function () { runOne(c, b.getAttribute("data-play")); });
    });
  });
  var all = document.getElementById("play-all");
  if (all) all.addEventListener("click", runAll);
  document.querySelectorAll("[data-stop]").forEach(function (b) { b.addEventListener("click", stop); });
  body.classList.add("js");
  syncUI();
  window.CB = { settings: S, stop: stop, audio: audio };  // 供自动化测试读取
})();
