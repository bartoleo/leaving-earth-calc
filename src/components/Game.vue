<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { store } from '../store.js';
import { rockets } from '../const.js';

defineProps({
  title: String,
});

const audio = ref(store.audio);

const viewHistory = ref(store.viewHistory);

const result = ref(store.result);

const history = ref(store.history);

const historyTotals = ref(store.historyTotals);

const recalculateValues = () => {
  var resultCalc = [];
  
  const mass = store.mass;
  const difficulty = store.difficulty;

  const maxMass = 150;
  const maxCost = 250;
  
  if (mass < 0 || difficulty <= 0 || difficulty >= 10 ||
    (!store.saturn &&
     !store.soyuz &&
     !store.atlas &&
     !store.juno)
  ) {
     // no solution
     console.log('No solution: mass or difficulty is zero or no rockets selected');
  } else {

    console.log(`Calculating for mass: ${mass}, difficulty: ${difficulty}, rockets: ${store.saturn ? 'Saturn ' : ''}${store.soyuz ? 'Soyuz ' : ''}${store.atlas ? 'Atlas ' : ''}${store.juno ? 'Juno' : ''}`);

    const thrustCheck = mass;

    var maxSaturns = 0;
    var maxSoyuzs = 0;
    var maxAtlases = 0;
    var maxJunos = 0;

    if (store.saturn && rockets.saturn.s[difficulty-1] > 0) {
      maxSaturns = Math.min(Math.floor(maxCost / rockets.saturn.cost)+1,Math.floor(maxMass / rockets.saturn.mass)+1);
    }
    if (store.soyuz && rockets.soyuz.s[difficulty-1] > 0) {
      maxSoyuzs = Math.min(Math.floor(maxCost / rockets.soyuz.cost)+1,Math.floor(maxMass / rockets.soyuz.mass)+1);
    }
    if (store.atlas && rockets.atlas.s[difficulty-1] > 0) {
      maxAtlases = Math.min(Math.floor(maxCost / rockets.atlas.cost)+1,Math.floor(maxMass / rockets.atlas.mass)+1);
    }   
    if (store.juno && rockets.juno.s[difficulty-1] > 0) {
      maxJunos = Math.min(Math.floor(maxCost / rockets.juno.cost)+1,Math.floor(maxMass / rockets.juno.mass)+1);
    }
    
    console.log(`Max Saturns: ${maxSaturns}, Max Soyuzs: ${maxSoyuzs}, Max Atlases: ${maxAtlases}, Max Junos: ${maxJunos}`);
    
    // iterate through all combinations of rockets
    // and check if thrust >= mass*difficulty 
    for (var saturns=0;saturns<=maxSaturns;saturns++){
      for (var soyuzs=0;soyuzs<=maxSoyuzs;soyuzs++){
        for (var atlases=0;atlases<=maxAtlases;atlases++){
          for (var junos=0;junos<=maxJunos;junos++){
            if (junos==0&&atlases==0&&soyuzs==0&&saturns==0){
              continue; // skip if no rockets selected
            }
            var thrust = 0;
            var massRockets = 0;
            var costRockets = 0;
            if (store.saturn){
              thrust += rockets.saturn.s[difficulty-1] * saturns;
            }
            if (store.soyuz){
              thrust += rockets.soyuz.s[difficulty-1] * soyuzs;
            } 
            if (store.atlas){
              thrust += rockets.atlas.s[difficulty-1] * atlases;
            }
            if (store.juno){
              thrust += rockets.juno.s[difficulty-1] * junos;
            }

            // round thrust
            thrust = Math.round(thrust, 2);
            
            //console.log(`Thrust: ${thrust}, Total Mass: ${totalMass}, Cost: ${cost}, Saturns: ${saturns}, Soyuzs: ${soyuzs}, Atlases: ${atlases}, Junos: ${junos}`);  
            if (thrust >= thrustCheck) {
              var addToResult = true;

              massRockets += rockets.saturn.mass * saturns;
              costRockets += rockets.saturn.cost * saturns;
              massRockets += rockets.soyuz.mass * soyuzs;
              costRockets += rockets.soyuz.cost * soyuzs;
              massRockets += rockets.atlas.mass * atlases;
              costRockets += rockets.atlas.cost * atlases;
              massRockets += rockets.juno.mass * junos;
              costRockets += rockets.juno.cost * junos;

              // add to results only if cost <= maxCost (500?)
              if (costRockets > maxCost){
                addToResult = false;
              }
              // add to results only if mass <= maxMass (150?)
              if (massRockets > maxMass){
                addToResult = false;
              }
              
              resultCalc.forEach((item) => {
                if ((item.saturns <= saturns)
                 && (item.soyuzs <= soyuzs)
                 && (item.atlases <= atlases)
                 && (item.junos <= junos)
                 ) {
                  //already exists in result
                  addToResult = false;
                  // break junos loop
                  junos = maxJunos+1;
                 }
              });

              if (addToResult){
                resultCalc.push({
                  costRockets: costRockets,
                  massRockets: massRockets,
                  saturns: saturns,
                  soyuzs: soyuzs,
                  atlases: atlases,
                  junos: junos,
                  thrust: thrust,
                  bestMassRockets: false,
                  bestCostRockets: false,
                  totalMass: mass+massRockets
                });
              }
            }
          }
        } 
      }
    }

  }

  // sort results by cost, then by mass
  resultCalc.sort((a, b) => {
    if (a.costRockets !== b.costRockets) {
      return a.costRockets - b.costRockets;
    } else {
      return a.massRockets - b.massRockets;
    }
  });

  // set bestMass flag on the result with lessest mass
  if (resultCalc.length > 0) {
    //read min value of mass on resultCalc
    resultCalc.forEach((item) => {
      if (item.massRockets === Math.min(...resultCalc.map(i => i.massRockets))) {
        item.bestMassRockets = true;
      }
    });
    //read min value of cost on resultCalc
    resultCalc.forEach((item) => {
      if (item.costRockets === Math.min(...resultCalc.map(i => i.costRockets))) {
        item.bestCostRockets = true;
      }
    });
  }

  store.setValues({
    result: resultCalc
  }); 

  result.value = resultCalc;
  console.log(`Calculated result: ${resultCalc}`);

};

const reset = () => {
  if (window.confirm('Confirm reset?')) {
    store.reset();
    window.location.hash = '/';
  }
};

const toggleAudio = () => {
  audio.value = !audio.value;
  store.setValues({
    audio: audio.value
  });
}

const toggleViewHistory = () => {
  viewHistory.value = !viewHistory.value;
  store.setValues({
    viewHistory: viewHistory.value
  });
} 

const toggleSaturn =() => {
  store.setValues({
    saturn: store.saturn
  });
  recalculateValues();
}

const toggleSoyuz =() => {
  store.setValues({
    soyuz: store.soyuz
  });
  recalculateValues();
} 

const toggleAtlas =() => {
  store.setValues({
    atlas: store.atlas
  });
  recalculateValues();
}

const toggleJuno =() => {
  store.setValues({
    juno: store.juno
  });
  recalculateValues();
}

const incrementMass = (value) => {
  store.setValues({
    mass: Math.max(0, store.mass + value)
  });
  recalculateValues();
}

const changeMassFromLastHistory = () => {
  if (store.history.length > 0) {
    const lastItem = store.history[store.history.length - 1];
    store.setValues({
      mass: Math.max(0, lastItem.totalMass)
    });
    recalculateValues();
  } else {
    alert('No history available to change mass from.');
  }
}

const incrementDifficulty = (value) => {
  store.setValues({
    difficulty: Math.max(1, Math.min(9, store.difficulty + value))
  });
  recalculateValues();
}

const toggleDifficulty = (value) => {
  store.setValues({
    difficulty: store.difficulty
  });
  recalculateValues();
}

changeMassFromLastHistory
const addToHistory = (item) => {
  var newItem = {
    mission: store.mission,
    step: store.step,
    mass: store.mass,
    difficulty: store.difficulty,
    saturns: item.saturns,
    soyuzs: item.soyuzs,
    atlases: item.atlases,
    junos: item.junos,
    thrust: item.thrust,
    costRockets: item.costRockets,
    massRockets: item.massRockets,
    totalMass: item.totalMass,
    bestCostRockets: item.bestCostRockets,
    bestMassRockets: item.bestMassRockets 
  };
  store.history.push(newItem);
  store.setValues({
    history: store.history
  });
  calculateHistoryTotals();
  viewHistory.value = true; // show history after adding
  console.log(`Added to history: ${item}`);
}

const removeHistory = (index) => {
  if (window.confirm('Confirm remove from history?')) {
    store.history.splice(index, 1);
    store.setValues({
      history: store.history
    });
    calculateHistoryTotals();
    console.log(`Removed from history at index: ${index}`);
  }
}

const calculateHistoryTotals = () => {
  var totals = {
    saturns: 0,
    soyuzs: 0,
    atlases: 0,
    junos: 0,
    thrust: 0,
    costRockets: 0,
    massRockets: 0,
    totalMass: 0
  };
  // recalculate totals for history
  store.history.forEach((item) => {
    totals.saturns += item.saturns;
    totals.soyuzs += item.soyuzs;
    totals.atlases += item.atlases;
    totals.junos += item.junos;
    totals.thrust += item.thrust;
    totals.costRockets += item.costRockets;
  });

  //massrockets and totalmass is the max value
  totals.massRockets = Math.max(...store.history.map(i => i.massRockets));
  totals.totalMass = Math.max(...store.history.map(i => i.totalMass));  

  store.setValues({
    historyTotals: totals
  });
  historyTotals.value = totals;
  console.log(`Calculated history totals: ${totals}`);
}

const config = () => {
  window.location.hash = '/config';
}

onMounted(() => {
    recalculateValues();
});

</script>

<template>
  
  <nav class="navbar sticky-top bg-dark">
    <div class="container-fluid">
      <span class="fs-4 text-light">Leaving Earth - Calc</span>
      <span class="game-button-bar">
        <button class="btn btn-primary-outline" type="button" @click="config"><i class="fas fa-gear"></i></button>
        <button class="btn btn-primary-outline" type="button" @click="toggleViewHistory" title="Show/Hide history"><i v-if="viewHistory==true" class="fas fa-table-list"></i><i v-if="viewHistory==false" class="fas fa-table-list icon-crossed"></i></button>
        <button class="btn btn-primary-outline" type="button" @click="toggleAudio"><i v-if="audio==true" class="fas fa-volume-high"></i><i v-if="audio==false" class="fas fa-volume-xmark"></i></button>
        <button class="btn btn-danger" type="button" @click="reset"><i class="fas fa-circle-xmark"></i> Reset</button>
      </span>
    </div>
  </nav>

  <div class="div-mission">
    Mission: <input v-model="store.mission" placeholder="Mission" class="mission-input" />
    Step: <input v-model="store.step" placeholder="Step" class="step-input" />
  </div>

  <input id="chkSaturn" type="checkbox" v-model="store.saturn" class="btn-check" @change="toggleSaturn()" />
  <label for="chkSaturn" class="btn btn-outline-primary rocket-checkbox">Saturn</label>
  <input id="chkSoyuz" type="checkbox" v-model="store.soyuz" class="btn-check" @change="toggleSoyuz()" />
  <label for="chkSoyuz" class="btn btn-outline-primary rocket-checkbox">Soyuz</label>
  <input id="chkAtlas" type="checkbox" v-model="store.atlas" class="btn-check" @change="toggleAtlas()" />
  <label for="chkAtlas" class="btn btn-outline-primary rocket-checkbox">Atlas</label>
  <input id="chkJuno" type="checkbox" v-model="store.juno" class="btn-check" @change="toggleJuno()" />
  <label for="chkJuno" class="btn btn-outline-primary rocket-checkbox">Juno</label>

  <div class="div-mass">
    <button class="btn btn-secondary button-change" @click="incrementMass(-5)">-5</button>
    <button class="btn btn-secondary button-change" @click="incrementMass(-1)">-1</button>
    Mass: <input type="number" v-model="store.mass" placeholder="Mass" class="mass-input" @change="recalculateValues()" />
    <button class="btn btn-secondary button-change" @click="incrementMass(1)">+1</button>
    <button class="btn btn-secondary button-change" @click="incrementMass(5)">+5</button>
    <button  v-if="history.length > 0" class="btn btn-secondary button-change" @click="changeMassFromLastHistory(5)">From last step: {{ historyTotals.totalMass }}</button>
  </div>
  <!--<div class="div-difficulty">
    <button class="btn btn-secondary button-change" @click="incrementDifficulty(-5)">-5</button>
    <button class="btn btn-secondary button-change" @click="incrementDifficulty(-1)">-1</button>
    Difficulty: <input type="number" v-model="store.difficulty" placeholder="Difficulty" class="difficulty-input" @change="recalculateValues()" />
    <button class="btn btn-secondary button-change" @click="incrementDifficulty(1)">+1</button>
    <button class="btn btn-secondary button-change" @click="incrementDifficulty(5)">+5</button>
  </div>
  -->

<div class="btn-group btn-group-difficulty" role="group" aria-label="Difficulty">
  Difficulty
  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty1" autocomplete="off" v-model="store.difficulty" value="1" @change="toggleDifficulty(1)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty1">1</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty2" autocomplete="off" v-model="store.difficulty" value="2" @change="toggleDifficulty(2)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty2">2</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty3" autocomplete="off" v-model="store.difficulty" value="3" @change="toggleDifficulty(3)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty3">3</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty4" autocomplete="off" v-model="store.difficulty" value="4" @change="toggleDifficulty(4)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty4">4</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty5" autocomplete="off" v-model="store.difficulty" value="5" @change="toggleDifficulty(5)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty5">5</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty6" autocomplete="off" v-model="store.difficulty" value="6" @change="toggleDifficulty(6)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty6">6</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty7" autocomplete="off" v-model="store.difficulty" value="7" @change="toggleDifficulty(7)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty7">7</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty8" autocomplete="off" v-model="store.difficulty" value="8" @change="toggleDifficulty(8)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty8">8</label>

  <input type="radio" class="btn-check" name="btnradio" id="btnDifficulty9" autocomplete="off" v-model="store.difficulty" value="9" @change="toggleDifficulty(9)"/>
  <label class="btn btn-outline-primary" for="btnDifficulty9">9</label>
</div>

  <div>
    Results:
    <table class="table-results">
      <thead>
        <tr>
          <th>Saturn</th>
          <th>Soyuz</th>
          <th>Atlas</th>
          <th>Juno</th>
          <th>Thrust</th>
          <th>Cost</th>
          <th>Mass</th>
          <th>Total Mass</th>
          <th>Add</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in result" :key="index" :class="index % 2 === 0 ? 'even-row' : 'odd-row'">
          <td :class="item.saturns==0?'value-0':'value'">{{ item.saturns }}</td>
          <td :class="item.soyuzs==0?'value-0':'value'">{{ item.soyuzs }}</td>
          <td :class="item.atlases==0?'value-0':'value'">{{ item.atlases }}</td>
          <td :class="item.junos==0?'value-0':'value'">{{ item.junos }}</td>
          <td :class="item.thrust==0?'value-0':'value'">{{ item.thrust }}</td>
          <td :class="item.bestCostRockets ? 'best-cost-rockets' : ''">{{ item.costRockets }}</td>
          <td :class="item.bestMassRockets ? 'best-mass-rockets' : ''">{{ item.massRockets }}</td>
          <td :class="item.bestMassRockets ? 'best-mass-rockets' : ''">{{ item.totalMass }}</td>
          <td class="add-button">
            <button class="btn btn-primary" @click="addToHistory(item)">Add</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card m-1 history-container" v-if="viewHistory">
    History
    <div class="history">
      <table class="table-history">
        <thead>
          <tr>
            <th>Mission</th>
            <th>Step</th>
            <th>Mass</th>
            <th>Difficulty</th>
            <th>Saturn</th>
            <th>Soyuz</th>
            <th>Atlas</th>
            <th>Juno</th>
            <th>Thrust</th>
            <th>Cost</th>
            <th>Mass</th>
            <th>Total Mass</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in history" :key="index" :class="index % 2 === 0 ? 'even-row' : 'odd-row'">
            <td>{{ item.mission }}</td>
            <td>{{ item.step }}</td>
            <td>{{ item.mass }}</td>
            <td>{{ item.difficulty }}</td>
            <td :class="item.saturns==0?'value-0':'value'">{{ item.saturns }}</td>
            <td :class="item.soyuzs==0?'value-0':'value'">{{ item.soyuzs }}</td>
            <td :class="item.atlases==0?'value-0':'value'">{{ item.atlases }}</td>
            <td :class="item.junos==0?'value-0':'value'">{{ item.junos }}</td>
            <td :class="item.thrust==0?'value-0':'value'">{{ item.thrust }}</td>
            <td :class="item.bestCostRockets ? 'best-cost-rockets' : ''">{{ item.costRockets }}</td>
            <td :class="item.bestMassRockets ? 'best-mass-rockets' : ''">{{ item.massRockets }}</td>
            <td :class="item.bestMassRockets ? 'best-mass-rockets' : ''">{{ item.totalMass }}</td>
            <td class="remove-button">
              <button class="btn btn-danger" @click="removeHistory(index)">Remove</button>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="history.length > 0">
          <tr>
            <td colspan="4" class="text-end">Total: {{ history.length }} entries</td>
            <td :class="historyTotals.saturns==0?'value-0':'value'">{{ historyTotals.saturns }}</td>
            <td :class="historyTotals.soyuzs==0?'value-0':'value'">{{ historyTotals.soyuzs }}</td>
            <td :class="historyTotals.atlases==0?'value-0':'value'">{{ historyTotals.atlases }}</td>
            <td :class="historyTotals.junos==0?'value-0':'value'">{{ historyTotals.junos }}</td>
            <td :class="historyTotals.thrust==0?'value-0':'value'">{{ historyTotals.thrust }}</td>
            <td>{{ historyTotals.costRockets }}</td>
            <td>{{ historyTotals.massRockets }}</td>
            <td>{{ historyTotals.totalMass }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
    
  </template>