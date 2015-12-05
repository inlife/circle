$(document).ready(function() {

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

    var GC = new GameController();
    createjs.MotionGuidePlugin.install();

    function hideall() {
        function hideifnot(item) {
            if (!$(item).hasClass("hidden")) $(item).addClass("hidden");
            return this;
        }

        hideifnot("#page_score");
        hideifnot("#page_menu");
        hideifnot("#page_game");
        hideifnot("#page_highscores");
        hideifnot("#page_about");
    }

    $(".button_menu").click(function() {
        console.log("btn:menu");
        hideall();
        if (GC.running) {
            $(".button_play").text("Resume");
            GC.pause();
        }
        $("#page_menu").removeClass("hidden");
    });

    $(".button_play").click(function() {
        console.log("btn:play");
        hideall();
        $("#page_game").removeClass("hidden");
        if (!GC.running && !GC.paused) {
            GC.start();
        } else if (GC.running && GC.paused) {
            $(".button_play").text("Play");
            GC.resume();
        }
    });

    $(".button_retry").click(function() {
        console.log("btn:retry");
        hideall();
        $("#page_game").removeClass("hidden");
        if (!GC.running && !GC.paused) {
            GC.start();
        }
    });

    $(".button_highscores").click(function() {
        console.log("btn:score");
        hideall();
        $("#scr1").text(store("cirlce_scr_1"));
        $("#scr2").text(store("cirlce_scr_2"));
        $("#scr3").text(store("cirlce_scr_3"));
        $("#page_highscores").removeClass("hidden");
    });

    $(".button_about").click(function() {
        console.log("btn:about");
        hideall();
        $("#page_about").removeClass("hidden");
    })


    window.sendPause = function() {
        $(".button_menu").click();
        return 123;
    }

    window.sendResume = function() {
        
    }


    $(window).resize(function() {
        if (GC.running) {
            GC.finish();
            hideall();
            $("#page_menu").removeClass("hidden");
        }
    });

    function GameController() {
        var self = this;

        this.stage = null;
        this.running = false;
        this.paused = false;
        this.started = false;

        if (!store('cirlce_scr_1')) {
            store('cirlce_scr_1', 0);
            store('cirlce_scr_2', 0);
            store('cirlce_scr_3', 0);
        }

        this.start = function() {
            
            this.running = true;
            this.started = false;

            var canvasW = 640,
                canvasH = 480;

            canvas = document.getElementById("game_canvas");
            canvas.width = document.body.clientWidth; //document.width is obsolete
            canvas.height = document.body.clientHeight; //document.height is obsolete
            canvasW = canvas.width;
            canvasH = canvas.height;

            var stage = new createjs.Stage("game_canvas");
            var modifier = Math.sqrt(Math.sqrt( canvasW / 480 ) * Math.sqrt( canvasH / 720 ));

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

            var colors = ["#E16B6B", "#98E16B", "#6BA0E1", "#E1B76B", "#9A6BE1", "#6BE1D9"];
            var color = colors[Math.floor(Math.random() * colors.length)];
            var phrases = [
                "dont let go", 
                "never give up" , 
                "just do it",
                "dont let your dreams be dreams",
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
            var circleSize = 75;
            var maxDist = distance(0, 0, canvasW, canvasH);
            var debug = false;
            var difficultyIncreaseModifier = 1250;
            var timeMultiplier = 125;
            var gameOverSize = 20;

            // circle
            var dashed = function(color) {

                var dashed = new createjs.Shape();

                dashed.graphics
                    .beginStroke(color)
                    .setStrokeDash([5, 5], 0)
                    .beginFill( ColorLuminance(color, 1.1) )
                    .drawCircle(0, 0, circleSize * modifier);

                dashed.x = canvasW / 2;
                dashed.y = canvasH / 2;

                stage.addChild(dashed);

                function move(obj) {
                    var doublesize = circleSize * 2;
                    var newx = Math.random() * (canvasW - doublesize) + circleSize;
                    var newy = Math.random() * (canvasH - doublesize) + circleSize;

                    var newdist = distance(dashed.x, dashed.y, newx, newy);
                    var time = Math.sqrt(newdist) / difficulty * timeMultiplier;

                    createjs.Tween.get(obj)
                        .to({ x: newx, y: newy }, time, createjs.Ease.quadInOut)
                        .call(function() {
                            move(obj);
                        });
                };

                this.dashedBump = function() {
                    move(dashed);
                };
                
                this.getDCenter = function() {
                    return { x: dashed.x, y: dashed.y };
                };

                this.resizeD = function() {
                    dashed.graphics
                        .clear()
                        .beginStroke(color)
                        .setStrokeDash([5, 5], 0)
                        .beginFill( ColorLuminance(color, 1.1) )
                        .drawCircle(0, 0, circleSize * modifier);

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
                circle.y = canvasH / 2;


                circle.on("pressmove", function(evt) {
                    evt.target.x = evt.stageX / stage.scaleX;
                    evt.target.y = evt.stageY / stage.scaleY;
                });

                circle.on("mousedown", function(evt) {
                    if (!self.started) {
                        self.started = true;
                        dashed.dashedBump();
                        setRandomPhrase(0);
                    }
                });

                stage.addChild(circle);

                this.getCenter = function() {
                    return { x: circle.x, y: circle.y };
                };

                this.resizeC = function() {
                    circle.graphics
                        .clear()
                        .beginFill(color)
                        .drawCircle(0, 0, circleSize * modifier);

                    stage.update();
                };

                return this;
            }(color);
           

            // texts
            var score = function() {
                var size = 45;

                var score = new createjs.Text();
                score.font = (size * modifier) + "px proxima_nova_rgregular";
                score.color = "#818181";
                score.text = "0";
                var scorebounds = score.getBounds();
                score.x = canvasW / 2 - scorebounds.width / 2;
                score.y = 25 * modifier;
                stage.addChild(score);

                this.updateS = function(text) {
                    score.text = text;
                    var scorebounds = score.getBounds();
                    score.x = canvasW / 2 - scorebounds.width / 2;
                };

                return this;
            }();

            var message = function() {
                var size = 25;

                var message = new createjs.Text();
                message.font = (size * modifier) + "px proxima_nova_rgregular";
                message.color = "#818181";
                message.text = "touch to start";
                var msgbounds = message.getBounds();
                message.x = canvasW / 2 - msgbounds.width / 2;
                message.y = canvasH - 50 * modifier;
                stage.addChild(message);

                this.update = function(text) {
                    message.text = text;
                    var msgbounds = message.getBounds();
                    message.x = canvasW / 2 - msgbounds.width / 2;
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

                    scoreCount += Math.pow(newScore * difficulty, 3 );
                    var formattedScore = Math.round(scoreCount).format();

                    score.updateS(formattedScore);

                    // update circle size
                    if (!debug) {
                        circleSize -= normalized;
                    }

                    // check for gameover
                    if (circleSize * modifier < gameOverSize) {

                        GC.finish();
                        hideall();
                        $("#score").text("score: " + formattedScore);
                        $("#page_score").removeClass("hidden");

                        // save highscores
                        if (store("cirlce_scr_1") < formattedScore) {
                            store("cirlce_scr_3", store("cirlce_scr_2"));
                            store("cirlce_scr_2", store("cirlce_scr_1"));
                            store("cirlce_scr_1", formattedScore);
                        } else if (store("cirlce_scr_2") < formattedScore) {
                            store("cirlce_scr_3", store("cirlce_scr_2"));
                            store("cirlce_scr_2", formattedScore);
                        } else if (store("cirlce_scr_3") < formattedScore) {
                            store("cirlce_scr_3", formattedScore);
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
                }
                message.update(phrase);
            };

            this.prhaseClock = setInterval(function() {
                if (!self.paused && self.started) {
                    setRandomPhrase();
                }
            }, 10000);
            
            //setRandomPhrase();


            // ticker
            function tick(event) {
                stage.update(event);
            }

            createjs.Ticker.on("tick", tick);

            this.stage = stage;
        };

        this.finish = function() {
            this.running = false;
            this.stage.removeAllChildren();
            this.stage.clear();
            this.stage.update();
            createjs.Tween.removeAllTweens();
            clearInterval(this.prhaseClock);
            clearInterval(this.scoreClock);
            $(".button_menu").click();
        };

        this.pause = function() {
            if (!this.paused) {
                this.paused = true;
                createjs.Ticker.paused = true;
            }
        };

        this.resume = function() {
            if (this.paused) {
                this.paused = false;
                createjs.Ticker.paused = false;
            }
        };
    }
});