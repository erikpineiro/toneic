
export function randomInteger() {}
export function randomString(length) {
    // https://stackoverflow.com/a/1349426
    let result           = [];
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
   }
   return result.join('');
}

export function getDateInfo () {
   // https://weeknumber.com/how-to/javascript
   // Returns the ISO week of the date.

   let date = new Date(Date.now());

   let year = date.getFullYear().toString().substr(2);

   date.setHours(0, 0, 0, 0);

   // Thursday in current week decides the year.
   date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

   // January 4 is always in week 1.
   let week1 = new Date(date.getFullYear(), 0, 4);

   // Adjust to Thursday in week 1 and count number of weeks from date to week1.
   let weekNumber =  1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
 
   return { year, weekNumber };
}
export function toneicWeek () {
      let date = getDateInfo();
      return `${date.year}v${date.weekNumber}`;
}