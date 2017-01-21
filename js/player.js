"use strict";

Vue.component('wideo', {
    props:{
        title: {
            type: String,
            required: false
        },
        start: {
            type: [Number, String],
            required: false
        },
        end: {
            type: [ String, Number],
            required: false
        },
        src: {
            type: String,
            required: true
        },

        height: {
            type: [ String, Number],
            'default': 320
        },
        width: {
            type: [ String, Number],
            'default': -1
        }
    },
    data(){
        function parseTime(time) {
            return parseFloat(time.replace(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/, function (str, h, m, s) {
                h = parseInt(h) || 0;
                m = parseInt(m) || 0;
                s = parseInt(s) || 0;

                h = h * 60;
                m = m * 60;
                s = s * 1;

                console.log(h, m, s);

                return h + m + s;
            }));
        }

        let h = parseInt(this.height);
        let w = this.width < 0 ? parseInt(this.height * (16/9)) : this.width;
        let s = this.src || "";
        let v = document.createElement("video");
        let st = parseTime(this.start);
        let e = parseTime(this.end);
        let title = this.title;

        h = parseInt(w / (16/9));

        v.src = s;
        v.current = 1;

        return {
            w: w,
            h: h,
            s: s,
            c: null,
            ctx: null,
            v: v,
            i: null,
            st: st,
            e: e,
            vol: 1,
            titl: title || ""
        }
    },
    methods:{
        updateCanvas(){
            let _ = this;
            let c = _.c;
            let v = _.v;

            _.ctx.drawImage(_.v, 0, 0, _.w, _.h);

            this.i = window.requestAnimationFrame(_.updateCanvas);

        },
        play(){
            this.v.play();
        },
        playPause(){
            if(this.v.paused){
                this.play();
            } else {
                this.pause();
            }
        },
        _events(){
            let _ = this;
            let v = $(_.v);

            v.on('loadedmetadata', function () {
                _.e = _.e   || this.duration;
            });

            v.on('timeupdate', function () {
                console.log(_.st, _.e);
                if(this.currentTime < _.st) this.currentTime = _.st;
                if(this.currentTime >= _.e){
                    this.stop();
                }
            });

            v.on('play', function () {
                _.updateCanvas();
            });

            v.on('pause', function () {
                window.cancelAnimationFrame(_.i);
            });
        },
        pause(){
            this.v.pause();
        },
        stop(){
            this.pause();
            this.v.currentTime = 0;
        },
        mute(){
            this.vol = this.v.volume;
            this.v.volume = 0;
        },
        unmute(){
            this.v.volume = this.vol;
        },
        setThumb(){
            let _ = this;
            let v = $(_.v);

            v.one('canplay', function () {
                _.play();
                _.mute();
            });
            v.bind('timeupdate', function () {
                if(this.currentTime > (_.st + .1)){
                    _.pause();
                    _.unmute();
                    v.unbind('timeupdate');
                }
            })
        }
    },
    mounted(){

        this.c = this.$el.getElementsByTagName("canvas")[0];
        this.c.width = this.w;
        this.c.height = this.h;
        this.ctx = this.c.getContext("2d");

        this._events();
        this.setThumb();
    },
    template: `<div class="_wideo">
                <p class="title" v-if="titl.length > 0" v-html="titl"></p>
                <canvas><p>Essa porcaria de navegador não suporta a belezura do Canvas. Atualize seu navegador, otário.</p></canvas>
                <div class="footer">
                    <div class="progress-bar">
                        <div class="bar"></div>
                    </div>
                    <div class="buttons">
                        <button class="play" @click="playPause()"></button>
                        <span class="current_time">0:00</span>
                        <span class="current_time">1:00</span>
                    </div>
                </div>
            </div>`
});