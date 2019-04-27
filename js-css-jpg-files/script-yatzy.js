



Vue.component("dice", {

    props: [
        "dicePictures",

        "numberOfThrowsLeft",

        "throwDiceButtonInfo"
    ],

    template: `
        <div class=grid-item id="dice-div">

            <div>
                <img :src="dicePictures[0]" @click="toggleLocked(0)" alt="die1">
            </div>

            <div>
                <img :src="dicePictures[1]" @click="toggleLocked(1)" alt="die2">
            </div>
                
            <div>
                <img :src="dicePictures[2]" @click="toggleLocked(2)" alt="die3">
            </div>

            <div>
                <img :src="dicePictures[3]" @click="toggleLocked(3)" alt="die4">
            </div>

            <div>
                <img :src="dicePictures[4]" @click="toggleLocked(4)" alt="die5">
            </div>

            <div>
                <p>Antal kast kvar: {{ numberOfThrowsLeft }}</p>
            </div>

            <button id="throw-button" @click="throwDice" :class="{disabled:(throwDiceButtonInfo.noThrowsLeft || throwDiceButtonInfo.allDiceLocked || throwDiceButtonInfo.throwOngoing)}">{{ throwDiceButtonInfo.buttonString }}</button>

        </div>
    `,

    methods: {

        toggleLocked: function(index) {

            //console.log("Hallå!");
            
            store.commit("toggleLocked", index);
        },


        throwDice: function() {

            if (this.numberOfThrowsLeft > 0 && !this.throwDiceButtonInfo.allDiceLocked && !this.throwDiceButtonInfo.throwOngoing) {

                store.commit("toggleThrowOngoing");

                store.commit("decreaseNumberOfThrowsLeft");

                // minska antal slag med 1, via en commit

                let numberOfRandomisations = 13;

                let interval = setInterval(function() {

                    //commit, kör random på de tärningar som ej är låsta

                    store.commit("randomizeDice");

                    //console.log("throwDice!!!");                

                    numberOfRandomisations--;

                    if (numberOfRandomisations === 0) {

                        clearInterval(interval);

                        store.commit("toggleThrowOngoing");

                    }

                }, 75);                

            }

        }
        
    }

});





////////////////////////////////////////////////////////////////////////////////////////////////////


// GÖR OBJEKT!!!



const store = new Vuex.Store({
    
    state: {

        dice: [
            {value: 1,
            locked: false},
        
            {value: 2,
            locked: false},
        
            {value: 3,
            locked: false},
        
            {value: 4,
            locked: false},
        
            {value: 5,
            locked: false},        
        ],

        dicePics: [
            {unlocked: 'js-css-jpg-files/one.jpg',
            locked: 'js-css-jpg-files/one-locked.jpg',
            disabled: 'js-css-jpg-files/one-disabled.jpg'},

            {unlocked: 'js-css-jpg-files/two.jpg',
            locked: 'js-css-jpg-files/two-locked.jpg',
            disabled: 'js-css-jpg-files/two-disabled.jpg'},

            {unlocked: 'js-css-jpg-files/three.jpg',
            locked: 'js-css-jpg-files/three-locked.jpg',
            disabled: 'js-css-jpg-files/three-disabled.jpg'},

            {unlocked: 'js-css-jpg-files/four.jpg',
            locked: 'js-css-jpg-files/four-locked.jpg',
            disabled: 'js-css-jpg-files/four-disabled.jpg'},

            {unlocked: 'js-css-jpg-files/five.jpg',
            locked: 'js-css-jpg-files/five-locked.jpg',
            disabled: 'js-css-jpg-files/five-disabled.jpg'},

            {unlocked: 'js-css-jpg-files/six.jpg',
            locked: 'js-css-jpg-files/six-locked.jpg',
            disabled: 'js-css-jpg-files/six-disabled.jpg'}
        ],

        throwDiceButtonStrings: ["Kasta tärningarna!", "Kasta tärningen!", "Ingen olåst tärning", "Inget kast kvar"],

        numberOfThrowsLeft: 3,

        throwOngoing: false

    },

    getters: {

        getCurrentDicePictures: state => {

            let pictures = [];

            if (state.numberOfThrowsLeft === 3) {

                for (let index = 0; index < 5; index++) {
                    pictures.push(state.dicePics[ state.dice[index].value - 1 ].disabled);
                }

            }

            else {

                for (let index = 0; index < 5; index++) {

                    if (state.dice[index].locked) {
                        pictures.push(state.dicePics[ state.dice[index].value - 1 ].locked);
                    }

                    else {
                        pictures.push(state.dicePics[ state.dice[index].value - 1 ].unlocked);
                    }
                    
                }

            }

            return pictures;

        },



        // throwButtonDisabled: state => {

        //     let allDiceLocked = state.dice.every(function(die) {
        //         return die.locked;
        //     });

        //     return allDiceLocked || state.numberOfThrowsLeft === 0;

        // },



        throwDiceButtonInfo: state => {

            let numberOfDiceLocked = state.dice.filter(function(die) {
                return die.locked;
            }).length;

            let throwDiceButtonString;

            if (state.numberOfThrowsLeft === 0) {
                throwDiceButtonString = state.throwDiceButtonStrings[3];
            }
            else if (numberOfDiceLocked === 5) {
                throwDiceButtonString = state.throwDiceButtonStrings[2];
            }
            else if (numberOfDiceLocked === 4) {
                throwDiceButtonString = state.throwDiceButtonStrings[1];
            }
            else {
                throwDiceButtonString = state.throwDiceButtonStrings[0];
            }            

            return {
                buttonString: throwDiceButtonString,
                noThrowsLeft: state.numberOfThrowsLeft === 0,
                allDiceLocked: numberOfDiceLocked === 5,
                throwOngoing: state.throwOngoing
            };

        }

    },

    mutations: {

        toggleLocked(state, payload) {

            if (state.numberOfThrowsLeft < 3 && !state.throwOngoing) {
                state.dice[payload].locked = !state.dice[payload].locked;
            }

        },



         decreaseNumberOfThrowsLeft(state) {

            state.numberOfThrowsLeft--;

         },



         randomizeDice(state) {

            state.dice.forEach(function(die) {
                
                if (!die.locked) {

                    die.value = Math.floor(Math.random() * 6) + 1;
                    
                    //console.log(die.value);                    

                }

            });

         },



         toggleThrowOngoing(state) {

            state.throwOngoing = !state.throwOngoing;
            
            //console.log("mutation toggleThrowOngoing");            

         }

    }

});









////////////////////////////////////////////////////////////////////////////////////////////////////


const app = new Vue({

    el: "#app",

    store,

    computed: {

        currentDicePictures() {
            return this.$store.getters.getCurrentDicePictures;
        },

        throwButtonDisabled() {
            return this.$store.getters.throwButtonDisabled;
        },

        numberOfThrowsLeft() {
            return this.$store.state.numberOfThrowsLeft;
        },

        throwDiceButtonInfo() {
            return this.$store.getters.throwDiceButtonInfo;
        }
                
    }

});