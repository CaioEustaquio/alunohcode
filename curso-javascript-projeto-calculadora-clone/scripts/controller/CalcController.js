class CalcController{

    constructor(){
        // o underscore/underline é o encapsulamento privado de uma propriedade dentro de uma classe em JS
        
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR'
        this._timeEl = document.querySelector('#hora');
        this._dateEl = document.querySelector('#data');
        this._displayCalcEl = document.querySelector('#display');
        this._currentDate;
        this.initialize();
        this.initButtonEvents();
        this.initKeyboard();
        this.copyToClipboard();
        this.pasteFromClipboard();
    }
    pasteFromClipboard(){

        document.addEventListener('paste', e =>{
            let text = e.clipboardData.getData('Text');
            this.displayCalcEl = parseFloat(text);
        });

    }
    // MÉTODO COM FUNÇÃO DEPRECIADA execCommand

    // copyToClipboard(){

    //     let input = document.createElement('input');
    //     input.value = this.displayCalcEl;

    //     document.body.appendChild(input);
    //     input.select();

        // document.execCommand("Copy");
    //     input.remove();
    // }
    copyToClipboard(){

        document.addEventListener('copy', e =>{

            let input = document.createElement('input');
            input.value = this.displayCalcEl;
    
            document.body.appendChild(input);
            input.select();
            e.clipboardData.setData('Text', parseFloat(input.value));

            // preventDefault(); previnindo o comportamento padrão e evitando que o dado copiado seja perdido
            e.preventDefault();
            input.remove();
        });
    }
    initialize(){

        this.setDisplayDateTime();

        setInterval(() =>{

            this.setDisplayDateTime();

        }, 1000);

        // setTimeOut serve para definir o tempo onde o setInterval terá que parar de ser executado

        // setTimeout(() =>{
        //     clearInterval(interval);
        // }, 10000);

        this.setLastNumberToDisplay();

        document.querySelectorAll('.btn-ac').forEach(btn =>{
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();
            });
        });

    }
    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
    }
    playAudio(){

        if(this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }
    // entrada de dados via teclado
    initKeyboard(){
        document.addEventListener('keyup', e =>{

            this.playAudio();

            switch(e.key){

                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                // case 'c':
                //     if(e.ctrlKey) this.copyToClipboard();
                //     break;
            }
        });
    }
    addEventListenerAll(element, events, fn){

        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }
    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }
    clearEntry(){
        this._operation.pop();
        this.setLastNumberToDisplay();
    }
    getLastOperation(){
        return this._operation[this._operation.length-1];
    }
    isOperator(value){
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
    }
    setLastOperation(value){
        this._operation[this._operation.length - 1] = value;
    }

    pushOperation(value){
        this._operation.push(value);

        if(this._operation.length > 3){

            this.calc();
        }
    }
    getResult(){
        try{
            return eval(this._operation.join(""));
        }catch(e){
            setTimeout((e)=>{
                this.setError();
            }, 1000)
        }

    }
    calc(){

        let last = '';
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){

            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3){
            last = this._operation.pop()
            this._lastNumber = this.getResult();
        }

        else if(this._operation.length == 3){
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult().toFixed(2);

        if(last == '%'){

            result /= 100;
            this._operation = [result];

        }else{

            this._operation = [result];
            if(last) this._operation.push(last);
        }
        this.setLastNumberToDisplay();
    }
    getLastItem(isOperator = true){

        let lastItem;

        for(let i = this._operation.length - 1; i >= 0; i--){

            if(this.isOperator(this._operation[i]) == isOperator){

                lastItem = this._operation[i]
                break;
            }
            
        }

        if(!lastItem){
            lastItem = (isOperator ? this._lastOperator : this._lastNumber);
        }

        return lastItem;
    }
    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0;

        this.displayCalcEl = lastNumber;
    }

    addOperation(value){

        if(isNaN(this.getLastOperation())){
            // string
            if(this.isOperator(value)){
                // trocar o operador
                this.setLastOperation(value);
            }else{
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        }else{
            
            if(this.isOperator(value)){
                this.pushOperation(value);
            }else{
                
                // Number
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                // atualizar display
                this.setLastNumberToDisplay();
            }
        }
    }
    addDot(){

        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');
        }else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    }
    setError(){
        this.displayCalcEl = "Error";
    }

    execBtn(value){

        this.playAudio();

        switch(value){

            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'ponto':
                this.addDot();
                break;
            case 'igual':
                this.calc();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }

    initButtonEvents(){

        // recuperando vários elementos filhos de mais de um elemento pai
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index) =>{
            this.addEventListenerAll(btn, "click drag", e =>{
                
                let txtBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(txtBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e =>{
                btn.style.cursor = "pointer";
            });
        });

        
    }

    // em Js são utilizadas as palavras reservadas
    // get e set e nome do método | para utilizar
    // o get basta chamar a propriedade, para
    // definir valores com o set é só utilizar o =

    setDisplayDateTime(){
        this.displayDateEl = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"

        });
        this.displayTimeEl = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTimeEl(){
        return this._timeEl.innerHTML;
    }
    set displayTimeEl(displayTimeEl){
        this._timeEl.innerHTML = displayTimeEl;
    }
    get displayDateEl(){
        return this._dateEl.innerHTML;
    }
    set displayDateEl(displayDateEl){
        this._dateEl.innerHTML = displayDateEl;
    }
    get displayCalcEl(){
        return this._displayCalcEl.innerHTML;
    }
    set displayCalcEl(displayCalcEl){

        if(displayCalcEl.toString().length > 10){
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = displayCalcEl;
    }
    get currentDate(){
        return new Date();
    }
    set currentDate(currentDate){
        this._currentDate = currentDate;
    }
}