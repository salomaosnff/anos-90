"use strict";

(function($){
    var current = 0;

    $.fn.player = function(){
        function toSec(time){
            var regexp = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;

            if(time){
                return time.replace(regexp, function(match, h, m, s){

                    h = parseInt(h) || 0;
                    m = parseInt(m) || 0;
                    s = parseInt(s) || 0;

                    return ((h * 60) + (m * 60) + s) || false;
                });
            }

            return false;

        }

        return this.each(function(i, el){

            var $el        = $(el);
            var start_time = toSec($el.attr('data-start'));
            var end_time   = toSec($el.attr('data-end'));
            var next       = $el.attr('data-next') || false;
            var lock = false;

            if(start_time){

                $el.bind('play', function(){
                    lock = !lock;
                    
                    if(this.currentTime < start_time){
                        this.currentTime = start_time
                    }
                });
            }

            if(end_time){

                $el.on('timeupdate', function(){

                    if(lock){
                        if(this.currentTime >= end_time){

                            this.currentTime = end_time;
                            this.pause();

                            if(next) $(next).each(function(i, el){
                                el.play();
                            });
                        }
                    }
                });
            }
        });
    };

    $.fn.naTela = function(callback){
        //Loop
        return this.each(function(indice, elemento){
            var retangulo = elemento.getBoundingClientRect(); //Retona o um objeto com as posições

            // Se o elemento estiver visível na tela e o callback for uma função
            if(
                typeof callback == 'function'         &&
                retangulo.top     >= 0                  &&
                retangulo.top     <= $(window).height() * .5 &&
                retangulo.left     >= 0                  &&
                retangulo.left     <= $(window).width()
            ){
                callback(retangulo, elemento); //Chama o callback e passa como parâmetro o objeto
            }
        });
    };// Fim Plugin


    function rolarPara(el){
        var $el = $(el);
        $el.find(".content").fadeIn(500);

        $("#tl").removeClass('hide');

        if($el.length > 0){
            $('html, body').animate({
                scrollTop:$el.offset().top - 128
            }, 800);
        }
    }

    $(document).ready(function(){
        var date_panels = $('#dates').find('.date-panel');
        var dates = date_panels.children(".date");
        var nav   = $("#nav").children("ul");

        date_panels.children(".content").hide();
        nav.empty();

        dates.each(function(i, el){
            var $el = $(el);
            var $panel = $el.parent();
            var $nav_item = $("<li/>",{
                text: $el.text(),
                class:"nav-item",
                "data-target": $panel.attr("id"),
                "id": "nav-" + $panel.attr("id"),
                appendTo:nav
            });

            $nav_item.on('click',function(){
                var id = "#"+$(this).attr('data-target');

                current = date_panels.index($(id)) + 1;

                rolarPara(id)
            });

        });
        date_panels.click(function(){
            $("#tl").removeClass('hide');
            $(this).find(".content").fadeIn(500);
        });

        $(this).scroll(function(){
            date_panels.naTela(function(rec, el){
                var $el = $(el);
                var id = "#" + $el.attr('data-target');

                nav.children("li")
                    .removeClass("active")
                    .parent()
                    .children(id)
                    .addClass('active')
                ;
            });
        });

        $(this).on('keypress', function(event){
            var key = event.keyCode;
            if(key == 38 || key == 39){
                if(current < date_panels.length){
                    alert(">" + current);
                    rolarPara(date_panels.get(++current));
                }
            } else if(key == 37 || key == 40){

                if(current > 0){
                    alert("<" + current);
                    rolarPara(date_panels.get(--current));
                }
            }

        });

        $('video, audio').player();
    });
})(jQuery);

