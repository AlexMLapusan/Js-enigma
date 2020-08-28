(function ($){

    const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

    //used to make sure at most one key is pressed at any given time and that the event associated with that key triggers only once
    let keyPressedFlag = false;
    let currentlyPressed = null;

    class Rotor{

        offset = 0; //current offset of the rotor
        links = []; //the internal associations between letters of the rotor

        constructor( wiring, offset) {
            this.offset = offset;
            for(let i=0; i<26; i++){
                this.links.push({input : ALPHABET[i], output : wiring[i]});
            }

            // let i = 0;
            // Array.from(ALPHABET).forEach(letter => {
            //     this.links[letter] = wiring[i++];
            // })
        }

        /**
         * returns the codification for the letter received as input tanking into account the current offset
         */
        goForward(letter){
            let letterPosition = ALPHABET.indexOf(letter);
            let wiringIndex = (letterPosition + this.offset) % 26;
            return this.links[wiringIndex].output;
        }

        goBackward(letter){
            // let letterPosition = ALPHABET.indexOf(letter);
            // let wiringIndex = (letterPosition + this.offset) % 26;
            let output;
            for(let i=0; i<26; i++){
                if(letter === this.links[i].output){
                    let outputIndex = (ALPHABET.indexOf(this.links[i].input) - this.offset + 26 )% 26;
                    output = ALPHABET[outputIndex];
                }
            }

            return output;
        }

        setOffset(offset){
            this.offset = offset;
        }

        incrementOffset(){
            this.offset = (this.offset + 1) % 26;
        }

        decrementOffset(){
            this.offset = (this.offset + 25) % 26;
        }

        /**
         * test function
         */
        printWiring(){
            // for(const[key, value] of Object.entries(this.links)){
            //     console.log(key + "  " + value);
            // }
            this.links.forEach(wiring =>{
                console.log(wiring.input, wiring.output);
            })
        }
    }

    class Reflector{
        links = []; //the internal associations between letters of the rotor

        constructor( wiring ) {

            for(let i=0; i<26; i++){
                this.links[ALPHABET[i]] = wiring[i];
            }

            // let i = 0;
            // Array.from(ALPHABET).forEach(letter => {
            //     this.links[letter] = wiring[i++];
            // })
        }

        /**
         * reflects the input
         */
        reflect(letter){
            return this.links[letter];
        }

        /**
         * test function
         */
        printWiring(){
            for(const[key, value] of Object.entries(this.links)){
                console.log(key + "  " + value);
            }
            // this.links.forEach(wiring =>{
            //     console.log(wiring.input, wiring.output);
            // })
        }
    }

    class ScramblingUnit {
        //This class is meant have a method that gets a letter as an input and outputs the encoded letter
        //i 	    ekmflgdqvzntowyhxuspaibrcj
        //ii 	    ajdksiruxblhwtmcqgznpyfvoe
        //iii 	    bdfhjlcprtxvznyeiwgakmusqo
        //iv 	    esovpzjayquirhxlnftgkdcmwb
        //v 	    vzbrgityupsdnhlxawmjqofeck
        //ukw-a 	ejmzalyxvbwfcrquontspikhgd
        //ukw-b 	yruhqsldpxngokmiebfzcwvjat
        //ukw-c 	fvpjiaoyedrzxwgctkuqsbnmhl

        // rotor1 = new Rotor("ekmflgdqvzntowyhxuspaibrcj", 25);
        // rotor2 = new Rotor("ajdksiruxblhwtmcqgznpyfvoe", 26);
        // rotor3 = new Rotor("bdfhjlcprtxvznyeiwgakmusqo", 5);
        reflector = new Reflector("yruhqsldpxngokmiebfzcwvjat");

        constructor(r1, r2, r3) {
            this.rotor1 = r1;
            this.rotor2 = r2;
            this.rotor3 = r3;
        }

        scramble(inputLetter){
            let interm = this.rotor1.goForward(inputLetter);
            interm = this.rotor2.goForward(interm);
            interm = this.rotor3.goForward(interm);

            interm = this.reflector.reflect(interm);

            interm = this.rotor3.goBackward(interm);
            interm = this.rotor2.goBackward(interm);
            interm = this.rotor1.goBackward(interm);

            this.moveRotors();

            return interm;
        }

        moveRotors(){
            this.rotor1.incrementOffset();
            if(this.rotor1.offset === 0){
                this.rotor2.incrementOffset();
                if(this.rotor2.offset === 0){
                    this.rotor3.incrementOffset();
                }
            }
        }

    }

    let rotor1 = new Rotor("ekmflgdqvzntowyhxuspaibrcj", 0);
    let rotor2 = new Rotor("ajdksiruxblhwtmcqgznpyfvoe", 0);
    let rotor3 = new Rotor("bdfhjlcprtxvznyeiwgakmusqo", 0);

    let scrambler = new ScramblingUnit(rotor1, rotor2, rotor3);

    let litUpKey = null;

    $(document).keypress(function (event){
        if(event.code.includes("Key")){
            if(currentlyPressed === null && !keyPressedFlag) {
                let pressedKey = event.code[3].toLowerCase();
                // console.log(pressedKey);
                // console.log($("." + pressedKey));
                litUpKey = scrambler.scramble(pressedKey);
                $("." + litUpKey).css("background", " linear-gradient(135deg, #fceabb 0%,#f8b500 40%,#f8b500 41%,#fccd4d 43%,#fbdf93 100%)");
                $("." + litUpKey).css("color", "#000");
                keyPressedFlag = true;
                currentlyPressed = event.code;

                // console.log(rotor1.offset);
                updateDisplayedRotors();
            }
        }

    });

    $(document).keyup(function (event){
        console.log(currentlyPressed);
        console.log(event.code);
        if(currentlyPressed === event.code){
            $("." + litUpKey).css("background", "linear-gradient(135deg, #000000 0%,#0a0a0a 11%,#0a0a0a 21%,#4e4e4e 33%,#383838 37%,#383838 37%,#1b1b1b 43%,#1b1b1b 43%,#000000 100%)");
            $("." + litUpKey).css("color", "#DDD");
            keyPressedFlag = false;
            currentlyPressed = null;
        }
    });

    function updateDisplayedRotors(){
        $(".fast .value").html(rotor1.offset);
        $(".medium .value").html(rotor2.offset);
        $(".slow .value").html(rotor3.offset);
    }

    updateDisplayedRotors();

    $(".increment").click(function (){
        let targetedRotor = $(this).closest(".rotor");
        switch ($(targetedRotor).attr("speed")) {
            case "fast": rotor1.incrementOffset();
                break;
            case "medium": rotor2.incrementOffset();
                break;
            case "slow": rotor3.incrementOffset();
                break;
        }
        updateDisplayedRotors();
    });

    $(".decrement").click(function (){
        let targetedRotor = $(this).closest(".rotor");
        switch ($(targetedRotor).attr("speed")) {
            case "fast": rotor1.decrementOffset();
                break;
            case "medium": rotor2.decrementOffset();
                break;
            case "slow": rotor3.decrementOffset();
                break;
        }
        updateDisplayedRotors();
    });

    $("img").mouseenter(()=>{
        $(".info").show();
    });
    $("img").mouseleave(()=>{
        $(".info").hide();
    });

})(jQuery)