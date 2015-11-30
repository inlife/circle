var stage = new createjs.Stage("mainCanvas");

function init() {

    var canvasW = 640,
        canvasH = 480;

    canvas = document.getElementById("mainCanvas");
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete
    canvasW = canvas.width;
    canvasH = canvas.height;

    createjs.Touch.enable(stage);
    createjs.Ticker.setFPS(60);

    var circle = new createjs.Shape();
    circle.graphics.beginFill("#E16B6B").drawCircle(0, 0, 100);
    circle.x = canvasW / 2;
    circle.y = canvasH / 2;

    var dashed = new createjs.Shape();
    dashed.graphics.beginStroke("#E16B6B").setStrokeDash([5, 5], 0).beginFill("#FAE9E9").drawCircle(0, 0, 100);
    dashed.x = canvasW / 2;
    dashed.y = canvasH / 2;
    stage.addChild(dashed);
    stage.addChild(circle);

    var score = new createjs.Text();
    score.font = "64px proxima_nova_rgregular, helvetica neue, helvetica, verdana";
    score.color = "#818181";
    score.text = "2,232";
    var scorebounds = score.getBounds();
    score.x = canvasW / 2 - scorebounds.width / 2;
    score.y = 50;
    stage.addChild(score);

    var message = new createjs.Text();
    message.font = "64px proxima_nova_rgregular";
    message.color = "#818181";
    message.text = "never give up";
    var msgbounds = message.getBounds();
    message.x = canvasW / 2 - msgbounds.width / 2;
    message.y = canvasH - 150;
    stage.addChild(message);

    var mooving = false;

    circle.on("pressmove", function(evt) {
        evt.target.x = evt.stageX;
        evt.target.y = evt.stageY;
    });
    circle.on("pressup", function(evt) { console.log("up"); })

    // Stage will pass delta when it calls stage.update(arg)
    // which will pass them to tick event handlers for us in time based animation.
    dashed.on("tick", function(event) {
        // var x = Math.random() - 0.5;
        // var y = Math.random() - 0.5;
        // var delta = event.delta;
        // dashed.x += delta/1000 * 100*x;
        // dashed.y += delta/1000 * 100*y;
        // //if (circle.x > stage.canvas.width) { circle.x = 0; }
    });

    function dashmove(obj) {
        var newx = Math.random() * (canvasW - 250) + 100;
        var newy = Math.random() * (canvasH - 250) + 100;

        var time = Math.max(2500, Math.random() * 1000);

        createjs.Tween.get(obj)
            .to({ x: newx, y: newy }, time, createjs.Ease.quadInOut)
            .call(function() {
                dashmove(obj);
            });
    }

    dashmove(dashed);

    // createjs.Tween.get(dashed)
    //   .to({ x: 400 }, Math.max(1000, Math.random() * 10000), createjs.Ease.getPowInOut(4))
    //   .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
    //   .to({ alpha: 0, y: 225 }, 100)
    //   .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
    //   .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));
    
    createjs.Ticker.on("tick", tick);
}

function tick(event) {
    stage.update(event);
}
