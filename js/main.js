// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    startImage: './img/startImage.jpg',
    oruga: './img/oruga.jpg',
    biscuit: './img/sweets_biscuit.png',
    antenna: './img/antenna.jpg',
    bgImg: './img/bgimg.jpg'
  }
};
var SCREEN_WIDTH  = 465;
var SCREEN_HEIGHT = 665;

phina.define('StartImage', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('startImage', 396, 428);
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_WIDTH / 2 + 113;
  }
});

phina.define('TitleScene', {
  superClass: 'DisplayScene',
  /**
   * @constructor
   */
  init: function(params) {
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
            stroke: null,
            fontSize: 64,
          },
          x: this.gridX.center(),
          y: this.gridY.span(1.8),
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
              stroke: null,
              fontSize: 32,
            },
            x: this.gridX.center(),
            y: this.gridY.span(14.8),
          },
        },
      });

      this.on('pointend', function() {
        this.exit();
      });
    }
  }

});

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
    // 背景色を指定
    this.backgroundColor = '#0F0';
    this.bg = Bg().addChildTo(this);
    this.gauge = PowerGauge().addChildTo(this);
    this.oruga = Oruga().addChildTo(this);
    this.popBiscuit();
    //this.antenna = Antenna().addChildTo(this);
    //this.antenna.thrown();
  },
  update: function(app){
    var p = app.pointer;
    if(p.getPointingStart()){
      this.oruga.throw();
    }
  },
  popBiscuit: function(){
    this.biscuit = Biscuit().addChildTo(this);
    this.biscuit.x = Random.randint(140, 340);
    this.biscuit.y = Random.randint(45, 295);
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
  init: function(){
    this.superInit('oruga', 80, 200);
    this.x = 90;
    this.y = SCREEN_HEIGHT - 100;
  },
  update: function(){
  },
  throw: function(){
    console.log("throw");
  },
  charge: function(){
    return 0;
  }
});

phina.define('Biscuit', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('biscuit', 100, 100);
  }
});

phina.define('BiscuitSpace', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('biscuit', 200, 250);
    this.x = 240;
    this.y = 170;
  }
});

phina.define('PowerGauge', {
  superClass: 'CircleGauge',
  init: function(){
    this.superInit();
    this.x = SCREEN_WIDTH - 200;
    this.y = SCREEN_HEIGHT - 120;
    this.radius = 100;
    this.maxValue = 100;
    this.value = 100;
    this.fill = 'skyblue';
    this.stroke = 'silver';
    this.strokeWidth = 5;
    this.gaugeUp = false;
  },
  update: function(){
    this.gaugeCharge();
  },
  gaugeCharge: function(){
    if(this.isFull()){
      this.gaugeUp = false;
    }
    if(this.isEmpty()){
      this.gaugeUp = true;
    }
    if(this.gaugeUp){
      this.addValue();
    }else{
      this.lessValue();
    }
  },
  addValue: function(){
    if(this.value <= 100){
      this.value += 3;
    }
    if(this.value >= 100){
      this.value = 100;
    }
  },
  lessValue: function(){
    if(this.value >= 0){
      this.value -= 3;
    }
    if(this.value <= 0){
      this.value = 0;
    }
  }
});

phina.define('Antenna', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('antenna', 100, 100);
    this.setPosition();
  },
  update: function(){
    this.thrown(1);
  },
  thrown: function(power){
    this.antennaTime += 0.1;
    this.x += Math.cos(this.antennaTime)*20;
    this.y += Math.sin(this.antennaTime)*20;
  },
  setPosition: function(){
    this.x = 90;
    this.y = SCREEN_HEIGHT - 150;
    this.antennaTime = 2/3*Math.PI;
  }
});

// メイン処理
phina.main(function() {
  // アプリケーション生成
  var app = GameApp({
    title: 'オルガとビスケット',
    startLabel: 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    fontColor: '#FCF5F7',
    backgroundColor: '#715454',
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
