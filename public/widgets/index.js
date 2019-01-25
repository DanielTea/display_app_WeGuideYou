const Vue = require('vue/dist/vue')
const _ = require('lodash/fp');

module.exports = function ({rootElement, slideWidgets, mainWidget}) {
  return new Vue({
    el: rootElement,
    data: {
      slideWidgets,
      mainWidget,
      currentWidget: 0,
      paused: false,
    },

    methods: {
      nextWidget: function () {
        let delay;

        if (this.currentWidget < this.slideWidgets.length) {
          delay = slideWidgets[this.currentWidget].duration * 1000;
        } else {
          delay = mainWidget.duration * 1000;
        }

        setTimeout(() => {
          if (this.paused) {
            return
          }

          this.currentWidget = (this.currentWidget + 1) % (this.slideWidgets.length + 1)
          this.nextWidget();
        }, delay);
      },

      pause () {
        if (this.paused) {
          return;
        }

        this.paused = true;
      },

      unpause () {
        if (!this.paused) {
          return;
        }

        this.paused = false;
        this.nextWidget();
      }
    },

    template: `
      <div class='widgets'>
  
        <widget v-for="(widget, index) in slideWidgets" 
                :type='widget.type' 
                :data='widget.data'
                :class="{ fadeIn: currentWidget == index && !paused,
                          fadeOut: currentWidget == index + 1 || (currentWidget == index && paused),
                          hidden: currentWidget != index && currentWidget != index + 1}"></widget>
            
        <widget :type='mainWidget.type' 
                :data='mainWidget.data'
                :class='{ expanded: currentWidget == slideWidgets.length && !paused,
                          small: currentWidget != slideWidgets.length || paused }'></widget>
      </div>`,

    mounted: function () {
        this.nextWidget();
    }
  });
}



Vue.component('widget', {
  props: {
    type: String,
    data: Object
  },
  template: `
    <div class='widget'>
      <weather-widget v-if='type == "weather"' :location='data.location' :api-key='data.apiKey'></weather-widget>
      <info-box-widget v-else-if='type == "info-box"' :template='data.template'></info-box-widget>
    </div>
  `
})



Vue.component('weather-widget', {
  props: {
    location: String,
    apiKey: String
  },

  data () {
    return {
      forecasts: []
    };
  },

  methods: {
    loadWeather: async function () {

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${this.location}&mode=json&appid=${this.apiKey}&units=metric`
      )
        .then((res) => res.json());

      const days = _.flow(
        _.groupBy(({dt_txt}) => dt_txt.slice(0, 10)),
        _.values
      )(res.list)

      console.log(days)

      this.forecasts =  [
        { weather: getWeatherOfCurrentDay(days[0]), weekday: getWeekday(0)},
        { weather: getWeatherOfDay(days[1]), weekday: getWeekday(1)},
        { weather: getWeatherOfDay(days[2]), weekday: getWeekday(2)},
        { weather: getWeatherOfDay(days[3]), weekday: getWeekday(3)},
      ]
    }
  },

  template: `
    <div class='weather-widget'>
      <div v-for='(forecast, index) in forecasts' class='weather-day-forecast'>      
        <h2>{{forecast.weekday}}</h2>        
      
        <div class='weather-day-forecast-icon' v-bind:style='{ background: "url(./public/widgets/icons/" + forecast.weather.icon + ".svg)" }'></div>

        <div class='weather-day-forecast-temperature'>
          <span class='weather-day'>{{Math.round(forecast.weather.temperatureDay)}}°</span> 
          <span class='weather-night'>{{Math.round(forecast.weather.temperatureNight)}}°</span>        
        </div>        
      </div>    
    </div>
  `,

  mounted () {
    this.loadWeather();

    setInterval(() => this.loadWeather(), 3600000) // referesh every hour
  },

})


function getWeatherOfCurrentDay (predictions) {
  return {
    temperatureDay: predictions[0].main.temp,
    temperatureNight: _.last(predictions).main.temp,
    description: predictions[0].weather[0].description,
    icon: predictions[0].weather[0].icon.slice(0, 2),
  }
}

function getWeatherOfDay (predictions) {
  return {
    temperatureDay: predictions[4].main.temp,
    temperatureNight: _.last(predictions).main.temp,
    description: predictions[4].weather[0].description,
    icon: predictions[4].weather[0].icon.slice(0, 2),
  }
}

function getWeekday (offset) {
  const day = ((new Date()).getDay() + offset) % 7

  return {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thur',
    5: 'Fri',
    6: 'Sat'
  }[day]
}

Vue.component('info-box-widget', {
  props: {
    template: String,
  },
  template: `
    <div class="info-box-widget" v-html='template'></div>
    
    
  `
})