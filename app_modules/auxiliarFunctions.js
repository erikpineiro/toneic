
export default {

   random: {
      int: function(min, max = null) {
         if (max === null) {
            max = min;
            min = 0;
         }
         return min + Math.floor( (max-min) * Math.random() );
      },
      string: function(length) {
         // https://stackoverflow.com/a/1349426
         let result           = [];
         let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
         for ( let i = 0; i < length; i++ ) {
           result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
        }
        return result.join('');
     }
   },

   minSecs: function(time){
      if (parseInt(time) !== time) return "--:--";
      return this.nDigits(Math.floor(time/60)) + ":" + this.nDigits(time%60);
   },

   nDigits: function(number, nDigits = 2){
      return ("000000000000" + number).substr(-nDigits);
   },

}
