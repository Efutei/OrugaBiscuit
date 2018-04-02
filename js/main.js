// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    startImage: './img/orugaface.png',
    oruga: './img/oruga_sprite.png',
    biscuit: './img/sweets_biscuit.png',
    antenna: './img/tunotyakuramugattai.png',
    bgImg: './img/bg.png',
    mark: './img/mark_exclamation.png',
    gameOverImage: './img/dontstop.jpg',
    howto: './img/howto.png',
    griffon: './img/biscuit_gundam.png'
  },
  sound: {
    hit: './sound/catch.mp3',
    bgm: './sound/Survivor.mp3',
    dead: './sound/dead.mp3',
    roar: './sound/roar.mp3'
  },
  spritesheet: {
    "oruga":
    {
      // フレーム情報
      "frame": {
        "width": 210, // 1フレームの画像サイズ（横）
        "height": 339, // 1フレームの画像サイズ（縦）
        "cols": 6, // フレーム数（横）
        "rows": 2, // フレーム数（縦）
      },
      // アニメーション情報
      "animations" : {
        "oruga_charge": { // アニメーション名
          "frames": [0,1,2,3,4,5], // フレーム番号範囲
          "next": "oruga_charge", // 次のアニメーション
          "frequency": 2, // アニメーション間隔
        },
        "oruga_throw": { // アニメーション名
          "frames": [6,7,8,9,10], // フレーム番号範囲
          "next": null, // 次のアニメーション
          "frequency": 2, // アニメーション間隔
        },
        "oruga_catch": { // アニメーション名
          "frames": [10,9,8,7,6], // フレーム番号範囲
          "next": "oruga_charge", // 次のアニメーション
          "frequency": 2, // アニメーション間隔
        },
      }
    },
    "antenna":
    {
      // フレーム情報
      "frame": {
        "width": 140, // 1フレームの画像サイズ（横）
        "height": 140, // 1フレームの画像サイズ（縦）
        "cols": 2, // フレーム数（横）
        "rows": 1, // フレーム数（縦）
      },
      // アニメーション情報
      "animations" : {
        "rotation": { // アニメーション名
          "frames": [0,1], // フレーム番号範囲
          "next": "rotation", // 次のアニメーション
          "frequency": 2, // アニメーション間隔
        },
      }
    }
  }
};
var SCREEN_WIDTH = 465;
var SCREEN_HEIGHT = 665;
var score = 0;
var isAntennaThrown = false;
var faraway = false;
var getBiscuit = false;
var thisResult;
var gotRank = false;
var firstPlay = true;

phina.define('StartImage', {
  superClass: 'Sprite',
  init: function(){
      this.superInit('startImage', 700, 428);
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_WIDTH / 2 + 113;
  }
});

phina.define('TitleScene', {
  superClass: 'DisplayScene',
  /**
   * @constructor
   */
  init: function (params) {
    this.superInit(params);

    params = ({}).$safe(params, phina.game.TitleScene.defaults);

    this.backgroundColor = params.backgroundColor;
    this.startImage = StartImage().addChildTo(this);

    this.fromJSON({
      children: {
        titleLabel: {
          className: 'phina.display.Label',
          arguments: {
            text: params.title,
            fill: params.fontColor,
            stroke: "white",
            fontSize: 72,
          },
          x: this.gridX.center(),
          y: this.gridY.span(2.2),
        }
      }
    });

    if (params.exitType === 'touch') {
      this.fromJSON({
        children: {
          touchLabel: {
            className: 'phina.display.Label',
            arguments: {
              text: "TOUCH START",
              fill: params.fontColor,
              stroke: "white",
              fontSize: 48,
            },
            x: this.gridX.center(),
            y: this.gridY.span(14.5),
          },
        },
      });

      this.on('pointend', function () {
        this.exit();
      });
    }
  }

});

phina.define("HowtoScene", {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();

    this.backgroundColor = '#0F0';
    this.bg = Bg().addChildTo(this);
    var howto = Sprite('howto', 266, 263).addChildTo(this);
    howto.x = SCREEN_WIDTH / 2;
    howto.y = SCREEN_HEIGHT / 2;
    howto.scaleX = 1.5;
    howto.scaleY = 1.5;
  },
  update: function(){
    if(!firstPlay){
      this.exit();
    }
  },
  onpointstart: function() {
    this.exit();
  },
});

function getRank(json){
  console.log(json);
  gotRank = true;
  thisResult.messageLabel.text = "Rank: " + json.rank + " / " + json.total;
}
// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function () {
    this.superInit();
    // 背景色を指定
    this.backgroundColor = '#0F0';
    this.bg = Bg().addChildTo(this);
    this.gauge = PowerGauge().addChildTo(this);
    this.oruga = Oruga().addChildTo(this);
    this.animOruga = FrameAnimation('oruga').attachTo(this.oruga);
    this.animOruga.gotoAndPlay('oruga_charge');
    this.oruga.scaleX = 0.8;
    this.oruga.scaleY = 0.8;
    this.popBiscuit();
    this.antenna = Antenna().addChildTo(this);
    this.animAntenna = FrameAnimation('antenna').attachTo(this.antenna);
    this.animAntenna.gotoAndPlay('rotation');
    this.antenna.scaleX = 0.5;
    this.antenna.scaleY = 0.5;
    this.mark = Mark().addChildTo(this);
    this.mark.alpha = 0;
    this.scoreText = ScoreText().addChildTo(this);
    isAntennaThrown = false;
    getBiscuit = false;
    faraway = false;
    score = 0;
    SoundManager.setVolume(0.8);
    SoundManager.setVolumeMusic(0.1);
    SoundManager.playMusic('bgm');
    gotRank = false;
    firstPlay = false;
  },
  update: function (app) {
    var p = app.pointer;
    if (p.getPointingStart()) {
      if(!isAntennaThrown){
        this.clickThrow();
      }else{
        this.clickCatch();
      }
    }
    if(this.antenna.checkHit(this.biscuit.x, this.biscuit.y)){
      if(!getBiscuit){
        score += 1;
        getBiscuit = true;
        SoundManager.setVolume(0.4);
        SoundManager.play('hit');
      }
      this.biscuit.remove();
    }
    if(this.antenna.x > this.biscuit.x){
      faraway = true;
    }
    if(faraway && this.checkMarkPoint()){
      this.mark.alpha = 1;
    }else{
      this.mark.alpha = 0;
    }
    if(faraway && this.antenna.x < 0){
      postRank(score, "noname", getRank);
      SoundManager.stopMusic();
      this.exit({
        score: score,
        message:　"止まるんじゃねぇぞ...",
        hashtags: 'オルガとビスケット'
      });
    }
  },
  clickThrow: function(){
    isAntennaThrown = true;
    this.animOruga.gotoAndPlay('oruga_throw');
    this.antenna.setPosition();
    this.antenna.setPower(this.gauge.checkValue());
    SoundManager.setVolume(0.2);
    SoundManager.play('roar');
  },
  clickCatch: function(){
    this.animOruga.gotoAndPlay('oruga_catch');
    if(faraway && this.checkAntennaInHitbox()){
      if(getBiscuit){
        this.popBiscuit();
      }
      this.antenna.goTofinger();
      isAntennaThrown = false;
      getBiscuit = false;
      faraway = false;
      this.antenna.speed += 0.1;
    }
  },
  popBiscuit: function () {
    if(Random.randint(0,9) == 0){
      this.biscuit = Griffon().addChildTo(this);
    }else{
      this.biscuit = Biscuit().addChildTo(this);
    }
    var x = 300, y = 170, rnd1 = Math.random() * Math.PI * 2, rnd2 = Math.random();
    this.biscuit.x = x + Math.cos(rnd1) * 100 * rnd2;
    this.biscuit.y = y + Math.sin(rnd1) * 125 * rnd2;
    /*this.biscuit.x = Random.randint(140, 340);
    this.biscuit.y = Random.randint(45, 295);*/
  },
  checkAntennaInHitbox: function(){
    return this.antenna.x > 175 && this.antenna.x < 240 && this.antenna.y > SCREEN_HEIGHT - 315;
  },
  checkMarkPoint: function(){
    return this.antenna.x > 175 && this.antenna.x < 250 && this.antenna.y > SCREEN_HEIGHT - 315;
  }
});

phina.define('Bg', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('bgImg', SCREEN_WIDTH, SCREEN_HEIGHT);
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT / 2;
  }
});

phina.define('Oruga', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('oruga', 210, 399);
    this.x = 140;
    this.y = SCREEN_HEIGHT - 125;
  }
});

phina.define('Biscuit', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('biscuit', 60, 60);
  }
});

phina.define('Griffon', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('griffon', 80, 80);
  }
});

phina.define('Mark', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('mark', 60, 60);
    this.alpha = 0;
    this.x = 155;
    this.y = SCREEN_HEIGHT - 265;
  }
});

phina.define('PowerGauge', {
  superClass: 'Gauge',
  init: function () {
    this.superInit();
    this.x = SCREEN_WIDTH - 200;
    this.y = SCREEN_HEIGHT - 120;
    this.width = 120;
    this.height = 30;
    this.cornerRadius = 10;
    this.maxValue = 100;
    this.value = 100;
    this.fill = 'skyblue';
    this.stroke = 'silver';
    this.strokeWidth = 5;
    this.gaugeUp = false;
    this.rotation = 270;
  },
  update: function () {
    if(!isAntennaThrown){
      this.gaugeCharge();
    }
  },
  gaugeCharge: function () {
    if (this.isFull()) {
      this.gaugeUp = false;
    }
    if (this.isEmpty()) {
      this.gaugeUp = true;
    }
    if (this.gaugeUp) {
      this.addValue();
    } else {
      this.lessValue();
    }
  },
  addValue: function () {
    if (this.value <= 100) {
      this.value += 3;
    }
    if (this.value >= 100) {
      this.value = 100;
    }
  },
  lessValue: function () {
    if (this.value >= 0) {
      this.value -= 3;
    }
    if (this.value <= 0) {
      this.value = 0;
    }
  },
  checkValue: function(){
    return this.value / 125 + 0.2;
  }
});

phina.define('Antenna', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('antenna', 140, 140);
    this.setPosition();
    this.charged();
    this.power = 1;
    this.speed = 1;
  },
  update: function () {
    if(this.x == 60 && !isAntennaThrown){
      this.charged();
    }
    if(isAntennaThrown){
      this.thrown(this.power, this.speed);
    }
  },
  thrown: function (power, speed) {
    if (!speed) speed = 1;
    var deg = -Math.PI / 180 * 55;
    var x = Math.cos(Math.PI * 1.2 + Math.PI * this.antennaCnt / 32) * 210,
        y = Math.sin(Math.PI * 1.2 + Math.PI * this.antennaCnt / 32) * 140;
    var xx = Math.cos(deg) * x - Math.sin(deg) * y,
        yy = Math.sin(deg) * x + Math.cos(deg) * y;
    xx += 270, yy *= power, yy += 280 + (1 - power) * 150;
    if (this.antennaCnt < 51) {
      this.x = xx, this.y = yy;
    } else if ((this.antennaCnt | 0) >= 51) {
      if ((this.antennaCnt | 0) == 51) this.vx = xx - this.x, this.vy = yy - this.y;
      this.x += this.vx, this.y += this.vy;
    }
    this.antennaCnt += speed;
  },
  setPosition: function () {
    this.antennaCnt = 0;
  },
  checkHit: function(x, y){
    this.distance = Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y - y,2));
    if(this.distance < 65){
      return true;
    }
    return false;
  },
  charged: function(){
    this.x = 60;
    this.y = SCREEN_HEIGHT - 253;
    this.tweener
    .to({
      x: 120
    },200,"swing")
    .to({
      x: 60
    },200,"swing")
    .play();
  },
  setPower: function(power){
    this.power = power;
  },
  goTofinger: function(){
    this.tweener
    .clear()
    .to({
      x: 60,
      y: SCREEN_HEIGHT - 253
    },400,"swing")
    .play();
  }
});

phina.define('ScoreText',{
  superClass: 'Label',

  init: function(){
    this.superInit();
    this.x = SCREEN_WIDTH - (this.width + 70);
    this.y = 50;
    this.fill = "#FFFFFF";
    this.stroke = 'black';
    this.strokeWidth = 3;
  },
  update: function(){
    this.text = "Score: " + score + " ";
    this.x = SCREEN_WIDTH - (this.width + 40);
  }
});

phina.define('GameOverImage', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('gameOverImage', 400, 300);
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_WIDTH / 2 + 100;
  }
});

// リザルトシーン上書き
phina.define('ResultScene', {
  superClass: 'DisplayScene',
  /**
   * @constructor
   */
  init: function(params) {
    params = ({}).$safe(params, phina.game.ResultScene.defaults);
    this.superInit(params);

    var message = params.message.format(params);

    this.backgroundColor = params.backgroundColor;
    thisResult = this;
    this.gameOverImage = GameOverImage().addChildTo(this);
    SoundManager.setVolumeMusic(0.8);
    SoundManager.playMusic('dead',1000,false);

    this.fromJSON({
      children: {
        scoreText: {
          className: 'phina.display.Label',
          arguments: {
            text: 'Score: '+params.score,
            fill: params.fontColor,
            stroke: null,
            fontSize: 64,
          },
          x: this.gridX.span(8),
          y: this.gridY.span(1.5),
        },

        messageLabel: {
          className: 'phina.display.Label',
          arguments: {
            text: message,
            fill: params.fontColor,
            stroke: null,
            fontSize: 32,
          },
          x: this.gridX.span(8),
          y: this.gridY.span(3.5),
        },

        shareButton: {
          className: 'phina.ui.Button',
          arguments: [{
            text: '★',
            width: 128,
            height: 128,
            fontColor: params.fontColor,
            fontSize: 50,
            cornerRadius: 64,
            fill: 'rgba(240, 240, 240, 0.5)',
            // stroke: '#aaa',
            // strokeWidth: 2,
          }],
          x: this.gridX.center(-3),
          y: this.gridY.span(14),
        },
        playButton: {
          className: 'phina.ui.Button',
          arguments: [{
            text: '▶',
            width: 128,
            height: 128,
            fontColor: params.fontColor,
            fontSize: 50,
            cornerRadius: 64,
            fill: 'rgba(240, 240, 240, 0.5)',
            // stroke: '#aaa',
            // strokeWidth: 2,
          }],
          x: this.gridX.center(3),
          y: this.gridY.span(14),

          interactive: true,
          onpush: function() {
            SoundManager.stopMusic();
            this.exit();
          }.bind(this),
        },
      }
    });

    if (params.exitType === 'touch') {
      this.on('pointend', function() {
        this.exit();
      });
    }

    this.shareButton.onclick = function() {
      var text;
      if(gotRank){
        text = 'Score: {0}\n{1}\n{2}\n'.format(params.score, this.parent.messageLabel.text, "止まるんじゃねぇぞ...");
      }else{
        text = 'Score: {0}\n{1}\n'.format(params.score, "止まるんじゃねぇぞ...");
      }
      var url = phina.social.Twitter.createURL({
        text: text,
        hashtags: params.hashtags,
        url: params.url,
      });
      window.open(url, 'share window', 'width=480, height=320');
    };
  },
});

// メイン処理
phina.main(function () {
  // アプリケーション生成
  var app = GameApp({
    title: 'オルガと\nビスケット',
    startLabel: 'titleScene',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    fontColor: '#663333',
    backgroundColor: '#009966',
    scenes: [
      {
        className: 'TitleScene',
        label: 'titleScene',
        nextLabel: 'howtoScene',
      },
      {
        className: 'HowtoScene',
        label: 'howtoScene',
        nextLabel: 'mainScene',
      },
      {
        className: 'MainScene',
        label: 'mainScene',
        nextLabel: 'resultScene',
      },
      {
        className: 'ResultScene',
        label: 'resultScene',
        nextLabel: 'titleScene',
      },
    ]
  });
  //iphone用ダミー音
  app.domElement.addEventListener('touchend', function dummy() {
    var s = phina.asset.Sound();
    s.loadFromBuffer();
    s.play().stop();
    app.domElement.removeEventListener('touchend', dummy);
  });
  // アプリケーション実行
  app.run();
});
