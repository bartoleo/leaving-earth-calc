import { reactive } from 'vue';

export const store = reactive({
  initialized: false,
  audioVolume: 0.5,
  audio: true,
  viewHistory: false,
  mass: 1,
  difficulty: 1,
  saturn: true,
  soyuz: true,
  atlas: true,
  juno: true,
  name: 'Mission',
  step: '',
  result: [],
  history: [],
  historyTotals: {},
  reset() {
    this.setValues({
      initialized: false,
      mass: 1,
      difficulty: 1,
      result: [],
      history: []
    });
  },
  load() {
    console.log('store load');
    var values = localStorage.store;
    if (values != null) {
      this.setValues(JSON.parse(values));
    } else {
      this.initialized = true;
    }
    console.log('store load:', this);
  },
  setValues(obj) {
    if (obj != null) {
      for (var k in obj) {
        this[k] = obj[k];
      }
    }
    console.log('store save');
    localStorage.store = JSON.stringify(this);
  },
});
