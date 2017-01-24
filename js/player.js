"use strict";
function parseTime(time) {
    return parseFloat(time && time.replace(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/, function (str, h, m, s) {
            h = parseInt(h) || 0;
            m = parseInt(m) || 0;
            s = parseInt(s) || 0;

            h = h * 60;
            m = m * 60;
            s = s * 1;

            return h + m + s;
        }));
}

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
            'default': 480
        },
        volume: {
            type: [ String, Number],
            'default': 75
        },
        width: {
            type: [ String, Number],
            'default': -1
        }
    },
    data(){

        let h = parseInt(this.height);
        let w = this.width < 0 ? parseInt(this.height * (16/9)) : this.width;
        let s = this.src || "";
        let v = document.createElement("video");
        let st = parseTime(this.start || 0);
        let e = parseTime(this.end || 0);
        let title = this.title;

        h = parseInt(w / (16/9));

        v.src = s;
        v.preload = "metadata";
        v.current = 0;

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
            vol: Number.parseFloat(this.volume || 75.00),
            time: 1,
            titl: title || "",
            duration : (e - st)
        }
    },
    methods:{
        fullscreen(autoplay){
            let $self = this;
            let timer;

            function _fullscreen(elem){
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                }
            }

            function _exit_fs(elem){
                if (elem.exitFullscreen) {
                    elem.exitFullscreen();
                } else if (elem.msExitFullscreen) {
                    elem.msExitFullscreen();
                } else if (elem.mozCancelFullScreen) {
                    elem.mozCancelFullScreen();
                } else if (elem.webkitExitFullscreen) {
                    elem.webkitExitFullscreen();
                }
            }

            _fullscreen(this.$el);

            if(autoplay) this.play();
        },
        hideBars(){
            $(this.$el).addClass('hide-bars');
        },
        showBars(){
            $(this.$el).removeClass('hide-bars');
        },
        updateCanvas(){
            let _ = this;
            let c = _.c;
            let v = _.v;

            _.ctx.drawImage(_.v, 0, 0, _.w, _.h);

            this.i = window.requestAnimationFrame(_.updateCanvas);

        },
        play(){
            this.v.play();
            $(this.$el).find('.cover').fadeOut(1000);
        },
        playPause(){

            if(this.v.paused){
                this.play();
            } else {
                this.pause();
            }

        },
        setVolume(vol){

            if(typeof vol == "number"){
                console.log("CURR VOL:: ", vol);
                let mute = $(this.$el).find('.mute');
                let icon = $('<i/>',{'class' : 'material-icons'});
                mute.empty();

                vol = Math.min(vol, 100);
                vol = Math.max(vol,   0);

                this.v.volume = vol / 100;

                if(vol <= 0){
                    icon.html('&#xE04F;');
                } else if(vol <= 25){
                    icon.html('&#xE04E;');
                } else if(vol < 50){
                    icon.html('&#xE04D;')
                } else {
                    icon.html('&#xE050;')
                }

                mute.append(icon);
            }

            return this.v.setVolume * 100;

        },
        updateDisplay(){
            function parseTime(d) {
                d = Number(d);
                let h = Math.floor(d / 3600);
                let m = Math.floor(d % 3600 / 60);
                let s = Math.floor(d % 3600 % 60);
                return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
            }

            let $_ = $(this.$el);

            $_.find('.current_time').text(parseTime(this.time));
            $_.find('.duration').text(parseTime(this.duration));
        },
        updateProgressBar(){
            this.updateDisplay();
            this.$children[0].set({
                pos: this.time,
                min: 0,
                max: this.duration
            });
        },
        _events(){
            let _ = this;
            let v = $(_.v);
            let btn = $(this.$el).find('.play');
            let icon = $("<i/>",{'class':'material-icons'});

            v.one('loadedmetadata', function () {
                console.log("Loaded!");
                _.updateDisplay();
                console.log(_.vol);
                _.setVolume(_.vol);
            });

            v.on('timeupdate', function () {
                let curr_time = _.e - _.currentTime();

                if(this.currentTime < _.st) this.currentTime = _.st;
                if(this.currentTime >= _.e){
                    _.stop();
                }

                _.duration = _.e - _.st;
                _.time = _.duration - curr_time;

                _.updateProgressBar();
            });

            v.bind('play pause', function(){
                btn.empty();
            });

            v.on('play', function () {
                _.updateCanvas();

                icon.html('&#xE034;');
                btn.append(icon);
            });

            v.on('pause', function () {
                icon.html('&#xE037;');
                btn.append(icon);
                window.cancelAnimationFrame(_.i);
            });
        },
        currentTime(time){

            if(time){
                try{
                    this.v.currentTime = time;
                }catch(err){}
            }

            return this.v.currentTime;
        },
        pause(){
            try{
                this.v.pause();
            }catch(e){}

        },
        stop(){
            this.pause();
            this.currentTime(0);
        },

        mute(){
            this.vol = this.setVolume();
            this.setVolume(0);
        },
        unmute(){
            this.setVolume(this.vol);
            this.vol = false;
        },

        toggleMute(){
            if(this.vol){
                this.unmute();
            } else {
                this.mute();
            }
        },
        setTime(a){
            this.position = this.st + a;
            this.currentTime(this.position);
        }
    },
    mounted(){
        let $self = this, timer = null;

        this.c = this.$el.getElementsByTagName("canvas")[0];
        this.c.width = this.w;
        this.c.height = this.h;
        this.ctx = this.c.getContext("2d");

        this._events();

        $(this.v).one('canplay', function(){
            $self.e = $self.e == 0 ? this.duration : $self.e;
            $self.duration = $self.e - $self.st;
        });

        $(this.$el).on('mousemove', function(){
            $self.showBars();

            clearTimeout(timer);

            timer = setTimeout(function(){
                $self.hideBars();
            }, 5000);
        });
    },
    template: `<div class="_wideo">
                <p class="title" v-if="titl.length > 0" v-html="titl"></p>
                <div class="screen" @click="fullscreen(true)">
                    <div class="cover">Clique para executar: <br> {{titl}}</div>
                    <canvas @click="playPause()"><p>Deu Zebra! Esse seu dinossauro aí não suporta canvas.</p></canvas>
                </div>
                <div class="footer">
                    <range class="progress-bar" :pos="time - st" min="0" :max="e - st" :step="1/1000" v-on:input="setTime"></range>
                    <div class="buttons">
                        <button class="play" @click="playPause()"><i class="material-icons">&#xE037;</i></button>
                        <div class="volume">
                         <button class="mute" @click="toggleMute()"></button>
                         <range class="volume-bar" :pos="vol || 0" min="0" :max="100" :step="1/10" v-on:input="setVolume"></range>
                        </div>
                        <span class="time">
                            <span class="current_time">--:--</span> / <span class="duration">--:--</span>
                        </span>
                    </div>
                </div>
            </div>`
});