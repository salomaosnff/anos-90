"use strict";

(function($){
    var current = 0;

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
    });
})(jQuery);

