"use strict";

Number.prototype.round = function (multiple, roundingFunction) {
    roundingFunction = roundingFunction || Math.round;
    return roundingFunction(this / multiple) * multiple;
};

Vue.component('range',{
    props: {
        min:{
            type: [Number, String],
            default: 0
        },
        max: {
            type: [Number, String],
            default: 100
        },
        pos: [Number, String],
        step: {
            type: [Number, String],
            default: 10
        }
    },
    template: `<div class="vue-range"><span class="vue-range-bar" :style="{width: width_bar + '%'}"></span></div>`,
    data(){
        return{
            moving   : false,
            $element : null,
            $bar     : null,
            minimo   : parseFloat(this.min),
            maximo   : parseFloat(this.max),
            etapas   : parseFloat(this.step),
            position : parseFloat(this.pos),
            width_bar: 0
        }
    },
    methods:{
        updateBar(){
            this.width_bar = (this.position / this.maximo) * 100;
            this.$emit('updateBar', this.width_bar);
        },

        setPosition(value){
            value = Math.max(value, this.minimo);
            value = Math.min(value, this.maximo);

            this.position = value;
            this.$emit('updatePosition', this.width_bar);
            this.updateBar();
        },
        setRange(percent){
            let value = (percent * this.maximo).round(this.etapas);

            this.setPosition(value);
            this.updateBar();
            this.$emit('input', value);
        },
        set(props){
            this.setPosition(props.pos || this.position);

            this.minimo = props.min || this.minimo;
            this.maximo = props.max || this.maximo;
            this.etapas = props.step || this.etapas;
        }
    },
    mounted(){
        let $self = this, offsetX, width;

        $self.$element = $($self.$el);
        $self.bar      = $self.$element.children('.vue-range-bar');
        $self.updateBar();

        function setPos(e){
            let x = e.pageX;
            let percent = 0;

            if($self.moving){

                x = e.pageX - offsetX;
                x = Math.max(x, 0);
                x = Math.min(x, width);

                percent = x / width;

                $self.setRange(percent);
            }

        }

        $self.$element.bind('mousedown', function(e){

            let $element = $self.$element;

            $self.moving = true;
            width = $element.width();
            offsetX = $element.offset().left;

            setPos(e);
        });

        $(document).bind('mouseup', function(){
            $self.moving = false;

        }).bind('mousemove', setPos);



    }
});