// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    startImage: './img/orugaface.png',
    oruga: './img/oruga_sprite.png',
    biscuit: './img/sweets_biscuit.png',
    antenna: './img/tunotyakuramugattai.png',
    bgImg: './img/bgraido.png',
    mark: './img/mark_exclamation.png'
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
      }
      this.biscuit.remove();
    }
    if(this.antenna.x > this.biscuit.x){
      faraway = true;
    }
    if(faraway && this.checkAntennaInHitbox()){
      this.mark.alpha = 1;
    }else{
      this.mark.alpha = 0;
    }
    if(faraway && this.antenna.x < 75){
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
    this.biscuit = Biscuit().addChildTo(this);
    var x = 300, y = 170, rnd1 = Math.random() * Math.PI * 2, rnd2 = Math.random();
    this.biscuit.x = x + Math.cos(rnd1) * 100 * rnd2;
    this.biscuit.y = y + Math.sin(rnd1) * 125 * rnd2;
    /*this.biscuit.x = Random.randint(140, 340);
    this.biscuit.y = Random.randint(45, 295);*/
  },
  checkAntennaInHitbox: function(){
    return this.antenna.x > 175 && this.antenna.x < 240 && this.antenna.y > SCREEN_HEIGHT - 315;
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
  superClass: 'CircleGauge',
  init: function () {
    this.superInit();
    this.x = SCREEN_WIDTH - 120;
    this.y = SCREEN_HEIGHT - 120;
    this.radius = 60;
    this.maxValue = 100;
    this.value = 100;
    this.fill = 'skyblue';
    this.stroke = 'silver';
    this.strokeWidth = 5;
    this.gaugeUp = false;
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

// メイン処理
phina.main(function () {
  // アプリケーション生成
  var app = GameApp({
    title: 'オルガと\nビスケット',
    startLabel: 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    fontColor: '#663333',
    backgroundColor: '#009966',
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
