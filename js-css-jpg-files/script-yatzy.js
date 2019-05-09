


// Den första Vue-komponentens template innehåller bilder på tärningarna. Vid ett klick på en av dessa 
// bilder anropas metoden 'toggleLocked'. Beroende på värdet på 'dicePictures.rotations' under ett 
// pågående tärningskast, så kommer varje bild att tilldelas en rotation på -10, -5, 0, 5 eller 
// 10 grader. (Klasserna 'minusTenDeg', 'minusFiveDeg', ingen klass alls, 'plusFiveDeg' 
// eller 'plusTenDeg').
// Templaten innehåller även en p-tag, där antalet återstående kast skrivs ut, samt en button som 
// anropar metoden 'throwDice'. Denna button kan vara disablad under vissa förutsättningar, och 
// dessa förutsättningar är:
// Om inga kast återstår, om alla tärningar är låsta, om ett tärningskast pågår eller om alla 
// poängkategorier har fyllts i, dvs att en hel omgång är avslutad.



const dice = {

    props: [
        "dicePictures",
        "throwDiceInfo",
        "result"
    ],



    template: `
        <div class=grid-item id="dice-div">

            <div>
                <img :src="dicePictures.pics[0]" @click="toggleLocked(0)" alt="die1" :class="{minusTenDeg:dicePictures.rotations[0] === -2, minusFiveDeg:dicePictures.rotations[0] === -1, plusFiveDeg:dicePictures.rotations[0] === 1, plusTenDeg:dicePictures.rotations[0] === 2}">
            </div>

            <div>
                <img :src="dicePictures.pics[1]" @click="toggleLocked(1)" alt="die2" :class="{minusTenDeg:dicePictures.rotations[1] === -2, minusFiveDeg:dicePictures.rotations[1] === -1, plusFiveDeg:dicePictures.rotations[1] === 1, plusTenDeg:dicePictures.rotations[1] === 2}">
            </div>

            <div>
                <img :src="dicePictures.pics[2]" @click="toggleLocked(2)" alt="die3" :class="{minusTenDeg:dicePictures.rotations[2] === -2, minusFiveDeg:dicePictures.rotations[2] === -1, plusFiveDeg:dicePictures.rotations[2] === 1, plusTenDeg:dicePictures.rotations[2] === 2}">
            </div>

            <div>
                <img :src="dicePictures.pics[3]" @click="toggleLocked(3)" alt="die4" :class="{minusTenDeg:dicePictures.rotations[3] === -2, minusFiveDeg:dicePictures.rotations[3] === -1, plusFiveDeg:dicePictures.rotations[3] === 1, plusTenDeg:dicePictures.rotations[3] === 2}">
            </div>

            <div>
                <img :src="dicePictures.pics[4]" @click="toggleLocked(4)" alt="die5" :class="{minusTenDeg:dicePictures.rotations[4] === -2, minusFiveDeg:dicePictures.rotations[4] === -1, plusFiveDeg:dicePictures.rotations[4] === 1, plusTenDeg:dicePictures.rotations[4] === 2}">
            </div>

            <div>
                <p>{{ throwDiceInfo.numberOfThrowsLeft }} kast kvar</p>
            </div>

            <button id="throw-button" @click="throwDice" :class="{disabled:(throwDiceInfo.numberOfThrowsLeft === 0 || throwDiceInfo.allDiceLocked || throwDiceInfo.throwOngoing || result.allCategoriesSet)}">{{ throwDiceInfo.buttonString }}</button>

        </div>
    `,



    methods: {

        // Metoden 'toggleLocked' anropar en mutation i store med samma namn, som togglar 
        // parametern 'locked' för tärningen med det aktuella indexet.



        toggleLocked: function(index) {

            store.commit("toggleLocked", index);

        },



        // Metoden 'throwDice' kollar först om förutsättningar är korrekta för att ett tärningskast 
        // ska utföras, dessa förutsättningar är:
        // Att åtminstone ett kast återstår, att åtminstone en tärning är olåst, att inget ett 
        // tärningskast pågår och att alla inte poängkategorier har fyllts i, dvs att en hel omgång 
        // inte är avslutad.
        // Om alla dessa förutsättningar är uppfyllda så anropas en mutation i stor vid namn 
        // 'toggleThrowOngoing'. Sedan körs 13 varv, med en delay på 75 ms efter varje varv. I ett 
        // varv så anropas en mutation i store vid namn 'randomizeDice', och därefter så minskas 
        // antalet återstående varv med 1. När man har nått ner till 0 på variabeln 
        // 'numberOfRandomisations' så anropas totalt 5 mutations i store: 'toggleThrowOngoing', 
        // dvs tärningskastet är nu avslutat, 'decreaseNumberOfThrowsLeft' som minskar antalet 
        // återstående kast med 1, 'resetDiceRotations' som ser till att ingen tärningsbild är 
        // roterad efter ett avslutat kast, 'calculatePoints' som räknar ut möjliga poäng för den 
        // aktuella kombinationen av värden på tärningarna, samt 'setInitialId' som avgör den 
        // initiala positionen för den flyttbara markören i poängprotokollet.



        throwDice: function() {

            if (this.throwDiceInfo.numberOfThrowsLeft > 0 && !this.throwDiceInfo.allDiceLocked && !this.throwDiceInfo.throwOngoing && !this.result.allCategoriesSet) {

                store.commit("toggleThrowOngoing");

                let numberOfRandomisations = 13;

                let interval = setInterval(function() {

                    store.commit("randomizeDice");

                    numberOfRandomisations--;

                    if (numberOfRandomisations === 0) {

                        clearInterval(interval);

                        store.commit("toggleThrowOngoing");

                        store.commit("decreaseNumberOfThrowsLeft");

                        store.commit("resetDiceRotations");

                        store.commit("calculatePoints");

                        store.commit("setInitialId");

                    }

                }, 75);

            }

        }

    },



    created() {

        // Den första eventlistener'n nedan ser till att sidan inte scrollar om man trycker 
        // på mellanslag/blanksteg.



        window.addEventListener('keydown', function(event) {

            if(event.keyCode == 32 && event.target == document.body) {

                event.preventDefault();

            }

        });



        // Denna eventlistener lyssnar efter tryck på sifferknapparna 1 - 5, både de "vanliga" 
        // och de på det numeriska tangentbordet, samt även tryck på tangenterna H, J, K, N 
        // och M. Alla dessa tangenttryck togglar någon tärning mellan låst och olåst läge, 
        // genom att metoden 'toggleLocked' anropas. Även tryck på mellanslag/blanksteg lyssnas 
        // efter, varvid metoden 'throwDice' anropas. 



        window.addEventListener('keyup', (event) => {

            if (event.keyCode >= 49 && event.keyCode <= 53) {

                this.toggleLocked(event.keyCode - 49);

            }

            else if (event.keyCode >= 97 && event.keyCode <= 101) {

                this.toggleLocked(event.keyCode - 97);

            }

            else if (event.keyCode === 72) {

                this.toggleLocked(0);

            }

            else if (event.keyCode === 74) {

                this.toggleLocked(1);

            }

            else if (event.keyCode === 75) {

                this.toggleLocked(2);

            }

            else if (event.keyCode === 78) {

                this.toggleLocked(3);

            }

            else if (event.keyCode === 77) {

                this.toggleLocked(4);

            }

            else if (event.keyCode === 32) {

                this.throwDice();

            }

        });

    }

};



////////////////////////////////////////////////////////////////////////////////////////////////////



// I templaten för nästa Vue-komponent, 'scoreCategoryRow', ingår två stycken div'ar med en p-tag i 
// varje. I den första p-tagen skrivs namnet på den aktuella poängkategorin ut, t.ex. "Ettor".
// Ett klick på den andra div'en anropar metoden 'setPoints' för den aktuella raden. Beroende på en 
// mängd villkor, så kan div'en tilldelas en av fyra klasser: 'pointsSet' om poängen är slutgiltigt 
// fastställd för den aktuella raden, 'zeroPoints' (håll i dig nu...): om radens id inte är 6 eller 
// 7, det är raderna delsumma och bonus som spelaren aldrig själv sätter poängen på, om det är 
// möjligt att sätta poäng vid denna tidpunkt enligt parametern 'possibleToSetPoints', om poäng inte 
// redan är slutgiltigt fastställd för den aktuella raden och om den beräknade, möjliga poängen för 
// den aktuella raden är lika med 0. Klassen 'moreThanZeroPoints' har samma villkor som klassen 
// 'zeroPoints' bortsett från det sista villkoret, den möjliga poängen för den aktuella raden är 
// större än 0.
// Den fjärde möjliga klassen, 'currentlyChosenScoreCategory' är för att visa markeringen på den 
// kategori man har navigerat till med piltangenterna. Denna klass tilldelas div'en om den aktuella 
// radens id är lika med 'currentId', dvs id't för raden man navigerat till, och om det är möjligt 
// att sätta poäng vid denna tidpunkt enligt parametern 'possibleToSetPoints'.
// p-tagen i den andra div'en visar poäng som ges av metoden 'showPoints'.



const scoreCategoryRow = {

    props: [
        "categoryAndPointsRow",
        "scoreTableInfo"
    ],



    template: `
        <div class="scoreCategory">

            <div>
                <p>{{ categoryAndPointsRow.categoryString }}</p>
            </div>

            <div @click="setPoints(categoryAndPointsRow)" :class="{pointsSet: categoryAndPointsRow.pointsSet, zeroPoints: (categoryAndPointsRow.id !== 6 && categoryAndPointsRow.id !== 7 && scoreTableInfo.possibleToSetPoints && !categoryAndPointsRow.pointsSet && categoryAndPointsRow.points === 0), moreThanZeroPoints: (categoryAndPointsRow.id !== 6 && categoryAndPointsRow.id !== 7 && scoreTableInfo.possibleToSetPoints && !categoryAndPointsRow.pointsSet && categoryAndPointsRow.points > 0), currentlyChosenScoreCategory: (categoryAndPointsRow.id === scoreTableInfo.currentId && scoreTableInfo.possibleToSetPoints)}">
                <p>{{ showPoints(categoryAndPointsRow) }}</p>
            </div>

        </div>
    `,



    methods: {

        // Metoden 'showPoints' kollar först om den aktuella radens id är 6 eller 7, om det är 
        // fallet och den slutgiltiga poängen inte är fastställd för denna rad så ska rutan 
        // vara tom. Annars, om poängen för den aktuella raden är fastställd, eller om antalet 
        // återstående kast är färre än 3 och det inte pågår något tärningskast för tillfället, 
        // så ska radens poäng visas (slutgiltig eller möjlig). Annars ska rutan vara tom.



        showPoints: function(currentRow) {

            if ( (currentRow.id === 6 || currentRow.id === 7) && !currentRow.pointsSet) {

                return "";

            }

            else if( currentRow.pointsSet || ( this.scoreTableInfo.numberOfThrowsLeft < 3 && !this.scoreTableInfo.throwOngoing ) ) {

                return currentRow.points;

            }

            else {

                return "";

            }

        },



        // Metoden 'setPoints' anropar en mutation i store vid samma namn, om poängen för den 
        // aktuella raden inte är slutgiltigt fastställd och det är möjligt att sätta poäng 
        // vid denna tidpunkt enligt parametern 'possibleToSetPoints' och den aktuella radens 
        // id inte är 6 eller 7.



        setPoints: function(currentRow) {

            if (!currentRow.pointsSet && this.scoreTableInfo.possibleToSetPoints && currentRow.id !== 6 && currentRow.id !== 7) {

                store.commit("setPoints", currentRow.id);

            }

        }

    }

};



////////////////////////////////////////////////////////////////////////////////////////////////////



// I templaten för nästa Vue-komponent, 'scoreTable', ingår en p-tag som visar slutresultatet 
// och en button som startar en ny omgång. Dessa visas endast när en hel omgång är avslutad, 
// dvs då 'result.allCategoriesSet' är true. Därefter kommer en 'score-category-row' för varje 
// poängkategori, som finns i 'categoryAndPointsInfo'.



const scoreTable = {

    props: [
        "categoryAndPointsInfo",
        "scoreTableInfo",
        "result"
    ],



    template: `
        <div class=grid-item id="score-grid-div">

            <p v-show=result.allCategoriesSet>
                Du fick totalt {{ result.totalPoints }} poäng av maximalt 374 poäng.
            </p>

            <button v-show=result.allCategoriesSet @click="startNewRound">Starta en ny omgång</button>

            <score-category-row
                ref="childComponent"
                v-for="categoryAndPointsRow, index in categoryAndPointsInfo"
                v-bind:category-and-points-row="categoryAndPointsRow"
                v-bind:score-table-info="scoreTableInfo"
                v-bind:key="categoryAndPointsRow.id">
            </score-category-row>

        </div>
    `,



    components: {
        "score-category-row": scoreCategoryRow
    },



    methods: {

        // Metoden 'startNewRound' anropar en mutation i store som startar en ny omgång.



        startNewRound: function() {

            store.commit("startNewRound");

        },



        // Metoden 'arrowsPressed' anropar en av fyra mutations i store, beroende på vilken 
        // av de fyra piltangenterna som man tryckt på.



        arrowsPressed: function(keyCode) {

            if (keyCode === 37) {

                store.commit("arrowLeft");

            }

            else if (keyCode === 38) {

                store.commit("arrowUp");

            }

            else if (keyCode === 39) {

                store.commit("arrowRight");

            }

            else if (keyCode === 40) {

                store.commit("arrowDown");

            }

        },



        // Metoden 'enterPressed' anropar metoden 'setPoints' i "barn-komponenten" 
        // 'scoreCategoryRow', såvida inte en hel omgång är avslutad, då anropas istället 
        // metoden 'startNewRound'.



        enterPressed: function() {

            if (!this.result.allCategoriesSet) {

                this.$refs.childComponent[0].setPoints(this.categoryAndPointsInfo[this.scoreTableInfo.currentId]);

            }

            else {

                this.startNewRound();

            }

        }

    },



    created() {

        // Denna eventlistener ser till att sidan inte scrollar när man trycker på 
        // någon av piltangenterna.



        window.addEventListener('keydown', function(event) {

            if(event.keyCode >= 37 && event.keyCode <= 40 && event.target == document.body) {

                event.preventDefault();

            }

        });



        // Denna eventlistener förhindrar att ordinarie funktion utförs när man trycker på 
        // enter/retur. Jag hade problem med att om man först klickat med musen på knappen 
        // för att kasta tärningarna, så gjorde ett senare tryck på enter/retur samma sak 
        // eftersom knappen blivit "markerad" efter musklicket. Men ett tryck på enter/retur 
        // ska inte kasta tärningarna, utan istället bekräfta att man vill sätta poäng på en 
        // viss poängkategori.



        window.addEventListener('keydown', function(event) {

            if(event.keyCode === 13) {

                event.preventDefault();

            }

        });



        // Denna eventlistener lyssnar efter tryck på någon av piltangenterna, då anropas 
        // metoden 'arrowsPressed', och efter tryck på enter/retur, då anropas 
        // metoden 'enterPressed'.



        window.addEventListener('keyup', (event) => {

            if (event.keyCode >= 37 && event.keyCode <= 40) {

                this.arrowsPressed(event.keyCode);

            }

            else if (event.keyCode === 13) {

                this.enterPressed();

            }

        });

    }

};



////////////////////////////////////////////////////////////////////////////////////////////////////



// I templaten för denna sista Vue-komponent, 'rulesInformation', skrivs regler och tips ut. 
// Den första div'en är till för pc, den andra för mobil. För mobil finns en knapp som man kan 
// trycka på för att visa eller dölja denna text. För pc visas alltid hela texten, även det 
// "andra stycket" som enbart gäller knappar på tangentbordet och därför inte är av intresse för 
// den som spelar på en mobil.



const rulesInformation = {

    props: [
        "rulesInfo"
    ],



    template: `
        <div class="grid-item" id="rules-info-div">

            <div>

                <p>{{ rulesInfo.rulesStrings[0] }}</p>

                <p>{{ rulesInfo.rulesStrings[1] }}</p>

            </div>

            <div>

                <button @click="toggleShowRules">{{ rulesInfo.buttonString }}</button>

                <p v-show="rulesInfo.showRules">{{ rulesInfo.rulesStrings[0] }}</p>

            </div>

        </div>
    `,



    methods: {

        // Metoden 'toggleShowRules' anropar en mutation som togglar värdet på en boolean. 
        // Denna boolean avgör om texten ska visas på en mobil eller inte. 
        // (v-show="rulesInfo.showRules" på p-taggen ovan.)



        toggleShowRules: function() {

            store.commit("toggleShowRules");

        }

    }

};



////////////////////////////////////////////////////////////////////////////////////////////////////



// Härnäst följer ett antal hjälpfunktioner som används av en mutation vid namn 
// 'calculatePoints', längre ned i programmet. Denna första funktion tar in en array 
// med 5 positioner, som bland annat innehåller varje tärnings aktuella värde. 
// Funktionen returnerar en array med 6 positioner, som istället anger antalet tärningar 
// av varje sort. (Exempel: [1, 2, 2, 0, 0, 0] innebär alltså att man har en etta, 
// två tvåor och två treor.)



function countNumberOfDice(dice) {

    let numberOfDice = [];

    for (let index = 1; index <= 6; index++) {

        numberOfDice.push(dice.filter(function(die) {

            return die.value === index;

        }).length);

    }

    return numberOfDice;

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion används för att beräkna poängen i de första sex poängkategorierna. 
// Värdet på 'value' är egentligen 1 lägre än det aktuella värdet på tärningarna som 
// man beräknar poängen för, därav ' + 1' i return-satsen.



function onesToSixes(value, numberOfDice) {

    return numberOfDice[value] * (value + 1);

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion används för att beräkna poängen för ett par. Man kan ju ha två par, 
// och då ska det högsta paret räknas. Därför vänder jag på arrayen med antalet av varje 
// tärningsvärde, och letar upp index för det första paret, dvs det element i arrayen 
// som är större eller lika med 2. Eftersom metoden 'reverse()' vänder på den ursprungliga 
// arrayen, så måste jag sedan vända på den en gång till. Om det index man hittat är -1, 
// så fanns det inget par, och då returneras 0. Annars returneras 2 gånger värdet på det 
// tärningsvärde som det högsta paret har. Värdet blir '6 - indexet', vilket ser lite 
// konstigt ut, men det blir så eftersom indexet gäller den omvända arrayen.



function onePair(numberOfDice) {

    let indexForHighestPair = numberOfDice.reverse().findIndex(function(numberOfDie) {

        return numberOfDie >= 2;

    });

    numberOfDice.reverse();

    if (indexForHighestPair === -1) {

        return 0;

    }

    else {

        return 2 * (6 - indexForHighestPair);

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion används för att beräkna poängen för två par. Den påminner delvis om 
// föregående funktion. Jag börjar med att leta efter det lägsta paret, därefter det 
// högsta paret genom att vända på arrayen. Jag vänder sedan rätt arrayen igen. Därefter 
// följer en if-sats, om de tre villkoren är uppfyllda så har man hittat två stycken 
// olika par. (Om 'indexForLowestPair' är -1 och 'indexForHighestPair' är 6 så finns det 
// inget par , dvs alla tärningar har olika värde. Om 'indexForLowestPair' och 
// 'indexForHighestPair' är samma så finns det endast ett par.)



function twoPair(numberOfDice) {

    let indexForLowestPair = numberOfDice.findIndex(function(numberOfDie) {

        return numberOfDie >= 2;

    });

    let indexForHighestPair = 5 - numberOfDice.reverse().findIndex(function(numberOfDie) {

        return numberOfDie >= 2;

    });

    numberOfDice.reverse();

    if ( (indexForLowestPair !== -1) && (indexForHighestPair !== 6) && (indexForLowestPair !== indexForHighestPair) ) {

        return 2 * (2 + indexForLowestPair + indexForHighestPair);

    }

    else {

        return 0;

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion används för att beräkna poängen för både tretal och fyrtal. Argumentet 
// 'minNumber' är 3 eller 4, beroende på om det är poäng för tretal eller fyrtal som ska 
// beräknas. Om man hittar åtminstone så många tärningar med samma värde som argumentet 
// 'minNumber' anger, så har man ett tretal eller fyrtal, poängen blir då 
// 'minNumber * (index + 1)'. Hittar man inte det, så blir index -1 och då returneras 0.



function threeAndFourOfAKind(numberOfDice, minNumber) {

    let index = numberOfDice.findIndex(function(numberOfDie) {

        return numberOfDie >= minNumber;

    });

    if (index === -1) {

        return 0;

    }

    else {

        return minNumber * (index + 1);

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion kollar om man har en liten stege. De 5 första elementen i arrayen slicas ut, 
// och om alla dessa har värdet 1, då har man en liten stege och 15 poäng returneras, annars 0.



function smallStraight(numberOfDice) {

    if (numberOfDice.slice(0, 5).every(function(value) {

        return value === 1;

    })) {

        return 15;

    }

    else {

        return 0;

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion beräknar poängen för en stor stege, och fungerar på i princip samma sätt 
// som föregående funktion, bortsett från att det är de 5 sista elementen som slicas ut 
// istället för de 5 första, och om alla har värdet 1 så returneras 20 poäng.



function largeStraight(numberOfDice) {

    if (numberOfDice.slice(1, 6).every(function(value) {

        return value === 1;

    })) {

        return 20;

    }

    else {

        return 0;

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion beräknar poängen för en kåk. Index för ett par samt index för ett tretal 
// letas upp. Om något eller båda av dessa index har värdet -1 hittades inte något par 
// och/eller något tretal och 0 returneras, annars har man en kåk.



function fullHouse(numberOfDice) {

    let indexPair = numberOfDice.findIndex(function(numberOfDie) {

        return numberOfDie === 2;

    });

    let indexThreeOfAKind = numberOfDice.findIndex(function(numberOfDie) {

        return numberOfDie === 3;

    });

    if (indexPair === -1 || indexThreeOfAKind === -1) {

        return 0;

    }

    else {

        return 2 * (indexPair + 1) + 3 * (indexThreeOfAKind + 1);

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion beräknar poängen för chans, vilket helt enkelt summan av alla 
// tärningsvärden multiplicerat med antalet av varje tärningsvärde.



function chance(numberOfDice) {

    let sum = 0;

    numberOfDice.forEach(function(numberOfDie, index) {

        sum += numberOfDie * (index + 1);

    });

    return sum;

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Denna funktion beräknar poängen för yatzy. Om det finns 5 stycken av något 
// tärningsvärde så returneras 50, annars 0. Detta är den sista av hjälpfunktionerna 
// som används i mutationen 'calculatePoints'.



function yatzy(numberOfDice) {

    if (numberOfDice.some(function(numberOfDie) {

        return numberOfDie === 5;

    })) {

        return 50;

    }

    else {

        return 0;

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Detta är en hjälpfunktion som används i mutationen 'setPoints' för att ta bort 
// det id som anger var markören i poängprotokollet befinner sig när man väljer att 
// slutgiltigt sätta poängen för en kategori. Mer info om detta finns längre ned 
// i denna fil.



function removeCurrentId(currentRowId, choosableIds) {

    if (currentRowId <= 5) {

        choosableIds.left.splice(choosableIds.left.indexOf(currentRowId), 1);

    }

    else {

        choosableIds.right.splice(choosableIds.right.indexOf(currentRowId), 1);

    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////



// Här kommer till slut min store.



const store = new Vuex.Store({

    state: {

        // I 'dice' lagras, för var och en av de 5 tärningarna, det aktuella värdet, 
        // en boolean som anger om tärningen är låst eller inte samt tärningsbildens rotation.



        dice: [
            {value: 1,
            locked: false,
            rotation: 0},

            {value: 2,
            locked: false,
            rotation: 0},

            {value: 3,
            locked: false,
            rotation: 0},

            {value: 4,
            locked: false,
            rotation: 0},

            {value: 5,
            locked: false,
            rotation: 0},
        ],



        // 'dicePics' innehåller sökvägarna till tärningsbilderna. Varje tärningsvärde 
        // har 3 bilder, en för olåst läge, en för låst läge och en för vad jag kallar 
        // disablat läge. Det sistnämnda är innan man slagit det första av 3 kast, 
        // då har tärningarnas värde ingen betydelse.



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



        // 'throwDiceButtonStrings' innehåller de olika textsträngar som 
        // 'kasta tärningarna'-knappen kan ha.



        throwDiceButtonStrings: ["Kasta tärningarna!", "Kasta tärningen!", "Ingen olåst tärning", ""],



        // I 'numberOfThrowsLeft' lagras antalet återstående kast i den 
        // aktuella omgången.


        numberOfThrowsLeft: 3,



        // 'throwOngoing' anger om ett tärningskast pågår för tillfället, eller inte.


        throwOngoing: false,



        // 'possibleToSetPoints' anger om det för ögonblicket är möjligt att sätta 
        // poäng på de olika kategorierna.


        possibleToSetPoints: false,



        // I 'scoreCategories' lagras, för var och en av de olika poängkategorierna 
        // i protokollet, ett id-nummer, en sträng som anger namnet på kategorin, poäng 
        // (antingen slutgiltigt fastställd eller möjlig poäng efter ett tärningskast) 
        // samt en boolean som anger om poängen är slutgiltigt fastställd.


        scoreCategories: [
            {id: 0,
            categoryString: "Ettor",
            points: 0,
            pointsSet: false},

            {id: 1,
            categoryString: "Tvåor",
            points: 0,
            pointsSet: false},

            {id: 2,
            categoryString: "Treor",
            points: 0,
            pointsSet: false},

            {id: 3,
            categoryString: "Fyror",
            points: 0,
            pointsSet: false},

            {id: 4,
            categoryString: "Femmor",
            points: 0,
            pointsSet: false},

            {id: 5,
            categoryString: "Sexor",
            points: 0,
            pointsSet: false},

            {id: 6,
            categoryString: "Delsumma",
            points: 0,
            pointsSet: false},

            {id: 7,
            categoryString: "Bonus",
            points: 0,
            pointsSet: false},

            {id: 8,
            categoryString: "Ett par",
            points: 0,
            pointsSet: false},

            {id: 9,
            categoryString: "Två par",
            points: 0,
            pointsSet: false},

            {id: 10,
            categoryString: "Tretal",
            points: 0,
            pointsSet: false},

            {id: 11,
            categoryString: "Fyrtal",
            points: 0,
            pointsSet: false},

            {id: 12,
            categoryString: "Liten stege",
            points: 0,
            pointsSet: false},

            {id: 13,
            categoryString: "Stor stege",
            points: 0,
            pointsSet: false},

            {id: 14,
            categoryString: "Kåk",
            points: 0,
            pointsSet: false},

            {id: 15,
            categoryString: "Chans",
            points: 0,
            pointsSet: false},

            {id: 16,
            categoryString: "Yatzy",
            points: 0,
            pointsSet: false}
        ],



        // 'rulesInfo' innehåller information relaterad till de regler och tips som 
        // visas på sidan. I mobil-läget visas en button som togglar mellan att 
        // visa respektive inte visa texten. 'buttonStrings' innehåller texten 
        // på denna button för de två olika fallen, och 'showRules' är den boolean 
        // som man togglar värdet på. 'rulesStrings' innehåller två textsträngar, 
        // den första visas i både mobil- och pc-läget. Den andra strängen gäller 
        // hur man spelar med tangentbordet, och visas enbart i pc-läget.



        rulesInfo: {
            buttonStrings: ["Visa regler och tips", "Dölj regler och tips"],
            showRules: false,
            rulesStrings: ["På denna webbsida spelas Yatzy enligt varianten \"fri\", dvs efter varje omgång av tre slag (eller färre, om man så vill) kan poängen bokföras på vilken kategori som helst, förutsatt att man inte redan tidigare bokfört poäng på kategorin.\n\nFör att kasta tärningarna, klicka/peka på knappen med texten 'Kasta tärningarna!'. Före det andra och det tredje slaget kan man välja att växla mellan låst och olåst läge på tärningarna, genom att klicka/peka på de tärningar man vill växla läge på.\n\nNär man vill bokföra ett resultat på en kategori i protokollet, så gör man det genom att klicka/peka på rutan som visar poängen för den aktuella kategorin. De kategorier som man kan välja blinkar sakta i färgerna grönt eller rött. Rött visar att om man väljer denna kategori så får man inga poäng, dvs man stryker denna kategori. Grönt innebär att man får åtminstone 1 poäng vid val av den aktuella kategorin. En tidigare vald kategori har en blå bakgrundsfärg.\n\nEfter att en hel omgång är avslutad så visas slutresultatet, samt en knapp som man kan klicka/peka på ifall man vill starta en ny omgång.",
            "Om man spelar på en dator kan man använda tangentbordet istället för musen, ifall man vill. För att kasta tärningarna trycker man på mellanslag/blanksteg.\n\nFör att växla mellan låst och olåst läge så trycker man på siffertangenterna 1 - 5. Tärningarna är numrerade på följande sätt:\n\n1  2  3\n 4  5\n\nFör att växla läge på tärningarna så kan man även använda följande tangenter:\n\nH  J  K\n  N  M\n\nFör att navigera runt i protokollet, när man vill bokföra ett resultat på en viss kategori, så använder man piltangenterna. Ett tryck på Enter/Retur bokför resultatet på den kategori som den blå markören befinner sig på. Även för att starta en ny omgång, när slutresultatet visas, så trycker man på Enter/Retur."]},



        // 'choosableIds' är id-nummer på de kategorier där man ännu inte satt slutgiltig 
        // poäng, och därmed kan navigera till med piltangenterna om man använder ett 
        // tangentbord för att spela. När man sätter poängen på en kategori så tas 
        // id-numret bort från 'choosableIds'. För att underlätta navigerandet i 
        // poängprotokollet så är id-numren uppdelade i 'left' och 'right', vilket 
        // motsvarar de två kolumnerna som protokollet är uppdelat i.



        choosableIds: {
            left: [0, 1, 2, 3, 4, 5],
            right: [8, 9, 10, 11, 12, 13, 14, 15, 16]
        },



        // 'currentId' är id-numret på den kategori som man navigerat till med 
        // piltangenterna, och som därmed har en blå markering.


        currentId: 0

    },



    getters: {

        // Här följer ett antal getters. Den första, 'getCurrentDicePictures', 
        // returnerar sökvägar till de tärningsbilder som ska visas för tillfället 
        // samt ett värde för varje tärning som anger vilken rotation bilden ska ha.
        // Om antalet återstående tärningskast är lika med tre, och det inte är 
        // något kast pågående, så visas de "disablade" tärningsbilderna, med 
        // det värde som senast slumpades fram för respektive tärning.
        // Annars visas antingen den "olåsta" eller "låsta" tärningsbilden för 
        // respektive tärning, med det aktuella värdet för respektive tärning.



        getCurrentDicePictures: state => {

            let pictures = [];

            if ( (state.numberOfThrowsLeft === 3) && !state.throwOngoing) {

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

            let rots = [];

            for (let index = 0; index < 5; index++) {

                rots.push(state.dice[index].rotation)

            }

            return {
                pics: pictures,
                rotations: rots
            };

        },



        // Denna getter, 'throwDiceInfo', samlar ihop information som behövs i 
        // 'dice'-komponenten. Först avgörs vilken text som för tillfället 
        // ska stå på "kasta tärningarna"-knappen. Det beror dels på om det återstår 
        // något kast eller inte, samt hur många tärningar som är låsta.
        // Ett objekt skapas av den valda textsträngen samt info om antalet 
        // återstående kast, om tärningar är låsta eller ej och om ett kast pågår 
        // för tillfället.



        throwDiceInfo: state => {

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
                numberOfThrowsLeft: state.numberOfThrowsLeft,
                allDiceLocked: numberOfDiceLocked === 5,
                throwOngoing: state.throwOngoing
            };

        },



        // 'scoreTableInfo' innehåller en returnerar en hopsamling av den information 
        // som behövs i 'scoreTable'-komponenten, samt dess "barnkomponent" 
        // 'scoreCategoryRow'. Det är info om antalet återstående kast, om ett kast 
        // pågår för tillfället, om det är möjligt att sätta poäng för tillfället 
        // (vilket jag bakar ihop med 'throwOngoing') och id-numret på den 
        // poängkategori man navigerat till.



        scoreTableInfo: state => {

            return {
                numberOfThrowsLeft: state.numberOfThrowsLeft,
                throwOngoing: state.throwOngoing,
                possibleToSetPoints: state.possibleToSetPoints && !state.throwOngoing,
                currentId: state.currentId
            }

        },



        // 'rulesInfo' samlar ihop info som behövs i 'rulesInformation'-komponenten. 
        // Det är vilken text som ska visas på knappen som togglar mellan att 
        // visa och inte visa regler och tips (i mobil-läget), en boolean som 
        // avgör om texten ska visas eller inte, samt själva texten.



        rulesInfo: state => {

            let buttonString;

            if (state.rulesInfo.showRules) {

                buttonString = state.rulesInfo.buttonStrings[1];

            }

            else {

                buttonString = state.rulesInfo.buttonStrings[0];

            }

            return {
                buttonString: buttonString,
                showRules: state.rulesInfo.showRules,
                rulesStrings: state.rulesInfo.rulesStrings
            }

        },



        // I 'result' kollas först om alla poängkategorier är fastställda. Med alla 
        // poängkategorier menas i detta fall de kategorier där spelaren själv sätter 
        // poängen, dvs alla utom delsumman för ettor t.o.m. sexor och bonus. Därför 
        // slicas kategorierna före och efter delsumma och bonus ut, och slås samman. 
        // På denna modifierade array av poängkategorier kollas om alla poäng är 
        // fastställda. Om så är fallet kan även poängen för kategorierna delsumma och 
        // bonus räknas ut. (Kanske inte helt rätt att göra det i en getter, men jag 
        // tyckte att det passade hyfsat bra att göra det här.)
        // Slutligen räknas totalpoängen ut, och ett objekt innehållandes en boolean 
        // som är true om alla poängkategorier har poängen fastställd samt totalpoängen 
        // (som kommer att vara 0 tills dess att alla poängkategorier är satta).



        result: state => {

            let scoreCategoriesModified = state.scoreCategories.slice(0, 6).concat(state.scoreCategories.slice(8));

            let allCategoriesSet = scoreCategoriesModified.every(function(scoreCategory) {

                return scoreCategory.pointsSet;

            });

            let totalPoints = 0;

            if (allCategoriesSet) {

                state.scoreCategories[6].pointsSet = true;

                state.scoreCategories[7].pointsSet = true;

                state.scoreCategories[6].points = state.scoreCategories.slice(0, 6).reduce(function(accumulator, scoreCategory) {

                    return accumulator + scoreCategory.points;

                }, 0);

                if (state.scoreCategories[6].points >= 63) {

                    state.scoreCategories[7].points = 50;

                }

                else {

                    state.scoreCategories[7].points =  0;

                }

                for (let index = 6; index <= 16; index++) {

                    totalPoints += state.scoreCategories[index].points;

                }

            }

            return {
                allCategoriesSet: allCategoriesSet,
                totalPoints: totalPoints
            }

        }

    },



    mutations: {

        // Nedan följer ett antal mutations. 'toggleLocked' växlar mellan låst och 
        // olåst läge på en tärning, förutsatt att antalet återstående kast är 
        // färre än 3 och det inte pågår ett kast för tillfället.



        toggleLocked(state, payload) {

            if (state.numberOfThrowsLeft < 3 && !state.throwOngoing) {

                state.dice[payload].locked = !state.dice[payload].locked;

            }

        },



        // 'decreaseNumberOfThrowsLeft' minskar antalet återstående kast med 1.



        decreaseNumberOfThrowsLeft(state) {

            state.numberOfThrowsLeft--;

        },



        // 'randomizeDice' slumpar fram ett värde för varje tärning, förutsatt 
        // att tärningen inte är låst. Dessutom slumpas ett värde för 
        // rotationen på tärningsbilden fram, -2, -1, 0, 1 eller 2.



        randomizeDice(state) {

            state.dice.forEach(function(die) {

                if (!die.locked) {

                    die.value = Math.floor(Math.random() * 6) + 1;

                    die.rotation = Math.floor(Math.random() * 5) - 2;

                }

            });

        },



        // 'toggleThrowOngoing' växlar värdet på den boolean som anger om ett 
        // kast pågår för tillfället eller ej.



        toggleThrowOngoing(state) {

            state.throwOngoing = !state.throwOngoing;

        },



        // 'resetDiceRotations' sätter rotationen till 0 för alla tärningar.



        resetDiceRotations(state) {

            state.dice.forEach(function(die) {

                die.rotation = 0;

            });

        },



        // 'toggleShowRules' växlar värdet på den boolean som anger om regler 
        // och tips ska visas eller ej (i mobil-läget).



        toggleShowRules(state) {

            state.rulesInfo.showRules = !state.rulesInfo.showRules;

        },



        // 'calculatePoints' räknar ut poäng för de poängkategorier som inte har 
        // fått en slutgiltigt fastställd poäng, med hjälpfunktionerna längre upp 
        // i denna fil. Därefter sätts 'possibleToSetPoints' till true, dvs efter 
        // att möjliga poäng har räknats ut för de ännu inte satta poängkategorierna 
        // så är det möjligt att fastställa poängen för någon kategori.



        calculatePoints(state) {

            let numberOfDice = countNumberOfDice(state.dice);

            state.scoreCategories.forEach(function(scoreCategory) {

                if(!scoreCategory.pointsSet) {

                    switch (scoreCategory.id) {

                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                            scoreCategory.points = onesToSixes(scoreCategory.id, numberOfDice);
                            break;

                        case 8:
                            scoreCategory.points = onePair(numberOfDice);
                            break;

                        case 9:
                            scoreCategory.points = twoPair(numberOfDice);
                            break;

                        case 10:
                            scoreCategory.points = threeAndFourOfAKind(numberOfDice, 3);
                            break;

                        case 11:
                            scoreCategory.points = threeAndFourOfAKind(numberOfDice, 4);
                            break;

                        case 12:
                            scoreCategory.points = smallStraight(numberOfDice);
                            break;

                        case 13:
                            scoreCategory.points = largeStraight(numberOfDice);
                            break;

                        case 14:
                            scoreCategory.points = fullHouse(numberOfDice);
                            break;

                        case 15:
                            scoreCategory.points = chance(numberOfDice);
                            break;

                        case 16:
                            scoreCategory.points = yatzy(numberOfDice);
                            break;

                    }

                }

            });

            state.possibleToSetPoints = true;

        },



        // 'setPoints' ändrar 'pointsSet' till true, dvs nu är poängen fastställd 
        // för den aktuella poängkategorin. 'possibleToSetPoints' ändras till false, 
        // dvs det är inte möjligt att sätta poäng på ytterligare en kategori direkt 
        // efter att man valt att sätta poäng på någon kategori.
        // Antalet kast återställs till 3, id-numret för den aktuella kategorin tas 
        // bort från 'choosableIds' så att man inte kan navigera till denna ruta med 
        // piltangenterna. Slutligen så blir sätts alla tärningar i olåst läge.



        setPoints(state, currentRowId) {

            state.scoreCategories[currentRowId].pointsSet = true;

            state.possibleToSetPoints = false;

            state.numberOfThrowsLeft = 3;

            removeCurrentId(currentRowId, state.choosableIds);

            state.dice.forEach(function(die) {

                die.locked = false;

            });

        },



        // 'startNewRound' anropas då en ny omgång ska påbörjas, då sätts 'pointsSet' 
        // till false för alla poängkategorier, och arrayerna med id-nummer för de 
        // valbara kategorierna återställs till sina ursprungsvärden.



        startNewRound(state) {

            state.scoreCategories.forEach(function(scoreCategory) {

                scoreCategory.pointsSet = false;

            });

            state.choosableIds.left = [0, 1, 2, 3, 4, 5];

            state.choosableIds.right = [8, 9, 10, 11, 12, 13, 14, 15, 16];

        },



        // 'setInitialId' väljer ut den position där den blå markeringen ska dyka 
        // upp efter varje tärningskast. Den hamnar på den första ej satta 
        // poängkategorin i den vänstra kolumnen, såvida inte alla kategorier i 
        // den vänstra kolumnen redan har valts, då hamnar markeringen på den första 
        // ej satta poängkategorin i den högra kolumnen.



        setInitialId(state) {

            if (state.choosableIds.left.length > 0) {

                state.currentId = state.choosableIds.left[0];

            }

            else if (state.choosableIds.right.length > 0) {

                state.currentId = state.choosableIds.right[0];

            }

            else {

                state.currentId = -1;

            }

        },



        // 'arrowUp': Vid tryck på "pil upp" så flyttas markören uppåt, till 
        // närmast ej satta poängkategori i den kolumn där markören befinner sig. 
        // Såvida markören inte redan finns på den översta ej satta poängkategorin 
        // i en kolumn, då förblir markören där den är.



        arrowUp(state) {

            if (state.currentId <= 5 && state.choosableIds.left.indexOf(state.currentId) > 0) {

                state.currentId = state.choosableIds.left[ state.choosableIds.left.indexOf(state.currentId) - 1 ];

            }

            else if (state.currentId >= 8 && state.choosableIds.right.indexOf(state.currentId) > 0) {

                state.currentId = state.choosableIds.right[ state.choosableIds.right.indexOf(state.currentId) - 1 ];

            }

        },



        // 'arrowDown' fungerar på samma sätt som 'arrowUp', fast tvärtom. Vid 
        // tryck på "pil ner" så flyttas markören neråt, till närmast ej satta 
        // poängkategori i den kolumn där markören befinner sig. Såvida markören 
        // inte redan finns på den nedersta ej satta poängkategorin i en kolumn, 
        // då förblir markören där den är.



        arrowDown(state) {

            if (state.currentId <= 5 && state.choosableIds.left.indexOf(state.currentId) < state.choosableIds.left.length - 1) {

                state.currentId = state.choosableIds.left[ state.choosableIds.left.indexOf(state.currentId) + 1 ];

            }

            else if (state.currentId >= 8 && state.choosableIds.right.indexOf(state.currentId) < state.choosableIds.right.length - 1) {

                state.currentId = state.choosableIds.right[ state.choosableIds.right.indexOf(state.currentId) + 1 ];

            }

        },



        // 'arrowRight' är lite knepigare än de två tidigare mutations. Först kollas 
        // om 'currentId' är mindre än 5, dvs om markören befinner sig i den vänstra 
        // kolumnen, och om längden av "right"-arrayen är högre än 0, dvs om det finns 
        // någon position i poängprotokollet i den högra kolumnen som man kan förflytta 
        // sig till. (Om markören finns i den högra kolumnen så görs ingenting vid tryck 
        // på "pil höger".) I så fall sätts 'possibleNewId' till 'currentId' + 8, dvs i 
        // första hand så försöker man flytta sig horisontellt till den högra kolumnen. 
        // Huruvida detta går kontrolleras genom att kolla ifall 'possibleNewId' finns 
        // kvar i "right"-arrayen.
        // Annars så letas det första tillgängliga index upp, som är högre än 
        // 'possibleNewId'. Om det skulle finnas först i "right"-arrayen så är det där 
        // markören kommer att hamna, dvs markören rör sig ett steg till höger och ett 
        // eller flera steg nedåt.
        // Om det inte finns något index i "right"-arrayen som är högre än 
        // 'possibleNewId', så blir 'currentId' lika med värdet på det sista elementet i 
        // "right"-arrayen. Markören rör sig alltså ett steg till höger och ett eller 
        // flera steg uppåt.
        // Det sista fallet är om det inte finns något index i "right"-arrayen som är 
        // lika med 'possibleNewId', men det finns index som är både högre och lägre än 
        // 'possibleNewId'. Då sätts 'currentId' till värdet på det sista elementet i 
        // "right"-arrayen som är lägre än 'possibleNewId'. Markören rör sig alltså ett 
        // steg till höger och ett eller flera steg uppåt, även i detta fall.



        arrowRight(state) {

            if (state.currentId <= 5 && state.choosableIds.right.length > 0) {

                let possibleNewId = state.currentId + 8;

                if (state.choosableIds.right.indexOf(possibleNewId) !== -1) {

                    state.currentId = possibleNewId;

                }

                else {

                    let possibleNewIndex = state.choosableIds.right.findIndex(function(value) {

                        return value > possibleNewId;

                    });

                    if (possibleNewIndex === 0) {

                        state.currentId = state.choosableIds.right[0];

                    }

                    else if (possibleNewIndex === -1) {

                        state.currentId = state.choosableIds.right.slice(-1)[0];

                    }

                    else {

                        state.currentId = state.choosableIds.right[possibleNewIndex - 1];

                    }

                }

            }

         },



        // 'arrowLeft' fungerar, som namnet antyder, på samma sätt som 'arrowRight', 
        // bortsett från att markören flyttas från den högra kolumnen till den vänstra.



        arrowLeft(state) {

            if (state.currentId >= 8 && state.choosableIds.left.length > 0) {

                let possibleNewId = state.currentId - 8;

                if (state.choosableIds.left.indexOf(possibleNewId) !== -1) {

                    state.currentId = possibleNewId;

                }

                else {

                    let possibleNewIndex = state.choosableIds.left.findIndex(function(value) {

                        return value > possibleNewId;

                    });

                    if (possibleNewIndex === 0) {

                        state.currentId = state.choosableIds.left[0];

                    }

                    else if (possibleNewIndex === -1) {

                        state.currentId = state.choosableIds.left.slice(-1)[0];

                    }

                    else {

                        state.currentId = state.choosableIds.left[possibleNewIndex - 1];

                    }

                }

            }

        }

    }

});



////////////////////////////////////////////////////////////////////////////////////////////////////



// Slutligen, här är Vue-instansen, med ett antal computed properties som (i de flesta fall) 
// returnerar getters från store.



const app = new Vue({

    el: "#app",

    store,

    components: {
        "dice": dice,
        "score-table": scoreTable,
        "rules-information": rulesInformation
    },



    computed: {

        currentDicePictures() {

            return this.$store.getters.getCurrentDicePictures;

        },



        throwButtonDisabled() {

            return this.$store.getters.throwButtonDisabled;

        },


        throwDiceInfo() {

            return this.$store.getters.throwDiceInfo;

        },



        scoreCategories() {

            return this.$store.state.scoreCategories;

        },



        scoreTableInfo() {

            return this.$store.getters.scoreTableInfo;

        },



        rulesInfo() {

            return this.$store.getters.rulesInfo;

        },



        result() {

            return this.$store.getters.result;

        }

    }

});


