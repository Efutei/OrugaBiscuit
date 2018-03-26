// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    startImage: './img/orugaface.png',
    oruga: './img/oruga.jpg',
    biscuit: './img/sweets_biscuit.png',
    antenna: './img/antenna.jpg',
    bgImg: './img/bgraido.png'
  }
};
var SCREEN_WIDTH = 465;
var SCREEN_HEIGHT = 665;

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
            stroke: null,
            fontSize: 58,
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
              stroke: null,
              fontSize: 32,
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
    this.popBiscuit();
    this.antenna = Antenna().addChildTo(this);
  },
  update: function (app) {
    var p = app.pointer;
    if (p.getPointingStart()) {
      this.oruga.throw();
    }
    if(this.antenna.checkHit(this.biscuit.x, this.biscuit.y)){

    }
  },
  popBiscuit: function () {
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
  init: function () {
    this.superInit('oruga', 80, 200);
    this.x = 90;
    this.y = SCREEN_HEIGHT - 100;
  },
  update: function () {
  },
  throw: function () {
    console.log("throw");
  },
  charge: function () {
    return 0;
  }
});

phina.define('Biscuit', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('biscuit', 100, 100);
  }
});

phina.define('BiscuitSpace', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('biscuit', 200, 250);
    this.x = 240;
    this.y = 170;
  }
});

phina.define('PowerGauge', {
  superClass: 'CircleGauge',
  init: function () {
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
  update: function () {
    this.gaugeCharge();
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
  }
});

phina.define('Antenna', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('antenna', 100, 100);
    this.setPosition();
  },
  update: function () {
    this.thrown(1);
  },
  thrown: function (power) {
    var deg = -Math.PI / 180 * 55;
    var x = Math.cos(Math.PI * 1.2 + Math.PI * this.antennaCnt / 32) * 210,
        y = Math.sin(Math.PI * 1.2 + Math.PI * this.antennaCnt / 32) * 140;
    var xx = Math.cos(deg) * x - Math.sin(deg) * y,
        yy = Math.sin(deg) * x + Math.cos(deg) * y;
    xx += 270, yy *= power, yy += 280 + (1 - power) * 150;
    if (this.antennaCnt < 51) {
      this.x = xx, this.y = yy;
    } else if (this.antennaCnt >= 51) {
      if (this.antennaCnt == 51) this.vx = xx - this.x, this.vy = yy - this.y;
      this.x += this.vx, this.y += this.vy;
    }
    this.antennaCnt++;
  },
  setPosition: function () {
    this.antennaCnt = 0;
  },
  checkHit: function(x, y){
    this.distance = Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y - y,2));
    if(this.distance < 30){
      return true;
    }
    return false;
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
