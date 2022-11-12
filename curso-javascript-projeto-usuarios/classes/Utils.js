class Utils{

    // static é a palavra reservada para determinar um método estático
    static dateFormat(date){

        return `${date.getDate()}/${(date.getMonth()+1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }
}