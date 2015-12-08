// window.addEventListener("load", function() {
//     function onTouchPreventDefault(event) { event.preventDefault(); };
//     document.addEventListener("touchmove", onTouchPreventDefault, false);
//     document.addEventListener("touchstart", onTouchPreventDefault, false);
// }, false);


$(document).ready(function() {

    var observer = new FontFaceObserver('Avenir-Black');
    var observer2 = new FontFaceObserver('Avenir-Roman');

    function touchHandlerDummy(e) {
        e.preventDefault();
        return false;
    }
    document.addEventListener("touchstart", touchHandlerDummy, false);
    document.addEventListener("touchmove", touchHandlerDummy, false);
    document.addEventListener("touchend", touchHandlerDummy, false);

    if (typeof console == "undefined") {
        window.console = {
            log: function () {}
        };
    }

    $(function() {
        FastClick.attach(document.body);
    });

    /*
     * ColorLuminance("#69c", 0);       // returns "#6699cc"
     * ColorLuminance("6699CC", 0.2);  // "#7ab8f5" - 20% lighter
     * ColorLuminance("69C", -0.5);    // "#334d66" - 50% darker
     * ColorLuminance("000", 1);       // "#000000" - true black cannot be made lighter!
     */
    function ColorLuminance(hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;
    }

    /**
     * Simple localStorage with Cookie Fallback
     * v.1.0.0
     *
     * USAGE:
     * ----------------------------------------
     * Set New / Modify:
     *   store('my_key', 'some_value');
     *
     * Retrieve:
     *   store('my_key');
     *
     * Delete / Remove:
     *   store('my_key', null);
     */
     
    var store = function store(key, value) {
     
        var lsSupport = false;
        
        // Check for native support
        if (localStorage) {
            lsSupport = true;
        }
        
        // If value is detected, set new or modify store
        if (typeof value !== "undefined" && value !== null) {
            // Convert object values to JSON
            if ( typeof value === 'object' ) {
                value = JSON.stringify(value);
            }
            // Set the store
            if (lsSupport) { // Native support
                localStorage.setItem(key, value);
            } else { // Use Cookie
                createCookie(key, value, 30);
            }
        }
        
        // No value supplied, return value
        if (typeof value === "undefined") {
            // Get value
            if (lsSupport) { // Native support
                data = localStorage.getItem(key);
            } else { // Use cookie 
                data = readCookie(key);
            }
            
            // Try to parse JSON...
            try {
               data = JSON.parse(data);
            }
            catch(e) {
               data = data;
            }
            
            return data;
            
        }
        
        // Null specified, remove store
        if (value === null) {
            if (lsSupport) { // Native support
                localStorage.removeItem(key);
            } else { // Use cookie
                createCookie(key, '', -1);
            }
        }
        
        /**
         * Creates new cookie or removes cookie with negative expiration
         * @param  key       The key or identifier for the store
         * @param  value     Contents of the store
         * @param  exp       Expiration - creation defaults to 30 days
         */
        
        function createCookie(key, value, exp) {
            var date = new Date();
            date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
            document.cookie = key + "=" + value + expires + "; path=/";
        }
        
        /**
         * Returns contents of cookie
         * @param  key       The key or identifier for the store
         */
        
        function readCookie(key) {
            var nameEQ = key + "=";
            var ca = document.cookie.split(';');
            for (var i = 0, max = ca.length; i < max; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
        
    };

    /**
     * Number.prototype.format(n, x)
     * 
     * @param integer n: length of decimal
     * @param integer x: length of sections
     */
    Number.prototype.format = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };
    

    Promise.all([observer.check(), observer2.check()]).then(function () {   
        var GC = new GameController();
        GC.start();

        window.sendPause = function() {
            if (GC.running && GC.started && !GC.paused) {
                GC.pause();
            }
        }

        window.sendResume = function() {
            
        }

        $(window).resize(function() {
            if (GC.running) {
                GC.finish();
            }
        });
    });



    function GameController() {
        var self = this;

        this.stage = null;
        this.running = false;
        this.paused = false;
        this.started = false;


        var canvasW = 640,
            canvasH = 480;

        canvas = document.getElementById("game_canvas");
        canvas.width = document.body.clientWidth; //document.width is obsolete
        canvas.height = document.body.clientHeight; //document.height is obsolete
        canvasW = canvas.width;
        canvasH = canvas.height;

        if (!store('circle_best_score')) {
            store('circle_best_score', 1);
        }

        var swipeImg = new createjs.Bitmap("assets/swipe.png");
        var pauseBtn = new createjs.Bitmap("assets/pause.png");

        var whitePlane = new createjs.Shape();
        whitePlane.graphics.beginFill("#fff").rect(0, 0, canvasW, canvasH);
        whitePlane.alpha = 0;

        // hitarea for pause button
        var hit = new createjs.Shape();
        hit.graphics.beginFill("#000").rect(50, 0, 100, 60);
        pauseBtn.hitArea = hit;

        pauseBtn.on("click", function(evt) {
            if (self.running && self.started && !self.paused) {
                self.pause();
            }
        });

        this.start = function() {
            
            this.running = true;
            this.started = false;

            var stage = new createjs.Stage("game_canvas");
            if (canvasH > canvasW) {
                var modifier = Math.sqrt(Math.sqrt( canvasW / 480 ) * Math.sqrt( canvasH / 720 ));
            } else {
                var modifier = Math.sqrt( canvasW / 720 );
            }

            if (window.devicePixelRatio) {
                // grab the width and height from canvas
                var height = canvas.getAttribute('height');
                var width = canvas.getAttribute('width');
                // reset the canvas width and height with window.devicePixelRatio applied
                canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));
                canvas.setAttribute('height', Math.round( height * window.devicePixelRatio));
                // force the canvas back to the original size using css
                canvas.style.width = width+"px";
                canvas.style.height = height+"px";
                // set CreateJS to render scaled
                stage.scaleX = stage.scaleY = window.devicePixelRatio;
                stage.update();
            }

            createjs.Touch.enable(stage);
            createjs.Ticker.setFPS(60);

            var colors = ["#FFA69E", "#98D2EB", "#AFE0CE"];
            var color = colors[Math.floor(Math.random() * colors.length)];
            var lastPhraseId = -1;
            var phrases = [
                "dont let go", 
                "never give up" , 
                "just do it",
                "your fingers are enemies",
                "10/10",
                "wow",
                "amazing",
                "youre doing great",
                "best game ever",
                "dont be a salad",
                "water is wet", 
                "quitters gonna quit", 
                "its always easier to leave"
            ];
            var scoreCount = 0;
            var difficulty = 1;
            var defaultCircleSize = 95;
            var circleSize = defaultCircleSize;
            var maxDist = distance(0, 0, canvasW, canvasH);
            var debug = false;
            var difficultyIncreaseModifier = 1250;
            var timeMultiplier = 125;
            var gameOverSize = 2;
            var textAnimTime = 250;
            var circleDescreasingTime = 100;
            swipeImg.alpha = 1;
            pauseBtn.alpha = 0;

            stage.alpha = 0;
            createjs.Tween.get(stage).to({ alpha: 1 }, 750);

            // texts
            var score = function() {
                var size = 75;

                var score = new createjs.Text();
                score.font = (size * modifier) + "px Avenir-Black";
                score.color = "#828A95";
                score.text = "circle";
                var scorebounds = score.getBounds();
                score.x = canvasW / 2 - (scorebounds.width) / 2;
                score.y = 125 * modifier;
                stage.addChild(score);

                this.updateS = function(text) {
                    score.text = text;
                    var scorebounds = score.getBounds();
                    score.x = canvasW / 2 - scorebounds.width / 2;
                };

                this.alphaS = function(val, fast) {
                    if (fast) {
                        score.alpha = val;
                    } else {
                        createjs.Tween.get(score).to({ alpha: val }, textAnimTime);
                    }
                };

                return this;
            }();

            var bestScore = function() {
                var size = 19;

                var score = new createjs.Text();
                score.font = (size * modifier) + "px Avenir-Black";
                score.color = "#FFA69E";
                score.text = " ";
                var scorebounds = score.getBounds();
                score.x = canvasW / 2 - (scorebounds.width) / 2;
                score.y = 210 * modifier;
                stage.addChild(score);

                this.updateBS = function(text) {
                    score.text = text;
                    var scorebounds = score.getBounds();
                    score.x = canvasW / 2 - scorebounds.width / 2;
                };

                this.alphaBS = function(val, fast) {
                    if (fast) {
                        score.alpha = val;
                    } else {
                        createjs.Tween.get(score).to({ alpha: val }, textAnimTime);
                    }
                };

                return this;
            }();


            // circle
            var dashed = function(color) {

                var dashedS = new createjs.Shape();
                var dashedC = new createjs.Shape();

                dashedS.graphics
                    .beginStroke(color)
                    .setStrokeDash([3, 3], 0)
                    .setStrokeStyle(2)
                    .drawCircle(0, 0, circleSize * modifier);


                dashedC.graphics
                    .beginFill( color )
                    .drawCircle(0, 0, circleSize * modifier);

                dashedS.x = canvasW / 2;
                dashedS.y = canvasH / 2 + 35 * modifier;
                dashedC.x = canvasW / 2;
                dashedC.y = canvasH / 2 + 35 * modifier;

                dashedS.alpha = .9;
                dashedC.alpha = .2;

                stage.addChild(dashedS);
                stage.addChild(dashedC);

                var bumped = false;

                function move(obj1, obj2) {
                    var doublesize = circleSize * modifier * 2;
                    // var newx = Math.random() * (canvasW - doublesize) + circleSize * modifier;
                    // var newy = Math.random() * (canvasH - doublesize) + circleSize * modifier;

                    if (bumped) {
                        var newx = Math.random() * (canvasW - 100) + 50;
                        var newy = Math.random() * (canvasH - 100) + 50;
                    } else {
                        var newx = Math.random() * 30 + canvasW / 2 - 15;
                        var newy = Math.random() * 30 + canvasH / 2 + 45 * modifier - 15;
                    }

                    var newdist = distance(dashedS.x, dashedS.y, newx, newy);
                    var time = Math.sqrt(newdist) / difficulty * timeMultiplier;

                    createjs.Tween.get(obj1)
                        .to({ x: newx, y: newy }, time, createjs.Ease.quadInOut)
                        .call(function() {
                            move(obj1, obj2);
                        });

                    createjs.Tween.get(obj2)
                        .to({ x: newx, y: newy }, time, createjs.Ease.quadInOut);
                };

                move(dashedS, dashedC);

                this.dashedBump = function() {
                    bumped = true;
                };
                
                this.getDCenter = function() {
                    return { x: dashedS.x, y: dashedS.y };
                };

                this.alphaD = function(val, fase) {
                    if (fast) {
                        dashedS.alpha = val;
                        dashedC.alpha = ((val > 0.2) ? 0.2 : val);
                    } else {
                        createjs.Tween.get(dashedS).to({ alpha: val }, textAnimTime);
                        createjs.Tween.get(dashedC).to({ alpha: ((val > 0.2) ? 0.2 : val) }, textAnimTime);
                    }
                };

                this.resizeD = function() {
                    createjs.Tween.get(dashedS).to({ scaleX: circleSize / defaultCircleSize, scaleY: circleSize / defaultCircleSize }, circleDescreasingTime);
                    createjs.Tween.get(dashedC).to({ scaleX: circleSize / defaultCircleSize, scaleY: circleSize / defaultCircleSize }, circleDescreasingTime);

                    stage.update();
                };

                return this;
            }(color);

            var circle = function(color) {

                var circle = new createjs.Shape();
                
                circle.graphics
                    .beginFill(color)
                    .drawCircle(0, 0, circleSize * modifier);

                circle.x = canvasW / 2;
                circle.y = canvasH / 2 + 45 * modifier;

                circle.alpha = .9;

                circle.on("pressmove", function(evt) {
                    if (!self.paused) {
                        evt.target.x = evt.stageX / stage.scaleX;
                        evt.target.y = evt.stageY / stage.scaleY;
                    }
                });

                circle.on("mousedown", function(evt) {
                    if (!self.started) {
                        self.started = true;
                        createjs.Tween.get(swipeImg).to({ alpha: 0 }, textAnimTime); 
                        createjs.Tween.get(pauseBtn).to({ alpha: 1 }, textAnimTime); 

                        dashed.dashedBump();

                        self.setPhrase("keep circle over the target");

                        // message.alphaM(0.5);
                        score.alphaS(0.5);
                        bestScore.alphaBS(0.5);
                    }
                    if (self.paused) {
                        self.resume();
                    }
                });

                stage.addChild(circle);

                this.getCenter = function() {
                    return { x: circle.x, y: circle.y };
                };

                this.alphaC = function(val, fast) {
                    if (fast) {
                        circle.alpha = val;
                    } else {
                        createjs.Tween.get(circle).to({ alpha: val }, textAnimTime); 
                    }
                };

                this.resizeC = function() {
                    createjs.Tween.get(circle).to({ scaleX: circleSize / defaultCircleSize, scaleY: circleSize / defaultCircleSize }, circleDescreasingTime);
                    stage.update();
                };

                return this;
            }(color);
            

            var message = function() {
                var size = 28;

                var message = new createjs.Text();
                message.font = (size * modifier) + "px Avenir-Roman";
                message.color = "#828A95";
                message.text = "drag circle to start";
                var msgbounds = message.getBounds();
                message.x = canvasW / 2 - msgbounds.width / 2 - 15 + 2 * modifier;
                message.y = canvasH - 100 * modifier;

                swipeImg.scaleX = 0.5 * modifier;
                swipeImg.scaleY = 0.5 * modifier;

                pauseBtn.scaleX = 0.5 * modifier;
                pauseBtn.scaleY = 0.5 * modifier;

                swipeImg.x = canvasW / 2 + msgbounds.width / 2;
                swipeImg.y = canvasH - 95 * modifier;

                pauseBtn.x = canvasW / 2 - 50 * modifier;
                pauseBtn.y = canvasH - 60 * modifier;

                stage.addChild(whitePlane);

                stage.addChild(message);
                stage.addChild(swipeImg);

                stage.addChild(pauseBtn);


                this.update = function(text, fast) {
                    if (fast) {
                        message.text = text;
                        var msgbounds = message.getBounds();
                        message.x = canvasW / 2 - msgbounds.width / 2;
                    } else {
                        createjs.Tween.get(message).to({ alpha: 0 }, textAnimTime / 2).call(function() {
                            message.text = text;
                            var msgbounds = message.getBounds();
                            message.x = canvasW / 2 - msgbounds.width / 2;
                            createjs.Tween.get(message).to({ alpha: 0.5 }, textAnimTime / 2);
                        });
                    }
                };

                this.alphaM = function(val) {
                    createjs.Tween.get(message).to({ alpha: val }, textAnimTime);
                };

                return this;
            }();


            // math
            function distance(x1, y1, x2, y2) {
                return Math.sqrt( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
            }

            this.scoreClock = setInterval(function() {
                if (!self.paused && self.started) {
                    var a = dashed.getDCenter();
                    var b = circle.getCenter();
                    var dist = distance(a.x, a.y, b.x, b.y);

                    // normalize distance
                    if (circleSize > 0) {
                        var normalized = dist / circleSize / 5;
                    } else {
                        var normalized = 1;
                    }

                    // calculate score
                    
                    var newScore = Math.max(0, 2.5 - normalized) / 2.5;
                    difficulty += newScore / difficultyIncreaseModifier;

                    if (dist < circleSize * modifier * 2) {
                        scoreCount += Math.pow(newScore * difficulty, 3 );
                        var formattedScore = Math.round(scoreCount).format();

                        score.updateS(formattedScore);
                    }
                    // update circle size
                    if (!debug) {
                        circleSize -= normalized;
                    }

                    // check for gameover
                    if (circleSize * modifier < gameOverSize) {

                        self.finish();

                        if (Number(store("circle_best_score")) < Math.round(scoreCount)) {
                            store("circle_best_score", Math.round(scoreCount));
                            bestScore.updateBS("highest score is " + Math.round(scoreCount).format());
                        }

                    } else {
                        // only update sizes
                        circle.resizeC();
                        dashed.resizeD();
                    }
                }
            }, 100);

            // phrases
            var setRandomPhrase = function(forced) {
                var phrase = phrases[ Math.floor( Math.random() * phrases.length ) ];
                if (typeof forced !== "undefined" && forced < phrases.length) {
                    phrase = phrases[forced];
                } else if (lastPhraseId == phrases.indexOf(phrase)) {
                    return setRandomPhrase();
                } else {
                    lastPhraseId = phrases.indexOf(phrase);
                }
                message.update(phrase);
            };

            self.setRandomPhrase = setRandomPhrase;
            self.setPhrase = function(phrase, fast) {
                message.update(phrase, fast);
            };

            var count = 0;
            this.prhaseClock = setInterval(function() {
                if (!self.paused && self.started) {
                    count++;
                    if (count >= 10) {
                        count = 0;
                        setRandomPhrase();
                    }
                }
            }, 1000);
            
            //setRandomPhrase();

            if (store("circle_best_score") > 1) {
                bestScore.updateBS("highest score is " + Number(store("circle_best_score")).format());
            }

            // ticker
            function tick(event) {
                stage.update(event);
            }

            createjs.Ticker.on("tick", tick);

            this.stage = stage;

            this.pause = function() {
                if (!this.paused) {
                    this.paused = true;
                    pauseBtn.alpha = 0;
                    createjs.Ticker.paused = true;
                    this.setPhrase("touch circle to resume", true);
                    whitePlane.alpha = .7;
                }
            };

            this.resume = function() {
                if (this.paused) {
                    this.paused = false;
                    createjs.Ticker.paused = false;
                    this.setRandomPhrase();
                    // whitePlane.alpha = 0;
                    createjs.Tween.get(pauseBtn).to({ alpha: 1 }, textAnimTime);
                    createjs.Tween.get(whitePlane).to({ alpha: 0 }, textAnimTime);
                }
            };
        };

        this.setPhrase = function() {};
        this.setRandomPhrase = function() {};

        this.finish = function() {
            this.running = false;
            this.stage.removeAllChildren();
            this.stage.clear();
            this.stage.update();
            createjs.Tween.removeAllTweens();
            clearInterval(this.prhaseClock);
            clearInterval(this.scoreClock);
            location.reload();
        };
    }
});