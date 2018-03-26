// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    startImage: './img/startImage.jpg',
    oruga: './img/oruga.jpg',
    biscuit: './img/biscuit.jpg'
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
    this.backgroundColor = '#444';
    this.gauge = PowerGauge().addChildTo(this);
  },
});

phina.define('Oruga', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('oruga', 100, 100);
    this.x = 30;
    this.y = SCREEN_HEIGHT - 30;
  },
  update: function(){
  },
  throw: function(){
    return 0;
  },
  charge: function(){
    return 0;
  }
});

phina.define('Biscuit', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('biscuit', 100, 100);
    this.x = 30;
    this.y = 30;
  },
  update: function(){
  },
  taken: function(){
    return 0;
  }
});

phina.define('PowerGauge', {
  superClass: 'Gauge',
  init: function(){
    this.superInit();
    this.x = SCREEN_WIDTH - 120;
    this.y = SCREEN_HEIGHT - 90;
    this.width = 160;
    this.height = 20;
    this.cornerRadius = 10;
    this.maxValue = 100;
    this.value = 0;
    this.fill = 'white';
    this.gaugeColor = 'skyblue';
    this.stroke = 'silver';
    this.strokeWidth = 5;
  },
  update: function(){
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
